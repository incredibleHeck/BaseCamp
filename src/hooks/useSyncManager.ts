import { useCallback, useEffect, useRef, useState } from 'react';
import {
  analyzeHybridTeacherDiagnostic,
  analyzeManualEntry,
  analyzeWorksheet,
  analyzeWorksheetMultiple,
  buildStudentContextForHybridPrompt,
  generateExtensionActivity,
  generateRemedialLessonPlan,
  MASTERY_EXTENSION_LESSON_PLACEHOLDER,
  mimeFromDataUrl,
  shouldUseExtensionActivity,
  type DiagnosticReport,
} from '../services/aiPrompts';
import { getQueue, removeFromQueue, QueuedAssessment } from '../services/offlineQueueService';
import { saveAssessment, Assessment, getStudentHistory } from '../services/assessmentService';
import { getStudent, getStudents } from '../services/studentService';
import {
  getDefaultAcademicYear,
  getDefaultTerm,
  DEFAULT_CLASS_LABEL,
} from '../config/academicContext';
import { playbookKeyFromLessonTitle } from '../utils/playbookKey';
import { evaluateAndPersistSenAlerts } from '../services/senAlertService';
import { getCurriculumContext } from '../services/curriculumRagService';
import {
  buildRecentHistorySummaryForLongitudinalPrompt,
  parseGradeLevelFromStudentRecord,
} from '../utils/longitudinalPromptHelpers';

function buildWorksheetRagOptions(item: QueuedAssessment, ragHint: string) {
  const fw = item.curriculumFramework ?? 'GES';
  const gl = item.gradeLevel;
  const { formattedContext, allowedObjectiveIds } = getCurriculumContext(
    item.assessmentType,
    ragHint,
    fw,
    gl
  );
  return {
    curriculumFramework: fw,
    gradeLevel: gl,
    curriculumContext: formattedContext,
    allowedObjectiveIds,
    studentGradeLevel: typeof gl === 'number' && Number.isFinite(gl) ? gl : undefined,
  };
}

async function longitudinalOptsForQueuedStudent(
  studentId: string,
  assessmentType: QueuedAssessment['assessmentType'],
  queueGradeLevel: number | undefined
): Promise<{ studentGradeLevel?: number; recentHistorySummary?: string }> {
  const out: { studentGradeLevel?: number; recentHistorySummary?: string } = {};
  try {
    const [student, history] = await Promise.all([getStudent(studentId), getStudentHistory(studentId)]);
    out.studentGradeLevel =
      parseGradeLevelFromStudentRecord(student) ??
      (typeof queueGradeLevel === 'number' && Number.isFinite(queueGradeLevel) ? queueGradeLevel : undefined);
    const summary = buildRecentHistorySummaryForLongitudinalPrompt(history ?? [], assessmentType);
    if (summary) out.recentHistorySummary = summary;
  } catch {
    if (typeof queueGradeLevel === 'number' && Number.isFinite(queueGradeLevel)) {
      out.studentGradeLevel = queueGradeLevel;
    }
  }
  return out;
}

