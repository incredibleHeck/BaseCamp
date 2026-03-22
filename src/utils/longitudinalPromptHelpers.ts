import type { Assessment } from '../services/assessmentService';
import type { Student } from '../services/studentService';

export function assessmentTimestampMs(t: Assessment['timestamp']): number {
  if (typeof t === 'number') return t;
  if (t instanceof Date) return t.getTime();
  const anyT = t as { toMillis?: () => number };
  if (anyT && typeof anyT.toMillis === 'function') return anyT.toMillis();
  return 0;
}

/**
 * Parse numeric grade (1–12) from class/grade strings, e.g. "P6" → 6, "JHS 1" → 7, "Grade 2" → 2.
 */
export function parseGradeLevelFromClassLabelString(label: string | undefined | null): number | undefined {
  if (!label?.trim()) return undefined;
  const s = label.trim();
  const jhs = /\bJHS\s*(\d+)\b|\bJ\.?\s*H\.?\s*S\.?\s*(\d+)\b/i.exec(s);
  if (jhs) {
    const n = parseInt(jhs[1] || jhs[2], 10);
    if (n >= 1 && n <= 3) return 6 + n;
  }
  const p = /\bP\s*(\d+)\b|Primary\s*(\d+)/i.exec(s);
  if (p) {
    const n = parseInt(p[1] || p[2], 10);
    if (n >= 1 && n <= 12) return n;
  }
  const g = /\b(?:Grade|Class|G)\s*(\d+)\b/i.exec(s);
  if (g) {
    const n = parseInt(g[1], 10);
    if (n >= 1 && n <= 12) return n;
  }
  const m = s.match(/\b(\d{1,2})\b/);
  if (m) {
    const n = parseInt(m[1], 10);
    if (n >= 1 && n <= 12) return n;
  }
  return undefined;
}

/** Uses optional `classLabel` (if present on record) then `student.grade`. */
export function parseGradeLevelFromStudentRecord(
  student: (Pick<Student, 'grade'> & { classLabel?: string }) | null | undefined
): number | undefined {
  if (!student) return undefined;
  const classLbl = (student as { classLabel?: string }).classLabel;
  return (
    parseGradeLevelFromClassLabelString(classLbl) ?? parseGradeLevelFromClassLabelString(student.grade)
  );
}

/**
 * Last 3–5 assessments (newest first), compact line for longitudinal / SEN prompts.
 */
export function buildRecentHistorySummaryForLongitudinalPrompt(
  history: Assessment[],
  assessmentType: string
): string | undefined {
  if (!history.length) return undefined;
  const wantLit =
    assessmentType.toLowerCase().includes('lit') || assessmentType === 'Literacy';
  const relevant = history.filter((a) => (wantLit ? a.type === 'Literacy' : a.type === 'Numeracy'));
  const ordered = [...(relevant.length ? relevant : history)].sort(
    (a, b) => assessmentTimestampMs(b.timestamp) - assessmentTimestampMs(a.timestamp)
  );
  const slice = ordered.slice(0, 5);
  if (!slice.length) return undefined;
  const n = slice.length;
  const scoreParts = slice.map((a) => {
    const sc = typeof a.score === 'number' ? `${a.score}%` : 'n/a';
    const topic = (
      a.gapTags?.[0] ??
      a.playbookTitle ??
      (a.diagnosis ? a.diagnosis.replace(/\s+/g, ' ').trim().slice(0, 36) : null) ??
      'topic'
    ).trim();
    return `${sc} (${topic})`;
  });
  const tagCounts = new Map<string, number>();
  for (const a of slice) {
    for (const t of a.gapTags ?? []) {
      const k = t.trim();
      if (k) tagCounts.set(k, (tagCounts.get(k) ?? 0) + 1);
    }
  }
  const frequent = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([t]) => t);
  const tagLine = frequent.length ? ` Frequent tags: ${frequent.join(', ')}.` : '';
  return `Past ${n} assessments: ${scoreParts.join(', ')}.${tagLine}`;
}
