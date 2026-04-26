import { getFirestore } from 'firebase-admin/firestore';
import { onValueWritten } from 'firebase-functions/v2/database';
import * as logger from 'firebase-functions/logger';
import { persistConcludedLiveSession } from './lib/persistLiveSessionToFirestore.js';

type RegionOption = string;

/**
 * When `state/status` becomes `concluded`, persist answers to Firestore and remove the RTDB session.
 */
export function createOnLiveSessionConcluded(region: RegionOption) {
  return onValueWritten(
    {
      ref: 'live_sessions/{sessionId}/state/status',
      region,
      memory: '512MiB',
      timeoutSeconds: 540,
    },
    async (event) => {
      const sessionId = event.params.sessionId;
      if (typeof sessionId !== 'string' || !sessionId.trim()) {
        logger.warn('onLiveSessionConcluded: missing sessionId', { params: event.params });
        return;
      }

      const after = event.data.after;
      if (!after.exists()) {
        return;
      }
      if (after.val() !== 'concluded') {
        return;
      }

      const before = event.data.before;
      if (before.exists() && before.val() === 'concluded') {
        return;
      }

      const sid = sessionId.trim();
      try {
        const firestore = getFirestore();
        const result = await persistConcludedLiveSession(firestore, sid);
        logger.info('onLiveSessionConcluded', { sessionId: sid, ...result });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger.error('onLiveSessionConcluded: unhandled error', { sessionId: sid, error: msg });
        throw err;
      }
    }
  );
}
