import React from 'react';
import { QueuedAssessment } from '../services/offlineQueueService';

interface PendingAnalysesProps {
  items: QueuedAssessment[];
  isOnline: boolean;
  isSyncing: boolean;
  studentNameById: Record<string, string>;
  onRemove: (id: string) => Promise<void>;
  onRetryNow: () => Promise<void>;
  onStartNewAssessment: () => void;
}

function formatAssessmentType(type: QueuedAssessment['assessmentType']) {
  return type === 'literacy' ? 'Literacy' : 'Numeracy';
}

export function PendingAnalyses({
  items,
  isOnline,
  isSyncing,
  studentNameById,
  onRemove,
  onRetryNow,
  onStartNewAssessment,
}: PendingAnalysesProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Pending Analyses</h3>
          <p className="text-sm text-gray-600 mt-1">
            Queued analyses will automatically run when internet is available.
          </p>
        </div>
        <button
          type="button"
          onClick={onRetryNow}
          disabled={!isOnline || isSyncing || items.length === 0}
          className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500"
        >
          {isSyncing ? 'Syncing...' : 'Run now'}
        </button>
      </div>

      {!items.length ? (
        <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-700 font-medium">No queued analyses right now.</p>
          <p className="text-sm text-gray-500 mt-1">
            Add a new assessment while offline and it will appear here.
          </p>
          <button
            type="button"
            onClick={onStartNewAssessment}
            className="mt-4 inline-flex items-center justify-center min-h-[44px] px-4 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Go to New Assessment
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-900">{formatAssessmentType(item.assessmentType)}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-gray-700">
                    {item.inputMode === 'manual' ? 'Manual entry' : 'Photo upload'}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full border border-amber-200 bg-amber-50 text-amber-700">
                    {isSyncing ? 'Syncing' : 'Queued'}
                  </span>
                </div>
                <p className="text-sm text-gray-700">
                  Student: {studentNameById[item.studentId] ?? item.studentId}
                </p>
                <p className="text-xs text-gray-500">
                  Queued {new Date(item.timestamp).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="inline-flex items-center justify-center min-h-[40px] px-3 rounded-lg border border-red-200 text-sm font-medium text-red-700 hover:bg-red-50 self-start sm:self-auto"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

