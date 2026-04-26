import type { AnswersByQuestion, LiveSessionQuestion, LiveSessionState } from '../types/liveSessionRtdb';

export type LeaderboardRow = {
  studentId: string;
  points: number;
  correctCount: number;
  answeredCount: number;
  displayName?: string;
};

/**
 * Sums 1 point per question where the student's selected index matches `correctIndex`.
 * Values in RTDB are option indices (numbers).
 */
export function buildLeaderboardFromAnswers(
  answers: AnswersByQuestion | null,
  state: LiveSessionState | null
): LeaderboardRow[] {
  if (!answers || !state?.questions?.length) return [];
  const byQ = new Map<string, LiveSessionQuestion>();
  for (const q of state.questions) {
    byQ.set(q.id, q);
  }
  const students = new Map<string, { points: number; correct: number; n: number }>();
  for (const [qid, byStudent] of Object.entries(answers)) {
    const q = byQ.get(qid);
    if (!q) continue;
    for (const [sid, val] of Object.entries(byStudent)) {
      if (typeof val !== 'number' || !Number.isFinite(val)) continue;
      const cur = students.get(sid) ?? { points: 0, correct: 0, n: 0 };
      cur.n += 1;
      if (val === q.correctIndex) {
        cur.correct += 1;
        cur.points += 1;
      }
      students.set(sid, cur);
    }
  }
  return [...students.entries()]
    .map(([studentId, s]) => ({ studentId, points: s.points, correctCount: s.correct, answeredCount: s.n }))
    .sort((a, b) => b.points - a.points);
}

/**
 * Merge `displayName` from presence (optional) into leaderboard rows by student id.
 */
export function applyPresenceLabels(
  rows: LeaderboardRow[],
  presence: Record<string, { online?: boolean; displayName?: string }> | null
): LeaderboardRow[] {
  if (!presence) return rows;
  return rows.map((r) => {
    const d = presence[r.studentId]?.displayName;
    return d ? { ...r, displayName: d } : r;
  });
}
