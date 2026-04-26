import type { AssessmentRow } from './effectiveNumericScore.js';
import { effectiveNumericScore } from './effectiveNumericScore.js';

export const STRUGGLE_SCORE_THRESHOLD = 50;

type Row = AssessmentRow & {
  alignedStandardCode?: unknown;
  gesObjectiveId?: unknown;
  masteryLevel?: unknown;
  gesAlignment?: { objectiveId?: string } | null;
};

function assessmentIndicatesStruggle(a: Row): boolean {
  if (a.masteryLevel === 'intervention_needed') return true;
  const n = effectiveNumericScore(a);
  return n !== null && n < STRUGGLE_SCORE_THRESHOLD;
}

export function gapStandardCodeFromAssessment(a: Row): string | null {
  const cambridge = typeof a.alignedStandardCode === 'string' ? a.alignedStandardCode.trim() : '';
  if (cambridge) return cambridge;
  const nested = a.gesAlignment?.objectiveId;
  if (typeof nested === 'string' && nested.trim()) return nested.trim();
  const ges = typeof a.gesObjectiveId === 'string' ? a.gesObjectiveId.trim() : '';
  if (ges) return ges;
  return null;
}

/**
 * From a flat list of assessment rows, pick the most common struggle standard (matches client idea).
 */
export function topLearningGapFromAssessments(assessments: Row[]): string | null {
  const tally = new Map<string, number>();
  for (const a of assessments) {
    if (!assessmentIndicatesStruggle(a)) continue;
    const code = gapStandardCodeFromAssessment(a);
    if (!code) continue;
    tally.set(code, (tally.get(code) ?? 0) + 1);
  }
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
