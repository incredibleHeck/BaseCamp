import type { Assessment } from '../types/domain';

/** Assessments at or below this (0–100) count as “struggled” for gap mining. */
export const STRUGGLE_SCORE_THRESHOLD = 50;

/** Prefer `rawScore` when finite; otherwise `score` (matches diagnostic routing). */
export function effectiveNumericScore(a: Assessment): number | null {
  const raw = a.rawScore;
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  const s = a.score;
  if (typeof s === 'number' && Number.isFinite(s)) return s;
  return null;
}

type AssessmentWithNestedGes = Assessment & {
  gesAlignment?: { objectiveId?: string } | null;
};

function assessmentIndicatesStruggle(a: Assessment): boolean {
  if (a.masteryLevel === 'intervention_needed') return true;
  const n = effectiveNumericScore(a);
  return n !== null && n < STRUGGLE_SCORE_THRESHOLD;
}

/** Cambridge code first, then nested GES alignment id, then flat `gesObjectiveId`. */
export function gapStandardCodeFromAssessment(a: Assessment): string | null {
  const cambridge = a.alignedStandardCode?.trim();
  if (cambridge) return cambridge;
  const nestedId = (a as AssessmentWithNestedGes).gesAlignment?.objectiveId?.trim();
  if (nestedId) return nestedId;
  const ges = a.gesObjectiveId?.trim();
  if (ges) return ges;
  return null;
}

function mostFrequentStandardCode(tally: Map<string, number>): string | null {
  let best: string | null = null;
  let bestCount = 0;
  for (const [code, count] of tally) {
    if (count > bestCount) {
      best = code;
      bestCount = count;
    } else if (count === bestCount && best !== null && code.localeCompare(best) < 0) {
      best = code;
    }
  }
  return bestCount > 0 ? best : null;
}

/**
 * Most frequent curriculum standard among “struggling” assessments across the given per-student histories.
 */
export function computeTopLearningGap(histories: Assessment[][]): string | null {
  const tally = new Map<string, number>();
  for (const history of histories) {
    for (const a of history) {
      if (!assessmentIndicatesStruggle(a)) continue;
      const code = gapStandardCodeFromAssessment(a);
      if (!code) continue;
      tally.set(code, (tally.get(code) ?? 0) + 1);
    }
  }
  return mostFrequentStandardCode(tally);
}
