import React from 'react';

export interface OfflineQueuedModalProps {
  open: boolean;
  queueLength?: number;
  onClose: () => void;
}

export function OfflineQueuedModal({ open, queueLength, onClose }: OfflineQueuedModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-xl border border-gray-200 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">You’re offline</h3>
            <p className="mt-1 text-sm text-gray-600">
              This diagnosis has been queued and will run automatically when internet is available again.
              You can queue multiple students while offline.
            </p>
            {typeof queueLength === 'number' && (
              <p className="mt-3 text-xs text-gray-500">
                Queued analyses: <span className="font-medium text-gray-800">{queueLength}</span>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 rounded-md px-2 py-1"
          >
            Close
          </button>
        </div>
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

