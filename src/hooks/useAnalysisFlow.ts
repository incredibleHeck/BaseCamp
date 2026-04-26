import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { saveAssessment, updateAssessment, type Assessment } from '../services/assessmentService';
import {
  formatCurriculumAlignmentLabel,
  generateExtensionActivity,
  generateSubjectRoutedLessonPlan,
  MASTERY_EXTENSION_LESSON_PLACEHOLDER,
  resolveAiCurriculumPromptType,
  shouldUseExtensionActivity,
  type DiagnosticReport as AIDiagnosticReport,
  type GenerateLessonPlanOptions,
} from '../services/ai/aiPrompts';
import { addToQueue, StorageQuotaExceededError } from '../services/core/offlineQueueService';
import {
  getDefaultAcademicYear,
  getDefaultTerm,
  DEFAULT_CLASS_LABEL,
} from '../config/academicContext';
import { playbookKeyFromLessonTitle } from '../utils/playbookKey';
import { curriculumFieldsFromDiagnosticReport } from '../utils/assessmentPersistUtils';
import { getStudent } from '../services/studentService';
import { evaluateAndPersistSenAlerts } from '../services/senAlertService';
import { logWorkflow, logWorkflowDebug } from '../utils/workflowLog';
import { useAssessment } from '../context/AssessmentContext';
import { getCurriculumContext, type CurriculumFramework } from '../services/ai/curriculumRagService';
import {
  executeFullAssessmentPipeline,
  loadLongitudinalPromptFields,
} from '../services/assessmentPipelineService';
import { useAuth } from '../context/AuthContext';
import { usePremiumTier } from '../context/PremiumTierContext';
import { useLiveClassroomSession } from '../context/LiveClassroomSessionContext';
import { useSchoolConfig } from './useSchoolConfig';

export type AnalysisStatus = 'empty' | 'analyzing' | 'results';

export interface DiagnosticReport extends AIDiagnosticReport {
  criticalGap?: string;
}

export type HybridAssessmentFlowResult =
  | { ok: true; savedAssessmentId: string }
  | { ok: true; queued: true }
  /** Live classroom path: IndexedDB skipped (RTDB in Sprint 2.2). */
  | { ok: true; bypassed: true }
  /** AI succeeded and UI shows the report, but Firestore save failed (e.g. rules / permissions). */
  | { ok: true; displayedOnly: true }
  | { ok: false; error: string };

