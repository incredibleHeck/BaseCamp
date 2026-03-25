import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import type { UserData } from '../../components/layout/Header';
import {
  listSenAlertsForDistrict,
  updateSenAlertStatus,
  type SenAlert,
} from '../../services/senAlertService';
import { DEFAULT_DISTRICT_ID } from '../../config/organizationDefaults';
import { SenAlertCard } from './SenAlertCard';

interface SenAlertsInboxProps {
  user: UserData;
  onAlertClick?: (studentId: string) => void;
}

export function SenAlertsInbox({ user, onAlertClick }: SenAlertsInboxProps) {
  const districtId = user.districtId ?? DEFAULT_DISTRICT_ID;
  const [alerts, setAlerts] = useState<SenAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const list = await listSenAlertsForDistrict(districtId);
    setAlerts(list);
    setLoading(false);
  }, [districtId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAction = async (alert: SenAlert, status: SenAlert['status'], action: string, note?: string) => {
    if (!alert.id) return;
    await updateSenAlertStatus(alert.id, status, action, note, user.id);
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
          <SenAlertCard
            key={a.id}
            alert={a}
            onAction={handleAction}
            onClick={onAlertClick}
          />
        ))}
      </ul>
    </div>
  );
}
