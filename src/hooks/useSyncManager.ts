import { useCallback, useEffect, useRef, useState } from 'react';
import { analyzeManualEntry, analyzeWorksheet, analyzeWorksheetMultiple } from '../services/aiPrompts';
import { getQueue, removeFromQueue, QueuedAssessment } from '../services/offlineQueueService';
import { saveAssessment, Assessment } from '../services/assessmentService';
import {
  getDefaultAcademicYear,
  getDefaultTerm,
  DEFAULT_CLASS_LABEL,
} from '../config/academicContext';
import { playbookKeyFromLessonTitle } from '../utils/playbookKey';
import { evaluateAndPersistSenAlerts } from '../services/senAlertService';

export interface SyncManagerState {
  isOnline: boolean;
  isSyncing: boolean;
  queueLength: number;
  queuedItems: QueuedAssessment[];
  refreshQueue: () => Promise<void>;
  processQueue: () => Promise<void>;
}

export function useSyncManager(): SyncManagerState {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [queueLength, setQueueLength] = useState(0);
  const [queuedItems, setQueuedItems] = useState<QueuedAssessment[]>([]);
  const isSyncingRef = useRef(false);

  const refreshQueue = useCallback(async () => {
    try {
      const queue = await getQueue();
      setQueuedItems(queue);
      setQueueLength(queue.length);
    } catch (error) {
      console.error('useSyncManager: failed to refresh queue', error);
    }
  }, []);

  // Initialize queue length on mount
  useEffect(() => {
    let cancelled = false;

    const initQueueLength = async () => {
      try {
        const queue = await getQueue();
        if (!cancelled) {
          setQueuedItems(queue);
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
    if (!isOnline || isSyncingRef.current) {
      return;
    }

    try {
      const queue = await getQueue();

      if (!queue.length) {
        setQueuedItems([]);
        setQueueLength(0);
        return;
      }

      isSyncingRef.current = true;
      setIsSyncing(true);

      for (const item of queue) {
        try {
          let report: Awaited<ReturnType<typeof analyzeWorksheet>> | null = null;

          if (item.inputMode === 'manual') {
            report = await analyzeManualEntry(
              item.assessmentType,
              item.dialectContext ?? '',
              item.manualRubric ?? [],
              item.observations?.trim() ?? ''
            );
          } else {
            const imageBase64s = item.imageBase64s ?? [];
            if (imageBase64s.length > 1) {
              report = await analyzeWorksheetMultiple(
                imageBase64s,
                item.assessmentType,
                item.dialectContext ?? ''
              );
            } else if (imageBase64s.length === 1) {
              report = await analyzeWorksheet(
                imageBase64s[0],
                item.assessmentType,
                item.dialectContext ?? ''
              );
            } else {
              // Malformed queue item; drop it so we don't spin forever
              await removeFromQueue(item.id);
              continue;
            }
          }

          if (!report) {
            // Keep item in queue to retry later
            continue;
          }

          const type: Assessment['type'] =
            item.assessmentType.toLowerCase() === 'literacy' ? 'Literacy' : 'Numeracy';

          const lessonTitle = report.lessonPlan?.title?.trim();
          const assessment: Assessment = {
            studentId: item.studentId,
            type,
            diagnosis: report.diagnosis,
            masteredConcepts: report.masteredConcepts,
            gapTags: report.gapTags,
            masteryTags: report.masteryTags,
            remedialPlan: report.remedialPlan,
            lessonPlan: report.lessonPlan,
            playbookKey: lessonTitle ? playbookKeyFromLessonTitle(lessonTitle) : undefined,
            playbookTitle: lessonTitle || undefined,
            score: typeof report.score === 'number' ? report.score : undefined,
            term: getDefaultTerm(),
            academicYear: getDefaultAcademicYear(),
            classLabel: DEFAULT_CLASS_LABEL,
            gesObjectiveId: report.gesAlignment?.objectiveId,
            gesObjectiveTitle: report.gesAlignment?.objectiveTitle,
            gesCurriculumExcerpt: report.gesAlignment?.excerpt,
            gesVerified: report.gesAlignment?.verified,
            timestamp: Date.now(),
            status: 'Completed',
          };

          const savedId = await saveAssessment(assessment);

          if (savedId) {
            await removeFromQueue(item.id);
            void evaluateAndPersistSenAlerts(item.studentId);
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
      isSyncingRef.current = false;
      setIsSyncing(false);
      await refreshQueue();
    }
  }, [isOnline, refreshQueue]);

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
    queuedItems,
    refreshQueue,
    processQueue,
  };
}

