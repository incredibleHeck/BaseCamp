import React, { useEffect, useMemo, useState } from 'react';
import { Users, TrendingUp, AlertTriangle } from 'lucide-react';
import type { UserData } from './Header';
import {
  fetchEnterpriseDashboard,
  type AnalyticsScope,
  type LearningGapRollup,
  type SchoolPerformanceRow,
} from '../services/enterpriseAnalyticsService';
import { DEFAULT_DISTRICT_ID } from '../config/organizationDefaults';

export interface LearningGap {
  id: string;
  topic: string;
  subject: string;
  percentage: number;
  severity: 'critical' | 'warning' | 'monitor';
}

export interface SchoolPerformance {
  id: string;
  name: string;
  studentsTracked: number;
  readinessScore: number;
  status: 'High Performing' | 'Average' | 'Needs Support';
}

interface DistrictOverviewProps {
  user: UserData;
  districtName?: string;
}

const getProgressBarColor = (severity: LearningGap['severity']) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-500 text-red-600';
    case 'warning':
      return 'bg-yellow-500 text-yellow-600';
    case 'monitor':
      return 'bg-emerald-500 text-emerald-600';
    default:
      return 'bg-blue-500 text-blue-600';
  }
};

const getStatusBadge = (status: SchoolPerformance['status']) => {
  switch (status) {
    case 'High Performing':
      return 'bg-green-100 text-green-800';
    case 'Average':
      return 'bg-yellow-100 text-yellow-800';
    case 'Needs Support':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

function mapGaps(g: LearningGapRollup[]): LearningGap[] {
  return g.map((x) => ({
    id: x.id,
    topic: x.topic,
    subject: x.subject,
    percentage: x.percentage,
    severity: x.severity,
  }));
}

function mapSchools(s: SchoolPerformanceRow[]): SchoolPerformance[] {
  return s.map((x) => ({
    id: x.id,
    name: x.name,
    studentsTracked: x.studentsTracked,
    readinessScore: x.readinessScore,
    status: x.status,
  }));
}

export function DistrictOverview({ user, districtName }: DistrictOverviewProps) {
  const [totalStudents, setTotalStudents] = useState(0);
  const [avgReadiness, setAvgReadiness] = useState(0);
  const [atRiskCount, setAtRiskCount] = useState(0);
  const [learningGaps, setLearningGaps] = useState<LearningGap[]>([]);
  const [schools, setSchools] = useState<SchoolPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  const scope: AnalyticsScope = useMemo(
    () => ({
      role: user.role,
      districtId: user.districtId ?? DEFAULT_DISTRICT_ID,
      circuitId: user.role === 'circuit_supervisor' ? user.circuitId : undefined,
      schoolId: undefined,
    }),
    [user.role, user.districtId, user.circuitId]
  );

  const title = districtName ?? user.location ?? 'District';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const dash = await fetchEnterpriseDashboard(scope);
        if (cancelled) return;
        setTotalStudents(dash.totalStudents);
        setAvgReadiness(dash.avgReadiness);
        setAtRiskCount(dash.atRiskCount);
        setLearningGaps(mapGaps(dash.learningGaps));
        setSchools(mapSchools(dash.schools));
      } catch {
        if (!cancelled) {
          setLearningGaps([]);
          setSchools([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [scope]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 w-full animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900">District analytics: {title}</h2>
        <p className="text-gray-600 mt-1 text-sm">
          Aggregated from Firestore learners in scope
          {user.role === 'circuit_supervisor' ? ' (your circuit).' : '.'}
        </p>
      </div>

      {loading && <p className="text-sm text-gray-500 mb-6">Loading district aggregates…</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Learners in scope"
          value={totalStudents.toLocaleString()}
          icon={<Users size={24} />}
          colorTheme="blue"
        />
        <StatCard
          title="Avg readiness (latest score)"
          value={`${avgReadiness}%`}
          icon={<TrendingUp size={24} />}
          colorTheme="emerald"
        />
        <StatCard
          title="Below 50 on latest"
          value={atRiskCount.toLocaleString()}
          subtitle="Screening proxy"
          icon={<AlertTriangle size={24} />}
          colorTheme="red"
        />
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Learning gap themes (latest assessment)</h3>
        {learningGaps.length === 0 && !loading ? (
          <p className="text-sm text-gray-500">No gap tags yet—run assessments to populate this view.</p>
        ) : (
          <div className="space-y-5">
            {learningGaps.map((gap) => {
              const colors = getProgressBarColor(gap.severity);
              const textColor = colors.split(' ')[1];
              const bgColor = colors.split(' ')[0];

              return (
                <div key={gap.id}>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {gap.topic} ({gap.subject})
                    </span>
                    <span className={`text-sm font-bold ${textColor}`}>{gap.percentage}% of learners</span>
                  </div>
                  <div
                    className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden"
                    role="progressbar"
                    aria-valuenow={gap.percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className={`${bgColor} h-2.5 rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${gap.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">School performance (scoped)</h3>
        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['School', 'Learners', 'Readiness', 'Status'].map((heading) => (
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
              {schools.map((school) => (
                <tr key={school.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{school.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{school.studentsTracked}</td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${
                      school.readinessScore >= 70
                        ? 'text-emerald-600'
                        : school.readinessScore >= 60
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }`}
                  >
                    {school.readinessScore}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(school.status)}`}
                    >
                      {school.status}
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

function StatCard({
  title,
  value,
  subtitle,
  icon,
  colorTheme,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  colorTheme: 'blue' | 'emerald' | 'red';
}) {
  const themes = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600', iconBg: 'bg-blue-100' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600', iconBg: 'bg-emerald-100' },
    red: { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-600', iconBg: 'bg-red-100' },
  };
  const theme = themes[colorTheme];

  return (
    <div
      className={`${theme.bg} border ${theme.border} rounded-xl p-5 flex items-start justify-between hover:shadow-md transition-shadow`}
    >
      <div>
        <p className={`text-sm font-medium ${theme.text} mb-1`}>{title}</p>
        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        {subtitle && <p className={`text-xs ${theme.text} opacity-80 mt-1`}>{subtitle}</p>}
      </div>
      <div className={`${theme.iconBg} p-2 rounded-lg ${theme.text}`}>{icon}</div>
    </div>
  );
}
