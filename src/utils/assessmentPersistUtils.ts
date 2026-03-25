import type { DiagnosticReport } from '../services/ai/aiPrompts';
import type { Assessment } from '../types/domain';

/** Prefer rawScore for rubric bands when the model supplies it; else canonical score (matches extension routing). */
function numericForRubric(report: Pick<DiagnosticReport, 'score' | 'rawScore'>): number | null {
  if (typeof report.rawScore === 'number' && Number.isFinite(report.rawScore)) return report.rawScore;
  if (typeof report.score === 'number' && Number.isFinite(report.score)) return report.score;
  return null;
}

function deriveMasteryLevelFromScore(n: number): string {
  if (n >= 95) return 'mastered';
  if (n >= 85) return 'advanced';
  if (n >= 70) return 'proficient';
  if (n >= 50) return 'developing';
  return 'intervention_needed';
}

/**
 * Maps AI diagnostic output to persisted Assessment curriculum fields used by analytics
 * (`alignedStandardCode`, `masteryLevel`, `score`, `rawScore`).
 */
export function curriculumFieldsFromDiagnosticReport(
  report: Pick<DiagnosticReport, 'score' | 'rawScore' | 'masteryLevel' | 'alignedStandardCode'>
): Pick<Assessment, 'alignedStandardCode' | 'masteryLevel' | 'score' | 'rawScore'> {
  const score = typeof report.score === 'number' && Number.isFinite(report.score) ? report.score : undefined;
  const rawScore =
    typeof report.rawScore === 'number' && Number.isFinite(report.rawScore)
      ? report.rawScore
      : score;

  const aligned =
    typeof report.alignedStandardCode === 'string' && report.alignedStandardCode.trim()
      ? report.alignedStandardCode.trim()
      : undefined;

  const rubricN = numericForRubric(report);
  let masteryLevel =
    typeof report.masteryLevel === 'string' && report.masteryLevel.trim()
      ? report.masteryLevel.trim()
      : undefined;
  if (!masteryLevel && rubricN !== null) {
    masteryLevel = deriveMasteryLevelFromScore(rubricN);
  }

  return {
    ...(aligned !== undefined ? { alignedStandardCode: aligned } : {}),
    ...(masteryLevel !== undefined ? { masteryLevel } : {}),
    ...(score !== undefined ? { score } : {}),
    ...(rawScore !== undefined ? { rawScore } : {}),
  };
}

