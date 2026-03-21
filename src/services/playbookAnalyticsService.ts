import type { Assessment } from './assessmentService';

export interface PlaybookLiftRow {
  playbookKey: string;
  playbookTitle: string;
  sampleSize: number;
  meanScoreDelta: number;
  /** coarse label for UI */
  evidenceStrength: 'exploratory' | 'moderate' | 'strong';
}

function tsMs(raw: Assessment['timestamp']): number {
  if (typeof raw === 'number') return raw;
  if (raw && typeof (raw as { toMillis?: () => number }).toMillis === 'function') {
    return (raw as { toMillis: () => number }).toMillis();
  }
  if (raw && typeof raw === 'object' && raw !== null && 'seconds' in raw) {
    return (raw as { seconds: number }).seconds * 1000;
  }
  return 0;
}

function evidenceStrength(n: number): PlaybookLiftRow['evidenceStrength'] {
  if (n >= 25) return 'strong';
  if (n >= 8) return 'moderate';
  return 'exploratory';
}

/**
 * Observational comparison: for each student, look at consecutive assessments of the same type
 * where the earlier row has a playbookKey; attribute score delta to that playbook.
 */
export function computePlaybookLiftLeaderboard(assessments: Assessment[]): PlaybookLiftRow[] {
  const byStudent = new Map<string, Assessment[]>();
  for (const a of assessments) {
    if (!a.studentId) continue;
    const list = byStudent.get(a.studentId) ?? [];
    list.push(a);
    byStudent.set(a.studentId, list);
  }

  const deltasByPlaybook = new Map<string, { sum: number; n: number; title: string }>();

  for (const [, rows] of byStudent) {
    const sorted = [...rows].sort((a, b) => tsMs(a.timestamp) - tsMs(b.timestamp));
    for (let i = 0; i < sorted.length - 1; i++) {
      const prev = sorted[i];
      const next = sorted[i + 1];
      if (prev.type !== next.type) continue;
      const key = prev.playbookKey;
      if (!key) continue;
      const s0 = prev.score;
      const s1 = next.score;
      if (typeof s0 !== 'number' || typeof s1 !== 'number') continue;
      const delta = s1 - s0;
      const title = prev.playbookTitle ?? prev.lessonPlan?.title ?? key;
      const bucket = deltasByPlaybook.get(key) ?? { sum: 0, n: 0, title };
      bucket.sum += delta;
      bucket.n += 1;
      bucket.title = title;
      deltasByPlaybook.set(key, bucket);
    }
  }

  const rows: PlaybookLiftRow[] = [...deltasByPlaybook.entries()].map(([playbookKey, v]) => ({
    playbookKey,
    playbookTitle: v.title,
    sampleSize: v.n,
    meanScoreDelta: v.n ? Math.round((v.sum / v.n) * 10) / 10 : 0,
    evidenceStrength: evidenceStrength(v.n),
  }));

  return rows.sort((a, b) => b.meanScoreDelta - a.meanScoreDelta || b.sampleSize - a.sampleSize);
}