/** Pass from UI when the hook’s props may not yet include this assessment (same-tick as diagnosis start). */
export type HybridAssessmentFlowContext = {
  assessmentType: 'numeracy' | 'literacy';
  dialectContext?: string | null;
  curriculumFramework?: CurriculumFramework;
  gradeLevel?: number;
  cohortId?: string;
  /** Cohort display name; persisted as assessment `classLabel` for rollups. */
  classLabel?: string;
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

export function useAnalysisFlow() {
  const { user } = useAuth();
  const { school } = useSchoolConfig(user.schoolId);
  const { isPremiumTier } = usePremiumTier();
  const { isLiveSessionActive } = useLiveClassroomSession();

  const {
    analysisStatus: status,
    lastAssessmentData,
    setupSnapshot,
    reportData,
    setReportData,
    setAnalysisResults,
    abortAnalysisFlow,
    isOffline,
  } = useAssessment();

  const studentId = lastAssessmentData?.studentId;
  const assessmentType = lastAssessmentData?.assessmentType;
  const inputMode = lastAssessmentData?.inputMode ?? setupSnapshot?.inputMode;
  const imageBase64 = lastAssessmentData?.imageBase64;
  const imageBase64s = lastAssessmentData?.imageBase64s;
  const dialectContext = lastAssessmentData?.dialect;
  const manualRubric = lastAssessmentData?.manualRubric;
  const observations = lastAssessmentData?.observations;
  const curriculumFramework = lastAssessmentData?.curriculumFramework ?? 'GES';
  const gradeLevel = lastAssessmentData?.gradeLevel;

  const resolvedAiCurriculumPromptType = useMemo(
    () => resolveAiCurriculumPromptType(school?.curriculumType, curriculumFramework),
    [school?.curriculumType, curriculumFramework]
  );
  const curriculumAlignmentLabel = useMemo(
    () => formatCurriculumAlignmentLabel(school?.curriculumType, curriculumFramework),
    [school?.curriculumType, curriculumFramework]
  );
  const aiCurriculumPromptRef = useRef(resolvedAiCurriculumPromptType);
  aiCurriculumPromptRef.current = resolvedAiCurriculumPromptType;
  const cohortIdFromSetup = lastAssessmentData?.cohortId?.trim();
  const classLabelFromSetup = lastAssessmentData?.classLabel?.trim();

  const [showSmsDraft, setShowSmsDraft] = useState(false);
  const [showLessonPlan, setShowLessonPlan] = useState(false);
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedAssessmentId, setSavedAssessmentId] = useState<string | null>(null);
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
        effectiveType === 'literacy' || effectiveType.toLowerCase().includes('lit')
          ? 'literacy'
          : 'numeracy';

      const effectiveDialect = flowContext?.dialectContext ?? dialectContext ?? '';
      const effectiveFramework = flowContext?.curriculumFramework ?? curriculumFramework ?? 'GES';
      const effectiveGrade = flowContext?.gradeLevel ?? gradeLevel;
      const effectiveCohortId =
        flowContext?.cohortId?.trim() || cohortIdFromSetup || undefined;
      const effectiveClassLabel =
        flowContext?.classLabel?.trim() || classLabelFromSetup || DEFAULT_CLASS_LABEL;

      try {
        const audioDataUrl = await blobToDataUrl(audioBlob);
        const worksheetDataUrl =
          optionalImageBlob && optionalImageBlob.size > 0 ? await blobToDataUrl(optionalImageBlob) : undefined;

        if (isOffline) {
          const addResult = await addToQueue(
            {
              studentId,
              assessmentType: subjectKey,
              inputMode: 'hybrid_voice',
              dialectContext: effectiveDialect,
              curriculumFramework: effectiveFramework,
              gradeLevel: effectiveGrade,
              cohortId: effectiveCohortId,
              classLabel: effectiveClassLabel,
              audioBase64: audioDataUrl,
              audioMimeType: audioBlob.type || 'audio/webm',
              imageBase64s: worksheetDataUrl ? [worksheetDataUrl] : undefined,
            },
            {
              isPremiumTier,
              isLiveSessionActive,
              channel: 'standard_assessment',
            }
          );
          if (addResult.status === 'bypassed') {
            logWorkflow('analysis:hybrid_offline_bypassed', { studentId });
            return { ok: true, bypassed: true };
          }
          logWorkflow('analysis:hybrid_queued_offline', { studentId });
          return { ok: true, queued: true };
        }

        const pipeline = await executeFullAssessmentPipeline({
          variant: 'hybrid',
          studentId,
          audioBase64: audioDataUrl,
          audioMimeType: audioBlob.type || 'audio/webm',
          worksheetImage:
            worksheetDataUrl && worksheetDataUrl.length > 0
              ? {
                  base64: worksheetDataUrl,
                  mimeType: optionalImageBlob?.type?.trim() || 'image/jpeg',
                }
              : undefined,
          assessmentType: effectiveType,
          dialectContext: effectiveDialect,
          curriculumFramework: effectiveFramework,
          gradeLevel: effectiveGrade,
          aiCurriculumPromptType: resolveAiCurriculumPromptType(
            school?.curriculumType,
            effectiveFramework
          ),
        });

        if (pipeline.ok === false) {
          logWorkflow('analysis:hybrid_failed', { reason: pipeline.reason });
          abortAnalysisFlow();
          return { ok: false, error: 'analysis_failed' };
        }

        const full = pipeline.report as DiagnosticReport;
        setAnalysisResults(full);
        if (full.extensionActivity?.trim()) {
          setRegeneratedLessonPlan(MASTERY_EXTENSION_LESSON_PLACEHOLDER);
        } else {
          setRegeneratedLessonPlan(null);
        }
        logWorkflow('analysis:hybrid_complete', { studentId });

        const displayPlan = full.lessonPlan ?? { title: '', instructions: [] };
        const playbookTitle = displayPlan?.title?.trim() || undefined;
        const type: Assessment['type'] = subjectKey === 'literacy' ? 'Literacy' : 'Numeracy';
        const studentRow = await getStudent(studentId);
        const curriculum = curriculumFieldsFromDiagnosticReport(full);

        const assessment: Assessment = {
          studentId,
          schoolId: studentRow?.schoolId?.trim() || undefined,
          type,
          ...curriculum,
          diagnosis: full.diagnosis,
          masteredConcepts: full.masteredConcepts,
          gapTags: full.gapTags ?? [],
          masteryTags: full.masteryTags ?? [],
          remedialPlan: full.remedialPlan || '',
          lessonPlan: displayPlan,
          extensionActivity: full.extensionActivity,
          playbookKey: playbookTitle ? playbookKeyFromLessonTitle(playbookTitle) : undefined,
          playbookTitle,
          term: getDefaultTerm(),
          academicYear: getDefaultAcademicYear(),
          classLabel: effectiveClassLabel,
          cohortId: effectiveCohortId,
          gesObjectiveId: full.gesAlignment?.objectiveId,
          gesObjectiveTitle: full.gesAlignment?.objectiveTitle,
          gesCurriculumExcerpt: full.gesAlignment?.excerpt,
          gesVerified: full.gesAlignment?.verified,
          senWarningFlag: full.senWarningFlag ?? undefined,
          timestamp: Date.now(),
          status: 'Completed',
        };

        const resultId = await saveAssessment(assessment);
        if (!resultId) {
          logWorkflow('analysis:hybrid_save_failed', { studentId });
          return { ok: true, displayedOnly: true };
        }
        setSavedAssessmentId(resultId);
        setIsSaved(true);
        evaluateAndPersistSenAlerts(studentId, {
          senWarningFlag: full.senWarningFlag,
          latestAssessmentId: resultId,
        }).catch((err) => console.error('SEN Alert evaluation failed:', err));
        return { ok: true, savedAssessmentId: resultId };
      } catch (error) {
        console.error('analyzeHybridAssessment failed', error);
        if (error instanceof StorageQuotaExceededError && typeof alert !== 'undefined') {
          alert(error.message);
        }
        logWorkflow('analysis:hybrid_failed', { reason: 'exception' });
        abortAnalysisFlow();
        return { ok: false, error: 'exception' };
      }
    },
    [
      assessmentType,
      curriculumFramework,
      dialectContext,
      gradeLevel,
      cohortIdFromSetup,
      classLabelFromSetup,
      isOffline,
      isPremiumTier,
      isLiveSessionActive,
      school?.curriculumType,
      setAnalysisResults,
      abortAnalysisFlow,
    ]
  );

  useEffect(() => {
    setRegeneratedLessonPlan(null);
    setSavedAssessmentId(null);
    setIsSaved(false);
  }, [reportData]);

  useEffect(() => {
    if (status !== 'analyzing') return;

    // Voice/hybrid pipeline sets report asynchronously; skip worksheet/manual effect while it runs.
    if (inputMode === 'voice') return;

    const nonEmptyImages = (imageBase64s ?? []).filter((s) => s && String(s).trim().length > 0);
    const worksheetImages =
      nonEmptyImages.length > 0
        ? nonEmptyImages
        : imageBase64 && String(imageBase64).trim().length > 0
          ? [imageBase64]
          : [];

    logWorkflow('analysis:effect_start', {
      assessmentType: assessmentType || '(empty)',
      imageCount: worksheetImages.length,
      hasSingleImage: worksheetImages.length === 1,
      manualRubricCount: manualRubric?.length ?? 0,
      observationsLen: (observations?.trim() ?? '').length,
    });
    logWorkflowDebug('analysis:effect_inputs', {
      studentId: studentId ?? null,
      dialectSet: Boolean(dialectContext),
    });

    if (worksheetImages.length > 0 && assessmentType) {
      const getAnalysis = async () => {
        try {
          logWorkflow('analysis:branch', { branch: 'worksheet_pipeline', pages: worksheetImages.length });
          const result = await executeFullAssessmentPipeline({
            variant: 'worksheet',
            studentId,
            assessmentType,
            dialectContext: dialectContext || '',
            curriculumFramework,
            gradeLevel,
            images: worksheetImages,
            aiCurriculumPromptType: aiCurriculumPromptRef.current,
          });
          if (result.ok === true) {
            setAnalysisResults(result.report as DiagnosticReport);
            logWorkflow('analysis:complete', { branch: 'worksheet_pipeline' });
          } else {
            logWorkflow('analysis:failed', { branch: 'worksheet_pipeline', reason: result.reason });
            abortAnalysisFlow();
          }
        } catch (error) {
          console.error('AnalysisResults: worksheet pipeline failed', error);
          logWorkflow('analysis:failed', { branch: 'worksheet_pipeline', reason: 'exception' });
          abortAnalysisFlow();
        }
      };
      void getAnalysis();
      return;
    }

    if (assessmentType && (manualRubric?.length || (observations?.trim() ?? '').length > 0)) {
      const getAnalysis = async () => {
        try {
          const result = await executeFullAssessmentPipeline({
            variant: 'manual',
            studentId,
            assessmentType,
            dialectContext: dialectContext || '',
            curriculumFramework,
            gradeLevel,
            manualRubric: manualRubric ?? [],
            observations: observations?.trim() ?? '',
            aiCurriculumPromptType: aiCurriculumPromptRef.current,
          });
          if (result.ok === true) {
            setAnalysisResults(result.report as DiagnosticReport);
            logWorkflow('analysis:complete', { branch: 'analyzeManualEntry' });
          } else {
            logWorkflow('analysis:failed', { branch: 'analyzeManualEntry', reason: result.reason });
            abortAnalysisFlow();
          }
        } catch (error) {
          console.error('AnalysisResults: manual pipeline failed', error);
          logWorkflow('analysis:failed', { branch: 'analyzeManualEntry', reason: 'exception' });
          abortAnalysisFlow();
        }
      };
      void getAnalysis();
      return;
    }

    logWorkflow('analysis:no_matching_branch', {
      hint: 'No images and no manual data, or missing assessmentType. Resetting analysis state.',
      assessmentType: assessmentType || '(empty)',
      imageBase64sLength: imageBase64s?.length ?? 0,
      worksheetImages: worksheetImages.length,
    });
    abortAnalysisFlow();
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
    setAnalysisResults,
    abortAnalysisFlow,
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
      curriculumType: resolvedAiCurriculumPromptType,
    };

    const gradeForLesson =
      typeof lessonPlanOpts.studentGradeLevel === 'number' &&
      Number.isFinite(lessonPlanOpts.studentGradeLevel)
        ? lessonPlanOpts.studentGradeLevel
        : 4;

    const at = assessmentType || subject;
    const ragHint = (data.diagnosis || '').slice(0, 800);

    try {
      if (shouldUseExtensionActivity(data)) {
        const rag = getCurriculumContext(at, ragHint, curriculumFramework, gradeLevel);
        const ext = await generateExtensionActivity({
          report: data as AIDiagnosticReport,
          studentGradeLevel: lessonPlanOpts.studentGradeLevel,
          dialectContext: lessonPlanOpts.dialectContext,
          curriculumContext: rag.formattedContext,
          curriculumType: lessonPlanOpts.curriculumType,
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
          const result = await generateSubjectRoutedLessonPlan(
            data as AIDiagnosticReport,
            at,
            subject,
            gradeForLesson,
            lessonPlanOpts.dialectContext,
            rag.formattedContext,
            lessonPlanOpts.curriculumType
          );
          if (result) {
            setRegeneratedLessonPlan(result);
            setShowLessonPlan(true);
          }
        }
      } else {
        const rag = getCurriculumContext(at, ragHint, curriculumFramework, gradeLevel);
        const result = await generateSubjectRoutedLessonPlan(
          data as AIDiagnosticReport,
          at,
          subject,
          gradeForLesson,
          lessonPlanOpts.dialectContext,
          rag.formattedContext,
          lessonPlanOpts.curriculumType
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
    const title = displayLessonPlan?.title ?? '10-Minute Remedial Activity';
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
  <p style="margin-top: 2rem; font-size: 0.875rem; color: #666;">BaseCamp Diagnostics · HecTech AI</p>
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
    const studentRow = await getStudent(studentId);
    const curriculum = curriculumFieldsFromDiagnosticReport(data);
    const assessment: Assessment = {
      studentId,
      schoolId: studentRow?.schoolId?.trim() || undefined,
      type: assessmentType.toLowerCase().includes('lit') ? 'Literacy' : 'Numeracy',
      ...curriculum,
      diagnosis: data.diagnosis,
      masteredConcepts: data.masteredConcepts,
      gapTags: data.gapTags ?? [],
      masteryTags: data.masteryTags ?? [],
      remedialPlan: data.remedialPlan || '',
      lessonPlan: displayPlan,
      extensionActivity: data.extensionActivity,
      playbookKey: playbookTitle ? playbookKeyFromLessonTitle(playbookTitle) : undefined,
      playbookTitle,
      term: getDefaultTerm(),
      academicYear: getDefaultAcademicYear(),
      classLabel: classLabelFromSetup || DEFAULT_CLASS_LABEL,
      cohortId: cohortIdFromSetup || undefined,
      gesObjectiveId: data.gesAlignment?.objectiveId,
      gesObjectiveTitle: data.gesAlignment?.objectiveTitle,
      gesCurriculumExcerpt: data.gesAlignment?.excerpt,
      gesVerified: data.gesAlignment?.verified,
      senWarningFlag: data.senWarningFlag ?? undefined,
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
          evaluateAndPersistSenAlerts(studentId, {
            senWarningFlag: data.senWarningFlag,
            latestAssessmentId: resultId,
          }).catch((err) => console.error('SEN Alert evaluation failed:', err));
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
    curriculumAlignmentLabel,
  };
}


