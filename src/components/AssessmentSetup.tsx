import React, { useState, useEffect } from 'react';
import { FileUploadZone } from './FileUploadZone';
import { Camera, Edit3, Loader2, Mic, Zap } from 'lucide-react';
import { getStudents, Student } from '../services/studentService';
import { VoiceObservationRecorder } from './VoiceObservationRecorder';
import { logWorkflow } from '../utils/workflowLog';

// 1. Define the shape of the data we will submit
export interface AssessmentData {
  studentId: string;
  assessmentType: 'numeracy' | 'literacy' | '';
  inputMode: 'upload' | 'manual' | 'voice';
  dialect: string | null;
  manualRubric?: string[];
  observations?: string;
  imageBase64?: string | null;
  imageBase64s?: string[];
}

export type AssessmentSetupSnapshot = Pick<AssessmentData, 'studentId' | 'assessmentType' | 'inputMode' | 'dialect'>;

interface AssessmentSetupProps {
  onDiagnose: (data: AssessmentData) => void;
  isProcessing?: boolean;
  initialStudentId?: string;
  /** After each voice clip is queued; parent may run sync. */
  processVoiceObservationQueue?: () => Promise<void>;
  /** Current form context for the right panel (e.g. voice-mode empty state). */
  onSetupStateChange?: (snapshot: AssessmentSetupSnapshot) => void;
}

export function AssessmentSetup({
  onDiagnose,
  isProcessing = false,
  initialStudentId = '',
  processVoiceObservationQueue,
  onSetupStateChange,
}: AssessmentSetupProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState(initialStudentId);
  const [assessmentType, setAssessmentType] = useState<'numeracy' | 'literacy' | ''>('');
  const [inputMode, setInputMode] = useState<'upload' | 'manual' | 'voice'>('upload');
  const [isLocalDialect, setIsLocalDialect] = useState(false);
  const [selectedDialect, setSelectedDialect] = useState('');

  // File upload state (multiple pages)
  const [imageBase64s, setImageBase64s] = useState<string[]>([]);

  // Manual entry states
  const [selectedRubrics, setSelectedRubrics] = useState<string[]>([]);
  const [observations, setObservations] = useState('');
  /** Voice clip written to local queue (and sync attempted); unlocks worksheet diagnosis CTA. */
  const [voiceClipSaved, setVoiceClipSaved] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      const fetchedStudents = await getStudents();
      setStudents(fetchedStudents);
    };
    fetchStudents();
  }, []);

  const dialectValue = isLocalDialect && selectedDialect ? selectedDialect : null;

  useEffect(() => {
    onSetupStateChange?.({
      studentId: selectedStudent,
      assessmentType,
      inputMode,
      dialect: dialectValue,
    });
  }, [selectedStudent, assessmentType, inputMode, dialectValue, onSetupStateChange]);

  const handleFilesProcessed = (files: File[]) => {
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

  const handleRubricToggle = (rubric: string) => {
    setSelectedRubrics((prev) =>
      prev.includes(rubric) ? prev.filter((r) => r !== rubric) : [...prev, rubric]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMode === 'voice') return;
    if (!selectedStudent || !assessmentType) {
      alert('Please select a student and assessment type.');
      return;
    }

    const payload: AssessmentData = {
      studentId: selectedStudent,
      assessmentType,
      inputMode,
      dialect: dialectValue,
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

  const isFormValid = !!selectedStudent && !!assessmentType;
  const canRecordVoice = isFormValid;
  const isUploadModeValid = isFormValid && imageBase64s.length > 0;
  const isManualModeValid = isFormValid && (selectedRubrics.length > 0 || observations.length > 0);

  const modeButtons: { mode: 'upload' | 'manual' | 'voice'; label: string; icon: React.ReactNode }[] = [
    { mode: 'upload', label: 'Photo Upload', icon: <Camera size={16} /> },
    { mode: 'manual', label: 'Manual Entry', icon: <Edit3 size={16} /> },
    { mode: 'voice', label: 'Voice', icon: <Mic size={16} /> },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">New Assessment</h3>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
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

          <div className="mt-3">
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
          <FileUploadZone onFilesProcessed={handleFilesProcessed} />
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
          <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-sm text-gray-600">
              Record a short classroom observation. When you stop recording, the clip is queued for transcription and
              analysis; if you are online it syncs automatically.
            </p>
            {isFormValid ? (
              <VoiceObservationRecorder
                studentId={selectedStudent}
                disabled={!canRecordVoice}
                onQueued={async () => {
                  try {
                    await processVoiceObservationQueue?.();
                    logWorkflow('voice:queued_and_sync_attempted', { studentId: selectedStudent });
                  } catch (e) {
                    console.error('Voice observation sync failed:', e);
                    logWorkflow('voice:sync_failed_local_queue_ok', { error: String(e) });
                  } finally {
                    setVoiceClipSaved(true);
                  }
                }}
              />
            ) : (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                Select a <strong>student</strong> and <strong>assessment type</strong> above to enable recording.
              </p>
            )}
          </div>
        )}

        <div className="pt-4">
          {inputMode === 'voice' ? (
            <div className="space-y-2">
              {!voiceClipSaved ? (
                <>
                  <button
                    type="button"
                    disabled
                    className="w-full bg-gray-200 text-gray-500 font-bold py-3 px-4 rounded-lg shadow-inner flex justify-center items-center gap-2 cursor-not-allowed"
                    title="Save a voice recording first"
                  >
                    Run AI Diagnosis <Zap size={16} />
                  </button>
                  <p className="text-xs text-center text-gray-500">
                    <strong>Run AI Diagnosis</strong> unlocks after your voice note is saved to the queue. Finish recording
                    above, then return here.
                  </p>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      logWorkflow('voice:continue_to_upload', {
                        note: 'This step only switches to Photo Upload; add images then use Run AI Diagnosis.',
                      });
                      setVoiceClipSaved(false);
                      setInputMode('upload');
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-md flex justify-center items-center gap-2"
                  >
                    Continue: upload for AI <Zap size={16} />
                  </button>
                  <p className="text-xs text-center text-gray-500">
                    Step 2 — upload worksheet photos in <strong>Photo Upload</strong> below, then press{' '}
                    <strong>Run AI Diagnosis</strong> to start analysis. (Check the browser console{' '}
                    <code className="text-[11px] bg-gray-100 px-1 rounded">[BaseCamp:workflow]</code> if anything fails.)
                  </p>
                </>
              )}
            </div>
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
