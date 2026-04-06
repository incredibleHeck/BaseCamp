import { useCallback, useEffect, useRef, useState } from 'react';
import { mimeFromDataUrl, type DiagnosticReport } from '../services/ai/aiPrompts';
import {
  getQueue,
  removeFromQueue,
  updateInQueue,
  type QueuedAssessment,
} from '../services/core/offlineQueueService';
import { saveAssessment, type Assessment } from '../services/assessmentService';
import { getStudent, getStudents, type Student } from '../services/studentService';
import {
  getDefaultAcademicYear,
  getDefaultTerm,
  DEFAULT_CLASS_LABEL,
} from '../config/academicContext';
import { playbookKeyFromLessonTitle } from '../utils/playbookKey';
import { curriculumFieldsFromDiagnosticReport } from '../utils/assessmentPersistUtils';
import { evaluateAndPersistSenAlerts } from '../services/senAlertService';
import { executeFullAssessmentPipeline } from '../services/assessmentPipelineService';

/** Failed sync attempts before the item is dropped (saves API/data on stuck queue rows). */
const MAX_OFFLINE_QUEUE_RETRIES = 3;

async function bumpQueueItemFailure(item: QueuedAssessment): Promise<void> {
  const next = (item.retryCount ?? 0) + 1;
  if (next >= MAX_OFFLINE_QUEUE_RETRIES) {
    await removeFromQueue(item.id);
    console.error('[useSyncManager] Offline queue item permanently removed after max retries', {
      itemId: item.id,
      inputMode: item.inputMode,
      retryCount: next,
    });
    return;
  }
  await updateInQueue(item.id, { retryCount: next });
}

function buildAssessmentFromReport(
  item: QueuedAssessment,
  report: DiagnosticReport,
  studentId: string,
  schoolId?: string
): Assessment {
  const type: Assessment['type'] =
    item.assessmentType.toLowerCase() === 'literacy' ? 'Literacy' : 'Numeracy';
  const lessonTitle = report.lessonPlan?.title?.trim();
  const curriculum = curriculumFieldsFromDiagnosticReport(report);
  return {
    studentId,
    schoolId,
    ...curriculum,
    type,
    diagnosis: report.diagnosis,
    masteredConcepts: report.masteredConcepts,
    gapTags: report.gapTags ?? [],
    masteryTags: report.masteryTags ?? [],
    remedialPlan: report.remedialPlan,
    lessonPlan: report.lessonPlan,
    extensionActivity: report.extensionActivity,
    playbookKey: lessonTitle ? playbookKeyFromLessonTitle(lessonTitle) : undefined,
    playbookTitle: lessonTitle || undefined,
    term: getDefaultTerm(),
    academicYear: getDefaultAcademicYear(),
    classLabel: item.classLabel?.trim() || DEFAULT_CLASS_LABEL,
    cohortId: item.cohortId?.trim() || undefined,
    gesObjectiveId: report.gesAlignment?.objectiveId,
    gesObjectiveTitle: report.gesAlignment?.objectiveTitle,
    gesCurriculumExcerpt: report.gesAlignment?.excerpt,
    gesVerified: report.gesAlignment?.verified,
    senWarningFlag: report.senWarningFlag ?? undefined,
    timestamp: Date.now(),
    status: 'Completed',
  };
}

export type BatchSyncProgress = {
  batchId: string;
  completed: number;
  total: number;
};

export interface SyncManagerState {
  isOnline: boolean;
  isSyncing: boolean;
  queueLength: number;
  queuedItems: QueuedAssessment[];
  /** Populated while a class batch is being processed (sequential Gemini calls). */
  batchSyncProgress: BatchSyncProgress | null;
  refreshQueue: () => Promise<void>;
  processQueue: () => Promise<void>;
}

/**
 * @param connectivityOnline When false (e.g. demo “Offline” toggle), the queue is not processed
 *   even if the browser reports `navigator.onLine`. Parent owns simulated vs real connectivity for now.
 */
