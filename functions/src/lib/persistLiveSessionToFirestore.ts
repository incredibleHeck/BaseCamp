import type { Firestore } from 'firebase-admin/firestore';
import { FieldValue, type DocumentData } from 'firebase-admin/firestore';
import { getDatabase } from 'firebase-admin/database';
import * as logger from 'firebase-functions/logger';

const PERSISTED = 'live_session_persisted';
const MAX_BATCH = 400;

type LiveQuestion = { id: string; correctIndex: number };

function parseQuestions(state: Record<string, unknown> | null): LiveQuestion[] {
  const q = state?.questions;
  if (!Array.isArray(q)) return [];
  const out: LiveQuestion[] = [];
  for (const item of q) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    if (typeof o.id !== 'string' || typeof o.correctIndex !== 'number') continue;
    out.push({ id: o.id, correctIndex: o.correctIndex });
  }
  return out;
}

export function gradeLiveAnswers(
  questions: LiveQuestion[],
  answers: Record<string, Record<string, unknown>> | null,
  anonUid: string
): { correct: number; total: number; score: number } {
  let correct = 0;
  const total = questions.length;
  for (const q of questions) {
    const perQ = answers?.[q.id];
    const raw = perQ?.[anonUid];
    const idx = typeof raw === 'number' ? raw : Number(raw);
    if (Number.isFinite(idx) && idx === q.correctIndex) correct += 1;
  }
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  return { correct, total, score };
}

