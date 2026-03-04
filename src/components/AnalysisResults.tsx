import React, { useState } from 'react';
import { FileSearch, Loader2, CheckCircle2 } from 'lucide-react';

type AnalysisStatus = 'empty' | 'analyzing' | 'results';

export function AnalysisResults() {
  const [status, setStatus] = useState<AnalysisStatus>('empty');

  // Temporary function to cycle through states for demonstration
  const cycleStatus = () => {
    if (status === 'empty') setStatus('analyzing');
    else if (status === 'analyzing') setStatus('results');
    else setStatus('empty');
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
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
                <li>Use visual fraction models (like pie charts or fraction bars) to show why denominators cannot simply be added.</li>
                <li>Practice finding the Least Common Multiple (LCM) for denominators before attempting addition.</li>
                <li>Review the concept of "equivalent fractions" using multiplication tables.</li>
              </ul>
            </div>

            <div className="mt-auto pt-4 flex justify-end">
              <button className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                + Save to Longitudinal Learner Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
