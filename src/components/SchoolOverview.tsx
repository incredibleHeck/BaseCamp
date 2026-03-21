import React, { useEffect, useMemo, useState } from 'react';
import { Users, GraduationCap, AlertOctagon } from 'lucide-react';
import type { UserData } from './Header';
import { fetchEnterpriseDashboard, type AnalyticsScope } from '../services/enterpriseAnalyticsService';
import { DEFAULT_DISTRICT_ID, DEFAULT_SCHOOL_ID } from '../config/organizationDefaults';

function tsMs(raw: unknown): number {
  if (typeof raw === 'number') return raw;
  if (raw && typeof (raw as { toMillis?: () => number }).toMillis === 'function') {
    return (raw as { toMillis: () => number }).toMillis();
  }
  if (raw && typeof raw === 'object' && raw !== null && 'seconds' in raw) {
    return (raw as { seconds: number }).seconds * 1000;
  }
  return 0;
}

export interface ClassData {
  id: string;
  name: string;
  teacher: string;
  readinessScore: number;
}

export interface CriticalAlert {
  id: string;
  studentName: string;
  className: string;
  identifiedGap: string;
  status: 'Critical' | 'Monitor';
}

interface SchoolOverviewProps {
  user: UserData;
  schoolName?: string;
}

export function SchoolOverview({ user, schoolName }: SchoolOverviewProps) {
  const [totalStudents, setTotalStudents] = useState(0);
  const [schoolReadiness, setSchoolReadiness] = useState(0);
  const [atRiskCount, setAtRiskCount] = useState(0);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<CriticalAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const scope: AnalyticsScope = useMemo(
    () => ({
      role: 'headteacher',
      districtId: user.districtId ?? DEFAULT_DISTRICT_ID,
      schoolId: user.schoolId ?? DEFAULT_SCHOOL_ID,
    }),
    [user.districtId, user.schoolId]
  );

  const displayName = schoolName ?? user.location ?? 'Your school';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const dash = await fetchEnterpriseDashboard(scope);
        if (cancelled) return;

        setTotalStudents(dash.totalStudents);

        let sum = 0;
        let n = 0;
        let risk = 0;
        const byClass = new Map<string, { scores: number[] }>();

        const latestByStudent = new Map<string, (typeof dash.assessments)[0]>();
        const sorted = [...dash.assessments].sort((a, b) => tsMs(b.timestamp) - tsMs(a.timestamp));
        for (const a of sorted) {
          if (!latestByStudent.has(a.studentId)) latestByStudent.set(a.studentId, a);
        }

        for (const s of dash.students) {
          if (!s.id) continue;
          const a = latestByStudent.get(s.id);
          const score = typeof a?.score === 'number' ? a.score : 62;
          sum += score;
          n += 1;
          if (score < 50) risk += 1;
          const label = s.grade || 'Class';
          const bucket = byClass.get(label) ?? { scores: [] };
          bucket.scores.push(score);
          byClass.set(label, bucket);
        }

        setSchoolReadiness(n ? Math.round(sum / n) : 0);
        setAtRiskCount(risk);

        const classRows: ClassData[] = [...byClass.entries()].map(([name, v], i) => ({
          id: `c-${i}`,
          name,
          teacher: '—',
          readinessScore: v.scores.length
            ? Math.round(v.scores.reduce((x, y) => x + y, 0) / v.scores.length)
            : 0,
        }));
        setClasses(classRows);

        const alerts: CriticalAlert[] = dash.students.slice(0, 6).map((s, i) => {
          const a = s.id ? latestByStudent.get(s.id) : undefined;
          const score = a?.score ?? 50;
          return {
            id: `a-${i}`,
            studentName: s.name,
            className: s.grade || '—',
            identifiedGap: a?.gapTags?.[0] ?? a?.diagnosis?.slice(0, 60) ?? '—',
            status: score < 45 ? 'Critical' : 'Monitor',
          };
        });
        setRecentAlerts(alerts);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [scope]);

  const getReadinessTheme = (score: number) => {
    if (score >= 70) return { bar: 'bg-emerald-500', text: 'text-emerald-600' };
    if (score >= 60) return { bar: 'bg-yellow-500', text: 'text-yellow-600' };
    return { bar: 'bg-red-500', text: 'text-red-600' };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 w-full animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900">School analytics: {displayName}</h2>
        <p className="text-gray-600 mt-1 text-sm">Scoped to your school roster and assessments in Firestore.</p>
      </div>

      {loading && <p className="text-sm text-gray-500 mb-6">Loading school aggregates…</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600 mb-1">Learners in school</p>
            <h3 className="text-3xl font-bold text-gray-900">{totalStudents}</h3>
            <p className="text-xs text-blue-500 mt-1">From class labels on student records</p>
          </div>
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
            <Users size={24} />
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-600 mb-1">Avg readiness</p>
            <h3 className="text-3xl font-bold text-gray-900">{schoolReadiness}%</h3>
            <p className="text-xs text-emerald-500 mt-1">Latest assessment score proxy</p>
          </div>
          <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
            <GraduationCap size={24} />
          </div>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-xl p-5 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-red-600 mb-1">Below 50 (latest)</p>
            <h3 className="text-3xl font-bold text-gray-900">{atRiskCount}</h3>
            <p className="text-xs text-red-500 mt-1">For leadership triage</p>
          </div>
          <div className="bg-red-100 p-2 rounded-lg text-red-600">
            <AlertOctagon size={24} />
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Class / stream breakdown</h3>
        <div className="grid grid-cols-1 gap-6">
          {classes.map((cls) => {
            const theme = getReadinessTheme(cls.readinessScore);
            return (
              <div
                key={cls.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-gray-300 transition-colors"
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{cls.name}</h4>
                    <p className="text-xs text-gray-500">{cls.teacher}</p>
                  </div>
                  <span className={`text-lg font-bold ${theme.text}`}>{cls.readinessScore}% readiness</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`${theme.bar} h-3 rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${cls.readinessScore}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent learner signals</h3>
        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Student', 'Class', 'Gap / diagnosis', 'Status'].map((heading) => (
                  <th
                    key={heading}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{alert.studentName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{alert.className}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{alert.identifiedGap}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        alert.status === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {alert.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
