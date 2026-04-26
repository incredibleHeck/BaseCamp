import {
  child,
  get,
  off,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  onDisconnect,
  onValue,
  ref,
  set,
  update,
  type Unsubscribe,
} from 'firebase/database';
import type { Database } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import type { AnswersByQuestion, LiveSessionState, LiveSessionStudentLink, PresenceValue, LiveAnswerValue } from '../../types/liveSessionRtdb';
import {
  liveSessionAnswerPath,
  liveSessionPresencePath,
  liveSessionRootPath,
  liveSessionStatePath,
  liveSessionStudentLinkPath,
} from './liveSessionRtdbPaths';

function requireRtdb(): Database {
  if (!rtdb) {
    throw new Error('Realtime Database is not configured. Set VITE_FIREBASE_DATABASE_URL in .env.');
  }
  return rtdb;
}

/** Subscribe to `live_sessions/{sessionId}/state`. Returns an unsubscribe function. */
export function subscribeSessionState(
  sessionId: string,
  onData: (state: LiveSessionState | null) => void
): Unsubscribe {
  const db = requireRtdb();
  const r = ref(db, liveSessionStatePath(sessionId));
  return onValue(r, (snap) => {
    const v = snap.val() as LiveSessionState | null;
    onData(v);
  });
}

/**
 * Shallow merge into `state`. First write must include `teacherId: auth.currentUser.uid`
 * to satisfy security rules.
 */
export async function updateSessionState(
  sessionId: string,
  partial: Partial<LiveSessionState>
): Promise<void> {
  const db = requireRtdb();
  await update(ref(db, liveSessionStatePath(sessionId)), partial);
}

/** Replace the entire `state` object (e.g. first create). */
export async function setSessionStateInitial(sessionId: string, state: LiveSessionState): Promise<void> {
  const db = requireRtdb();
  await set(ref(db, liveSessionStatePath(sessionId)), state);
}

/**
 * Full snapshot of `answers` (sufficient for in-memory leaderboard at class scale).
 * For a pure delta stream, use `subscribeAnswersDeltas` instead.
 */
export function subscribeAnswersMap(
  sessionId: string,
  onData: (answers: AnswersByQuestion | null) => void
): Unsubscribe {
  const db = requireRtdb();
  const r = ref(db, `${liveSessionRootPath(sessionId)}/answers`);
  return onValue(r, (snap) => onData(snap.val() as AnswersByQuestion | null));
}

/**
 * Fires on child events under `answers/{questionId}/{studentId}` (teacher-side listeners per architecture).
 */
export function subscribeAnswersDeltas(
  sessionId: string,
  cb: (ev: {
    event: 'add' | 'change' | 'remove';
    questionId: string;
    studentId: string;
    value: LiveAnswerValue | null;
  }) => void
): Unsubscribe {
  const db = requireRtdb();
  const answersRef = ref(db, `${liveSessionRootPath(sessionId)}/answers`);
  const perQCleanups: Array<() => void> = [];
  const seenQ = new Set<string>();

  const watchQuestion = (qid: string) => {
    if (seenQ.has(qid)) return;
    seenQ.add(qid);
    const qref = child(answersRef, qid);
    const u1 = onChildAdded(qref, (s) => {
      const sid = s.key;
      if (!sid) return;
      cb({ event: 'add', questionId: qid, studentId: sid, value: s.val() as LiveAnswerValue });
    });
    const u2 = onChildChanged(qref, (s) => {
      const sid = s.key;
      if (!sid) return;
      cb({ event: 'change', questionId: qid, studentId: sid, value: s.val() as LiveAnswerValue });
    });
    const u3 = onChildRemoved(qref, (s) => {
      const sid = s.key;
      if (!sid) return;
      cb({ event: 'remove', questionId: qid, studentId: sid, value: null });
    });
    perQCleanups.push(() => {
      u1();
      u2();
      u3();
    });
  };

  void get(answersRef).then((snap) => {
    const v = snap.val() as Record<string, unknown> | null;
    if (v && typeof v === 'object') {
      for (const qid of Object.keys(v)) watchQuestion(qid);
    }
  });
  const uRoot = onChildAdded(answersRef, (qSnap) => {
    const qid = qSnap.key;
    if (qid) watchQuestion(qid);
  });
  return () => {
    uRoot();
    for (const c of perQCleanups) c();
  };
}

/**
 * Set student presence to online and register `onDisconnect` to mark offline.
 * Call when a student (or the owning uid) opens the live session connection.
 */
export async function setStudentPresenceWithDisconnect(
  sessionId: string,
  studentId: string,
  options?: { displayName?: string }
): Promise<void> {
  const db = requireRtdb();
  const p = ref(db, liveSessionPresencePath(sessionId, studentId));
  const val: PresenceValue = {
    online: true,
    lastSeen: Date.now(),
    ...(options?.displayName?.trim() ? { displayName: options.displayName.trim() } : {}),
  };
  await set(p, val);
  const offState: PresenceValue = { online: false, lastSeen: Date.now() };
  await onDisconnect(p).set(offState);
}

/**
 * One-shot presence (no onDisconnect), e.g. tests or non–student clients.
 */
export async function setStudentOnline(
  sessionId: string,
  studentId: string,
  online: boolean
): Promise<void> {
  const db = requireRtdb();
  const p = ref(db, liveSessionPresencePath(sessionId, studentId));
  const val: PresenceValue = { online, lastSeen: Date.now() };
  await set(p, val);
}

export function subscribePresenceMap(
  sessionId: string,
  onData: (presenceByStudentId: Record<string, PresenceValue> | null) => void
): Unsubscribe {
  const db = requireRtdb();
  const p = ref(db, `${liveSessionRootPath(sessionId)}/presence`);
  return onValue(p, (snap) => {
    onData(snap.val() as Record<string, PresenceValue> | null);
  });
}

export async function setAnswer(
  sessionId: string,
  questionId: string,
  studentId: string,
  value: LiveAnswerValue
): Promise<void> {
  const db = requireRtdb();
  await set(ref(db, liveSessionAnswerPath(sessionId, questionId, studentId)), value);
}

/**
 * Binds the anonymous `auth.uid` to the real Firestore student id for post-session Server persistence.
 * Must run after `signInAnonymously` so the writer matches RTDB `student_links` rules.
 */
export async function setLiveSessionStudentLink(
  sessionId: string,
  anonAuthUid: string,
  link: LiveSessionStudentLink
): Promise<void> {
  const db = requireRtdb();
  await set(ref(db, liveSessionStudentLinkPath(sessionId, anonAuthUid)), link);
}

/**
 * Unsubscribe a listener previously attached with `onValue` on the same ref (optional helper).
 * Prefer the unsubscribe returned from `subscribeSessionState` / `subscribePresenceMap`.
 */
export function stopListeningByPath(path: string): void {
  const db = requireRtdb();
  off(ref(db, path));
}