function buildAssessmentFromReport(
  item: QueuedAssessment,
  report: DiagnosticReport,
  studentId: string
): Assessment {
  const type: Assessment['type'] =
    item.assessmentType.toLowerCase() === 'literacy' ? 'Literacy' : 'Numeracy';
  const lessonTitle = report.lessonPlan?.title?.trim();
  return {
    studentId,
    type,
    diagnosis: report.diagnosis,
    masteredConcepts: report.masteredConcepts,
    gapTags: report.gapTags,
    masteryTags: report.masteryTags,
    remedialPlan: report.remedialPlan,
    lessonPlan: report.lessonPlan,
    extensionActivity: report.extensionActivity,
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

export function useSyncManager(): SyncManagerState {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
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
          let report: Awaited<ReturnType<typeof analyzeWorksheet>> | null = null;

          if (item.inputMode === 'manual') {
            const manualHint = [item.observations?.trim() ?? '', ...(item.manualRubric ?? [])].join(' ');
            const rag = buildWorksheetRagOptions(item, manualHint);
            const sidManual = item.studentId?.trim();
            const longitudinal =
              sidManual ?
                await longitudinalOptsForQueuedStudent(sidManual, item.assessmentType, item.gradeLevel)
              : {};
            report = await analyzeManualEntry(
              item.assessmentType,
              item.dialectContext ?? '',
              item.manualRubric ?? [],
              item.observations?.trim() ?? '',
              { ...rag, ...longitudinal }
            );
          } else if (item.inputMode === 'upload_batch') {
            const batchId = item.batchId ?? '';
            const img = item.imageBase64s?.[0];
            if (!img?.trim()) {
              await removeFromQueue(item.id);
              continue;
            }

            const students = await getStudents();
            const roster = students
              .filter((s): s is { id: string; name: string } => Boolean(s.id?.trim()))
              .map((s) => ({ studentId: s.id!, name: s.name }));

            if (!roster.length) {
              console.warn('useSyncManager: upload_batch skipped — empty roster', item.id);
              continue;
            }

            const total = batchId ? (batchTotals.get(batchId) ?? 1) : 1;
            const doneBefore = batchId ? (batchDone.get(batchId) ?? 0) : 0;
            setBatchSyncProgress({ batchId: batchId || item.id, completed: doneBefore, total });

            const rag = buildWorksheetRagOptions(item, '');
            report = await analyzeWorksheet(img, item.assessmentType, item.dialectContext ?? '', {
              autoDetectStudent: true,
              classRoster: roster,
              ...rag,
            });

            if (!report) {
              continue;
            }

            const resolvedId = report.detectedStudentId ?? null;
            if (!resolvedId) {
              console.warn(
                'useSyncManager: no confident roster match for batch worksheet; leaving in queue',
                item.id
              );
              continue;
            }

            const assessment = buildAssessmentFromReport(item, report, resolvedId);
            const savedId = await saveAssessment(assessment);

            if (savedId) {
              await removeFromQueue(item.id);
              void evaluateAndPersistSenAlerts(resolvedId, {
                senWarningFlag: report.senWarningFlag,
                latestAssessmentId: savedId,
              });
              if (batchId) {
                const nextDone = (batchDone.get(batchId) ?? 0) + 1;
                batchDone.set(batchId, nextDone);
                setBatchSyncProgress({ batchId: batchId || item.id, completed: nextDone, total });
              }
            }
            continue;
          } else if (item.inputMode === 'hybrid_voice') {
            const audioB64 = item.audioBase64?.trim() ?? '';
            if (!audioB64) {
              await removeFromQueue(item.id);
              continue;
            }
            const sid = item.studentId;
            if (!sid) {
              await removeFromQueue(item.id);
              continue;
            }
            const student = await getStudent(sid);
            const history = await getStudentHistory(sid);
            const studentContext = buildStudentContextForHybridPrompt(student, history);
            const displayName = student?.name ?? 'the learner';
            const firstImage = item.imageBase64s?.[0];
            const worksheetImage =
              firstImage && firstImage.trim()
                ? {
                    base64: firstImage,
                    mimeType: mimeFromDataUrl(firstImage) ?? 'image/jpeg',
                  }
                : undefined;
            const hybridHint = [studentContext, displayName].join(' ').slice(0, 800);
            const rag = buildWorksheetRagOptions(item, hybridHint);
            const hybridStudentGrade =
              parseGradeLevelFromStudentRecord(student) ??
              (typeof rag.gradeLevel === 'number' && Number.isFinite(rag.gradeLevel) ? rag.gradeLevel : undefined);
            const hybridHistorySummary = buildRecentHistorySummaryForLongitudinalPrompt(
              history ?? [],
              item.assessmentType
            );
            report = await analyzeHybridTeacherDiagnostic({
              audioBase64: audioB64,
              audioMimeType: item.audioMimeType?.trim() || mimeFromDataUrl(audioB64) || 'audio/webm',
              studentDisplayName: displayName,
              studentContext,
              worksheetImage,
              subject: item.assessmentType,
              dialectContext: item.dialectContext ?? '',
              curriculumFramework: rag.curriculumFramework,
              gradeLevel: rag.gradeLevel,
              curriculumContext: rag.curriculumContext,
              allowedObjectiveIds: rag.allowedObjectiveIds,
              studentGradeLevel: hybridStudentGrade,
              recentHistorySummary: hybridHistorySummary,
            });

            if (report) {
              const dialect = item.dialectContext?.trim();
              const lessonPlanOpts = {
                studentGradeLevel: hybridStudentGrade,
                dialectContext: dialect ? dialect : undefined,
              };

              if (shouldUseExtensionActivity(report)) {
                const ext = await generateExtensionActivity({
                  report,
                  studentGradeLevel: lessonPlanOpts.studentGradeLevel,
                  dialectContext: lessonPlanOpts.dialectContext,
                  curriculumContext: rag.curriculumContext,
                });
                if (ext) {
                  report = {
                    ...report,
                    extensionActivity: ext,
                    lessonPlan: MASTERY_EXTENSION_LESSON_PLACEHOLDER,
                  };
                } else {
                  const enrichedLesson = await generateRemedialLessonPlan(
                    report.diagnosis,
                    report.remedialPlan,
                    item.assessmentType,
                    report.gesAlignment ?? undefined,
                    lessonPlanOpts
                  );
                  if (enrichedLesson) {
                    report = { ...report, lessonPlan: enrichedLesson };
                  }
                }
              } else {
                const enrichedLesson = await generateRemedialLessonPlan(
                  report.diagnosis,
                  report.remedialPlan,
                  item.assessmentType,
                  report.gesAlignment ?? undefined,
                  lessonPlanOpts
                );
                if (enrichedLesson) {
                  report = { ...report, lessonPlan: enrichedLesson };
                }
              }
            }
          } else {
            const rag = buildWorksheetRagOptions(item, '');
            const sidUpload = item.studentId?.trim();
            const longitudinal =
              sidUpload ?
                await longitudinalOptsForQueuedStudent(sidUpload, item.assessmentType, item.gradeLevel)
              : {};
            const ragWithLong = { ...rag, ...longitudinal };
            const imageBase64s = item.imageBase64s ?? [];
            if (imageBase64s.length > 1) {
              report = await analyzeWorksheetMultiple(
                imageBase64s,
                item.assessmentType,
                item.dialectContext ?? '',
                ragWithLong
              );
            } else if (imageBase64s.length === 1) {
              report = await analyzeWorksheet(
                imageBase64s[0],
                item.assessmentType,
                item.dialectContext ?? '',
                ragWithLong
              );
            } else {
              await removeFromQueue(item.id);
              continue;
            }
          }

          if (!report) {
            continue;
          }

          const sid = item.studentId;
          if (!sid) {
            continue;
          }

          const assessment = buildAssessmentFromReport(item, report, sid);
          const savedId = await saveAssessment(assessment);

          if (savedId) {
            await removeFromQueue(item.id);
            if (item.studentId) {
              void evaluateAndPersistSenAlerts(item.studentId, {
                senWarningFlag: report.senWarningFlag,
                latestAssessmentId: savedId,
              });
            }
          }
        } catch (error) {
          console.error('useSyncManager: failed to process queued item', {
            error,
            itemId: item.id,
          });
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
  }, [isOnline, refreshQueue]);

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
    batchSyncProgress,
    refreshQueue,
    processQueue,
  };
}
