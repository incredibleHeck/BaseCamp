import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Building, FileText, TrendingUp, Users } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  generateDistrictAnalytics,
  type DistrictAnalyticsPayload,
} from '../../services/analytics/districtAnalyticsService';
import { useAuth } from '../../context/AuthContext';

const BAR_FILL = '#0f172a';

function formatAvgScore(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function DistrictDashboard({ onSchoolClick }: { onSchoolClick?: (schoolId: string) => void }) {
  const { user } = useAuth();
  const districtId = user.districtId?.trim() || undefined;

  const [data, setData] = useState<DistrictAnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(() => Boolean(districtId));
  const [error, setError] = useState<string | null>(null);

  const [subjectFilter, setSubjectFilter] = useState<'All' | 'Literacy' | 'Numeracy'>('All');
  const [termFilter, setTermFilter] = useState<string>('All');

  const load = useCallback(async () => {
    if (!districtId) return;
    setLoading(true);
    setError(null);
    try {
      const payload = await generateDistrictAnalytics({
        districtId,
        subject: subjectFilter,
        term: termFilter,
      });
      if (payload === null) {
        setData(null);
        setError('Could not load district analytics. Please try again.');
        return;
      }
      setData(payload);
    } catch (e) {
      setData(null);
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }, [districtId, subjectFilter, termFilter]);

  useEffect(() => {
    if (!districtId) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }
    void load();
  }, [districtId, load]);

  const scopeMissing = !districtId;
  const showSkeleton = loading || scopeMissing;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6">
      <header className="space-y-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              District dashboard
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              District-wide schools, enrollment, assessments, and average performance.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value as any)}
              className="h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
            >
              <option value="All">All Subjects</option>
              <option value="Literacy">Literacy</option>
              <option value="Numeracy">Numeracy</option>
            </select>
            <select
              value={termFilter}
              onChange={(e) => setTermFilter(e.target.value)}
              className="h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
            >
              <option value="All">All Terms</option>
              <option value="Term 1">Term 1</option>
              <option value="Term 2">Term 2</option>
              <option value="Term 3">Term 3</option>
            </select>
          </div>
        </div>
      </header>

      {scopeMissing && !loading && (
        <p
          role="status"
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400"
        >
          Your profile does not include a district ID yet. District analytics will appear once your account is assigned a{' '}
          <span className="font-mono text-slate-800 dark:text-slate-200">districtId</span>.
        </p>
      )}

      {showSkeleton && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-xl border border-slate-200/80 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
              />
            ))}
          </div>
          <div className="h-[350px] w-full animate-pulse rounded-xl border border-slate-200/80 bg-slate-100 dark:border-slate-800 dark:bg-slate-900" />
        </>
      )}

      {!showSkeleton && error && (
        <div
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100"
          role="alert"
        >
          <p className="font-medium">Unable to load analytics</p>
          <p className="mt-1 text-amber-900/90 dark:text-amber-200/90">{error}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-3 rounded-lg bg-amber-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-800 dark:bg-amber-700 dark:hover:bg-amber-600"
          >
            Retry
          </button>
        </div>
      )}

      {!showSkeleton && !error && data && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total schools
                </CardTitle>
                <Building className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-50">
                  {data.overview.totalSchools}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total students
                </CardTitle>
                <Users className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-50">
                  {data.overview.totalStudents}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total assessments
                </CardTitle>
                <FileText className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-50">
                  {data.overview.totalAssessments}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  District average score
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-50">
                  {formatAvgScore(data.overview.districtAverageScore)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle
                  className={
                    data.overview.activeSenFlags > 0
                      ? 'text-sm font-medium text-amber-700 dark:text-amber-400'
                      : 'text-sm font-medium text-slate-600 dark:text-slate-400'
                  }
                >
                  Active SEN flags
                </CardTitle>
                <AlertTriangle
                  className={
                    data.overview.activeSenFlags > 0
                      ? 'h-4 w-4 text-amber-600 dark:text-amber-500'
                      : 'h-4 w-4 text-slate-500 dark:text-slate-400'
                  }
                  aria-hidden
                />
              </CardHeader>
              <CardContent>
                <p
                  className={
                    data.overview.activeSenFlags > 0
                      ? 'text-3xl font-bold tabular-nums text-amber-700 dark:text-amber-400'
                      : 'text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-50'
                  }
                >
                  {data.overview.activeSenFlags}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Average score by school</CardTitle>
            </CardHeader>
            <CardContent>
              {data.schools.length === 0 ? (
                <p className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                  No school data yet. Students grouped by school will appear here.
                </p>
              ) : (
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.schools.map((s) => ({
                        schoolId: s.schoolId,
                        schoolName: s.schoolName,
                        avgScore: s.avgScore,
                      }))}
                      margin={{ top: 8, right: 12, left: 4, bottom: 8 }}
                      onClick={(state: any) => {
                        if (state && state.activePayload && state.activePayload.length > 0) {
                          const schoolId = state.activePayload[0].payload.schoolId;
                          if (schoolId && onSchoolClick) {
                            onSchoolClick(schoolId);
                          }
                        }
                      }}
                      className={onSchoolClick ? "cursor-pointer" : ""}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                      <XAxis
                        dataKey="schoolName"
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={{ className: 'stroke-slate-300 dark:stroke-slate-600' }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        width={36}
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={{ className: 'stroke-slate-300 dark:stroke-slate-600' }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '0.5rem',
                          border: '1px solid rgb(226 232 240)',
                          fontSize: '0.875rem',
                        }}
                        formatter={(value: number | string) => [value, 'Avg score']}
                        labelFormatter={(label) => String(label)}
                      />
                      <Bar dataKey="avgScore" fill={BAR_FILL} radius={[6, 6, 0, 0]} maxBarSize={48} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

