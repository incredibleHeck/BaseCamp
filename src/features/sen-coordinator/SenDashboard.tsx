import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Users, FileText, CheckCircle } from 'lucide-react';
import type { UserData } from '../../components/layout/Header';
import { SenAlertsInbox } from './SenAlertsInbox';
import { listSenAlertsForDistrict } from '../../services/senAlertService';
import { DEFAULT_DISTRICT_ID } from '../../config/organizationDefaults';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

interface SenDashboardProps {
  user: UserData;
  onAlertClick?: (studentId: string) => void;
}

export function SenDashboard({ user, onAlertClick }: SenDashboardProps) {
  const districtId = user.districtId ?? DEFAULT_DISTRICT_ID;
  const [stats, setStats] = useState({
    openAlerts: 0,
    escalatedAlerts: 0,
    totalReviewed: 0,
  });

  useEffect(() => {
    async function loadStats() {
      const list = await listSenAlertsForDistrict(districtId);
      setStats({
        openAlerts: list.filter((a) => a.status === 'open').length,
        escalatedAlerts: list.filter((a) => a.status === 'escalated').length,
        totalReviewed: list.filter((a) => a.status === 'dismissed' || a.status === 'snoozed').length,
      });
    }
    void loadStats();
  }, [districtId]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SEN Coordinator Dashboard</h1>
          <p className="text-gray-600 mt-2">Overview of special educational needs screening and alerts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Open Alerts</CardTitle>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.openAlerts}</div>
            <p className="text-xs text-gray-500 mt-1">Requires review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Escalated Cases</CardTitle>
            <Users className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.escalatedAlerts}</div>
            <p className="text-xs text-gray-500 mt-1">Active IEPs or interventions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Reviewed</CardTitle>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalReviewed}</div>
            <p className="text-xs text-gray-500 mt-1">Dismissed or snoozed</p>
          </CardContent>
        </Card>
      </div>

      <SenAlertsInbox user={user} onAlertClick={onAlertClick} />
    </div>
  );
}
