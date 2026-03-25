import React, { useState } from 'react';
import { ChevronUp } from 'lucide-react';
import type { SenAlert } from '../../services/senAlertService';

interface SenAlertCardProps {
  alert: SenAlert;
  onAction: (alert: SenAlert, status: SenAlert['status'], action: string, note?: string) => Promise<void>;
  onClick?: (studentId: string) => void;
}

export function SenAlertCard({ alert, onAction, onClick }: SenAlertCardProps) {
  const [note, setNote] = useState('');
  const [expanded, setExpanded] = useState(false);

  const handleAction = async (status: SenAlert['status'], action: string) => {
    await onAction(alert, status, action, note.trim() || undefined);
    setNote('');
  };

  return (
    <li className="border border-gray-200 rounded-xl p-4 bg-gray-50/80 hover:bg-white hover:shadow-md transition-all cursor-pointer" onClick={() => onClick?.(alert.studentId)}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <p className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">{alert.studentName ?? 'Learner'} </p>
          <p className="text-xs text-gray-500 font-mono mt-0.5">Student ID: {alert.studentId}</p>
          <p className="text-sm text-gray-700 mt-2">{alert.summary}</p>
          <p className="text-xs text-gray-500 mt-2">
            Rule {alert.ruleId} v{alert.ruleVersion} · Assessments: {(alert.triggeredByAssessmentIds ?? []).join(', ')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => handleAction('dismissed', 'dismissed')}
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={() => handleAction('snoozed', 'snoozed')}
            className="px-3 py-2 text-sm rounded-lg border border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100"
          >
            Snooze
          </button>
          <button
            type="button"
            onClick={() => handleAction('escalated', 'escalated')}
            className="px-3 py-2 text-sm rounded-lg border border-red-200 bg-red-50 text-red-800 hover:bg-red-100"
          >
            Escalate
          </button>
        </div>
      </div>
      <div className="mt-3" onClick={(e) => e.stopPropagation()}>
        <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor={`note-${alert.id}`}>
          Review note (optional, stored in audit log)
        </label>
        <textarea
          id={`note-${alert.id}`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
          placeholder="e.g. Spoke with headteacher; scheduling observation."
        />
      </div>
      <button
        type="button"
        className="mt-2 text-xs text-blue-600 flex items-center gap-1 hover:underline"
        onClick={(e) => {
          e.stopPropagation();
          setExpanded((prev) => !prev);
        }}
      >
        <ChevronUp className={`w-3 h-3 transition-transform ${expanded ? '' : 'rotate-180'}`} />
        Audit trail
      </button>
      {expanded && (
        <ul className="mt-2 text-xs text-gray-600 space-y-1 border-t border-gray-200 pt-2" onClick={(e) => e.stopPropagation()}>
          {(alert.auditLog ?? []).length === 0 && <li>No entries.</li>}
          {(alert.auditLog ?? []).map((e, i) => (
            <li key={i}>
              {new Date(e.at).toLocaleString()} — <strong>{e.action}</strong>
              {e.note ? `: ${e.note}` : ''}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