export function useSyncManager(connectivityOnline: boolean): SyncManagerState {
  const [isSyncing, setIsSyncing] = useState(false);
  const [queueLength, setQueueLength] = useState(0);
  const [queuedItems, setQueuedItems] = useState<QueuedAssessment[]>([]);
  const [batchSyncProgress, setBatchSyncProgress] = useState<BatchSyncProgress | null>(null);
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

  const processQueue = useCallback(async () => {
    if (!connectivityOnline || isSyncingRef.current) {
      return;
    }

    const runSyncUnderLock = async (): Promise<void> => {
      try {
        const queue = await getQueue();

        if (!queue.length) {
          setQueuedItems([]);
          setQueueLength(0);
          return;
        }

        const batchTotals = new Map<string, number>();
        for (const it of queue) {
          if (it.inputMode === 'upload_batch' && it.batchId) {
            batchTotals.set(it.batchId, (batchTotals.get(it.batchId) ?? 0) + 1);
          }
        }
        const batchDone = new Map<string, number>();

        isSyncingRef.current = true;
        setIsSyncing(true);

        for (const item of queue) {
          try {
          if (item.inputMode === 'upload_batch') {
            const batchId = item.batchId ?? '';
            const img = item.imageBase64s?.[0];
            if (!img?.trim()) {
              await removeFromQueue(item.id);
              continue;
            }

            let students: Student[] = [];
            if (item.cohortId) {
              const { getStudentsByCohorts } = await import('../services/studentService');
              students = await getStudentsByCohorts([item.cohortId]);
            } else {
              students = await getStudents();
            }
            const roster = students
              .filter((s) => Boolean(s.id?.trim()))
              .map((s) => ({ studentId: s.id!, name: s.name }));

            if (!roster.length) {
              console.warn('useSyncManager: upload_batch skipped — empty roster', item.id);
              continue;
            }

            const total = batchId ? (batchTotals.get(batchId) ?? 1) : 1;
            const doneBefore = batchId ? (batchDone.get(batchId) ?? 0) : 0;
            setBatchSyncProgress({ batchId: batchId || item.id, completed: doneBefore, total });

            const batchRes = await executeFullAssessmentPipeline({
              variant: 'batch_detect',
              assessmentType: item.assessmentType,
              dialectContext: item.dialectContext ?? '',
              curriculumFramework: item.curriculumFramework ?? 'GES',
              gradeLevel: item.gradeLevel,
              imageBase64: img,
              classRoster: roster,
            });

            if (!batchRes.ok) {
              await bumpQueueItemFailure(item);
              continue;
            }

            const batchReport = batchRes.report;
            const resolvedId = batchReport.detectedStudentId?.trim() ?? null;
            if (!resolvedId) {
              console.warn(
                'useSyncManager: no confident roster match for batch worksheet; leaving in queue',
                item.id
              );
              await bumpQueueItemFailure(item);
              continue;
            }

            const batchStudent = await getStudent(resolvedId);
            const assessment = buildAssessmentFromReport(
              item,
              batchReport,
              resolvedId,
              batchStudent?.schoolId?.trim() || undefined
            );
            const savedId = await saveAssessment(assessment);

            if (savedId) {
              await removeFromQueue(item.id);
              evaluateAndPersistSenAlerts(resolvedId, {
                senWarningFlag: batchReport.senWarningFlag,
                latestAssessmentId: savedId,
              }).catch((err) => console.error('SEN Alert evaluation failed:', err));
              if (batchId) {
                const nextDone = (batchDone.get(batchId) ?? 0) + 1;
                batchDone.set(batchId, nextDone);
                setBatchSyncProgress({ batchId: batchId || item.id, completed: nextDone, total });
              }
            } else {
              await bumpQueueItemFailure(item);
            }
            continue;
          }

          let pipelineResult = await (async () => {
            if (item.inputMode === 'manual') {
              return executeFullAssessmentPipeline({
                variant: 'manual',
                studentId: item.studentId,
                assessmentType: item.assessmentType,
                dialectContext: item.dialectContext ?? '',
                curriculumFramework: item.curriculumFramework ?? 'GES',
                gradeLevel: item.gradeLevel,
                manualRubric: item.manualRubric ?? [],
                observations: item.observations?.trim() ?? '',
              });
            }

            if (item.inputMode === 'hybrid_voice') {
              const audioB64 = item.audioBase64?.trim() ?? '';
              if (!audioB64) {
                await removeFromQueue(item.id);
                return null;
              }
              const sid = item.studentId;
              if (!sid) {
                await removeFromQueue(item.id);
                return null;
              }
              const firstImage = item.imageBase64s?.[0];
              return executeFullAssessmentPipeline({
                variant: 'hybrid',
                studentId: sid,
                audioBase64: audioB64,
                audioMimeType: item.audioMimeType?.trim() || mimeFromDataUrl(audioB64) || 'audio/webm',
                worksheetImage:
                  firstImage && firstImage.trim()
                    ? { base64: firstImage, mimeType: mimeFromDataUrl(firstImage) ?? 'image/jpeg' }
                    : undefined,
                assessmentType: item.assessmentType,
                dialectContext: item.dialectContext ?? '',
                curriculumFramework: item.curriculumFramework ?? 'GES',
                gradeLevel: item.gradeLevel,
              });
            }

            const imageBase64s = item.imageBase64s ?? [];
            if (imageBase64s.length === 0) {
              await removeFromQueue(item.id);
              return null;
            }

            return executeFullAssessmentPipeline({
              variant: 'worksheet',
              studentId: item.studentId,
              assessmentType: item.assessmentType,
              dialectContext: item.dialectContext ?? '',
              curriculumFramework: item.curriculumFramework ?? 'GES',
              gradeLevel: item.gradeLevel,
              images: imageBase64s,
            });
          })();

          if (pipelineResult === null) {
            continue;
          }

          if (!pipelineResult.ok) {
            await bumpQueueItemFailure(item);
            continue;
          }

          const report: DiagnosticReport = pipelineResult.report;
          const sid = item.studentId?.trim();
          if (!sid) {
            await bumpQueueItemFailure(item);
            continue;
          }

          const queueStudent = await getStudent(sid);
          const assessment = buildAssessmentFromReport(
            item,
            report,
            sid,
            queueStudent?.schoolId?.trim() || undefined
          );
          const savedId = await saveAssessment(assessment);

          if (savedId) {
            await removeFromQueue(item.id);
            evaluateAndPersistSenAlerts(sid, {
              senWarningFlag: report.senWarningFlag,
              latestAssessmentId: savedId,
            }).catch((err) => console.error('SEN Alert evaluation failed:', err));
          } else {
            await bumpQueueItemFailure(item);
          }
          } catch (error) {
            console.error('useSyncManager: failed to process queued item', {
              error,
              itemId: item.id,
            });
            await bumpQueueItemFailure(item);
          }
        }
      } catch (error) {
        console.error('useSyncManager: processQueue failed', error);
      } finally {
        isSyncingRef.current = false;
        setIsSyncing(false);
        setBatchSyncProgress(null);
        await refreshQueue();
      }
    };

    const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined;
    if (locks && typeof locks.request === 'function') {
      await locks.request('basecamp-sync-lock', runSyncUnderLock);
    } else {
      await runSyncUnderLock();
    }
  }, [connectivityOnline, refreshQueue]);

  useEffect(() => {
    if (!connectivityOnline) return;

    let cancelled = false;

    const run = async () => {
      if (cancelled) return;
      await processQueue();
    };

    run();

    return () => {
      cancelled = true;
    };
    // When items are enqueued while still "online" (no offline/online transition), we must
    // process again — queueLength updates after addToQueue + refreshQueue.
  }, [connectivityOnline, processQueue, queueLength]);

  return {
    isOnline: connectivityOnline,
    isSyncing,
    queueLength,
    queuedItems,
    batchSyncProgress,
    refreshQueue,
    processQueue,
  };
}


