import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { addToQueue, StorageQuotaExceededError } from '../services/core/offlineQueueService';
import { logWorkflow } from '../utils/workflowLog';
import type { AssessmentData, AssessmentSetupSnapshot } from '../features/assessments/AssessmentSetup';
import type {
  AnalysisStatus,
  AnalyzeHybridAssessmentFn,
  DiagnosticReport,
  HybridAssessmentFlowResult,
  HybridAssessmentFlowContext,
} from '../hooks/useAnalysisFlow';

type CurrentView = string;

type AssessmentProviderProps = {
  children: ReactNode;
  isOffline: boolean;
  currentView: CurrentView;
  refreshQueue: () => Promise<void>;
  onOfflineQueued: () => void;
  onOpenStudentProfile: () => void;
};

type AssessmentContextValue = {
  analysisStatus: AnalysisStatus;
  lastAssessmentData: AssessmentData | null;
  setupSnapshot: AssessmentSetupSnapshot | null;
  reportData: DiagnosticReport | null;
  isHybridRunning: boolean;

  setSetupSnapshot: (snapshot: AssessmentSetupSnapshot | null) => void;
  setIsHybridRunning: (running: boolean) => void;
  setReportData: React.Dispatch<React.SetStateAction<DiagnosticReport | null>>;

  startAnalysis: () => void;
  /** Sets report and moves UI to results (single atomic transition after AI success). */
  setAnalysisResults: (report: DiagnosticReport) => void;
  markAnalysisEmpty: () => void;
  completeAnalysisFlow: () => void;
  abortAnalysisFlow: () => void;
  resetAssessment: () => void;

  registerHybridRunner: (runner: AnalyzeHybridAssessmentFn | null) => void;
  runHybridFromSetup: (
    studentId: string,
    audioBlob: Blob,
    optionalImage: Blob | null | undefined,
    flowContext?: HybridAssessmentFlowContext | null
  ) => Promise<HybridAssessmentFlowResult>;

  handleDiagnose: (data: AssessmentData) => Promise<void>;
  handleHybridQueued: () => void;

  isOffline: boolean;
  onOpenStudentProfile: () => void;
};

const AssessmentContext = createContext<AssessmentContextValue | null>(null);

