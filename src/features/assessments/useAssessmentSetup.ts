import { useState, useEffect, useCallback, useMemo } from 'react';
import { getStudents, getStudentsBySchool, getStudentsByCohorts, Student } from '../../services/studentService';
import { logWorkflow } from '../../utils/workflowLog';
import { useAssessment } from '../../context/AssessmentContext';
import type { CurriculumFramework } from '../../services/ai/curriculumRagService';
import { parseGradeLevelFromStudentRecord } from '../../utils/longitudinalPromptHelpers';
import { getCohortsBySchool, getCohortsByTeacher } from '../../services/cohortService';
import { useAuth } from '../../context/AuthContext';
import type { Cohort } from '../../types/domain';
import { ASSESSMENT_TRANSLANGUAGING_LANGUAGES } from '../../constants/studentLanguages';
import type { AssessmentData, StagedVoiceClip } from './AssessmentSetup';

export function useAssessmentSetup(initialStudentId: string) {
  const { user } = useAuth();
  const schoolId = user.schoolId?.trim() || undefined;

  const {
    handleDiagnose,
    analysisStatus,
    isOffline,
    runHybridFromSetup,
    handleHybridQueued,
    setSetupSnapshot,
    isHybridRunning,
    setIsHybridRunning,
  } = useAssessment();

  const isProcessing = analysisStatus === 'analyzing' || isHybridRunning;
  
  const [students, setStudents] = useState<Student[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [cohortsLoading, setCohortsLoading] = useState(false);
  
  const [selectedCohortId, setSelectedCohortId] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(initialStudentId);
  const [assessmentType, setAssessmentType] = useState<'numeracy' | 'literacy' | ''>('');
  const [curriculumFramework, setCurriculumFramework] = useState<CurriculumFramework>('GES');
  const [inputMode, setInputMode] = useState<'upload' | 'manual' | 'voice'>('upload');
  
  const [isLocalDialect, setIsLocalDialect] = useState(false);
  const [selectedDialect, setSelectedDialect] = useState('');

  const [imageBase64s, setImageBase64s] = useState<string[]>([]);
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [uploadScope, setUploadScope] = useState<'single' | 'batch'>('single');

  const [selectedRubrics, setSelectedRubrics] = useState<string[]>([]);
  const [observations, setObservations] = useState('');

  const [stagedAudio, setStagedAudio] = useState<StagedVoiceClip | null>(null);
  const [stagedImage, setStagedImage] = useState<File | null>(null);
  const [hybridUploadKey, setHybridUploadKey] = useState(0);
  const [stagedImagePreviewUrl, setStagedImagePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    
    const loadData = async () => {
      setCohortsLoading(true);
      
      try {
        let fetchedCohorts: Cohort[] = [];
        let fetchedStudents: Student[] = [];

        if (user.role === 'teacher' && user.id) {
          fetchedCohorts = await getCohortsByTeacher(user.id);
          const cohortIds = fetchedCohorts.map(c => c.id);
          if (cohortIds.length > 0) {
            fetchedStudents = await getStudentsByCohorts(cohortIds);
          }
        } else if (schoolId) {
          fetchedCohorts = await getCohortsBySchool(schoolId);
          fetchedStudents = await getStudentsBySchool(schoolId);
        } else {
          // Fallback for district/admin without schoolId
          fetchedStudents = await getStudents();
        }

        if (!cancelled) {
          setCohorts(fetchedCohorts);
          setStudents(fetchedStudents);
        }
      } catch (error) {
        console.error('Failed to load cohorts/students:', error);
      } finally {
        if (!cancelled) {
          setCohortsLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [user.id, user.role, schoolId]);

  useEffect(() => {
    if (!selectedStudent) {
      setSelectedCohortId('');
      return;
    }
    const st = students.find((s) => s.id === selectedStudent);
    const cid = st?.cohortId?.trim();
    if (cid && cohorts.some((c) => c.id === cid)) {
      setSelectedCohortId(cid);
    } else {
      setSelectedCohortId('');
    }
  }, [selectedStudent, students, cohorts]);

  useEffect(() => {
    if (!selectedStudent) {
      setIsLocalDialect(false);
      setSelectedDialect('');
      return;
    }
    const st = students.find((s) => s.id === selectedStudent);
    const raw = st?.primaryLanguage?.trim();
    if (!raw) {
      setIsLocalDialect(false);
      setSelectedDialect('');
      return;
    }
    const match = ASSESSMENT_TRANSLANGUAGING_LANGUAGES.find((d) => d.toLowerCase() === raw.toLowerCase());
    if (match) {
      setIsLocalDialect(true);
      setSelectedDialect(match);
    } else {
      setIsLocalDialect(false);
      setSelectedDialect('');
    }
  }, [selectedStudent, students]);

  const selectedCohort = useMemo(
    () => cohorts.find((c) => c.id === selectedCohortId),
    [cohorts, selectedCohortId]
  );

  const dialectValue = isLocalDialect && selectedDialect ? selectedDialect : null;

  useEffect(() => {
    const batchUpload = inputMode === 'upload' && uploadScope === 'batch';
    setSetupSnapshot({
      studentId: batchUpload ? '' : selectedStudent,
      assessmentType,
      inputMode,
      dialect: dialectValue,
      curriculumFramework,
    });
  }, [selectedStudent, assessmentType, inputMode, uploadScope, dialectValue, curriculumFramework, setSetupSnapshot]);

  useEffect(() => {
    if (inputMode !== 'upload') {
      setUploadScope('single');
      setBatchFiles([]);
    }
  }, [inputMode]);

  useEffect(() => {
    setBatchFiles([]);
    setImageBase64s([]);
  }, [uploadScope]);

  useEffect(() => {
    if (inputMode !== 'voice') {
      setStagedAudio(null);
      setStagedImage(null);
      setHybridUploadKey((k) => k + 1);
    }
  }, [inputMode]);

  useEffect(() => {
    setStagedAudio(null);
    setStagedImage(null);
    setHybridUploadKey((k) => k + 1);
  }, [selectedStudent, assessmentType]);

  useEffect(() => {
    if (!stagedImage) {
      setStagedImagePreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(stagedImage);
    setStagedImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [stagedImage]);

  const clearVoiceStaging = useCallback(() => {
    setStagedAudio(null);
    setStagedImage(null);
    setHybridUploadKey((k) => k + 1);
  }, []);

  const handleHybridWorksheetFiles = useCallback((files: File[]) => {
    setStagedImage(files.length > 0 ? files[0] : null);
  }, []);

  const handleSingleUploadFilesProcessed = (files: File[]) => {
    setBatchFiles([]);
    if (files.length === 0) {
      setImageBase64s([]);
      return;
    }
    let completed = 0;
    const results: string[] = new Array(files.length);
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        results[index] = reader.result as string;
        completed++;
        if (completed === files.length) {
          setImageBase64s(results.filter(Boolean));
        }
      };
      reader.onerror = () => {
        completed++;
        if (completed === files.length) setImageBase64s(results.filter(Boolean));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleBatchFilesProcessed = (files: File[]) => {
    setImageBase64s([]);
    setBatchFiles(files);
  };

  const handleRubricToggle = (rubric: string) => {
    setSelectedRubrics((prev) =>
      prev.includes(rubric) ? prev.filter((r) => r !== rubric) : [...prev, rubric]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMode === 'voice') return;
    if (inputMode === 'upload' && uploadScope === 'batch') return;
    if (!selectedStudent || !assessmentType) {
      alert('Please select a student and assessment type.');
      return;
    }
    if (!selectedCohortId || !selectedCohort) {
      alert('Please select a class (cohort) for this assessment.');
      return;
    }

    const studentRecord = students.find((s) => s.id === selectedStudent);
    const gradeLevel = parseGradeLevelFromStudentRecord(studentRecord);
    const payload: AssessmentData = {
      studentId: selectedStudent,
      assessmentType,
      inputMode,
      dialect: dialectValue,
      curriculumFramework,
      gradeLevel,
      cohortId: selectedCohortId,
      classLabel: selectedCohort.name,
      manualRubric: inputMode === 'manual' ? selectedRubrics : undefined,
      observations: inputMode === 'manual' ? observations : undefined,
      imageBase64: inputMode === 'upload' && imageBase64s.length === 1 ? imageBase64s[0] : undefined,
      imageBase64s: inputMode === 'upload' ? imageBase64s : undefined,
    };
    logWorkflow('assessmentSetup:submit_run_diagnosis', {
      inputMode: payload.inputMode,
      imagePages: payload.imageBase64s?.filter(Boolean).length ?? 0,
    });
    void handleDiagnose(payload);
  };

  const handleHybridDiagnosisClick = async () => {
    if (!stagedAudio || !assessmentType) return;
    if (!selectedStudent) return;
    if (!selectedCohortId || !selectedCohort) {
      alert('Please select a class (cohort) for this assessment.');
      return;
    }

    setIsHybridRunning(true);
    logWorkflow('assessmentSetup:hybrid_run_start', {
      studentId: selectedStudent,
      hasImage: Boolean(stagedImage),
      offline: isOffline,
    });

    try {
      const studentRecord = students.find((s) => s.id === selectedStudent);
      const gradeLevel = parseGradeLevelFromStudentRecord(studentRecord);
      const result = await runHybridFromSetup(selectedStudent, stagedAudio.blob, stagedImage, {
        assessmentType,
        dialectContext: dialectValue,
        curriculumFramework,
        gradeLevel,
        cohortId: selectedCohortId,
        classLabel: selectedCohort.name,
      });

      if (result.ok && 'queued' in result && result.queued) {
        handleHybridQueued();
        clearVoiceStaging();
        logWorkflow('assessmentSetup:hybrid_queued', { studentId: selectedStudent });
        return;
      }

      if (result.ok && 'savedAssessmentId' in result) {
        clearVoiceStaging();
        logWorkflow('assessmentSetup:hybrid_saved', { id: result.savedAssessmentId });
        return;
      }

      if (result.ok && 'displayedOnly' in result && result.displayedOnly) {
        clearVoiceStaging();
        logWorkflow('assessmentSetup:hybrid_displayed_save_failed', { studentId: selectedStudent });
        alert(
          'The diagnosis finished and is shown above, but it could not be saved to your database (usually Firestore permissions). Sign out and sign in again after deploying the latest rules, or check the console for details.'
        );
        return;
      }

      if ('error' in result) {
        if (result.error === 'not_ready') {
          alert('Diagnosis engine is still starting. Wait a moment and try again.');
        } else {
          alert('Diagnosis could not be completed. Check your connection and try again.');
        }
      }
    } catch (err) {
      console.error('Hybrid diagnosis failed', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsHybridRunning(false);
    }
  };

  const handleQueueBatchClick = () => {
    console.log('Class batch worksheets (preview — not queued yet):', batchFiles);
  };

  const cohortReady = Boolean(selectedCohortId && selectedCohort);
  const isFormValid = !!selectedStudent && !!assessmentType && cohortReady;
  const canRecordVoice = isFormValid;
  const isUploadModeValid = isFormValid && imageBase64s.length > 0;
  const isBatchQueueValid = !!assessmentType && batchFiles.length > 0 && cohortReady;
  const isManualModeValid = isFormValid && (selectedRubrics.length > 0 || observations.length > 0);

  return {
    state: {
      schoolId,
      isProcessing,
      isOffline,
      isHybridRunning,
      students,
      cohorts,
      cohortsLoading,
      selectedCohortId,
      selectedStudent,
      assessmentType,
      curriculumFramework,
      inputMode,
      isLocalDialect,
      selectedDialect,
      imageBase64s,
      batchFiles,
      uploadScope,
      selectedRubrics,
      observations,
      stagedAudio,
      stagedImage,
      hybridUploadKey,
      stagedImagePreviewUrl,
      dialectValue,
      cohortReady,
      isFormValid,
      canRecordVoice,
      isUploadModeValid,
      isBatchQueueValid,
      isManualModeValid,
    },
    handlers: {
      setSelectedCohortId,
      setSelectedStudent,
      setAssessmentType,
      setCurriculumFramework,
      setInputMode,
      setIsLocalDialect,
      setSelectedDialect,
      setUploadScope,
      setObservations,
      setStagedAudio,
      setStagedImage,
      setHybridUploadKey,
      clearVoiceStaging,
      handleHybridWorksheetFiles,
      handleSingleUploadFilesProcessed,
      handleBatchFilesProcessed,
      handleRubricToggle,
      handleSubmit,
      handleHybridDiagnosisClick,
      handleQueueBatchClick,
    },
  };
}