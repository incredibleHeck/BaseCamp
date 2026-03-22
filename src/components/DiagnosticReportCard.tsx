import React from 'react';
import {
  CheckCircle2,
  Loader2,
  MessageSquare,
  Send,
  Sparkles,
  Printer,
  Volume2,
  Check,
} from 'lucide-react';
import type { DiagnosticReport } from '../hooks/useAnalysisFlow';

export interface DiagnosticReportCardProps {
  data: DiagnosticReport;
  showSmsDraft: boolean;
  setShowSmsDraft: (v: boolean | ((prev: boolean) => boolean)) => void;
  isGeneratingLesson: boolean;
  showLessonPlan: boolean;
  displayLessonPlan: { title: string; instructions: string[] } | null | undefined;
  displayInstructions: string[];
  handleGenerateLesson: () => void | Promise<void>;
  handlePrintActivity: () => void;
  handleSave: () => void | Promise<void>;
  isSaving: boolean;
  isSaved: boolean;
  handleGenerateAudio: () => void;
  isGeneratingAudio: boolean;
}

export function DiagnosticReportCard({
  data,
  showSmsDraft,
  setShowSmsDraft,
  isGeneratingLesson,
  showLessonPlan,
  displayLessonPlan,
  displayInstructions,
  handleGenerateLesson,
  handlePrintActivity,
  handleSave,
  isSaving,
  isSaved,
  handleGenerateAudio,
  isGeneratingAudio,
}: DiagnosticReportCardProps) {
  return (
    <div className="flex-grow flex flex-col animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4 mt-8 sm:mt-0">
        <h3 className="text-xl font-bold text-gray-900">AI Diagnostic Report</h3>
        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium border border-emerald-200">
          <CheckCircle2 className="w-4 h-4" />
          Analysis Complete
        </span>
      </div>

      <div className="flex-grow flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-50 border border-red-100 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-red-800 mb-2">Critical Learning Gap Detected</h4>
            <p className="text-sm text-red-700">{data.diagnosis}</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">Mastered Concepts</h4>
            <p className="text-sm text-blue-700">{data.masteredConcepts}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-slate-800 mb-1">Mastery score (0–100)</h4>
            <p className="text-2xl font-bold text-slate-900">
              {typeof data.score === 'number' ? data.score : '—'}
            </p>
            <p className="text-xs text-slate-500 mt-1">Used for gradebook export (Phase 2).</p>
          </div>
          {data.gesAlignment && data.gesAlignment.objectiveId ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="text-sm font-semibold text-amber-900">GES curriculum alignment</h4>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border ${
                    data.gesAlignment.verified
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-orange-100 text-orange-800 border-orange-200'
                  }`}
                >
                  {data.gesAlignment.verified ? 'Verified' : 'Review'}
                </span>
              </div>
              <p className="text-sm font-mono text-amber-950">{data.gesAlignment.objectiveId}</p>
              {data.gesAlignment.objectiveTitle ? (
                <p className="text-sm text-amber-900 mt-1">{data.gesAlignment.objectiveTitle}</p>
              ) : null}
              {data.gesAlignment.excerpt ? (
                <p className="text-xs text-amber-800 mt-2 leading-relaxed">{data.gesAlignment.excerpt}</p>
              ) : null}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center">
              <p className="text-sm text-gray-600">
                No GES objective linked for this run (add more syllabus data in RAG corpus to improve
                coverage).
              </p>
            </div>
          )}
        </div>

        {data.alignedStandardCode ? (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3">
            <h4 className="text-xs font-semibold text-indigo-900 uppercase tracking-wide">
              Cambridge standard code (judge / British Council)
            </h4>
            <p className="font-mono text-lg text-indigo-950 mt-1">{data.alignedStandardCode}</p>
          </div>
        ) : null}

        <div className="bg-gray-50 border border-gray-100 rounded-lg p-5">
          <h4 className="text-base font-semibold text-gray-900 mb-3">Recommended Intervention</h4>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-2 mb-4">
            {data.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>

          {!isGeneratingLesson && (
            <button
              type="button"
              onClick={() => void handleGenerateLesson()}
              className="inline-flex items-center justify-center gap-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-sm font-medium py-2.5 px-4 min-h-[44px] rounded-lg transition-colors border border-yellow-200 w-full sm:w-auto"
            >
              <Sparkles size={16} />
              {showLessonPlan || data.lessonPlan?.instructions?.length
                ? 'Regenerate 5-Minute Remedial Activity'
                : '✨ Generate 5-Minute Remedial Activity'}
            </button>
          )}

          {isGeneratingLesson && (
            <div className="flex items-center gap-2 text-sm text-gray-600 py-2 px-4 bg-gray-50 rounded-lg border border-gray-200 w-fit">
              <Loader2 size={16} className="animate-spin text-blue-600" />
              AI generating localized lesson...
            </div>
          )}

          {(showLessonPlan || data.lessonPlan) && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-5 animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-start mb-3">
                <h5 className="text-base font-bold text-gray-900">
                  {displayLessonPlan?.title ?? 'Visualizing Concepts with Local Materials'}
                </h5>
                <Sparkles size={16} className="text-yellow-600" />
              </div>
              <div className="space-y-3 mb-4">
                <p className="text-sm text-gray-800 font-medium">Instructions:</p>
                <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2 pl-2">
                  {displayInstructions.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
              <button
                type="button"
                onClick={handlePrintActivity}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1.5 min-h-[44px] hover:underline py-2"
              >
                <Printer size={14} /> Print Activity
              </button>
            </div>
          )}
        </div>

        <div className="mt-auto pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => setShowSmsDraft(!showSmsDraft)}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-800 transition-colors border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 px-4 py-2.5 min-h-[44px] rounded-lg flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <MessageSquare size={16} />
            Guardian Communication
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving}
            className={`text-sm font-medium transition-all flex items-center justify-center gap-1.5 min-h-[44px] py-2.5 w-full sm:w-auto rounded-lg ${
              isSaved
                ? 'text-emerald-600 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                : 'text-blue-600 hover:text-blue-800 border border-blue-200 bg-blue-50 hover:bg-blue-100'
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Saving...
              </>
            ) : isSaved ? (
              <>
                <Check size={16} /> Update profile (overwrites saved lesson plan)
              </>
            ) : (
              '+ Save to Longitudinal Learner Profile'
            )}
          </button>
        </div>

        {showSmsDraft && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3">
              <div className="bg-emerald-100 p-2 rounded-full shrink-0">
                <MessageSquare size={20} className="text-emerald-600" />
              </div>
              <div className="flex-grow">
                <h5 className="text-sm font-semibold text-gray-900 mb-1">Draft Message to Parent</h5>
                <div className="bg-white border border-gray-200 rounded-lg p-3 rounded-tl-none shadow-sm mb-3">
                  <p className="text-sm text-gray-700">
                    {data.smsDraft || 'BaseCamp Alert: Student requires additional support. - Teacher'}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors shadow-sm"
                  >
                    <Send size={14} /> Send SMS
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateAudio}
                    className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg transition-colors shadow-sm"
                  >
                    {isGeneratingAudio ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Volume2 size={14} />
                    )}
                    {isGeneratingAudio ? 'Translating...' : 'Generate Local Audio'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
