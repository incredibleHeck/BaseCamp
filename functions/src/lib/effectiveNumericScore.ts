/**
 * Mirrors `src/utils/analyticsUtils.ts` — prefer `rawScore` when finite; else `score` (0–100).
 */
export type AssessmentRow = {
  rawScore?: unknown;
  score?: unknown;
};

export function effectiveNumericScore(a: AssessmentRow): number | null {
  const raw = a.rawScore;
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  const s = a.score;
  if (typeof s === 'number' && Number.isFinite(s)) return s;
  return null;
}
