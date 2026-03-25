import { useCallback, useEffect, useRef, useState } from 'react';
import { transcribeAndAnalyzeVoiceObservation } from '../services/ai/aiPrompts';
import {
  getVoiceObservationQueue,
  patchVoiceObservationQueueItem,
  prepareVoiceObservationForAI,
  removeVoiceObservationFromQueue,
  resetStaleVoiceObservationSyncing,
} from '../services/voiceObservationQueueService';
import { saveVoiceObservation } from '../services/observationService';

/**
 * Processes queued voice observations when online.
 * Reads base64 from IndexedDB, prepares payloads for the AI layer (existing Gemini call), updates status.
 */
export function useVoiceObservationSync(isOnline: boolean) {
  const [voiceQueueLength, setVoiceQueueLength] = useState(0);
  const busy = useRef(false);

  const refreshVoiceQueue = useCallback(async () => {
    const q = await getVoiceObservationQueue();
    setVoiceQueueLength(q.length);
  }, []);

  const processVoiceQueue = useCallback(async () => {
    if (!isOnline || busy.current) return;
    busy.current = true;
    try {
      await resetStaleVoiceObservationSyncing();
      const queue = await getVoiceObservationQueue();
      const work = queue
        .filter((x) => x.status === 'pending' || x.status === 'failed')
        .sort((a, b) => a.timestamp - b.timestamp);

      for (const item of work) {
        try {
          await patchVoiceObservationQueueItem(item.id, { status: 'syncing' });

          const payload = prepareVoiceObservationForAI({ ...item, status: 'syncing' });

          const analysis = await transcribeAndAnalyzeVoiceObservation(
            payload.audioBase64,
            payload.mimeType
          );

          if (!analysis) {
            await patchVoiceObservationQueueItem(item.id, { status: 'failed' });
            continue;
          }

          const saved = await saveVoiceObservation(item.studentId, analysis, item.durationMs);
          if (saved) {
            await removeVoiceObservationFromQueue(item.id);
          } else {
            await patchVoiceObservationQueueItem(item.id, { status: 'failed' });
          }
        } catch (e) {
          console.error('Voice observation item failed', e);
          try {
            await patchVoiceObservationQueueItem(item.id, { status: 'failed' });
          } catch (patchErr) {
            console.error('Could not mark voice item failed', patchErr);
          }
        }
      }
    } finally {
      busy.current = false;
      await refreshVoiceQueue();
    }
  }, [isOnline, refreshVoiceQueue]);

  useEffect(() => {
    refreshVoiceQueue();
  }, [refreshVoiceQueue]);

  useEffect(() => {
    if (!isOnline) return;
    processVoiceQueue();
  }, [isOnline, processVoiceQueue]);

  return { voiceQueueLength, refreshVoiceQueue, processVoiceQueue };
}

