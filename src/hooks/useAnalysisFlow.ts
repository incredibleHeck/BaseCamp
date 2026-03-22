import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  saveAssessment,
  updateAssessment,
  getStudentHistory,
  type Assessment,
} from '../services/assessmentService';
import {
  analyzeHybridTeacherDiagnostic,
  analyzeWorksheet,
  analyzeWorksheetMultiple,
  analyzeManualEntry,
  buildStudentContextForHybridPrompt,
  generateExtensionActivity,
  generateRemedialLessonPlan,
  MASTERY_EXTENSION_LESSON_PLACEHOLDER,
  shouldUseExtensionActivity,
  type DiagnosticReport as AIDiagnosticReport,
  type GenerateLessonPlanOptions,
} from '../services/aiPrompts';
import { getStudent } from '../services/studentService';
import { addToQueue } from '../services/offlineQueueService';
import {
  getDefaultAcademicYear,
  getDefaultTerm,
  DEFAULT_CLASS_LABEL,
} from '../config/academicContext';
import { playbookKeyFromLessonTitle } from '../utils/playbookKey';
import { evaluateAndPersistSenAlerts } from '../services/senAlertService';
import { logWorkflow, logWorkflowDebug } from '../utils/workflowLog';
import { getCurriculumContext, type CurriculumFramework } from '../services/curriculumRagService';
import {
  buildRecentHistorySummaryForLongitudinalPrompt,
  parseGradeLevelFromStudentRecord,
} from '../utils/longitudinalPromptHelpers';

/** When student + history are already loaded (e.g. hybrid flow), avoids duplicate fetches. */
type LongitudinalPrefetchedStudentContext = {
  student: Awaited<ReturnType<typeof getStudent>>;
  history: Assessment[];
};

export type AnalysisStatus = 'empty' | 'analyzing' | 'results';

export interface DiagnosticReport extends AIDiagnosticReport {
  criticalGap?: string;
}

export type HybridAssessmentFlowResult =
  | { ok: true; savedAssessmentId: string }
  | { ok: true; queued: true }
  | { ok: false; error: string };

/** Pass from UI when the hook’s props may not yet include this assessment (same-tick as diagnosis start). */
export type HybridAssessmentFlowContext = {
  assessmentType: 'numeracy' | 'literacy';
  dialectContext?: string | null;
  curriculumFramework?: CurriculumFramework;
  gradeLevel?: number;
};

export type AnalyzeHybridAssessmentFn = (
  studentId: string,
  audioBlob: Blob,
  optionalImageBlob?: Blob | null,
  flowContext?: HybridAssessmentFlowContext | null
) => Promise<HybridAssessmentFlowResult>;

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onloadend = () => {
      if (typeof fr.result === 'string') resolve(fr.result);
      else reject(new Error('Could not read blob as data URL'));
    };
    fr.onerror = () => reject(fr.error ?? new Error('FileReader failed'));
    fr.readAsDataURL(blob);
  });
}

export interface UseAnalysisFlowParams {
  status: AnalysisStatus;
  isOffline?: boolean;
  studentId?: string;
  assessmentType?: string;
  /** When `voice`, worksheet/manual effect is skipped — hybrid pipeline sets report separately. */
  inputMode?: 'upload' | 'manual' | 'voice' | null;
  imageBase64?: string | null;
  imageBase64s?: string[] | null;
  dialectContext?: string | null;
  manualRubric?: string[] | null;
  observations?: string | null;
  curriculumFramework?: CurriculumFramework;
  gradeLevel?: number;
  onAnalysisComplete?: () => void;
  onAnalysisError?: () => void;
}

const EMPTY_REPORT: DiagnosticReport = {
  diagnosis: 'No data available.',
  criticalGap: 'No data available.',
  masteredConcepts: 'No data available.',
  gapTags: [],
  masteryTags: [],
  recommendations: [],
  remedialPlan: '',
  score: 0,
  smsDraft: '',
  lessonPlan: { title: 'No lesson plan', instructions: [] },
  alignedStandardCode: null,
};

function buildFullReport(result: AIDiagnosticReport): DiagnosticReport {
  return {
    ...result,
    criticalGap: result.diagnosis,
    lessonPlan: result.lessonPlan ?? {
      title: 'No lesson plan',
      instructions: [],
    },
  };
}

