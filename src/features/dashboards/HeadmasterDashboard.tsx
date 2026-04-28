import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { AlertTriangle, ArrowLeft, BarChart3, Download, FileText, Loader2, TrendingUp, Users } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  generateSchoolAnalytics,
  type SchoolAnalyticsPayload,
} from '../../services/analytics/schoolAnalyticsService';
import { getSchoolById } from '../../services/schoolService';
import type { School } from '../../types/domain';
import { useAuth } from '../../context/AuthContext';
import { useExecutiveSummary } from '../../hooks/useExecutiveSummary';
import { PageHero } from '../../components/page-shell/PageHero';
import { Button } from '../../components/ui/button';
import { downloadCampusRosterCsv } from '../../utils/campusRosterExport';

function formatAvgScorePercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function HeadmasterDashboard({ overrideSchoolId, onBack }: { overrideSchoolId?: string, onBack?: () => void }) {
  const { user } = useAuth();
  const schoolId = overrideSchoolId || user.schoolId?.trim() || undefined;

  const [schoolDoc, setSchoolDoc] = useState<School | null>(null);
  const [schoolDocLoading, setSchoolDocLoading] = useState(false);

  useEffect(() => {
    if (!schoolId) {
      setSchoolDoc(null);
      setSchoolDocLoading(false);
      return;
    }
    let cancelled = false;
    setSchoolDocLoading(true);
    void getSchoolById(schoolId).then((doc) => {
      if (!cancelled) {
        setSchoolDoc(doc);
        setSchoolDocLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [schoolId]);

  const { summary: aggDoc, loading: aggLoading, error: aggError } = useExecutiveSummary(schoolId);

  const aggData = useMemo<SchoolAnalyticsPayload | null>(() => {
    if (!aggDoc) return null;
    return {
      overview: {
        totalStudents: aggDoc.byCohort.reduce((n, c) => n + c.assessmentCount, 0),
        totalAssessments: aggDoc.window.assessmentCount,
        activeSenFlags: aggDoc.window.assessmentsWithSenFlag,
        schoolAverageScore: aggDoc.window.averageScore,
      },
      classrooms: aggDoc.byCohort.map((c) => ({
        classLabel: c.cohortId,
        gradeLevel: 0,
        studentCount: c.assessmentCount,
        avgScore: c.averageScore,
        activeSenCount: c.assessmentsWithSenFlag,
        topLearningGap: c.topLearningGap,
      })),
    };
  }, [aggDoc]);

  const [fallbackData, setFallbackData] = useState<SchoolAnalyticsPayload | null>(null);
  const [fallbackLoading, setFallbackLoading] = useState(false);
  const [fallbackError, setFallbackError] = useState<string | null>(null);
  const [csvExporting, setCsvExporting] = useState(false);

  const loadFallback = useCallback(async () => {
    if (!schoolId) return;
    setFallbackLoading(true);
    setFallbackError(null);
    try {
      const payload = await generateSchoolAnalytics(schoolId);
      if (payload === null) {
        setFallbackData(null);
        setFallbackError('Could not load school analytics. Please try again.');
        return;
      }
      setFallbackData(payload);
    } catch (e) {
      setFallbackData(null);
      setFallbackError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setFallbackLoading(false);
    }
  }, [schoolId]);

  const useAgg = aggData !== null;
  const data = useAgg ? aggData : fallbackData;
  const loading = useAgg ? aggLoading : (aggLoading || fallbackLoading);
  const error = useAgg ? aggError : (aggError || fallbackError);

  useEffect(() => {
    if (!schoolId) {
      setFallbackData(null);
      setFallbackError(null);
      setFallbackLoading(false);
      return;
    }
    if (aggLoading) return;
    if (aggData) return;
    void loadFallback();
  }, [schoolId, aggLoading, aggData, loadFallback]);

  const scopeMissing = !schoolId;
  const showSkeleton = loading || scopeMissing;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to organization
        </button>
      )}
      <PageHero
        className="!mb-0 !sm:mb-0"
        title={
          schoolId && schoolDocLoading ? (
            <Skeleton className="h-9 w-[min(100%,28rem)] max-w-full rounded-md" aria-hidden />
          ) : schoolDoc?.name ? (
            <span>{schoolDoc.name}</span>
          ) : overrideSchoolId ? (
            <span>School overview</span>
          ) : (
            <span>Headteacher dashboard</span>
          )
        }
        description="Assessment activity and class averages grouped for your campus."
        actions={
          schoolId ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={csvExporting}
              aria-busy={csvExporting}
              className="shrink-0"
              onClick={() => {
                setCsvExporting(true);
                void downloadCampusRosterCsv(schoolId, 'campus-roster-export').finally(() =>
                  setCsvExporting(false)
                );
              }}
            >
              {csvExporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Download className="mr-2 h-4 w-4 shrink-0" aria-hidden />
              )}
              Export CSV
            </Button>
          ) : undefined
        }
      />

      {scopeMissing && !loading && (
        <p
          role="status"
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400"
        >
          Your profile does not include a school ID yet. School analytics will appear once your account is assigned a{' '}
          <span className="font-mono text-slate-800 dark:text-slate-200">schoolId</span>.
        </p>
      )}

      {showSkeleton && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
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
            onClick={() => void loadFallback()}
            className="mt-3 rounded-lg bg-amber-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-800 dark:bg-amber-700 dark:hover:bg-amber-600"
          >
            Retry
          </button>
        </div>
      )}

      {!showSkeleton && !error && data && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
                <Users className="h-24 w-24" aria-hidden />
              </div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Total students
                </CardTitle>
                <div className="p-2 bg-indigo-50 rounded-lg dark:bg-indigo-900/20">
                  <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" aria-hidden />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                  {data.overview.totalStudents}
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
                <FileText className="h-24 w-24" aria-hidden />
              </div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Total assessments
                </CardTitle>
                <div className="p-2 bg-indigo-50 rounded-lg dark:bg-indigo-900/20">
                  <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" aria-hidden />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                  {data.overview.totalAssessments}
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
                <TrendingUp className="h-24 w-24" aria-hidden />
              </div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  School average score
                </CardTitle>
                <div className="p-2 bg-emerald-50 rounded-lg dark:bg-emerald-900/20">
                  <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                  {data.overview.schoolAverageScore}
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
                <AlertTriangle className="h-24 w-24" aria-hidden />
              </div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Active SEN flags
                </CardTitle>
                <div className={`p-2 rounded-lg ${data.overview.activeSenFlags > 0 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-zinc-50 dark:bg-zinc-900/20'}`}>
                  <AlertTriangle
                    className={
                      data.overview.activeSenFlags > 0
                        ? 'h-4 w-4 text-amber-600 dark:text-amber-500'
                        : 'h-4 w-4 text-zinc-400 dark:text-zinc-500'
                    }
                    aria-hidden
                  />
                </div>
              </CardHeader>
              <CardContent>
                <p
                  className={
                    data.overview.activeSenFlags > 0
                      ? 'text-3xl font-bold tabular-nums text-amber-600 dark:text-amber-400'
                      : 'text-3xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50'
                  }
                >
                  {data.overview.activeSenFlags}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Average score by class</CardTitle>
            </CardHeader>
            <CardContent>
              {data.classrooms.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-center">
                  <div className="bg-zinc-50 p-4 rounded-full mb-4">
                    <BarChart3 className="h-8 w-8 text-zinc-400" aria-hidden />
                  </div>
                  <p className="text-sm font-medium text-zinc-900">No classroom data yet</p>
                  <p className="text-sm text-zinc-500 mt-1 max-w-sm">
                    Assessments will appear here grouped by class once students complete them.
                  </p>
                </div>
              ) : (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.classrooms.map((c) => ({
                        classLabel: c.classLabel,
                        avgScore: c.avgScore,
                      }))}
                      margin={{ top: 8, right: 12, left: 4, bottom: 8 }}
                    >
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#4f46e5" stopOpacity={1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-zinc-200/50 dark:stroke-zinc-800/50" />
                      <XAxis
                        dataKey="classLabel"
                        tick={{ fontSize: 11, fill: '#71717a' }}
                        tickLine={false}
                        axisLine={false}
                        dy={8}
                      />
                      <YAxis
                        domain={[0, 100]}
                        width={36}
                        tick={{ fontSize: 11, fill: '#71717a' }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(244, 244, 245, 0.4)' }}
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid rgba(228, 228, 231, 0.8)',
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(8px)',
                          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
                          fontSize: '0.875rem',
                          color: '#18181b',
                        }}
                        formatter={(value: number | string) => [value, 'Avg score']}
                        labelFormatter={(label) => String(label)}
                      />
                      <Bar dataKey="avgScore" fill="url(#barGradient)" radius={[6, 6, 0, 0]} maxBarSize={48} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-base">Classroom Breakdown</CardTitle>
              <CardDescription>Detailed metrics and top learning gaps by class.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Class name</TableHead>
                    <TableHead>Grade level</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Avg score</TableHead>
                    <TableHead>Active SEN</TableHead>
                    <TableHead>Top learning gap</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.classrooms.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={6} className="h-24 text-center text-sm text-slate-500 dark:text-slate-400">
                        No classroom data available.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.classrooms.map((row, idx) => (
                      <TableRow key={`${row.classLabel}-${idx}`}>
                        <TableCell className="font-medium text-slate-900 dark:text-slate-50">
                          {row.classLabel}
                        </TableCell>
                        <TableCell className="tabular-nums text-slate-700 dark:text-slate-300">
                          {row.gradeLevel}
                        </TableCell>
                        <TableCell className="tabular-nums text-slate-700 dark:text-slate-300">
                          {row.studentCount}
                        </TableCell>
                        <TableCell className="tabular-nums text-slate-700 dark:text-slate-300">
                          {formatAvgScorePercent(row.avgScore)}
                        </TableCell>
                        <TableCell
                          className={
                            row.activeSenCount > 0
                              ? 'tabular-nums font-semibold text-amber-700 dark:text-amber-400'
                              : 'tabular-nums text-slate-700 dark:text-slate-300'
                          }
                        >
                          {row.activeSenCount > 0 ? (
                            <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-xs text-amber-900 dark:bg-amber-950/60 dark:text-amber-200">
                              {row.activeSenCount}
                            </span>
                          ) : (
                            row.activeSenCount
                          )}
                        </TableCell>
                        <TableCell>
                          {row.topLearningGap == null || row.topLearningGap === '' ? (
                            <span className="text-sm text-slate-500 dark:text-slate-500">No data</span>
                          ) : (
                            <span className="inline-flex max-w-[14rem] truncate rounded-full bg-indigo-50 px-2.5 py-1 font-mono text-xs font-medium text-indigo-800 ring-1 ring-indigo-200/80 dark:bg-indigo-950/50 dark:text-indigo-200 dark:ring-indigo-800/80">
                              {row.topLearningGap}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

