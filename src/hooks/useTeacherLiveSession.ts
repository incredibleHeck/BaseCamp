import { useEffect, useMemo, useState } from 'react';
import { rtdb } from '../lib/firebase';
import type { AnswersByQuestion } from '../types/liveSessionRtdb';
import type { LiveSessionState } from '../types/liveSessionRtdb';
import {
  subscribeAnswersMap,
  subscribePresenceMap,
  subscribeSessionState,
} from '../services/liveClassroom/liveSessionRtdbService';
import { applyPresenceLabels, buildLeaderboardFromAnswers, type LeaderboardRow } from '../utils/liveSessionLeaderboard';
import type { PresenceValue } from '../types/liveSessionRtdb';

export type UseTeacherLiveSessionResult = {
  state: LiveSessionState | null;
  presence: Record<string, PresenceValue> | null;
  answers: AnswersByQuestion | null;
  leaderboard: LeaderboardRow[];
  rtdbReady: boolean;
};

/**
 * Subscribes to RTDB for a live session (teacher dashboard). No-ops when `sessionId` is null or RTDB missing.
 */
export function useTeacherLiveSession(sessionId: string | null): UseTeacherLiveSessionResult {
  const [state, setState] = useState<LiveSessionState | null>(null);
  const [presence, setPresence] = useState<Record<string, PresenceValue> | null>(null);
  const [answers, setAnswers] = useState<AnswersByQuestion | null>(null);
  const [rtdbReady, setRtdbReady] = useState(true);

  useEffect(() => {
    if (!sessionId || !rtdb) {
      setState(null);
      setPresence(null);
      setAnswers(null);
      if (!rtdb) setRtdbReady(false);
      else setRtdbReady(true);
      return;
    }
    let cancelled = false;
    const unsubs: Array<() => void> = [];
    try {
      setRtdbReady(true);
      unsubs.push(subscribeSessionState(sessionId, (s) => !cancelled && setState(s)));
      unsubs.push(subscribePresenceMap(sessionId, (p) => !cancelled && setPresence(p)));
      unsubs.push(subscribeAnswersMap(sessionId, (a) => !cancelled && setAnswers(a)));
    } catch (e) {
      console.error('useTeacherLiveSession: RTDB not available', e);
      setRtdbReady(false);
    }
    return () => {
      cancelled = true;
      for (const u of unsubs) u();
    };
  }, [sessionId]);

  const leaderboard = useMemo(() => {
    const rows = buildLeaderboardFromAnswers(answers, state);
    return applyPresenceLabels(rows, presence);
  }, [answers, state, presence]);

  return { state, presence, answers, leaderboard, rtdbReady };
}
