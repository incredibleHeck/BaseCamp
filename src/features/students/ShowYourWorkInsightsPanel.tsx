import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Loader2, Video, AlertCircle } from 'lucide-react';
import type { ShowYourWorkInsightRow } from '../../hooks/useShowYourWorkInsights';

type ShowYourWorkInsightsPanelProps = {
  rows: ShowYourWorkInsightRow[];
  loading: boolean;
  error: string | null;
};

function formatWhen(d: Date | null): string {
  if (!d) return '—';
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function InsightCard({ row }: { row: ShowYourWorkInsightRow }) {
  const [open, setOpen] = useState(false);
  const ins = row.insights;

  return (
    <div className="rounded-xl border border-violet-200/80 bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-2 px-4 py-3 text-left hover:bg-violet-50/50 transition-colors"
      >
        <span className="mt-0.5 text-violet-600">{open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-violet-700">Show your work</span>
            {row.status === 'failed' ? (
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-800">Failed</span>
            ) : (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">Ready</span>
            )}
            <span className="text-xs text-gray-500">{formatWhen(row.createdAt)}</span>
          </div>
          {row.status === 'completed' && ins?.teacherSummary ? (
            <p className="mt-1 text-sm text-gray-800 line-clamp-2">{ins.teacherSummary}</p>
          ) : row.status === 'failed' && row.error ? (
            <p className="mt-1 text-sm text-rose-700 line-clamp-2">{row.error}</p>
          ) : (
            <p className="mt-1 text-sm text-gray-500">No summary yet.</p>
          )}
        </div>
      </button>
      {open ? (
        <div className="border-t border-violet-100 px-4 py-3 space-y-3 text-sm bg-violet-50/30">
          {row.status === 'failed' ? (
            <div className="flex gap-2 text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>{row.error || 'Processing failed.'}</p>
            </div>
          ) : (
            <>
              {ins?.speechCadence ? (
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">Speech cadence</p>
                  <p className="text-gray-800 mt-0.5">{ins.speechCadence}</p>
                </div>
              ) : null}
              {ins?.vocabularyHighlights && ins.vocabularyHighlights.length > 0 ? (
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">Vocabulary</p>
                  <ul className="mt-0.5 list-disc list-inside text-gray-800 space-y-0.5">
                    {ins.vocabularyHighlights.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {ins?.problemSolvingSteps && ins.problemSolvingSteps.length > 0 ? (
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">Problem-solving steps</p>
                  <ol className="mt-0.5 list-decimal list-inside text-gray-800 space-y-0.5">
                    {ins.problemSolvingSteps.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ol>
                </div>
              ) : null}
              {ins?.limitations ? (
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">Limitations</p>
                  <p className="text-gray-700 mt-0.5">{ins.limitations}</p>
                </div>
              ) : null}
              {row.model ? <p className="text-xs text-gray-400">Model: {row.model}</p> : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function ShowYourWorkInsightsPanel({ rows, loading, error }: ShowYourWorkInsightsPanelProps) {
  return (
    <div className="rounded-2xl border border-violet-200 bg-gradient-to-b from-violet-50/60 to-white p-5 shadow-sm mb-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white">
          <Video className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900">Show your work (video insights)</h3>
          <p className="text-xs text-gray-600 mt-0.5">
            AI summaries from student portal clips (Premium). New uploads may take a minute to appear.
          </p>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-red-600 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-600 py-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading insights…
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-gray-500 py-2">No video insights yet for this learner.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <InsightCard key={r.id} row={r} />
          ))}
        </div>
      )}
    </div>
  );
}
