import React, { useState, useEffect, useCallback } from 'react';
import { FileUploadZone } from './FileUploadZone';
import {
  Camera,
  CheckCircle,
  Edit3,
  Image as ImageFileIcon,
  Loader2,
  Mic,
  RotateCcw,
  Trash2,
  Users,
  User,
  Zap,
} from 'lucide-react';
import { getStudents, Student } from '../services/studentService';
import { VoiceObservationRecorder } from './VoiceObservationRecorder';
import { logWorkflow } from '../utils/workflowLog';
import type { AnalyzeHybridAssessmentFn } from '../hooks/useAnalysisFlow';
import type { CurriculumFramework } from '../services/curriculumRagService';
import { parseGradeLevelFromLabel } from '../services/curriculumRagService';

export interface StagedVoiceClip {
  blob: Blob;
  mimeType: string;
  durationMs: number;
}

// 1. Define the shape of the data we will submit
export interface AssessmentData {
  studentId: string;
  assessmentType: 'numeracy' | 'literacy' | '';
  inputMode: 'upload' | 'manual' | 'voice';
  dialect: string | null;
  /** Ghana GES vs Cambridge International (math pilot RAG). */
  curriculumFramework?: CurriculumFramework;
  /** Best-effort parse from selected student roster grade (Cambridge filtering). */
  gradeLevel?: number;
  manualRubric?: string[];
  observations?: string;
  imageBase64?: string | null;
  imageBase64s?: string[];
}

export type AssessmentSetupSnapshot = Pick<
  AssessmentData,
  'studentId' | 'assessmentType' | 'inputMode' | 'dialect' | 'curriculumFramework'
>;

