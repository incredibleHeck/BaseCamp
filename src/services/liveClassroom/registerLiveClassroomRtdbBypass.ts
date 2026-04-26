import { push, ref, set } from 'firebase/database';
import { auth, rtdb } from '../../lib/firebase';
import { setLiveClassroomQueueBypassHandler, type LiveClassroomQueueBypassPayload } from '../core/liveClassroomQueueBypass';

/**
 * Wires the Sprint 2.1 offline-queue bypass to Realtime Database.
 * `QueuedAssessment` is worksheet-shaped; full live-quiz event mapping is Sprint 2.3.
 * When a bypass fires, we optionally append a minimal row under `live_bypass_ledger/{uid}`.
 */
export function registerLiveClassroomRtdbBypass(): void {
  setLiveClassroomQueueBypassHandler((payload: LiveClassroomQueueBypassPayload) => {
    if (import.meta.env.DEV) {
      console.debug('[registerLiveClassroomRtdbBypass]', {
        inputMode: payload.inputMode,
        assessmentType: payload.assessmentType,
        studentId: payload.studentId,
      });
    }

    if (!rtdb) {
      if (import.meta.env.DEV) {
        console.debug(
          '[registerLiveClassroomRtdbBypass] rtdb is null; set VITE_FIREBASE_DATABASE_URL to append ledger rows.'
        );
      }
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      if (import.meta.env.DEV) {
        console.warn('[registerLiveClassroomRtdbBypass] no signed-in user; skipping ledger write.');
      }
      return;
    }

    const entry = push(ref(rtdb, `live_bypass_ledger/${user.uid}`));
    void set(entry, {
      ts: Date.now(),
      inputMode: payload.inputMode,
      assessmentType: payload.assessmentType,
      studentId: payload.studentId ?? null,
    });
  });
}
