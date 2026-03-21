import { useState, useEffect, useMemo } from 'react';
import { saveAssessment, updateAssessment, type Assessment } from '../services/assessmentService';
import {
  analyzeWorksheet,
  analyzeWorksheetMultiple,
  analyzeManualEntry,
  generateRemedialLessonPlan,
  type DiagnosticReport as AIDiagnosticReport,
} from '../services/aiPrompts';
import {
  getDefaultAcademicYear,
  getDefaultTerm,
  DEFAULT_CLASS_LABEL,
} from '../config/academicContext';
import { playbookKeyFromLessonTitle } from '../utils/playbookKey';
import { evaluateAndPersistSenAlerts } from '../services/senAlertService';
import { logWorkflow, logWorkflowDebug } from '../utils/workflowLog';

export type AnalysisStatus = 'empty' | 'analyzing' | 'results';

export interface DiagnosticReport extends AIDiagnosticReport {
  criticalGap?: string;
}

export interface UseAnalysisFlowParams {
  status: AnalysisStatus;
  isOffline?: boolean;
  studentId?: string;
  assessmentType?: string;
  imageBase64?: string | null;
  imageBase64s?: string[] | null;
  dialectContext?: string | null;
  manualRubric?: string[] | null;
  observations?: string | null;
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

export function useAnalysisFlow({
  status,
  isOffline = false,
  studentId,
  assessmentType,
  imageBase64,
  imageBase64s,
  dialectContext,
  manualRubric,
  observations,
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
          const result = await analyzeWorksheetMultiple(
            nonEmptyImages,
            assessmentType,
            dialectContext || ''
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
          const result = await analyzeWorksheet(imageBase64, assessmentType, dialectContext || '');
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
          const result = await analyzeManualEntry(
            assessmentType,
            dialectContext || '',
            manualRubric ?? [],
            observations?.trim() ?? ''
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
    imageBase64,
    imageBase64s,
    assessmentType,
    studentId,
    dialectContext,
    manualRubric,
    observations,
    onAnalysisComplete,
    onAnalysisError,
  ]);

  const data = useMemo<DiagnosticReport>(() => reportData ?? EMPTY_REPORT, [reportData]);

  const handleGenerateLesson = async () => {
    setIsGeneratingLesson(true);
    setRegeneratedLessonPlan(null);
    const subject = assessmentType === 'literacy' ? 'literacy' : 'numeracy';
    const result = await generateRemedialLessonPlan(
      data.diagnosis,
      data.remedialPlan,
      subject,
      reportData?.gesAlignment
    );
    setIsGeneratingLesson(false);
    if (result) {
      setRegeneratedLessonPlan(result);
      setShowLessonPlan(true);
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
        await updateAssessment(savedAssessmentId, { lessonPlan: displayPlan });
        setIsSaved(true);
      } else {
        const resultId = await saveAssessment(assessment);
        if (resultId) {
          setSavedAssessmentId(resultId);
          setIsSaved(true);
          void evaluateAndPersistSenAlerts(studentId);
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
  };
}
