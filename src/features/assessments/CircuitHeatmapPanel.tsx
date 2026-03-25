import React, { useEffect, useMemo, useState } from 'react';
import { Download, MapPin } from 'lucide-react';
import type { UserData } from '../../components/layout/Header';
import {
  buildCircuitSkillRollups,
  fetchScopedDistrictRollupInputs,
  heatmapRowsToCsv,
  type CircuitSkillRollup,
  type DistrictFeatureScope,
} from '../../services/analytics/districtAnalyticsService';
import { DEMO_CIRCUIT_REGIONS, CIRCUIT_MAP_VIEWBOX, bandFillClass } from '../../data/demoCircuitMap';
import { DEFAULT_DISTRICT_ID } from '../../config/organizationDefaults';

interface CircuitHeatmapPanelProps {
  user: UserData;
}

const SKILL_PRESETS = [
  { value: 'fraction', label: 'Fraction / rational number gaps' },
  { value: 'division', label: 'Division & remainders' },
  { value: 'comprehension', label: 'Reading comprehension' },
  { value: 'phonics', label: 'Phonics / decoding' },
];

export function CircuitHeatmapPanel({ user }: CircuitHeatmapPanelProps) {
  const [skill, setSkill] = useState(SKILL_PRESETS[0].value);
  const [rows, setRows] = useState<CircuitSkillRollup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scope: DistrictFeatureScope = useMemo(
    () => ({
      districtId: user.districtId ?? DEFAULT_DISTRICT_ID,
      circuitId: user.role === 'circuit_supervisor' ? user.circuitId : undefined,
      schoolId: undefined,
    }),
    [user.role, user.districtId, user.circuitId]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const dash = await fetchScopedDistrictRollupInputs(scope);
        if (cancelled) return;
        const roll = buildCircuitSkillRollups(dash.students, dash.assessments, skill);
        setRows(roll);
      } catch (e) {
        if (!cancelled) setError('Could not load heatmap data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [scope, skill]);

  const bandByCircuit = useMemo(() => {
    const m = new Map<string, CircuitSkillRollup['band']>();
    for (const r of rows) m.set(r.circuitId, r.band);
    return m;
  }, [rows]);

  const exportCsv = () => {
    const label = SKILL_PRESETS.find((p) => p.value === skill)?.label ?? skill;
    const csv = heatmapRowsToCsv(rows, label);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `basecamp-heatmap-${skill}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 w-full animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-600 shrink-0" />
            Circuit risk heatmap (demo boundaries)
          </h2>
          <p className="text-gray-600 mt-1 text-sm max-w-2xl">
            Aggregated share of learners whose <strong>latest</strong> assessment matches the skill filter (gap tags or
            diagnosis text). Small circuits are <strong>suppressed</strong> below minimum <em>n</em> for privacy.
          </p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg border border-gray-200 bg-gray-50 text-sm font-medium text-gray-800 hover:bg-gray-100"
        >
          <Download className="w-4 h-4" />
          Export table (CSV)
        </button>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <label htmlFor="skill-select" className="text-sm font-medium text-gray-700">
          Skill / gap focus
        </label>
        <select
          id="skill-select"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 max-w-md"
        >
          {SKILL_PRESETS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-sm text-gray-500 py-8 text-center">Loading aggregates…</p>}
      {error && <p className="text-sm text-red-600 py-4">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-slate-50">
            <svg viewBox={CIRCUIT_MAP_VIEWBOX} className="w-full h-auto max-h-[320px]" role="img" aria-label="Schematic district map by circuit">
              <title>Circuit choropleth</title>
              {DEMO_CIRCUIT_REGIONS.map((region) => {
                const band = bandByCircuit.get(region.circuitId) ?? 'suppressed';
                const cls = bandFillClass(band);
                const rollup = rows.find((r) => r.circuitId === region.circuitId);
                const sub =
                  rollup?.band === 'suppressed'
                    ? 'n < min'
                    : rollup != null && rollup.pctWeak != null
                      ? `${rollup.pctWeak}% weak`
                      : '';
                return (
                  <g key={region.circuitId}>
                    <path d={region.path} className={`stroke-2 ${cls}`} />
                    <text
                      x={region.labelX}
                      y={region.labelY}
                      className="fill-gray-900 text-[11px] font-semibold"
                      style={{ fontFamily: 'system-ui, sans-serif' }}
                    >
                      {region.name}
                    </text>
                    <text
                      x={region.labelX}
                      y={region.labelY + 14}
                      className="fill-gray-700 text-[10px]"
                      style={{ fontFamily: 'system-ui, sans-serif' }}
                    >
                      {sub}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div className="px-4 py-3 flex flex-wrap gap-4 text-xs text-gray-600 border-t border-gray-200 bg-white">
              <span>
                <span className="inline-block w-3 h-3 rounded-sm bg-emerald-200 border border-emerald-600 mr-1 align-middle" />{' '}
                Lower intensity
              </span>
              <span>
                <span className="inline-block w-3 h-3 rounded-sm bg-amber-200 border border-amber-600 mr-1 align-middle" />{' '}
                Moderate
              </span>
              <span>
                <span className="inline-block w-3 h-3 rounded-sm bg-red-300 border border-red-700 mr-1 align-middle" />{' '}
                Higher intensity
              </span>
              <span>
                <span className="inline-block w-3 h-3 rounded-sm bg-gray-200 border border-gray-500 mr-1 align-middle" />{' '}
                Suppressed
              </span>
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Circuit</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-600">Learners</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-600">% weak</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Band</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {rows.map((r) => (
                  <tr key={r.circuitId}>
                    <td className="px-4 py-2 font-medium text-gray-900">{r.circuitName}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-gray-700">{r.studentCount}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-gray-700">
                      {r.pctWeak === null ? '—' : `${r.pctWeak}%`}
                    </td>
                    <td className="px-4 py-2 capitalize text-gray-700">{r.band}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