async function loadLongitudinalPromptFields(
  studentId: string | undefined,
  assessmentType: string,
  fallbackGradeLevel: number | undefined,
  prefetched?: LongitudinalPrefetchedStudentContext
): Promise<{ studentGradeLevel?: number; recentHistorySummary?: string }> {
  const out: { studentGradeLevel?: number; recentHistorySummary?: string } = {};

  if (!studentId?.trim()) {
    if (typeof fallbackGradeLevel === 'number' && Number.isFinite(fallbackGradeLevel)) {
      out.studentGradeLevel = fallbackGradeLevel;
    }
    return out;
  }

  try {
    let student: Awaited<ReturnType<typeof getStudent>>;
    let history: Assessment[];
    if (prefetched) {
      student = prefetched.student;
      history = prefetched.history;
    } else {
      [student, history] = await Promise.all([getStudent(studentId), getStudentHistory(studentId)]);
    }
    const fromRecord = parseGradeLevelFromStudentRecord(student);
    out.studentGradeLevel =
      fromRecord ??
      (typeof fallbackGradeLevel === 'number' && Number.isFinite(fallbackGradeLevel)
        ? fallbackGradeLevel
        : undefined);

    const summary = buildRecentHistorySummaryForLongitudinalPrompt(history ?? [], assessmentType);
    if (summary) out.recentHistorySummary = summary;
  } catch {
    if (typeof fallbackGradeLevel === 'number' && Number.isFinite(fallbackGradeLevel)) {
      out.studentGradeLevel = fallbackGradeLevel;
    }
  }

  return out;
}

