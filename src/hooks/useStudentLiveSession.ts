import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously, type User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import type { LiveSessionState } from '../types/liveSessionRtdb';
import {
  setAnswer,
  setLiveSessionStudentLink,
  setStudentPresenceWithDisconnect,
  subscribeSessionState,
} from '../services/liveClassroom/liveSessionRtdbService';

export type UseStudentLiveSessionResult = {
  state: LiveSessionState | null;
  authUser: User | null;
  authReady: boolean;
  error: string | null;
  submitOptionIndex: (optionIndex: number) => Promise<void>;
};

/**
 * Student "Follow Me" mode: anonymous auth (RTDB keys must match `auth.uid`), presence, and one answer per active question.
 * @param firestoreStudentId Real `students` doc id from the portal (links anon uid for Cloud Function export).
 */
export function useStudentLiveSession(
  liveSessionId: string | null,
  displayName: string | null,
  firestoreStudentId: string | null
): UseStudentLiveSessionResult {
  const [state, setState] = useState<LiveSessionState | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(auth.currentUser);
  const [authReady, setAuthReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setAuthUser);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!liveSessionId) return;
    let cancelled = false;
    void (async () => {
      try {
        if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.error('useStudentLiveSession: signInAnonymously', e);
        if (!cancelled) setError('Could not connect. Check Firebase Anonymous auth is enabled.');
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [liveSessionId]);

  useEffect(() => {
    if (!liveSessionId) {
      setState(null);
      return;
    }
    const unsub = subscribeSessionState(liveSessionId, setState);
    return () => unsub();
  }, [liveSessionId]);

  useEffect(() => {
    if (!liveSessionId || !authUser?.uid) return;
    let cancelled = false;
    void (async () => {
      try {
        await setStudentPresenceWithDisconnect(liveSessionId, authUser.uid, {
          displayName: displayName?.trim() || undefined,
        });
      } catch (e) {
        console.error('useStudentLiveSession: presence', e);
        if (!cancelled) setError('Could not register presence. Is Realtime Database configured?');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [liveSessionId, authUser?.uid, displayName]);

  useEffect(() => {
    if (!liveSessionId || !authUser?.uid || !firestoreStudentId?.trim()) return;
    let cancelled = false;
    void (async () => {
      try {
        await setLiveSessionStudentLink(liveSessionId, authUser.uid, {
          firestoreStudentId: firestoreStudentId.trim(),
        });
      } catch (e) {
        console.error('useStudentLiveSession: student link', e);
        if (!cancelled) setError('Could not link your profile to this session.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [liveSessionId, authUser?.uid, firestoreStudentId]);

  const submitOptionIndex = async (optionIndex: number) => {
    setError(null);
    if (!liveSessionId || !authUser?.uid) {
      setError('Not connected.');
      return;
    }
    const qid = state?.activeQuestionId;
    if (!qid) {
      setError('No active question yet.');
      return;
    }
    if (state.status === 'concluded') {
      setError('This session has ended.');
      return;
    }
    try {
      await setAnswer(liveSessionId, qid, authUser.uid, optionIndex);
    } catch (e) {
      console.error('useStudentLiveSession: setAnswer', e);
      setError('Could not submit answer.');
    }
  };

  return { state, authUser, authReady, error, submitOptionIndex };
}
