import React from 'react';
import { FileSearch, Loader2, Mic } from 'lucide-react';
import { useAnalysisFlow, type AnalysisStatus, type DiagnosticReport } from '../hooks/useAnalysisFlow';
import { DiagnosticReportCard } from './DiagnosticReportCard';
import type { AssessmentData } from './AssessmentSetup';

export type { AnalysisStatus, DiagnosticReport };

interface AnalysisResultsProps {
  status: AnalysisStatus;
  onSaveProfile: () => void;
  isOffline?: boolean;
  studentId?: string;
  assessmentType?: string;
  imageBase64?: string | null;
  imageBase64s?: string[] | null;
  dialectContext?: string | null;
  manualRubric?: string[] | null;
  observations?: string | null;
  /** Reflects New Assessment form mode for empty-state messaging. */
  inputMode?: AssessmentData['inputMode'];
  onAnalysisComplete?: () => void;
  onAnalysisError?: () => void;
}

export function AnalysisResults({
  status,
  onSaveProfile: _onSaveProfile,
  isOffline = false,
  studentId,
  assessmentType,
  imageBase64,
  imageBase64s,
  dialectContext,
  manualRubric,
  observations,
  inputMode,
  onAnalysisComplete,
  onAnalysisError,
}: AnalysisResultsProps) {
  const flow = useAnalysisFlow({
    status,
    isOffline,
    studentId,
    assessmentType,
    imageBase64,
    imageBase64s,
    dialectContext,
    manualRubric,
    observations,
    onAnalysisComplete,
    onAnalysisError,
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full min-h-[400px] flex flex-col relative">
      {status === 'empty' && (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
          <div className="bg-gray-50 p-5 rounded-full mb-4">
            {inputMode === 'voice' ? (
              <Mic className="w-12 h-12 text-gray-300" />
            ) : (
              <FileSearch className="w-12 h-12 text-gray-300" />
            )}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {inputMode === 'voice' ? 'Voice observation mode' : 'No Assessment Uploaded'}
          </h3>
          <p className="text-gray-500 max-w-sm">
            {inputMode === 'voice'
              ? 'Use the left panel to record a voice observation. AI worksheet diagnosis appears here when you run a photo or manual assessment.'
              : 'Upload a student assessment or enter data manually to view the AI diagnosis.'}
          </p>
        </div>
      )}

      {(status === 'analyzing' || (status === 'results' && !flow.reportData)) && (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-6" />
          <h3 className="text-lg font-medium text-gray-900 mb-2 animate-pulse">
            Analyzing via HeckTeck AI Engine...
          </h3>
          <p className="text-gray-500 max-w-sm">
            Processing context and identifying learning gaps. This usually takes a few seconds.
          </p>
        </div>
      )}

      {status === 'results' && flow.reportData && (
        <DiagnosticReportCard
          data={flow.data}
          showSmsDraft={flow.showSmsDraft}
          setShowSmsDraft={flow.setShowSmsDraft}
          isGeneratingLesson={flow.isGeneratingLesson}
          showLessonPlan={flow.showLessonPlan}
          displayLessonPlan={flow.displayLessonPlan}
          displayInstructions={flow.displayInstructions}
          handleGenerateLesson={flow.handleGenerateLesson}
          handlePrintActivity={flow.handlePrintActivity}
          handleSave={flow.handleSave}
          isSaving={flow.isSaving}
          isSaved={flow.isSaved}
          handleGenerateAudio={flow.handleGenerateAudio}
          isGeneratingAudio={flow.isGeneratingAudio}
        />
      )}
    </div>
  );
}
