import { useCallback, useEffect, useRef, useState } from 'react';
import { transcribeAndAnalyzeVoiceObservation } from '../services/aiPrompts';
import {
  getVoiceObservationQueue,
  removeVoiceObservationFromQueue,
} from '../services/voiceObservationQueueService';
import { saveVoiceObservation } from '../services/observationService';

/**
 * Processes queued voice observation blobs when online (Phase 2).
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
      const queue = await getVoiceObservationQueue();
      for (const item of queue) {
        try {
          const analysis = await transcribeAndAnalyzeVoiceObservation(
            item.audioBase64,
            item.mimeType
          );
          if (!analysis) continue;
          const saved = await saveVoiceObservation(item.studentId, analysis, item.durationMs);
          if (saved) {
            await removeVoiceObservationFromQueue(item.id);
          }
        } catch (e) {
          console.error('Voice observation item failed', e);
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
