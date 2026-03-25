import React from 'react';
import { FileUploadZone } from '../../components/FileUploadZone';
import {
  Camera,
  CheckCircle,
  Image as ImageFileIcon,
  Loader2,
  Mic,
  RotateCcw,
  Trash2,
  Users,
  User,
  Zap,
} from 'lucide-react';
import { logWorkflow } from '../../utils/workflowLog';
import { VoiceObservationRecorder } from '../ai-tools/VoiceObservationRecorder';
import type { CurriculumFramework } from '../../services/ai/curriculumRagService';
import { cn } from '../../utils/ui-helpers';
import { Button } from '../../components/ui/button';
import { useAssessmentSetup } from './useAssessmentSetup';
import { StudentPicker } from './StudentPicker';
import { CurriculumSelector } from './CurriculumSelector';
import { AssessmentMethodGrid } from './AssessmentMethodGrid';

const textareaFieldClass = cn(
  'min-h-[5.5rem] w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm',
  'placeholder:text-slate-500',
  'transition-colors',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
  'disabled:cursor-not-allowed disabled:opacity-50',
  'dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:placeholder:text-slate-400',
  'ring-offset-white dark:ring-offset-slate-950 dark:focus-visible:ring-indigo-400'
);

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
  /** Formal class (Firestore `cohorts` document id). */
  cohortId?: string;
  /** Cohort display name; stored as assessment `classLabel` for Headmaster rollups. */
  classLabel?: string;
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
  initialStudentId?: string;
}

export function AssessmentSetup({ initialStudentId = '' }: AssessmentSetupProps) {
  const { state, handlers } = useAssessmentSetup(initialStudentId);

  const {
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
    isFormValid,
    canRecordVoice,
    isUploadModeValid,
    isBatchQueueValid,
    isManualModeValid,
  } = state;

  const {
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
  } = handlers;

  const primaryDiagnosisLabel = isOffline ? 'Queue Diagnosis' : 'Run AI Diagnosis';
  const hybridPrimaryBusy = isProcessing || isHybridRunning;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">New Assessment</h3>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <StudentPicker
          inputMode={inputMode}
          uploadScope={uploadScope}
          students={students}
          selectedStudent={selectedStudent}
          onStudentSelect={setSelectedStudent}
          cohorts={cohorts}
          cohortsLoading={cohortsLoading}
          selectedCohortId={selectedCohortId}
          onCohortSelect={setSelectedCohortId}
          schoolId={schoolId}
          isLocalDialect={isLocalDialect}
          onIsLocalDialectChange={setIsLocalDialect}
          selectedDialect={selectedDialect}
          onDialectSelect={setSelectedDialect}
        />

        {inputMode === 'upload' && uploadScope === 'batch' && (
          <p className="text-sm text-gray-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            <strong>Class batch:</strong> student names will be detected from worksheets later. Choose subject below and
            add up to 50 photos.
          </p>
        )}

        <CurriculumSelector
          assessmentType={assessmentType}
          onAssessmentTypeChange={setAssessmentType}
          curriculumFramework={curriculumFramework}
          onCurriculumFrameworkChange={setCurriculumFramework}
        />

        <AssessmentMethodGrid inputMode={inputMode} onInputModeChange={setInputMode} />

        {inputMode === 'upload' ? (
          <div className="space-y-3 pt-1">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Worksheet source</p>
              <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-1">
                <Button
                  type="button"
                  variant={uploadScope === 'single' ? 'outline' : 'ghost'}
                  className={cn(
                    'h-10 min-h-10 w-full justify-center gap-2 text-sm font-medium',
                    uploadScope === 'single' &&
                      'border-slate-200 bg-white text-indigo-600 shadow-sm hover:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-indigo-400 dark:hover:bg-slate-900'
                  )}
                  onClick={() => setUploadScope('single')}
                >
                  <User size={16} className="shrink-0" aria-hidden />
                  <span className="truncate">Single Student</span>
                </Button>
                <Button
                  type="button"
                  variant={uploadScope === 'batch' ? 'outline' : 'ghost'}
                  className={cn(
                    'h-10 min-h-10 w-full justify-center gap-2 text-sm font-medium',
                    uploadScope === 'batch' &&
                      'border-slate-200 bg-white text-indigo-600 shadow-sm hover:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-indigo-400 dark:hover:bg-slate-900'
                  )}
                  onClick={() => setUploadScope('batch')}
                >
                  <Users size={16} className="shrink-0" aria-hidden />
                  <span className="truncate">Class Batch</span>
                </Button>
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
                className={textareaFieldClass}
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
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="default"
                          className="gap-1.5"
                          onClick={() => {
                            setStagedImage(null);
                            setHybridUploadKey((k) => k + 1);
                          }}
                        >
                          <RotateCcw className="h-4 w-4" aria-hidden />
                          Replace
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="default"
                          className="gap-1.5"
                          onClick={() => {
                            setStagedImage(null);
                            setHybridUploadKey((k) => k + 1);
                          }}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                          Remove
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <Button type="button" variant="link" className="h-auto px-0 text-sm" onClick={clearVoiceStaging}>
                    Cancel & re-record
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="pt-4">
          {inputMode === 'voice' ? (
            <div className="space-y-2">
              <Button
                type="button"
                variant="default"
                size="lg"
                className="w-full gap-2 font-semibold shadow-md"
                disabled={!stagedAudio || hybridPrimaryBusy || !isFormValid || !assessmentType}
                onClick={() => void handleHybridDiagnosisClick()}
              >
                {hybridPrimaryBusy ? (
                  <>
                    <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden />
                    {isOffline ? 'Queuing…' : 'Analyzing…'}
                  </>
                ) : (
                  <>
                    {primaryDiagnosisLabel} <Zap size={16} className="shrink-0" aria-hidden />
                  </>
                )}
              </Button>
              {!stagedAudio && (
                <p className="text-xs text-center text-gray-500">
                  Capture a voice note above to enable <strong>{primaryDiagnosisLabel}</strong>.
                </p>
              )}
              {isOffline && stagedAudio && (
                <p className="text-xs text-center text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  You&apos;re offline — we&apos;ll queue this multimodal assessment and run it when you&apos;re back online.
                </p>
              )}
            </div>
          ) : inputMode === 'upload' && uploadScope === 'batch' ? (
            <Button
              type="button"
              variant="default"
              size="lg"
              className="w-full gap-2 font-semibold shadow-md"
              disabled={isProcessing || !isBatchQueueValid}
              onClick={handleQueueBatchClick}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden />
                  Working…
                </>
              ) : (
                <>
                  Queue {batchFiles.length} Worksheet{batchFiles.length === 1 ? '' : 's'}{' '}
                  <Zap size={16} className="shrink-0" aria-hidden />
                </>
              )}
            </Button>
          ) : (
            <Button
              type="submit"
              variant="default"
              size="lg"
              className="w-full gap-2 font-semibold shadow-md"
              disabled={
                isProcessing || (inputMode === 'upload' && !isUploadModeValid) || (inputMode === 'manual' && !isManualModeValid)
              }
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden />
                  {isOffline ? 'Queuing diagnosis…' : 'Analyzing Learner Profile...'}
                </>
              ) : (
                <>
                  {primaryDiagnosisLabel} <Zap size={16} className="shrink-0" aria-hidden />
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}