export function useAnalysisFlow({
  status,
  isOffline = false,
  studentId,
  assessmentType,
  inputMode,
  imageBase64,
  imageBase64s,
  dialectContext,
  manualRubric,
  observations,
  curriculumFramework = 'GES',
  gradeLevel,
  onAnalysisComplete,
  onAnalysisError,
}: UseAnalysisFlowParams) {
  const [showSmsDraft, setShowSmsDraft] = useState(false);
  const [showLessonPlan, setShowLessonPlan] = useState(false);
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedAssessmentId, setSavedAssessmentId] = useState<string | null>(null);
  const [reportData, setReportData] = useState<DiagnosticReport | null>(null);
  const [regeneratedLessonPlan, setRegeneratedLessonPlan] = useState<{
    title: string;
    instructions: string[];
  } | null>(null);

  const analyzeHybridAssessment = useCallback(
    async (
      studentId: string,
      audioBlob: Blob,
      optionalImageBlob?: Blob | null,
      flowContext?: HybridAssessmentFlowContext | null
    ): Promise<HybridAssessmentFlowResult> => {
      if (!studentId?.trim()) return { ok: false, error: 'missing_student' };

      const effectiveType = flowContext?.assessmentType ?? assessmentType;
      if (!effectiveType) return { ok: false, error: 'missing_assessment_type' };

      const subjectKey =
        effectiveType === 'literacy' ||
        effectiveType.toLowerCase().includes('lit') ||
        effectiveType === 'Literacy'
          ? 'literacy'
          : 'numeracy';

      const effectiveDialect = flowContext?.dialectContext ?? dialectContext ?? '';
      const effectiveFramework = flowContext?.curriculumFramework ?? curriculumFramework ?? 'GES';
      const effectiveGrade = flowContext?.gradeLevel ?? gradeLevel;

      try {
        const audioDataUrl = await blobToDataUrl(audioBlob);
        const worksheetDataUrl =
          optionalImageBlob && optionalImageBlob.size > 0 ? await blobToDataUrl(optionalImageBlob) : undefined;

        if (isOffline) {
          await addToQueue({
            studentId,
            assessmentType: subjectKey,
            inputMode: 'hybrid_voice',
            dialectContext: effectiveDialect,
            curriculumFramework: effectiveFramework,
            gradeLevel: effectiveGrade,
            audioBase64: audioDataUrl,
            audioMimeType: audioBlob.type || 'audio/webm',
            imageBase64s: worksheetDataUrl ? [worksheetDataUrl] : undefined,
          });
          logWorkflow('analysis:hybrid_queued_offline', { studentId });
          return { ok: true, queued: true };
        }

        const [student, history] = await Promise.all([getStudent(studentId), getStudentHistory(studentId)]);
        const studentContext = buildStudentContextForHybridPrompt(student, history);
        const displayName = student?.name ?? 'the learner';
        const hybridRagHint = [studentContext, displayName].join(' ').slice(0, 800);
        const hybridRag = getCurriculumContext(
          subjectKey,
          hybridRagHint,
          effectiveFramework,
          effectiveGrade
        );

        const longitudinal = await loadLongitudinalPromptFields(
          studentId,
          effectiveType,
          effectiveGrade,
          { student, history }
        );
        const hybridStudentGrade = longitudinal.studentGradeLevel;
        const hybridHistorySummary = longitudinal.recentHistorySummary;

        const report = await analyzeHybridTeacherDiagnostic({
          audioBase64: audioDataUrl,
          audioMimeType: audioBlob.type || 'audio/webm',
          studentDisplayName: displayName,
          studentContext,
          worksheetImage:
            worksheetDataUrl && worksheetDataUrl.length > 0
              ? {
                  base64: worksheetDataUrl,
                  mimeType: optionalImageBlob?.type?.trim() || 'image/jpeg',
                }
              : undefined,
          subject: subjectKey,
          dialectContext: effectiveDialect,
          curriculumFramework: effectiveFramework,
          gradeLevel: effectiveGrade,
          curriculumContext: hybridRag.formattedContext,
          allowedObjectiveIds: hybridRag.allowedObjectiveIds,
          studentGradeLevel: hybridStudentGrade,
          recentHistorySummary: hybridHistorySummary,
        });

        if (!report) {
          logWorkflow('analysis:hybrid_failed', { reason: 'null_report' });
          onAnalysisError?.();
          return { ok: false, error: 'analysis_failed' };
        }

        const lessonPlanOpts: GenerateLessonPlanOptions = {
          studentGradeLevel: longitudinal.studentGradeLevel,
          dialectContext: effectiveDialect.trim() ? effectiveDialect : undefined,
        };

        let mergedReport: AIDiagnosticReport;
        if (shouldUseExtensionActivity(report)) {
          const ext = await generateExtensionActivity({
            report,
            studentGradeLevel: lessonPlanOpts.studentGradeLevel,
            dialectContext: lessonPlanOpts.dialectContext,
            curriculumContext: hybridRag.formattedContext,
          });
          if (ext) {
            mergedReport = {
              ...report,
              extensionActivity: ext,
              lessonPlan: MASTERY_EXTENSION_LESSON_PLACEHOLDER,
            };
          } else {
            const enrichedLesson = await generateRemedialLessonPlan(
              report.diagnosis,
              report.remedialPlan,
              subjectKey,
              report.gesAlignment ?? undefined,
              lessonPlanOpts
            );
            mergedReport = {
              ...report,
              lessonPlan: enrichedLesson ?? report.lessonPlan,
            };
          }
        } else {
          const enrichedLesson = await generateRemedialLessonPlan(
            report.diagnosis,
            report.remedialPlan,
            subjectKey,
            report.gesAlignment ?? undefined,
            lessonPlanOpts
          );
          mergedReport = {
            ...report,
            lessonPlan: enrichedLesson ?? report.lessonPlan,
          };
        }

        const full = buildFullReport(mergedReport);
        setReportData(full);
        if (
          mergedReport.lessonPlan &&
          mergedReport.lessonPlan !== report.lessonPlan &&
          mergedReport.lessonPlan.title !== MASTERY_EXTENSION_LESSON_PLACEHOLDER.title
        ) {
          setRegeneratedLessonPlan(mergedReport.lessonPlan);
        } else if (mergedReport.extensionActivity) {
          setRegeneratedLessonPlan(MASTERY_EXTENSION_LESSON_PLACEHOLDER);
        }
        onAnalysisComplete?.();
        logWorkflow('analysis:hybrid_complete', { studentId });

        const displayPlan = full.lessonPlan ?? { title: '', instructions: [] };
        const playbookTitle = displayPlan?.title?.trim() || undefined;
        const type: Assessment['type'] = subjectKey === 'literacy' ? 'Literacy' : 'Numeracy';

        const assessment: Assessment = {
          studentId,
          type,
          diagnosis: full.diagnosis,
          masteredConcepts: full.masteredConcepts,
          gapTags: full.gapTags ?? [],
          masteryTags: full.masteryTags ?? [],
          remedialPlan: full.remedialPlan || '',
          lessonPlan: displayPlan,
          extensionActivity: full.extensionActivity,
          playbookKey: playbookTitle ? playbookKeyFromLessonTitle(playbookTitle) : undefined,
          playbookTitle,
          score: typeof full.score === 'number' ? full.score : undefined,
          term: getDefaultTerm(),
          academicYear: getDefaultAcademicYear(),
          classLabel: DEFAULT_CLASS_LABEL,
          gesObjectiveId: full.gesAlignment?.objectiveId,
          gesObjectiveTitle: full.gesAlignment?.objectiveTitle,
          gesCurriculumExcerpt: full.gesAlignment?.excerpt,
          gesVerified: full.gesAlignment?.verified,
          timestamp: Date.now(),
          status: 'Completed',
        };

        const resultId = await saveAssessment(assessment);
        if (!resultId) {
          onAnalysisError?.();
          return { ok: false, error: 'save_failed' };
        }
        setSavedAssessmentId(resultId);
        setIsSaved(true);
        void evaluateAndPersistSenAlerts(studentId, {
          senWarningFlag: full.senWarningFlag,
          latestAssessmentId: resultId,
        });
        return { ok: true, savedAssessmentId: resultId };
      } catch (error) {
        console.error('analyzeHybridAssessment failed', error);
        logWorkflow('analysis:hybrid_failed', { reason: 'exception' });
        onAnalysisError?.();
        return { ok: false, error: 'exception' };
      }
    },
    [assessmentType, curriculumFramework, dialectContext, gradeLevel, isOffline, onAnalysisComplete, onAnalysisError]
  );

  useEffect(() => {
    setRegeneratedLessonPlan(null);
    setSavedAssessmentId(null);
    setIsSaved(false);
  }, [reportData]);

  useEffect(() => {
    if (status !== 'analyzing') return;

    logWorkflow('analysis:effect_start', {
      assessmentType: assessmentType || '(empty)',
      imageCount: imageBase64s?.filter(Boolean).length ?? 0,
      hasSingleImage: Boolean(imageBase64 && String(imageBase64).length > 0),
      manualRubricCount: manualRubric?.length ?? 0,
      observationsLen: (observations?.trim() ?? '').length,
    });
    logWorkflowDebug('analysis:effect_inputs', {
      studentId: studentId ?? null,
      dialectSet: Boolean(dialectContext),
    });

    const nonEmptyImages = (imageBase64s ?? []).filter((s) => s && String(s).trim().length > 0);

    if (nonEmptyImages.length > 0 && assessmentType) {
      const getAnalysis = async () => {
        try {
          logWorkflow('analysis:branch', { branch: 'analyzeWorksheetMultiple', pages: nonEmptyImages.length });
          const longitudinal = await loadLongitudinalPromptFields(studentId, assessmentType, gradeLevel);
          const rag = getCurriculumContext(assessmentType, '', curriculumFramework, gradeLevel);
          const result = await analyzeWorksheetMultiple(
            nonEmptyImages,
            assessmentType,
            dialectContext || '',
            {
              curriculumFramework,
              gradeLevel,
              curriculumContext: rag.formattedContext,
              allowedObjectiveIds: rag.allowedObjectiveIds,
              ...longitudinal,
            }
          );
          if (result) {
            setReportData(buildFullReport(result));
            onAnalysisComplete?.();
            logWorkflow('analysis:complete', { branch: 'analyzeWorksheetMultiple' });
          } else {
            logWorkflow('analysis:failed', { branch: 'analyzeWorksheetMultiple', reason: 'null_result' });
            onAnalysisError?.();
          }
        } catch (error) {
          console.error('AnalysisResults: analyzeWorksheetMultiple failed', error);
          logWorkflow('analysis:failed', { branch: 'analyzeWorksheetMultiple', reason: 'exception' });
          onAnalysisError?.();
        }
      };
      void getAnalysis();
      return;
    }

    if (imageBase64 && assessmentType) {
      const getAnalysis = async () => {
        try {
          const longitudinal = await loadLongitudinalPromptFields(studentId, assessmentType, gradeLevel);
          const rag = getCurriculumContext(assessmentType, '', curriculumFramework, gradeLevel);
          const result = await analyzeWorksheet(imageBase64, assessmentType, dialectContext || '', {
            curriculumFramework,
            gradeLevel,
            curriculumContext: rag.formattedContext,
            allowedObjectiveIds: rag.allowedObjectiveIds,
            ...longitudinal,
          });
          if (result) {
            setReportData(buildFullReport(result));
            onAnalysisComplete?.();
          } else {
            onAnalysisError?.();
          }
        } catch (error) {
          console.error('AnalysisResults: analyzeWorksheet failed', error);
          onAnalysisError?.();
        }
      };
      void getAnalysis();
      return;
    }

    if (assessmentType && (manualRubric?.length || (observations?.trim() ?? '').length > 0)) {
      const getAnalysis = async () => {
        try {
          const manualHint = [observations?.trim() ?? '', ...(manualRubric ?? [])].join(' ');
          const longitudinal = await loadLongitudinalPromptFields(studentId, assessmentType, gradeLevel);
          const rag = getCurriculumContext(assessmentType, manualHint, curriculumFramework, gradeLevel);
          const result = await analyzeManualEntry(
            assessmentType,
            dialectContext || '',
            manualRubric ?? [],
            observations?.trim() ?? '',
            {
              curriculumFramework,
              gradeLevel,
              curriculumContext: rag.formattedContext,
              allowedObjectiveIds: rag.allowedObjectiveIds,
              ...longitudinal,
            }
          );
          if (result) {
            setReportData(buildFullReport(result));
            onAnalysisComplete?.();
            logWorkflow('analysis:complete', { branch: 'analyzeManualEntry' });
          } else {
            logWorkflow('analysis:failed', { branch: 'analyzeManualEntry', reason: 'null_result' });
            onAnalysisError?.();
          }
        } catch (error) {
          console.error('AnalysisResults: analyzeManualEntry failed', error);
          logWorkflow('analysis:failed', { branch: 'analyzeManualEntry', reason: 'exception' });
          onAnalysisError?.();
        }
      };
      void getAnalysis();
      return;
    }

    logWorkflow('analysis:no_matching_branch', {
      hint: 'No images and no manual data, or missing assessmentType. Resetting analysis state.',
      assessmentType: assessmentType || '(empty)',
      imageBase64sLength: imageBase64s?.length ?? 0,
      nonEmptyImages: nonEmptyImages.length,
    });
    onAnalysisError?.();
  }, [
    status,
    inputMode,
    imageBase64,
    imageBase64s,
    assessmentType,
    studentId,
    dialectContext,
    manualRubric,
    observations,
    curriculumFramework,
    gradeLevel,
    onAnalysisComplete,
    onAnalysisError,
  ]);

  const data = useMemo<DiagnosticReport>(() => reportData ?? EMPTY_REPORT, [reportData]);

  const handleGenerateLesson = async () => {
    setIsGeneratingLesson(true);
    setRegeneratedLessonPlan(null);
    const subject = assessmentType === 'literacy' ? 'literacy' : 'numeracy';

    const longitudinal = await loadLongitudinalPromptFields(
      studentId,
      assessmentType || subject,
      gradeLevel
    );

    const lessonPlanOpts: GenerateLessonPlanOptions = {
      studentGradeLevel: longitudinal.studentGradeLevel,
      dialectContext: dialectContext?.trim() || undefined,
    };

    try {
      if (shouldUseExtensionActivity(data)) {
        const rag = getCurriculumContext(
          assessmentType || subject,
          (data.diagnosis || '').slice(0, 800),
          curriculumFramework,
          gradeLevel
        );
        const ext = await generateExtensionActivity({
          report: data as AIDiagnosticReport,
          studentGradeLevel: lessonPlanOpts.studentGradeLevel,
          dialectContext: lessonPlanOpts.dialectContext,
          curriculumContext: rag.formattedContext,
        });
        if (ext && reportData) {
          setReportData({
            ...reportData,
            extensionActivity: ext,
            lessonPlan: MASTERY_EXTENSION_LESSON_PLACEHOLDER,
          });
          setRegeneratedLessonPlan(MASTERY_EXTENSION_LESSON_PLACEHOLDER);
          setShowLessonPlan(true);
        } else {
          const result = await generateRemedialLessonPlan(
            data.diagnosis,
            data.remedialPlan,
            subject,
            reportData?.gesAlignment,
            lessonPlanOpts
          );
          if (result) {
            setRegeneratedLessonPlan(result);
            setShowLessonPlan(true);
          }
        }
      } else {
        const result = await generateRemedialLessonPlan(
          data.diagnosis,
          data.remedialPlan,
          subject,
          reportData?.gesAlignment,
          lessonPlanOpts
        );
        if (result) {
          setRegeneratedLessonPlan(result);
          setShowLessonPlan(true);
        }
      }
    } finally {
      setIsGeneratingLesson(false);
    }
  };

  const displayLessonPlan = regeneratedLessonPlan ?? data.lessonPlan;
  const displayInstructions = displayLessonPlan?.instructions?.length
    ? displayLessonPlan.instructions
    : [
        'Gather 10 small stones or pebbles.',
        'Ask the student to divide the stones into two equal groups.',
        'Physically demonstrate the concept.',
      ];

  const handlePrintActivity = () => {
    const title = displayLessonPlan?.title ?? '5-Minute Remedial Activity';
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 2rem auto; padding: 1rem; }
    h1 { font-size: 1.25rem; margin-bottom: 1rem; }
    ol { margin: 0; padding-left: 1.5rem; }
    li { margin-bottom: 0.5rem; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p><strong>Instructions:</strong></p>
  <ol>${displayInstructions.map((step: string) => `<li>${step.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</li>`).join('')}</ol>
  <p style="margin-top: 2rem; font-size: 0.875rem; color: #666;">BaseCamp Diagnostics · HeckTeck AI</p>
</body>
</html>`;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      win.onload = () => {
        win.print();
        win.onafterprint = () => win.close();
      };
    } else {
      alert('Please allow pop-ups to print the activity.');
    }
  };

  const handleGenerateAudio = () => {
    setIsGeneratingAudio(true);
    setTimeout(() => setIsGeneratingAudio(false), 2000);
  };

  const handleSave = async () => {
    if (!studentId || !assessmentType) return;

    const displayPlan = regeneratedLessonPlan ?? data.lessonPlan ?? { title: '', instructions: [] };
    const playbookTitle = displayPlan?.title?.trim() || undefined;
    const assessment: Assessment = {
      studentId,
      type: assessmentType.toLowerCase().includes('lit') ? 'Literacy' : 'Numeracy',
      diagnosis: data.diagnosis,
      masteredConcepts: data.masteredConcepts,
      gapTags: data.gapTags ?? [],
      masteryTags: data.masteryTags ?? [],
      remedialPlan: data.remedialPlan || '',
      lessonPlan: displayPlan,
      extensionActivity: data.extensionActivity,
      playbookKey: playbookTitle ? playbookKeyFromLessonTitle(playbookTitle) : undefined,
      playbookTitle,
      score: typeof data.score === 'number' ? data.score : undefined,
      term: getDefaultTerm(),
      academicYear: getDefaultAcademicYear(),
      classLabel: DEFAULT_CLASS_LABEL,
      gesObjectiveId: data.gesAlignment?.objectiveId,
      gesObjectiveTitle: data.gesAlignment?.objectiveTitle,
      gesCurriculumExcerpt: data.gesAlignment?.excerpt,
      gesVerified: data.gesAlignment?.verified,
      timestamp: Date.now(),
      status: 'Completed',
    };

    if (isOffline) {
      alert('You are offline. Please reconnect to save to the learner profile.');
      return;
    }

    setIsSaving(true);
    try {
      if (savedAssessmentId) {
        await updateAssessment(savedAssessmentId, {
          lessonPlan: displayPlan,
          ...(data.extensionActivity !== undefined ? { extensionActivity: data.extensionActivity } : {}),
        });
        setIsSaved(true);
      } else {
        const resultId = await saveAssessment(assessment);
        if (resultId) {
          setSavedAssessmentId(resultId);
          setIsSaved(true);
          void evaluateAndPersistSenAlerts(studentId, {
            senWarningFlag: data.senWarningFlag,
            latestAssessmentId: resultId,
          });
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  return {
    reportData,
    data,
    showSmsDraft,
    setShowSmsDraft,
    showLessonPlan,
    isGeneratingLesson,
    isGeneratingAudio,
    isSaving,
    isSaved,
    displayLessonPlan,
    displayInstructions,
    handleGenerateLesson,
    handlePrintActivity,
    handleGenerateAudio,
    handleSave,
    analyzeHybridAssessment,
  };
}