export function liveSessionAssessmentDocId(sessionId: string, firestoreStudentId: string): string {
  const safeSession = sessionId.replace(/\//g, '_');
  return `ls_${safeSession}_${firestoreStudentId}`;
}

export type PersistResult = {
  ok: boolean;
  skipped?: 'already_persisted' | 'no_rtdb_data' | 'not_concluded';
  assessmentCount?: number;
};

function primaryCohortTeacherId(cohort: DocumentData | undefined): string | undefined {
  if (!cohort) return undefined;
  const ids = cohort.assignedTeacherIds;
  if (Array.isArray(ids)) {
    for (const x of ids) {
      if (typeof x === 'string' && x.trim()) return x.trim();
    }
  }
  const legacy = cohort.teacherId;
  if (typeof legacy === 'string' && legacy.trim()) return legacy.trim();
  return undefined;
}

/**
 * Reads RTDB `live_sessions/{sessionId}`, writes one `assessments` row per `student_links` entry,
 * marks `live_session_persisted/{sessionId}`, then removes the RTDB subtree.
 */
export async function persistConcludedLiveSession(
  firestore: Firestore,
  sessionId: string
): Promise<PersistResult> {
  const persistedRef = firestore.collection(PERSISTED).doc(sessionId);
  const persistedSnap = await persistedRef.get();
  if (persistedSnap.exists) {
    await removeLiveSessionRtdb(sessionId);
    return { ok: true, skipped: 'already_persisted', assessmentCount: (persistedSnap.data() as { assessmentCount?: number })?.assessmentCount };
  }

  const rtdb = getDatabase();
  const rootRef = rtdb.ref(`live_sessions/${sessionId}`);
  const rootSnap = await rootRef.once('value');
  if (!rootSnap.exists()) {
    return { ok: true, skipped: 'no_rtdb_data' };
  }

  const root = rootSnap.val() as Record<string, unknown>;
  const state = (root.state ?? null) as Record<string, unknown> | null;
  if (state?.status !== 'concluded') {
    return { ok: true, skipped: 'not_concluded' };
  }

  const questions = parseQuestions(state);
  const answers = (root.answers ?? null) as Record<string, Record<string, unknown>> | null;
  const studentLinks = (root.student_links ?? null) as Record<string, { firestoreStudentId?: string }> | null;

  const teacherId = typeof state.teacherId === 'string' ? state.teacherId : '';
  const roundTitle = typeof state.roundTitle === 'string' ? state.roundTitle : '';
  const endedAtMs = typeof state.endedAtMs === 'number' ? state.endedAtMs : null;

  const links = studentLinks && typeof studentLinks === 'object' ? Object.entries(studentLinks) : [];
  const rows: Array<{
    anonUid: string;
    firestoreStudentId: string;
    score: number;
    correct: number;
    total: number;
  }> = [];

  for (const [anonUid, link] of links) {
    const fsId = typeof link?.firestoreStudentId === 'string' ? link.firestoreStudentId.trim() : '';
    if (!fsId) continue;
    const g = gradeLiveAnswers(questions, answers, anonUid);
    rows.push({ anonUid, firestoreStudentId: fsId, ...g });
  }

  if (rows.length === 0) {
    logger.warn('persistConcludedLiveSession: no student_links; nothing to write', { sessionId });
  }

  const studentIds = [...new Set(rows.map((r) => r.firestoreStudentId))];
  const studentMap = await loadStudents(firestore, studentIds);
  const cohortIds = [...new Set(studentIds.map((id) => studentMap.get(id)?.cohortId).filter(Boolean) as string[])];
  const cohortMap = await loadCohorts(firestore, cohortIds);

  const nowMs = Date.now();
  const diagnosis = roundTitle.trim()
    ? `Live session: ${roundTitle.trim()}`
    : 'Live classroom session (Follow Me)';

  const writes: Array<{ id: string; data: DocumentData }> = [];
  for (const row of rows) {
    const st = studentMap.get(row.firestoreStudentId);
    const cohortId =
      st && typeof st.cohortId === 'string' && st.cohortId.trim() ? st.cohortId.trim() : undefined;
    const cohort = cohortId ? cohortMap.get(cohortId) : undefined;
    const schoolId = typeof st?.schoolId === 'string' ? st.schoolId : undefined;
    const cohortTeacherId =
      primaryCohortTeacherId(cohort) ??
      (typeof st?.cohortTeacherId === 'string' ? st.cohortTeacherId : undefined);

    const classLabel = cohort && typeof cohort.name === 'string' ? cohort.name : undefined;

    const docId = liveSessionAssessmentDocId(sessionId, row.firestoreStudentId);
    const data: DocumentData = {
      studentId: row.firestoreStudentId,
      type: 'Numeracy',
      diagnosis,
      score: row.score,
      rawScore: row.total > 0 ? row.correct / row.total : 0,
      timestamp: endedAtMs != null ? endedAtMs : FieldValue.serverTimestamp(),
      status: 'Completed',
      updatedAt: nowMs,
      liveSessionId: sessionId,
      ...(teacherId ? { createdByUserId: teacherId } : {}),
      ...(cohortId ? { cohortId } : {}),
      ...(cohortTeacherId ? { cohortTeacherId } : {}),
      ...(schoolId ? { schoolId } : {}),
      ...(classLabel ? { classLabel } : {}),
    };
    writes.push({ id: docId, data });
  }

  for (let i = 0; i < writes.length; i += MAX_BATCH) {
    const batch = firestore.batch();
    const chunk = writes.slice(i, i + MAX_BATCH);
    for (const w of chunk) {
      batch.set(firestore.collection('assessments').doc(w.id), w.data, { merge: true });
    }
    await batch.commit();
  }

  await persistedRef.set({
    sessionId,
    processedAt: FieldValue.serverTimestamp(),
    assessmentCount: writes.length,
    teacherId: teacherId || null,
  });

  await rootRef.remove();

  return { ok: true, assessmentCount: writes.length };
}

async function removeLiveSessionRtdb(sessionId: string): Promise<void> {
  const rtdb = getDatabase();
  try {
    await rtdb.ref(`live_sessions/${sessionId}`).remove();
  } catch (e) {
    logger.warn('removeLiveSessionRtdb', { sessionId, err: String(e) });
  }
}

async function loadStudents(
  firestore: Firestore,
  ids: string[]
): Promise<Map<string, Record<string, unknown>>> {
  const map = new Map<string, Record<string, unknown>>();
  for (let i = 0; i < ids.length; i += 10) {
    const slice = ids.slice(i, i + 10);
    const snaps = await Promise.all(slice.map((id) => firestore.collection('students').doc(id).get()));
    for (let j = 0; j < slice.length; j++) {
      const d = snaps[j];
      if (d.exists) map.set(slice[j], d.data() as Record<string, unknown>);
    }
  }
  return map;
}

async function loadCohorts(
  firestore: Firestore,
  ids: string[]
): Promise<Map<string, { name?: string; teacherId?: string }>> {
  const map = new Map<string, { name?: string; teacherId?: string }>();
  for (const id of ids) {
    const d = await firestore.collection('cohorts').doc(id).get();
    if (!d.exists) continue;
    const c = d.data() as Record<string, unknown>;
    map.set(id, {
      name: typeof c.name === 'string' ? c.name : undefined,
      teacherId: typeof c.teacherId === 'string' ? c.teacherId : undefined,
    });
  }
  return map;
}
