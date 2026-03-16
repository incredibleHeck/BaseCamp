import { useCallback, useEffect, useState } from 'react';
import { analyzeWorksheet } from '../services/aiPrompts';
import { getQueue, removeFromQueue, QueuedAssessment } from '../services/offlineQueueService';
import { saveAssessment, Assessment } from '../services/assessmentService';

export interface SyncManagerState {
  isOnline: boolean;
  isSyncing: boolean;
  queueLength: number;
  processQueue: () => Promise<void>;
}

export function useSyncManager(): SyncManagerState {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [queueLength, setQueueLength] = useState(0);

  // Initialize queue length on mount
  useEffect(() => {
    let cancelled = false;

    const initQueueLength = async () => {
      try {
        const queue = await getQueue();
        if (!cancelled) {
          setQueueLength(queue.length);
        }
      } catch (error) {
        console.error('useSyncManager: failed to load initial queue length', error);
      }
    };

    initQueueLength();

    return () => {
      cancelled = true;
    };
  }, []);

  // Track online/offline status
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let cancelled = false;

    const handleOnline = () => {
      if (!cancelled) {
        setIsOnline(true);
      }
    };

    const handleOffline = () => {
      if (!cancelled) {
        setIsOnline(false);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      cancelled = true;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const processQueue = useCallback(async () => {
    if (!isOnline || isSyncing) {
      return;
    }

    setIsSyncing(true);

    try {
      const queue = await getQueue();

      if (!queue.length) {
        setQueueLength(0);
        return;
      }

      for (const item of queue) {
        try {
          const report = await analyzeWorksheet(
            item.imageBase64,
            item.subject,
            item.dialectContext
          );

          if (!report) {
            // Keep item in queue to retry later
            continue;
          }

          const type: Assessment['type'] =
            item.subject.toLowerCase() === 'literacy' ? 'Literacy' : 'Numeracy';

          const assessment: Assessment = {
            studentId: item.studentId,
            type,
            diagnosis: report.diagnosis,
            masteredConcepts: report.masteredConcepts,
            gapTags: report.gapTags,
            masteryTags: report.masteryTags,
            remedialPlan: report.remedialPlan,
            lessonPlan: report.lessonPlan,
            timestamp: Date.now(),
            status: 'Completed',
          };

          const savedId = await saveAssessment(assessment);

          if (savedId) {
            await removeFromQueue(item.id);
          }
        } catch (error) {
          console.error('useSyncManager: failed to process queued item', {
            error,
            itemId: item.id,
          });
          // Continue with next item
        }
      }
    } catch (error) {
      console.error('useSyncManager: processQueue failed', error);
    } finally {
      setIsSyncing(false);

      try {
        const remaining = await getQueue();
        setQueueLength(remaining.length);
      } catch (error) {
        console.error('useSyncManager: failed to refresh queue length', error);
      }
    }
  }, [isOnline, isSyncing]);

  // Auto-process queue when we are online (on load and when coming back online)
  useEffect(() => {
    if (!isOnline) return;

    let cancelled = false;

    const run = async () => {
      if (cancelled) return;
      await processQueue();
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [isOnline, processQueue]);

  return {
    isOnline,
    isSyncing,
    queueLength,
    processQueue,
  };
}

