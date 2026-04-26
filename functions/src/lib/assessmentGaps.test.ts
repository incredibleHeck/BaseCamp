import { describe, it, expect } from 'vitest';
import {
  topLearningGapFromAssessments,
  gapStandardCodeFromAssessment,
  STRUGGLE_SCORE_THRESHOLD,
} from './assessmentGaps.js';

describe('gapStandardCodeFromAssessment', () => {
  it('returns cambridge code when present', () => {
    expect(gapStandardCodeFromAssessment({ alignedStandardCode: 'N3.2a' })).toBe('N3.2a');
  });

  it('falls back to gesAlignment.objectiveId', () => {
    expect(
      gapStandardCodeFromAssessment({ gesAlignment: { objectiveId: 'GES-M-4.1' } })
    ).toBe('GES-M-4.1');
  });

  it('falls back to gesObjectiveId', () => {
    expect(gapStandardCodeFromAssessment({ gesObjectiveId: 'OBJ-123' })).toBe('OBJ-123');
  });

  it('returns null when all fields missing', () => {
    expect(gapStandardCodeFromAssessment({})).toBeNull();
  });

  it('trims whitespace', () => {
    expect(gapStandardCodeFromAssessment({ alignedStandardCode: '  N5.1  ' })).toBe('N5.1');
  });
});

describe('topLearningGapFromAssessments', () => {
  it('returns null for empty list', () => {
    expect(topLearningGapFromAssessments([])).toBeNull();
  });

  it('returns null when no assessments indicate struggle', () => {
    const rows = [
      { score: 80, alignedStandardCode: 'N1.1' },
      { score: 90, alignedStandardCode: 'N1.2' },
    ];
    expect(topLearningGapFromAssessments(rows)).toBeNull();
  });

  it('returns the most common struggle standard', () => {
    const rows = [
      { score: 30, alignedStandardCode: 'N3.2a' },
      { score: 20, alignedStandardCode: 'N3.2a' },
      { score: 40, alignedStandardCode: 'N4.1' },
    ];
    expect(topLearningGapFromAssessments(rows)).toBe('N3.2a');
  });

  it('treats intervention_needed as struggle regardless of score', () => {
    const rows = [
      { score: 90, masteryLevel: 'intervention_needed', alignedStandardCode: 'N1.1' },
    ];
    expect(topLearningGapFromAssessments(rows)).toBe('N1.1');
  });

  it('breaks ties alphabetically', () => {
    const rows = [
      { score: 10, alignedStandardCode: 'B' },
      { score: 10, alignedStandardCode: 'A' },
    ];
    expect(topLearningGapFromAssessments(rows)).toBe('A');
  });

  it('uses STRUGGLE_SCORE_THRESHOLD boundary correctly', () => {
    const atThreshold = [{ score: STRUGGLE_SCORE_THRESHOLD, alignedStandardCode: 'X' }];
    expect(topLearningGapFromAssessments(atThreshold)).toBeNull();

    const belowThreshold = [{ score: STRUGGLE_SCORE_THRESHOLD - 1, alignedStandardCode: 'X' }];
    expect(topLearningGapFromAssessments(belowThreshold)).toBe('X');
  });
});
