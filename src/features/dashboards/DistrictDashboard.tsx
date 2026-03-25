import React, { useCallback, useEffect, useState } from 'react';
import {
  generateDistrictAnalytics,
  type DistrictAnalyticsPayload,
} from '../../services/analytics/districtAnalyticsService';
import { useAuth } from '../../context/AuthContext';
import { DistrictKPIs } from './DistrictKPIs';
import { SchoolComparisonCharts } from './SchoolComparisonCharts';

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
          <DistrictKPIs overview={data.overview} />
          <SchoolComparisonCharts schools={data.schools} onSchoolClick={onSchoolClick} />
        </>
      )}
    </div>
  );
}