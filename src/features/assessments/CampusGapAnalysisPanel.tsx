import React, { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Download, Building2 } from 'lucide-react';
import type { UserData } from '../../components/layout/Header';
import {
  buildBranchGapRollups,
  branchGapRowsToCsv,
  fetchScopedJurisdictionRollupInputs,
  type BranchGapRollup,
  type OrganizationFeatureScope,
} from '../../services/analytics/organizationAnalyticsService';
import { DEFAULT_ORGANIZATION_ID } from '../../config/organizationDefaults';
import { effectiveOrganizationId } from '../../utils/organizationScope';

interface CampusGapAnalysisPanelProps {
  user: UserData;
}

const SKILL_PRESETS = [
  { value: 'fraction', label: 'Fraction / rational number gaps' },
  { value: 'division', label: 'Division & remainders' },
  { value: 'comprehension', label: 'Reading comprehension' },
  { value: 'phonics', label: 'Phonics / decoding' },
];

function barColorForBand(band: BranchGapRollup['band']): string {
  switch (band) {
    case 'low':
      return '#6ee7b7';
    case 'moderate':
      return '#fcd34d';
    case 'high':
      return '#fca5a5';
    case 'suppressed':
    default:
      return '#e2e8f0';
  }
}

function supportTierLabel(band: BranchGapRollup['band']): string {
  switch (band) {
    case 'low':
      return 'Low';
    case 'moderate':
      return 'Moderate';
    case 'high':
      return 'High';
    case 'suppressed':
      return 'Suppressed';
    default:
      return '—';
  }
}

type ChartRow = {
  schoolId: string;
  name: string;
  prevalence: number;
  band: BranchGapRollup['band'];
  isSuppressed: boolean;
};

export function CampusGapAnalysisPanel({ user }: CampusGapAnalysisPanelProps) {
  const [skill, setSkill] = useState(SKILL_PRESETS[0].value);
  const [rows, setRows] = useState<BranchGapRollup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orgScope = user.organizationId ?? DEFAULT_ORGANIZATION_ID;
  const scope: OrganizationFeatureScope = useMemo(
    () => ({
      organizationId: orgScope,
      circuitId: undefined,
      schoolId: undefined,
    }),
    [orgScope]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const dash = await fetchScopedJurisdictionRollupInputs(scope);
        if (cancelled) return;
        const roll = buildBranchGapRollups(dash.students, dash.assessments, skill);
        setRows(roll);
      } catch (e) {
        if (!cancelled) setError('Could not load campus gap data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [scope, skill]);

  const chartData: ChartRow[] = useMemo(
    () =>
      rows.map((r) => ({
        schoolId: r.schoolId,
        name: r.branchName,
        prevalence: r.pctSupportNeeded ?? 0,
        band: r.band,
        isSuppressed: r.pctSupportNeeded === null,
      })),
    [rows]
  );

  const chartHeight = useMemo(() => Math.min(520, Math.max(260, rows.length * 44)), [rows.length]);

  const exportCsv = () => {
    const label = SKILL_PRESETS.find((p) => p.value === skill)?.label ?? skill;
    const csv = branchGapRowsToCsv(rows, label);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campus-gap-analysis-${skill}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6 mb-8 w-full animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-slate-700 shrink-0" aria-hidden />
            Campus Gap Analysis
          </h2>
          <p className="text-slate-600 mt-1 text-sm max-w-2xl">
            Identify foundational learning gaps across your network campuses.
          </p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 hover:bg-slate-100"
        >
          <Download className="w-4 h-4" />
          Export table (CSV)
        </button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
        <label htmlFor="gap-skill-select" className="text-sm font-medium text-slate-700">
          Skill / gap focus
        </label>
        <select
          id="gap-skill-select"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 max-w-md bg-white shadow-sm"
        >
          {SKILL_PRESETS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-sm text-slate-500 py-8 text-center">Loading aggregates…</p>}
      {error && <p className="text-sm text-red-600 py-4">{error}</p>}

      {!loading && !error && (
        <div className="flex flex-col gap-8">
          {rows.length === 0 ? (
            <p className="text-sm text-slate-500 py-10 text-center border border-dashed border-slate-200 rounded-xl">
              No branch data for this view yet. Enrollments by campus will appear when students are linked to schools.
            </p>
          ) : (
            <div className="border border-slate-200 rounded-xl bg-gradient-to-b from-slate-50/80 to-white p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Gap prevalence by campus</h3>
              <p className="text-xs text-slate-500 mb-4">
                Share of learners whose latest assessment matches this gap (diagnosis or tags). Branches with fewer than
                the minimum cohort size show as suppressed.
              </p>
              <div className="w-full" style={{ height: chartHeight }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={chartData}
                    margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
                    barCategoryGap={10}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal className="stroke-slate-200" />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tickFormatter={(v) => `${v}%`}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={132}
                      tick={{ fontSize: 12, fill: '#334155' }}
                      tickLine={false}
                      axisLine={{ className: 'stroke-slate-200' }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '0.5rem',
                        border: '1px solid rgb(226 232 240)',
                        fontSize: '0.8125rem',
                      }}
                      formatter={(value: number, _name: string, item: { payload?: ChartRow }) => {
                        const p = item.payload;
                        if (!p) return [value, 'Gap prevalence'];
                        if (p.isSuppressed) return ['Suppressed (privacy threshold)', 'Gap prevalence'];
                        return [`${p.prevalence}%`, 'Gap prevalence'];
                      }}
                    />
                    <Bar dataKey="prevalence" radius={[0, 6, 6, 0]} maxBarSize={28} isAnimationActive={rows.length < 20}>
                      {chartData.map((row) => (
                        <Cell key={row.schoolId} fill={barColorForBand(row.band)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: barColorForBand('low') }} />
                  Low support need
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: barColorForBand('moderate') }} />
                  Moderate
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: barColorForBand('high') }} />
                  High
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: barColorForBand('suppressed') }} />
                  Suppressed
                </span>
              </div>
            </div>
          )}

          {rows.length > 0 && (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-medium text-slate-600">Campus/Branch</th>
                    <th className="px-4 py-2.5 text-right font-medium text-slate-600">Total Learners</th>
                    <th className="px-4 py-2.5 text-right font-medium text-slate-600">Gap Prevalence (%)</th>
                    <th className="px-4 py-2.5 text-left font-medium text-slate-600">Support Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {rows.map((r) => (
                    <tr key={r.schoolId} className="hover:bg-slate-50/80">
                      <td className="px-4 py-2.5 font-medium text-slate-900">{r.branchName}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-slate-700">{r.studentCount}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-slate-700">
                        {r.pctSupportNeeded === null ? '—' : `${r.pctSupportNeeded}%`}
                      </td>
                      <td className="px-4 py-2.5 text-slate-800">{supportTierLabel(r.band)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
