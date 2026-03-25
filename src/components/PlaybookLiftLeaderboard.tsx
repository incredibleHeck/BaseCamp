import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import type { UserData } from './Header';
import {
  fetchScopedDistrictRollupInputs,
  type DistrictFeatureScope,
} from '../services/districtAnalyticsService';
import { computePlaybookLiftLeaderboard, type PlaybookLiftRow } from '../services/playbookAnalyticsService';
import { DEFAULT_DISTRICT_ID } from '../config/organizationDefaults';

interface PlaybookLiftLeaderboardProps {
  user: UserData;
}

export function PlaybookLiftLeaderboard({ user }: PlaybookLiftLeaderboardProps) {
  const [rows, setRows] = useState<PlaybookLiftRow[]>([]);
  const [loading, setLoading] = useState(true);

  const scope: DistrictFeatureScope = useMemo(
    () => ({
      districtId: user.districtId ?? DEFAULT_DISTRICT_ID,
      schoolId: user.role === 'headteacher' ? user.schoolId : undefined,
      circuitId: undefined,
    }),
    [user.role, user.districtId, user.schoolId]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const dash = await fetchScopedDistrictRollupInputs(scope);
        if (cancelled) return;
        setRows(computePlaybookLiftLeaderboard(dash.assessments));
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
      <div className="flex items-start gap-3 mb-6">
        <div className="p-2 rounded-lg bg-indigo-100 text-indigo-800">
          <BarChart3 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Remedial playbook lift (observational)</h2>
          <p className="text-gray-600 mt-1 text-sm max-w-3xl">
            Mean score change on the <strong>next</strong> assessment of the same subject after a playbook was logged.
            This is <strong>not</strong> a randomized trial—interpret with context and minimum sample sizes.
          </p>
        </div>
      </div>

      {loading && <p className="text-sm text-gray-500">Computing leaderboard…</p>}

      {!loading && rows.length === 0 && (
        <p className="text-sm text-gray-600">
          No linked sequences yet. Save assessments with a remedial activity title (playbook) and follow-up scores to
          populate this view.
        </p>
      )}

      {!loading && rows.length > 0 && (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Playbook</th>
                <th className="px-4 py-2 text-right font-medium text-gray-600">Sequences (n)</th>
                <th className="px-4 py-2 text-right font-medium text-gray-600">Mean Δ score</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {rows.map((r) => (
                <tr key={r.playbookKey}>
                  <td className="px-4 py-2">
                    <div className="font-medium text-gray-900">{r.playbookTitle}</div>
                    <div className="text-xs text-gray-500 font-mono">{r.playbookKey}</div>
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">{r.sampleSize}</td>
                  <td
                    className={`px-4 py-2 text-right tabular-nums font-semibold ${
                      r.meanScoreDelta >= 0 ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    {r.meanScoreDelta > 0 ? '+' : ''}
                    {r.meanScoreDelta}
                  </td>
                  <td className="px-4 py-2 capitalize">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${
                        r.evidenceStrength === 'strong'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : r.evidenceStrength === 'moderate'
                            ? 'bg-amber-50 text-amber-900 border-amber-200'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      {r.evidenceStrength}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
