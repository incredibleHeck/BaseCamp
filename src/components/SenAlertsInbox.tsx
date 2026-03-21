import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, ChevronUp } from 'lucide-react';
import type { UserData } from './Header';
import {
  listSenAlertsForDistrict,
  updateSenAlertStatus,
  type SenAlert,
} from '../services/senAlertService';
import { DEFAULT_DISTRICT_ID } from '../config/organizationDefaults';

interface SenAlertsInboxProps {
  user: UserData;
}

export function SenAlertsInbox({ user }: SenAlertsInboxProps) {
  const districtId = user.districtId ?? DEFAULT_DISTRICT_ID;
  const [alerts, setAlerts] = useState<SenAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noteById, setNoteById] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    const list = await listSenAlertsForDistrict(districtId);
    setAlerts(list);
    setLoading(false);
  }, [districtId]);

  useEffect(() => {
    void load();
  }, [load]);

  const act = async (alert: SenAlert, status: SenAlert['status'], action: string) => {
    if (!alert.id) return;
    const note = noteById[alert.id]?.trim();
    await updateSenAlertStatus(alert.id, status, action, note || undefined, user.id);
    setNoteById((prev) => ({ ...prev, [alert.id!]: '' }));
    await load();
  };

  const openAlerts = alerts.filter((a) => a.status === 'open');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 w-full animate-in fade-in duration-500">
      <div className="flex items-start gap-3 mb-6">
        <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">SEN screening inbox</h2>
          <p className="text-gray-600 mt-1 text-sm max-w-3xl">
            Automated <strong>educational screening signals</strong> from longitudinal numeracy patterns. Not a medical
            diagnosis—coordinators should review, dismiss, snooze, or escalate with a reason (audit trail).
          </p>
          <p className="text-xs text-gray-500 mt-2">District: {districtId}</p>
        </div>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading alerts…</p>}

      {!loading && openAlerts.length === 0 && (
        <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm">
          <CheckCircle className="w-5 h-5 shrink-0" />
          No open alerts. New items appear when the rule engine flags three consecutive qualifying numeracy assessments.
        </div>
      )}

      <ul className="space-y-4">
        {openAlerts.map((a) => (
          <li key={a.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50/80">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900">{a.studentName ?? 'Learner'} </p>
                <p className="text-xs text-gray-500 font-mono mt-0.5">Student ID: {a.studentId}</p>
                <p className="text-sm text-gray-700 mt-2">{a.summary}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Rule {a.ruleId} v{a.ruleVersion} · Assessments: {(a.triggeredByAssessmentIds ?? []).join(', ')}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => act(a, 'dismissed', 'dismissed')}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  onClick={() => act(a, 'snoozed', 'snoozed')}
                  className="px-3 py-2 text-sm rounded-lg border border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100"
                >
                  Snooze
                </button>
                <button
                  type="button"
                  onClick={() => act(a, 'escalated', 'escalated')}
                  className="px-3 py-2 text-sm rounded-lg border border-red-200 bg-red-50 text-red-800 hover:bg-red-100"
                >
                  Escalate
                </button>
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor={`note-${a.id}`}>
                Review note (optional, stored in audit log)
              </label>
              <textarea
                id={`note-${a.id}`}
                value={noteById[a.id!] ?? ''}
                onChange={(e) => setNoteById((prev) => ({ ...prev, [a.id!]: e.target.value }))}
                rows={2}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                placeholder="e.g. Spoke with headteacher; scheduling observation."
              />
            </div>
            <button
              type="button"
              className="mt-2 text-xs text-blue-600 flex items-center gap-1 hover:underline"
              onClick={() => setExpandedId((id) => (id === a.id ? null : a.id!))}
            >
              <ChevronUp className={`w-3 h-3 transition-transform ${expandedId === a.id ? '' : 'rotate-180'}`} />
              Audit trail
            </button>
            {expandedId === a.id && (
              <ul className="mt-2 text-xs text-gray-600 space-y-1 border-t border-gray-200 pt-2">
                {(a.auditLog ?? []).length === 0 && <li>No entries.</li>}
                {(a.auditLog ?? []).map((e, i) => (
                  <li key={i}>
                    {new Date(e.at).toLocaleString()} — <strong>{e.action}</strong>
                    {e.note ? `: ${e.note}` : ''}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