export function AssessmentProvider({
  children,
  isOffline,
  currentView,
  refreshQueue,
  onOfflineQueued,
  onOpenStudentProfile,
}: AssessmentProviderProps) {
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>('empty');
  const [lastAssessmentData, setLastAssessmentData] = useState<AssessmentData | null>(null);
  const [setupSnapshot, setSetupSnapshot] = useState<AssessmentSetupSnapshot | null>(null);
  const [reportData, setReportData] = useState<DiagnosticReport | null>(null);
  const [isHybridRunning, setIsHybridRunning] = useState(false);

  const hybridRunnerRef = useRef<AnalyzeHybridAssessmentFn | null>(null);

  const registerHybridRunner = useCallback((runner: AnalyzeHybridAssessmentFn | null) => {
    hybridRunnerRef.current = runner;
  }, []);

  const resetAssessment = useCallback(() => {
    setAnalysisStatus('empty');
    setLastAssessmentData(null);
    setReportData(null);
    setSetupSnapshot(null);
    setIsHybridRunning(false);
  }, []);

  const startAnalysis = useCallback(() => {
    setAnalysisStatus('analyzing');
  }, []);

  const setAnalysisResults = useCallback((report: DiagnosticReport) => {
    logWorkflow('diagnose:analysis_complete', { status: 'results' });
    setReportData(report);
    setAnalysisStatus('results');
  }, []);

  const markAnalysisEmpty = useCallback(() => {
    setAnalysisStatus('empty');
  }, []);

  const completeAnalysisFlow = useCallback(() => {
    setAnalysisStatus('results');
  }, []);

  const abortAnalysisFlow = useCallback(() => {
    logWorkflow('diagnose:analysis_error_or_aborted', {
      note: 'Returned UI to empty. Open console for prior [BaseCamp:workflow] lines. Optional: localStorage basecampWorkflowDebug=1',
    });
    setAnalysisStatus('empty');
  }, []);

  const handleHybridQueued = useCallback(() => {
    setAnalysisStatus('empty');
    void refreshQueue();
    onOfflineQueued();
  }, [refreshQueue, onOfflineQueued]);

  const runHybridFromSetup = useCallback(
    async (
      studentId: string,
      audioBlob: Blob,
      optionalImage: Blob | null | undefined,
      flowContext?: HybridAssessmentFlowContext | null
    ) => {
      const fn = hybridRunnerRef.current;
      if (!fn) return { ok: false as const, error: 'not_ready' };

      if (!isOffline && flowContext) {
        setLastAssessmentData({
          studentId,
          assessmentType: flowContext.assessmentType,
          inputMode: 'voice',
          dialect: flowContext.dialectContext ?? null,
          curriculumFramework: flowContext.curriculumFramework ?? 'GES',
          gradeLevel: flowContext.gradeLevel,
          cohortId: flowContext.cohortId,
          classLabel: flowContext.classLabel,
        });
        setAnalysisStatus('analyzing');
      }

      return fn(studentId, audioBlob, optionalImage ?? null, flowContext);
    },
    [isOffline]
  );

  const handleDiagnose = useCallback(
    async (data: AssessmentData) => {
      logWorkflow('diagnose:received', {
        inputMode: data.inputMode,
        studentId: data.studentId,
        assessmentType: data.assessmentType,
        imagePages: data.imageBase64s?.filter(Boolean).length ?? 0,
        manual: data.inputMode === 'manual',
      });

      if (data.inputMode === 'voice') {
        logWorkflow('diagnose:skipped_voice_mode', {
          note: 'Voice uses the observation queue only; use Photo Upload or Manual for worksheet AI.',
        });
        setLastAssessmentData(data);
        setAnalysisStatus('empty');
        return;
      }

      setLastAssessmentData(data);

      if (isOffline) {
        logWorkflow('diagnose:offline_queue_path', { inputMode: data.inputMode });
        try {
          const assessmentType = data.assessmentType === 'literacy' ? 'literacy' : 'numeracy';

          if (data.inputMode === 'manual') {
            await addToQueue({
              studentId: data.studentId,
              assessmentType,
              inputMode: 'manual',
              manualRubric: data.manualRubric ?? [],
              observations: data.observations ?? '',
              dialectContext: data.dialect ?? undefined,
              curriculumFramework: data.curriculumFramework ?? 'GES',
              gradeLevel: data.gradeLevel,
              cohortId: data.cohortId,
              classLabel: data.classLabel,
            });
          } else {
            const imageBase64s = (data.imageBase64s ?? []).filter(Boolean);
            if (imageBase64s.length > 0) {
              await addToQueue({
                studentId: data.studentId,
                assessmentType,
                inputMode: 'upload',
                imageBase64s,
                dialectContext: data.dialect ?? undefined,
                curriculumFramework: data.curriculumFramework ?? 'GES',
                gradeLevel: data.gradeLevel,
                cohortId: data.cohortId,
                classLabel: data.classLabel,
              });
            } else {
              alert('Please upload at least one image before running diagnosis.');
              return;
            }
          }

          await refreshQueue();
          setAnalysisStatus('empty');
          onOfflineQueued();
        } catch (error) {
          console.error('Failed to queue offline diagnosis', error);
          if (error instanceof StorageQuotaExceededError) {
            alert(error.message);
          } else {
            alert('Could not queue this diagnosis offline. Please try again.');
          }
        }
        return;
      }

      logWorkflow('diagnose:online_starting_analysis', {
        inputMode: data.inputMode,
        imagePages: data.imageBase64s?.filter(Boolean).length ?? 0,
      });
      setAnalysisStatus('analyzing');
    },
    [isOffline, refreshQueue, onOfflineQueued]
  );

  // Leaving the assessment tab while mid-analysis: avoid stuck spinner on return
  useEffect(() => {
    if (currentView !== 'new-assessment') {
      setAnalysisStatus((s) => (s === 'analyzing' ? 'results' : s));
    }
  }, [currentView]);

  const value = useMemo<AssessmentContextValue>(
    () => ({
      analysisStatus,
      lastAssessmentData,
      setupSnapshot,
      reportData,
      isHybridRunning,
      setSetupSnapshot,
      setIsHybridRunning,
      setReportData,
      startAnalysis,
      setAnalysisResults,
      markAnalysisEmpty,
      completeAnalysisFlow,
      abortAnalysisFlow,
      resetAssessment,
      registerHybridRunner,
      runHybridFromSetup,
      handleDiagnose,
      handleHybridQueued,
      isOffline,
      onOpenStudentProfile,
    }),
    [
      analysisStatus,
      lastAssessmentData,
      setupSnapshot,
      reportData,
      isHybridRunning,
      setReportData,
      startAnalysis,
      setAnalysisResults,
      markAnalysisEmpty,
      completeAnalysisFlow,
      abortAnalysisFlow,
      resetAssessment,
      registerHybridRunner,
      runHybridFromSetup,
      handleDiagnose,
      handleHybridQueued,
      isOffline,
      onOpenStudentProfile,
    ]
  );

  return <AssessmentContext.Provider value={value}>{children}</AssessmentContext.Provider>;
}

export function useAssessment(): AssessmentContextValue {
  const ctx = useContext(AssessmentContext);
  if (!ctx) {
    throw new Error('useAssessment must be used within AssessmentProvider');
  }
  return ctx;
}

export type { AnalysisStatus };

