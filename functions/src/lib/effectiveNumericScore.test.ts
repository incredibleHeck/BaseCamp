import { describe, it, expect } from 'vitest';
import { effectiveNumericScore } from './effectiveNumericScore.js';

describe('effectiveNumericScore', () => {
  it('prefers rawScore when finite', () => {
    expect(effectiveNumericScore({ rawScore: 0.85, score: 85 })).toBe(0.85);
  });

  it('falls back to score when rawScore is missing', () => {
    expect(effectiveNumericScore({ score: 72 })).toBe(72);
  });

  it('falls back to score when rawScore is non-finite', () => {
    expect(effectiveNumericScore({ rawScore: NaN, score: 50 })).toBe(50);
  });

  it('returns null when both are missing', () => {
    expect(effectiveNumericScore({})).toBeNull();
  });

  it('returns null when both are non-numeric', () => {
    expect(effectiveNumericScore({ rawScore: 'high', score: 'A' })).toBeNull();
  });

  it('handles zero rawScore', () => {
    expect(effectiveNumericScore({ rawScore: 0, score: 50 })).toBe(0);
  });

  it('handles Infinity rawScore and falls back', () => {
    expect(effectiveNumericScore({ rawScore: Infinity, score: 30 })).toBe(30);
  });
});
