import React, { useState } from 'react';
import { auth, rtdb } from '../../lib/firebase';
import { usePremiumTier } from '../../context/PremiumTierContext';
import { useLiveClassroomSession } from '../../context/LiveClassroomSessionContext';
import { useTeacherLiveSession } from '../../hooks/useTeacherLiveSession';
import { setSessionStateInitial, updateSessionState } from '../../services/liveClassroom/liveSessionRtdbService';
import type { LiveSessionQuestion, LiveSessionState } from '../../types/liveSessionRtdb';
import { buildStudentFollowMePortalUrl } from '../../utils/studentPortalLiveLink';

const DEMO_ROUNDS: { title: string; questions: LiveSessionQuestion[] } = {
  title: 'Number sense (demo)',
  questions: [
    {
      id: 'q1',
      prompt: 'What is 7 + 5?',
      options: ['10', '11', '12', '13'],
      correctIndex: 2,
    },
    {
      id: 'q2',
      prompt: 'Which is greater?',
      options: ['1/2', '3/4', '1/3', '2/5'],
      correctIndex: 1,
    },
  ],
};

export function TeacherLiveClassroomPanel() {
  const { isPremiumTier } = usePremiumTier();
  const { beginLiveSession, endLiveSession, activeSessionId } = useLiveClassroomSession();
  const { state, presence, leaderboard, rtdbReady } = useTeacherLiveSession(activeSessionId);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copyOk, setCopyOk] = useState(false);

  const canUse = isPremiumTier && rtdb && rtdbReady;

  const startSession = async () => {
    setErr(null);
    const u = auth.currentUser;
    if (!u?.uid) {
      setErr('You must be signed in.');
      return;
    }
    if (!rtdb) {
      setErr('Set VITE_FIREBASE_DATABASE_URL to enable live sessions.');
      return;
    }
    setBusy(true);
    try {
      const id = beginLiveSession();
      const first = DEMO_ROUNDS.questions[0];
      const st: LiveSessionState = {
        status: 'active',
        teacherId: u.uid,
        roundTitle: DEMO_ROUNDS.title,
        questions: DEMO_ROUNDS.questions,
        activeQuestionId: first.id,
        startedAtMs: Date.now(),
      };
      await setSessionStateInitial(id, st);
    } catch (e) {
      console.error(e);
      setErr('Could not start session. Check Realtime Database rules and URL.');
    } finally {
      setBusy(false);
    }
  };

  const setQuestion = async (qid: string) => {
    if (!activeSessionId) return;
    setErr(null);
    setBusy(true);
    try {
      await updateSessionState(activeSessionId, { activeQuestionId: qid });
    } catch (e) {
      console.error(e);
      setErr('Could not change question.');
    } finally {
      setBusy(false);
    }
  };

  const conclude = async () => {
    if (!activeSessionId) return;
    setBusy(true);
    try {
      await updateSessionState(activeSessionId, { status: 'concluded', endedAtMs: Date.now() });
      endLiveSession();
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  const joinUrl = activeSessionId ? buildStudentFollowMePortalUrl(activeSessionId) : '';

  const copyLink = async () => {
    if (!joinUrl) return;
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopyOk(true);
      setTimeout(() => setCopyOk(false), 2000);
    } catch {
      setErr('Could not copy to clipboard.');
    }
  };

  if (!isPremiumTier) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-6 text-amber-950">
        <h3 className="text-lg font-semibold">Live classroom</h3>
        <p className="mt-2 text-sm">This feature is available for Cambridge premium schools. Your tenant or token is not in premium mode.</p>
      </div>
    );
  }

  if (!rtdb) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-zinc-800">
        <h3 className="text-lg font-semibold">Realtime Database not configured</h3>
        <p className="mt-2 text-sm text-zinc-600">Add <code className="rounded bg-zinc-100 px-1">VITE_FIREBASE_DATABASE_URL</code> to your environment (Firebase Console → Realtime Database), then restart the app.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h3 className="text-lg font-semibold text-zinc-900">Follow Me (live)</h3>
        <p className="text-sm text-zinc-600 mt-1">Students open the link on the student portal; answers and presence use Realtime Database.</p>
      </div>

      {err ? <p className="text-sm text-red-600">{err}</p> : null}

      <div className="flex flex-wrap gap-2">
        {!activeSessionId ? (
          <button
            type="button"
            disabled={busy || !canUse}
            onClick={() => void startSession()}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {busy ? 'Starting…' : 'Start demo live session'}
          </button>
        ) : (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => void conclude()}
              className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
            >
              End session
            </button>
            <div className="flex flex-1 min-w-0 items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50/80 px-3 py-2 text-xs font-mono text-zinc-700 truncate max-w-md">
              {joinUrl}
            </div>
            <button type="button" onClick={() => void copyLink()} className="rounded-xl bg-zinc-900 px-3 py-2.5 text-sm text-white">
              {copyOk ? 'Copied' : 'Copy link'}
            </button>
          </>
        )}
      </div>

      {state?.questions && state.questions.length > 0 && activeSessionId ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-zinc-500 mb-2">Current round</p>
          <p className="text-sm text-zinc-800">{state.roundTitle ?? 'Untitled'}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {state.questions.map((q) => (
              <button
                key={q.id}
                type="button"
                disabled={busy}
                onClick={() => void setQuestion(q.id)}
                className={`rounded-lg px-3 py-1.5 text-sm ${
                  state.activeQuestionId === q.id
                    ? 'bg-violet-100 text-violet-900 font-medium ring-1 ring-violet-300'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                {q.prompt.slice(0, 32)}
                {q.prompt.length > 32 ? '…' : ''}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {activeSessionId ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <h4 className="text-sm font-semibold text-zinc-900">Presence</h4>
            <ul className="mt-2 space-y-1 text-sm text-zinc-700 max-h-48 overflow-y-auto">
              {presence && Object.keys(presence).length > 0 ? (
                Object.entries(presence).map(([uid, p]) => (
                  <li key={uid} className="flex justify-between gap-2">
                    <span className="truncate">{p.displayName || uid.slice(0, 8)}</span>
                    <span className={p.online ? 'text-emerald-600' : 'text-zinc-400'}>{p.online ? 'Online' : 'Offline'}</span>
                  </li>
                ))
              ) : (
                <li className="text-zinc-500">Waiting for students…</li>
              )}
            </ul>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <h4 className="text-sm font-semibold text-zinc-900">Leaderboard</h4>
            <ol className="mt-2 list-decimal list-inside space-y-1 text-sm text-zinc-800 max-h-48 overflow-y-auto">
              {leaderboard.length > 0 ? (
                leaderboard.map((r, i) => (
                  <li key={r.studentId}>
                    {i + 1}. {r.displayName || r.studentId.slice(0, 8)} — {r.points} pt
                  </li>
                ))
              ) : (
                <li className="list-none text-zinc-500">No answers yet.</li>
              )}
            </ol>
          </div>
        </div>
      ) : null}
    </div>
  );
}
