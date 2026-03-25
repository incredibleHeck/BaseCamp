import React, { useMemo } from 'react';
import { QueuedAssessment } from '../../services/core/offlineQueueService';
import type { BatchSyncProgress } from '../../hooks/useSyncManager';

interface PendingAnalysesProps {
  items: QueuedAssessment[];
  isOnline: boolean;
  isSyncing: boolean;
  batchSyncProgress?: BatchSyncProgress | null;
  studentNameById: Record<string, string>;
  onRemove: (id: string) => Promise<void>;
  onRetryNow: () => Promise<void>;
  onStartNewAssessment: () => void;
}

function formatAssessmentType(type: QueuedAssessment['assessmentType']) {
  return type === 'literacy' ? 'Literacy' : 'Numeracy';
}

function formatInputMode(mode: QueuedAssessment['inputMode']) {
  if (mode === 'manual') return 'Manual entry';
  if (mode === 'hybrid_voice') return 'Voice (+ optional photo)';
  if (mode === 'upload_batch') return 'Class batch (auto-detect name)';
  return 'Photo upload';
}

function ts(item: QueuedAssessment): number {
  const t = item.timestamp;
  if (typeof t === 'number') return t;
  if (t && typeof (t as { toMillis?: () => number }).toMillis === 'function') {
    return (t as { toMillis: () => number }).toMillis();
  }
  return 0;
}

function partitionQueue(items: QueuedAssessment[]) {
  const batchMap = new Map<string, QueuedAssessment[]>();
  const singles: QueuedAssessment[] = [];
  for (const it of items) {
    if (it.batchId) {
      const arr = batchMap.get(it.batchId) ?? [];
      arr.push(it);
      batchMap.set(it.batchId, arr);
    } else {
      singles.push(it);
    }
  }
  for (const arr of batchMap.values()) {
    arr.sort((a, b) => ts(a) - ts(b));
  }
  const batchEntries = [...batchMap.entries()].sort(
    (a, b) => ts(a[1][0]!) - ts(b[1][0]!)
  );
  singles.sort((a, b) => ts(a) - ts(b));
  return { batchEntries, singles };
}

function QueueRow({
  item,
  isSyncing,
  studentNameById,
  onRemove,
}: {
  item: QueuedAssessment;
  isSyncing: boolean;
  studentNameById: Record<string, string>;
  onRemove: (id: string) => Promise<void>;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-2 px-3 bg-white/80 border border-gray-100 rounded-lg">
      <div className="space-y-0.5 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-gray-900">{formatAssessmentType(item.assessmentType)}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-gray-600">
            {formatInputMode(item.inputMode)}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800">
            {isSyncing ? 'Syncing' : 'Queued'}
          </span>
        </div>
        <p className="text-xs text-gray-700">
          Student:{' '}
          {item.studentId
            ? studentNameById[item.studentId] ?? item.studentId
            : item.autoDetectStudent || item.inputMode === 'upload_batch'
              ? 'Class batch (names auto-detect later)'
              : 'Not assigned'}
        </p>
        <p className="text-[10px] text-gray-500">Queued {new Date(ts(item)).toLocaleString()}</p>
      </div>
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="inline-flex items-center justify-center min-h-[36px] px-2.5 rounded-md border border-red-200 text-xs font-medium text-red-700 hover:bg-red-50 self-start sm:self-auto shrink-0"
      >
        Remove
      </button>
    </div>
  );
}

export function PendingAnalyses({
  items,
  isOnline,
  isSyncing,
  batchSyncProgress = null,
  studentNameById,
  onRemove,
  onRetryNow,
  onStartNewAssessment,
}: PendingAnalysesProps) {
  const { batchEntries, singles } = useMemo(() => partitionQueue(items), [items]);

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
        <div className="space-y-4">
          {batchEntries.map(([batchId, batchItems]) => {
            const first = batchItems[0];
            const showBatchProgress =
              isSyncing && batchSyncProgress && batchSyncProgress.batchId === batchId;
            const pct =
              showBatchProgress && batchSyncProgress.total > 0
                ? Math.min(100, Math.round((batchSyncProgress.completed / batchSyncProgress.total) * 100))
                : 0;

            return (
              <div
                key={batchId}
                className="border border-indigo-200 rounded-xl bg-indigo-50/40 overflow-hidden shadow-sm"
              >
                <div className="px-4 py-3 border-b border-indigo-100 bg-white/60">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-indigo-950">Class batch</p>
                      <p className="text-xs text-indigo-800/80">
                        {formatAssessmentType(first.assessmentType)} · {batchItems.length} worksheet
                        {batchItems.length === 1 ? '' : 's'}
                      </p>
                    </div>
                    {showBatchProgress && batchSyncProgress ? (
                      <span className="text-xs font-semibold tabular-nums text-indigo-900 bg-indigo-100 px-2 py-1 rounded-md">
                        Batch syncing: {batchSyncProgress.completed} / {batchSyncProgress.total}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-600">Batch ID: {batchId.slice(0, 24)}…</span>
                    )}
                  </div>
                  {showBatchProgress && batchSyncProgress && (
                    <div className="mt-2 h-2 rounded-full bg-indigo-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all duration-300 ease-out"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="p-2 space-y-2">
                  {batchItems.map((item) => (
                    <QueueRow
                      key={item.id}
                      item={item}
                      isSyncing={isSyncing}
                      studentNameById={studentNameById}
                      onRemove={onRemove}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {singles.length > 0 && (
            <div className="space-y-3">
              {batchEntries.length > 0 && (
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Other queued items</p>
              )}
              {singles.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatAssessmentType(item.assessmentType)}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-gray-700">
                        {formatInputMode(item.inputMode)}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full border border-amber-200 bg-amber-50 text-amber-700">
                        {isSyncing ? 'Syncing' : 'Queued'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      Student:{' '}
                      {item.studentId
                        ? studentNameById[item.studentId] ?? item.studentId
                        : item.autoDetectStudent || item.inputMode === 'upload_batch'
                          ? 'Class batch (names auto-detect later)'
                          : 'Not assigned'}
                    </p>
                    <p className="text-xs text-gray-500">Queued {new Date(ts(item)).toLocaleString()}</p>
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
      )}
    </div>
  );
}