function formatDurationMs(ms: number): string {
  const totalSec = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface AssessmentSetupProps {
  onDiagnose: (data: AssessmentData) => void;
  isProcessing?: boolean;
  initialStudentId?: string;
  /** Current form context for the right panel (e.g. voice-mode empty state). */
  onSetupStateChange?: (snapshot: AssessmentSetupSnapshot) => void;
  isOffline?: boolean;
  /** Multimodal voice (+ optional worksheet) diagnosis; registered from AnalysisResults. */
  analyzeHybridAssessment?: AnalyzeHybridAssessmentFn;
  /** After hybrid item is queued offline (modal / refresh handled by parent). */
  onHybridQueued?: () => void;
}

export function AssessmentSetup({
  onDiagnose,
  isProcessing = false,
  initialStudentId = '',
  onSetupStateChange,
  isOffline = false,
  analyzeHybridAssessment,
  onHybridQueued,
}: AssessmentSetupProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState(initialStudentId);
  const [assessmentType, setAssessmentType] = useState<'numeracy' | 'literacy' | ''>('');
  const [curriculumFramework, setCurriculumFramework] = useState<CurriculumFramework>('GES');
  const [inputMode, setInputMode] = useState<'upload' | 'manual' | 'voice'>('upload');
  const [isLocalDialect, setIsLocalDialect] = useState(false);
  const [selectedDialect, setSelectedDialect] = useState('');

  /** Single-student upload: base64 for existing diagnose flow. */
  const [imageBase64s, setImageBase64s] = useState<string[]>([]);
  /** Class batch: raw files (submission not wired yet). */
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [uploadScope, setUploadScope] = useState<'single' | 'batch'>('single');

  // Manual entry states
  const [selectedRubrics, setSelectedRubrics] = useState<string[]>([]);
  const [observations, setObservations] = useState('');

  /** Voice hybrid staging (not queued until teacher runs diagnosis). */
  const [stagedAudio, setStagedAudio] = useState<StagedVoiceClip | null>(null);
  const [stagedImage, setStagedImage] = useState<File | null>(null);
  const [hybridUploadKey, setHybridUploadKey] = useState(0);
  const [isHybridRunning, setIsHybridRunning] = useState(false);
  const [stagedImagePreviewUrl, setStagedImagePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      const fetchedStudents = await getStudents();
      setStudents(fetchedStudents);
    };
    fetchStudents();
  }, []);

  const dialectValue = isLocalDialect && selectedDialect ? selectedDialect : null;

  useEffect(() => {
    const batchUpload = inputMode === 'upload' && uploadScope === 'batch';
    onSetupStateChange?.({
      studentId: batchUpload ? '' : selectedStudent,
      assessmentType,
      inputMode,
      dialect: dialectValue,
      curriculumFramework,
    });
  }, [selectedStudent, assessmentType, inputMode, uploadScope, dialectValue, curriculumFramework, onSetupStateChange]);

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

    const selectedGrade = students.find((s) => s.id === selectedStudent)?.grade;
    const gradeLevel = parseGradeLevelFromLabel(selectedGrade);
    const payload: AssessmentData = {
      studentId: selectedStudent,
      assessmentType,
      inputMode,
      dialect: dialectValue,
      curriculumFramework,
      gradeLevel,
      manualRubric: inputMode === 'manual' ? selectedRubrics : undefined,
      observations: inputMode === 'manual' ? observations : undefined,
      imageBase64: inputMode === 'upload' && imageBase64s.length === 1 ? imageBase64s[0] : undefined,
      imageBase64s: inputMode === 'upload' ? imageBase64s : undefined,
    };
    logWorkflow('assessmentSetup:submit_run_diagnosis', {
      inputMode: payload.inputMode,
      imagePages: payload.imageBase64s?.filter(Boolean).length ?? 0,
    });
    onDiagnose(payload);
  };

  const handleHybridDiagnosisClick = async () => {
    if (!stagedAudio || !analyzeHybridAssessment || !assessmentType) return;
    if (!selectedStudent) return;

    setIsHybridRunning(true);
    logWorkflow('assessmentSetup:hybrid_run_start', {
      studentId: selectedStudent,
      hasImage: Boolean(stagedImage),
      offline: isOffline,
    });

    try {
      const selectedGrade = students.find((s) => s.id === selectedStudent)?.grade;
      const gradeLevel = parseGradeLevelFromLabel(selectedGrade);
      const result = await analyzeHybridAssessment(selectedStudent, stagedAudio.blob, stagedImage, {
        assessmentType,
        dialectContext: dialectValue,
        curriculumFramework,
        gradeLevel,
      });

      if (result.ok && 'queued' in result && result.queued) {
        onHybridQueued?.();
        clearVoiceStaging();
        logWorkflow('assessmentSetup:hybrid_queued', { studentId: selectedStudent });
        return;
      }

      if (result.ok && 'savedAssessmentId' in result) {
        clearVoiceStaging();
        logWorkflow('assessmentSetup:hybrid_saved', { id: result.savedAssessmentId });
        return;
      }

      if (result.error === 'not_ready') {
        alert('Diagnosis engine is still starting. Wait a moment and try again.');
      } else if (!result.ok) {
        alert('Diagnosis could not be completed. Check your connection and try again.');
      }
    } catch (err) {
      console.error('Hybrid diagnosis failed', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsHybridRunning(false);
    }
  };

  const isFormValid = !!selectedStudent && !!assessmentType;
  const canRecordVoice = isFormValid;
  const isUploadModeValid = isFormValid && imageBase64s.length > 0;
  const isBatchQueueValid = !!assessmentType && batchFiles.length > 0;
  const isManualModeValid = isFormValid && (selectedRubrics.length > 0 || observations.length > 0);

  const handleQueueBatchClick = () => {
    console.log('Class batch worksheets (preview — not queued yet):', batchFiles);
  };

  const modeButtons: { mode: 'upload' | 'manual' | 'voice'; label: string; icon: React.ReactNode }[] = [
    { mode: 'upload', label: 'Photo Upload', icon: <Camera size={16} /> },
    { mode: 'manual', label: 'Manual Entry', icon: <Edit3 size={16} /> },
    { mode: 'voice', label: 'Voice', icon: <Mic size={16} /> },
  ];

  const hybridPrimaryBusy = isProcessing || isHybridRunning;
  const hybridPrimaryLabel = isOffline ? 'Queue Diagnosis' : 'Run AI Diagnosis';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">New Assessment</h3>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          {!(inputMode === 'upload' && uploadScope === 'batch') && (
            <>
              <label htmlFor="student" className="block text-sm font-medium text-gray-700 mb-1">
                Select Student
              </label>
              <select
                id="student"
                required
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="" disabled>
                  Select a student...
                </option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.grade})
                  </option>
                ))}
              </select>
            </>
          )}

          <div className={inputMode === 'upload' && uploadScope === 'batch' ? 'mt-0' : 'mt-3'}>
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={isLocalDialect}
                  onChange={(e) => setIsLocalDialect(e.target.checked)}
                  className="w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500 mt-1"
                />
              </div>
              <div className="text-sm">
                <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                  Student primarily speaks a local dialect at home
                </span>
                <p className="text-xs text-amber-500/80 italic mt-0.5">
                  Provides context to the AI to distinguish between cognitive literacy gaps and ESL translation errors.
                </p>
              </div>
            </label>

            {isLocalDialect && (
              <div className="mt-2 ml-7 animate-in fade-in slide-in-from-top-2">
                <select
                  value={selectedDialect}
                  onChange={(e) => setSelectedDialect(e.target.value)}
                  required={isLocalDialect}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-amber-500"
                >
                  <option value="" disabled>
                    Specify dialect...
                  </option>
                  <option value="Twi">Twi</option>
                  <option value="Ga">Ga</option>
                  <option value="Ewe">Ewe</option>
                  <option value="Dagbani">Dagbani</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {inputMode === 'upload' && uploadScope === 'batch' && (
          <p className="text-sm text-gray-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            <strong>Class batch:</strong> student names will be detected from worksheets later. Choose subject below and
            add up to 50 photos.
          </p>
        )}

        <div>
          <label htmlFor="assessmentType" className="block text-sm font-medium text-gray-700 mb-1">
            Assessment Type
          </label>
          <select
            id="assessmentType"
            required
            value={assessmentType}
            onChange={(e) => setAssessmentType(e.target.value as 'numeracy' | 'literacy' | '')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          >
            <option value="" disabled>
              Select assessment type...
            </option>
            <option value="numeracy">Numeracy (Fractions & Decimals)</option>
            <option value="literacy">Literacy (Reading Comprehension)</option>
          </select>
        </div>

        <div>
          <label htmlFor="curriculumFramework" className="block text-sm font-medium text-gray-700 mb-1">
            Curriculum Standard
          </label>
          <select
            id="curriculumFramework"
            value={curriculumFramework}
            onChange={(e) => setCurriculumFramework(e.target.value as CurriculumFramework)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          >
            <option value="GES">Ghana (GES)</option>
            <option value="Cambridge">Cambridge International</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Cambridge mode uses pilot taxonomies: Primary Mathematics for numeracy and Primary English / Literacy for
            literacy (filtered by roster grade and keywords). If the wrong subject is selected, you may get a “no match”
            fallback instead of forced objectives.
          </p>
        </div>

        <div className="pt-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Input Mode</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1 bg-gray-100 rounded-lg">
            {modeButtons.map(({ mode, label, icon }) => (
              <button
                key={mode}
                type="button"
                onClick={() => setInputMode(mode)}
                className={`flex items-center justify-center gap-2 py-2 px-2 text-sm font-medium rounded-md transition-all ${
                  inputMode === mode ? 'bg-white text-amber-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {icon}
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {inputMode === 'upload' ? (
          <div className="space-y-3 pt-1">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Worksheet source</p>
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setUploadScope('single')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-2 text-sm font-medium rounded-md transition-all ${
                    uploadScope === 'single'
                      ? 'bg-white text-amber-600 shadow-sm border border-gray-200/80'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <User size={16} className="shrink-0" />
                  <span className="truncate">Single Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUploadScope('batch')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-2 text-sm font-medium rounded-md transition-all ${
                    uploadScope === 'batch'
                      ? 'bg-white text-amber-600 shadow-sm border border-gray-200/80'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Users size={16} className="shrink-0" />
                  <span className="truncate">Class Batch</span>
                </button>
              </div>
            </div>
            <FileUploadZone
              key={`upload-${uploadScope}`}
              multiple={uploadScope === 'batch'}
              maxFiles={uploadScope === 'batch' ? 50 : 10}
              onFilesProcessed={
                uploadScope === 'batch' ? handleBatchFilesProcessed : handleSingleUploadFilesProcessed
              }
            />
          </div>
        ) : inputMode === 'manual' ? (
          <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Rubric Selection</h4>
              <div className="space-y-2">
                {[
                  'Struggles with carrying over numbers',
                  'Confuses numerators and denominators',
                  'Difficulty sounding out multi-syllable words',
                ].map((rubric) => (
                  <label
                    key={rubric}
                    className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRubrics.includes(rubric)}
                      onChange={() => handleRubricToggle(rubric)}
                      className="mt-1 w-4 h-4 text-amber-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{rubric}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="observations" className="block text-sm font-medium text-gray-700 mb-1">
                Teacher Observations (Optional)
              </label>
              <textarea
                id="observations"
                rows={3}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-amber-500 resize-none bg-white"
                placeholder="Add any specific notes about the student's performance..."
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
            {!stagedAudio ? (
              <>
                <p className="text-sm text-gray-600">
                  Record a short observation. You can add an optional worksheet photo on the next step, then run AI
                  diagnosis — audio and image are analyzed together with this learner&apos;s history.
                </p>
                {isFormValid ? (
                  <VoiceObservationRecorder
                    studentId={selectedStudent}
                    learnerLabel={students.find((s) => s.id === selectedStudent)?.name}
                    disabled={!canRecordVoice}
                    onRecordingComplete={(audioBlob, meta) => {
                      setStagedAudio({
                        blob: audioBlob,
                        mimeType: meta.mimeType,
                        durationMs: meta.durationMs,
                      });
                      setStagedImage(null);
                      setHybridUploadKey((k) => k + 1);
                      logWorkflow('voice:staged_for_hybrid', {
                        studentId: selectedStudent,
                        durationMs: meta.durationMs,
                      });
                    }}
                  />
                ) : (
                  <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                    Select a <strong>student</strong> and <strong>assessment type</strong> above to enable recording.
                  </p>
                )}
              </>
            ) : (
              <div className="rounded-xl border border-emerald-200 bg-gradient-to-b from-emerald-50/80 to-white p-4 space-y-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-emerald-100 p-2 shrink-0">
                    <CheckCircle className="w-6 h-6 text-emerald-600" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Mic className="w-4 h-4 text-emerald-700 shrink-0" />
                      Voice Note Captured
                    </h4>
                    <p className="text-sm text-emerald-800 mt-0.5">
                      Duration <span className="font-mono font-semibold">{formatDurationMs(stagedAudio.durationMs)}</span>
                    </p>
                    <p className="text-xs text-gray-600 mt-2">
                      Optional: add a worksheet photo so the AI can align what you said with what the learner wrote.
                    </p>
                  </div>
                </div>

                <div className="border-t border-emerald-100 pt-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                    <Camera className="w-4 h-4 text-amber-600 shrink-0" />
                    Add worksheet photo (optional)
                  </div>
                  <FileUploadZone
                    key={hybridUploadKey}
                    maxFiles={1}
                    multiple={false}
                    label="Worksheet or exercise (one photo)"
                    onFilesProcessed={handleHybridWorksheetFiles}
                  />

                  {stagedImage && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                      {stagedImagePreviewUrl && (
                        <img
                          src={stagedImagePreviewUrl}
                          alt="Worksheet preview"
                          className="w-24 h-24 object-cover rounded-md border border-gray-200 shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Attachment</p>
                        <p className="text-sm text-gray-900 truncate flex items-center gap-2">
                          <ImageFileIcon className="w-4 h-4 text-gray-400 shrink-0" />
                          {stagedImage.name}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setStagedImage(null);
                            setHybridUploadKey((k) => k + 1);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-white"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Replace
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setStagedImage(null);
                            setHybridUploadKey((k) => k + 1);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-red-200 text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={clearVoiceStaging}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 underline-offset-2 hover:underline"
                  >
                    Cancel & re-record
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="pt-4">
          {inputMode === 'voice' ? (
            <div className="space-y-2">
              <button
                type="button"
                disabled={
                  !stagedAudio ||
                  !analyzeHybridAssessment ||
                  hybridPrimaryBusy ||
                  !isFormValid ||
                  !assessmentType
                }
                onClick={() => void handleHybridDiagnosisClick()}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-md flex justify-center items-center gap-2"
              >
                {hybridPrimaryBusy ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isOffline ? 'Queuing…' : 'Analyzing…'}
                  </>
                ) : (
                  <>
                    {hybridPrimaryLabel} <Zap size={16} />
                  </>
                )}
              </button>
              {!stagedAudio && (
                <p className="text-xs text-center text-gray-500">
                  Capture a voice note above to enable <strong>{hybridPrimaryLabel}</strong>.
                </p>
              )}
              {isOffline && stagedAudio && (
                <p className="text-xs text-center text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  You&apos;re offline — we&apos;ll queue this multimodal assessment and run it when you&apos;re back online.
                </p>
              )}
            </div>
          ) : inputMode === 'upload' && uploadScope === 'batch' ? (
            <button
              type="button"
              disabled={isProcessing || !isBatchQueueValid}
              onClick={handleQueueBatchClick}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-md flex justify-center items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Working…
                </>
              ) : (
                <>
                  Queue {batchFiles.length} Worksheet{batchFiles.length === 1 ? '' : 's'} <Zap size={16} />
                </>
              )}
            </button>
          ) : (
            <button
              type="submit"
              disabled={
                isProcessing || (inputMode === 'upload' && !isUploadModeValid) || (inputMode === 'manual' && !isManualModeValid)
              }
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-md flex justify-center items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Learner Profile...
                </>
              ) : (
                <>
                  Run AI Diagnosis <Zap size={16} />
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
