import React, { useState } from 'react';
import { FileSearch, Loader2, CheckCircle2, MessageSquare, Send, Sparkles, Printer } from 'lucide-react';

type AnalysisStatus = 'empty' | 'analyzing' | 'results';

export function AnalysisResults() {
  const [status, setStatus] = useState<AnalysisStatus>('empty');
  const [showSmsDraft, setShowSmsDraft] = useState(false);
  const [showLessonPlan, setShowLessonPlan] = useState(false);
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);

  // Temporary function to cycle through states for demonstration
  const cycleStatus = () => {
    if (status === 'empty') setStatus('analyzing');
    else if (status === 'analyzing') setStatus('results');
    else setStatus('empty');
  };

  const handleGenerateLesson = () => {
    setIsGeneratingLesson(true);
    setTimeout(() => {
      setIsGeneratingLesson(false);
      setShowLessonPlan(true);
    }, 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full min-h-[400px] flex flex-col relative">
      {/* Temporary Simulate Button */}
      <button 
        onClick={cycleStatus}
        className="absolute top-4 right-4 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-md transition-colors font-medium z-10"
      >
        Simulate: {status}
      </button>

      {status === 'empty' && (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
          <div className="bg-gray-50 p-5 rounded-full mb-4">
            <FileSearch className="w-12 h-12 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessment Uploaded</h3>
          <p className="text-gray-500 max-w-sm">
            Upload a student assessment to view the AI diagnosis.
          </p>
        </div>
      )}

      {status === 'analyzing' && (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-6" />
          <h3 className="text-lg font-medium text-gray-900 mb-2 animate-pulse">
            Analyzing via HeckTeck AI Engine...
          </h3>
          <p className="text-gray-500 max-w-sm">
            Processing handwriting and identifying learning gaps. This usually takes a few seconds.
          </p>
        </div>
      )}

      {status === 'results' && (
        <div className="flex-grow flex flex-col">
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
                <p className="text-sm text-red-700">
                  Student demonstrates fundamental misunderstanding of fractional equivalence. Consistently adding denominators instead of finding common denominators.
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">Mastered Concepts</h4>
                <p className="text-sm text-blue-700">
                  Strong proficiency in basic multiplication up to 12x12.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-lg p-5">
              <h4 className="text-base font-semibold text-gray-900 mb-3">Recommended Intervention</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-2 mb-4">
                <li>Use visual fraction models (like pie charts or fraction bars) to show why denominators cannot simply be added.</li>
                <li>Practice finding the Least Common Multiple (LCM) for denominators before attempting addition.</li>
                <li>Review the concept of "equivalent fractions" using multiplication tables.</li>
              </ul>
              
              {!showLessonPlan && !isGeneratingLesson && (
                <button 
                  onClick={handleGenerateLesson}
                  className="inline-flex items-center gap-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-sm font-medium py-2 px-4 rounded-lg transition-colors border border-yellow-200"
                >
                  <Sparkles size={16} />
                  ✨ Generate 5-Minute Remedial Activity
                </button>
              )}

              {isGeneratingLesson && (
                <div className="flex items-center gap-2 text-sm text-gray-600 py-2 px-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Loader2 size={16} className="animate-spin text-blue-600" />
                  AI generating localized lesson...
                </div>
              )}

              {showLessonPlan && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-5 animate-in fade-in slide-in-from-top-2">
                  <div className="flex justify-between items-start mb-3">
                    <h5 className="text-base font-bold text-gray-900">Visualizing Fractions with Local Materials</h5>
                    <Sparkles size={16} className="text-yellow-600" />
                  </div>
                  <div className="space-y-3 mb-4">
                    <p className="text-sm text-gray-800 font-medium">Instructions:</p>
                    <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2 pl-2">
                      <li>Gather 10 small stones or pebbles.</li>
                      <li>Ask the student to divide the stones into two equal groups to show 1/2.</li>
                      <li>Ask them to divide them into 5 equal groups to show 1/5.</li>
                      <li>Physically demonstrate why 1/2 of the stones is a larger amount than 1/5 of the stones.</li>
                    </ol>
                  </div>
                  <button className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline">
                    <Printer size={14} />
                    Print Activity
                  </button>
                </div>
              )}
            </div>

            <div className="mt-auto pt-4 flex flex-col sm:flex-row items-center justify-end gap-4">
              <button 
                onClick={() => setShowSmsDraft(!showSmsDraft)}
                className="text-sm font-medium text-emerald-600 hover:text-emerald-800 transition-colors border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <MessageSquare size={16} />
                Generate SMS for Parent
              </button>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                + Save to Longitudinal Learner Profile
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
                        BaseCamp Alert: Kwame needs help with fractions before JHS. Ask him to group stones into halves and quarters tonight. - Teacher Mensah
                      </p>
                    </div>
                    <button className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors shadow-sm">
                      <Send size={14} />
                      Send via SMS Gateway
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
