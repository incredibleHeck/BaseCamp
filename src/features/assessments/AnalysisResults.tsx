import React, { useEffect } from 'react';
import { FileSearch, Loader2, Mic } from 'lucide-react';
import { useAssessment } from '../../context/AssessmentContext';
import { useAnalysisFlow, type AnalysisStatus, type DiagnosticReport } from '../../hooks/useAnalysisFlow';
import { DiagnosticReportCard } from './DiagnosticReportCard';
import type { AssessmentData } from './AssessmentSetup';

export type { AnalysisStatus, DiagnosticReport };

/**
 * Right panel for the new-assessment flow. Reads/writes assessment state via `AssessmentProvider` + `useAnalysisFlow`.
 */
export function AnalysisResults() {
  const { analysisStatus, reportData, registerHybridRunner, lastAssessmentData, setupSnapshot } =
    useAssessment();

  const flow = useAnalysisFlow();

  useEffect(() => {
    registerHybridRunner(flow.analyzeHybridAssessment);
    return () => registerHybridRunner(null);
  }, [flow.analyzeHybridAssessment, registerHybridRunner]);

  const inputMode: AssessmentData['inputMode'] | undefined =
    lastAssessmentData?.inputMode ?? setupSnapshot?.inputMode;

  const showAnalyzingLoader =
    analysisStatus === 'analyzing' || (analysisStatus === 'results' && !reportData);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full min-h-[400px] flex flex-col relative">
      {analysisStatus === 'empty' && (
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
              ? 'Record a voice note on the left, optionally attach a worksheet photo, then tap Run AI Diagnosis. Your multimodal report will appear here.'
              : 'Upload a student assessment or enter data manually to view the AI diagnosis.'}
          </p>
        </div>
      )}

      {showAnalyzingLoader && (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-6" />
          <h3 className="text-lg font-medium text-gray-900 mb-2 animate-pulse">
            Analyzing via HecTech AI Engine...
          </h3>
          <p className="text-gray-500 max-w-sm">
            Processing context and identifying learning gaps. This usually takes a few seconds.
          </p>
        </div>
      )}

      {analysisStatus === 'results' && reportData && (
        <DiagnosticReportCard
          curriculumAlignmentLabel={flow.curriculumAlignmentLabel}
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
