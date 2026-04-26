import React, { useEffect, useRef } from 'react';
import { Loader2, Radio } from 'lucide-react';
import { rtdb } from '../../lib/firebase';
import { useStudentLiveSession } from '../../hooks/useStudentLiveSession';

type Props = {
  sessionId: string;
  displayName: string;
  /** Firestore `students` document id (portal) — links anonymous auth for session export. */
  firestoreStudentId: string;
  onLeave: () => void;
};

/**
 * RTDB Follow Me session for the student portal. Uses anonymous Firebase Auth; RTDB keys are `auth.uid` (not Firestore student id).
 */
export function StudentFollowMeSession({ sessionId, displayName, firestoreStudentId, onLeave }: Props) {
  const { state, authReady, error, submitOptionIndex } = useStudentLiveSession(
    sessionId,
    displayName,
    firestoreStudentId
  );

  const sawNonNullState = useRef(false);
  const autoLeftRef = useRef(false);

  useEffect(() => {
    sawNonNullState.current = false;
    autoLeftRef.current = false;
  }, [sessionId]);

  useEffect(() => {
    if (state != null) sawNonNullState.current = true;
  }, [state]);

  useEffect(() => {
    if (!authReady || state !== null || !sawNonNullState.current || autoLeftRef.current) return;
    autoLeftRef.current = true;
    onLeave();
  }, [authReady, state, onLeave]);

  if (!rtdb) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-950 text-sm">
        Live sessions need Realtime Database. Ask your school to enable it in the BaseCamp environment.
        <button type="button" onClick={onLeave} className="mt-3 block w-full py-2 rounded-xl bg-white border border-amber-300 font-medium">
          Back
        </button>
      </div>
    );
  }

  if (!authReady) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-zinc-600">
        <Loader2 className="w-5 h-5 animate-spin" />
        Connecting…
      </div>
    );
  }

  if (state?.status === 'concluded') {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center space-y-4">
        <h2 className="text-lg font-bold text-zinc-900">Session ended</h2>
        <p className="text-sm text-zinc-600">Your teacher has ended this live round.</p>
        <button type="button" onClick={onLeave} className="w-full min-h-12 rounded-xl bg-zinc-900 text-white font-semibold">
          Back
        </button>
      </div>
    );
  }

  const q = state?.questions?.find((x) => x.id === state.activeQuestionId);

  return (
    <div className="bg-white rounded-2xl shadow border border-violet-100 p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-2 text-violet-700">
        <Radio className="w-5 h-5" />
        <span className="text-xs font-semibold uppercase tracking-wide">Live with your class</span>
      </div>
      {state?.roundTitle ? <h2 className="text-lg font-bold text-zinc-900">{state.roundTitle}</h2> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {q ? (
        <>
          <p className="text-base sm:text-lg font-medium text-zinc-900 leading-snug">{q.prompt}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {q.options.map((label, i) => (
              <button
                key={i}
                type="button"
                onClick={() => void submitOptionIndex(i)}
                className="min-h-14 rounded-xl border-2 border-zinc-200 px-4 py-3 text-left text-sm font-medium hover:border-violet-400 hover:bg-violet-50/50"
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-500">You can change your mind until your teacher moves on — the last write wins.</p>
        </>
      ) : (
        <p className="text-sm text-zinc-600">Waiting for the teacher to start a question…</p>
      )}
      <button type="button" onClick={onLeave} className="w-full text-sm text-zinc-500 underline">
        Leave live session
      </button>
    </div>
  );
}
