import { get, set, update } from 'idb-keyval';
import { compressImage } from '../../utils/imageCompression';
import {
  shouldEnqueueToIndexedDb,
  type OfflineQueuePayloadChannel,
  type OfflineQueueRoutingInput,
} from './offlineQueueRouting';
import { dispatchLiveClassroomQueueBypass } from './liveClassroomQueueBypass';

const QUEUE_KEY = 'basecamp-offline-queue';

/** Stored on queued rows; `live_classroom_ephemeral` should not appear (defensive cleanup in sync). */
export type OfflineQueueChannel = 'standard' | 'live_classroom_ephemeral';

export type { OfflineQueuePayloadChannel, OfflineQueueRoutingInput } from './offlineQueueRouting';
export { shouldEnqueueToIndexedDb, describeOfflineQueueRoute } from './offlineQueueRouting';
export {
  setLiveClassroomQueueBypassHandler,
  type LiveClassroomQueueBypassPayload,
} from './liveClassroomQueueBypass';

const WORKSHEET_BATCH_ROUTING: OfflineQueueRoutingInput = {
  isPremiumTier: false,
  isLiveSessionActive: false,
  channel: 'standard_assessment',
};

export type QueuedAssessmentInputMode = 'upload' | 'manual' | 'hybrid_voice' | 'upload_batch';

/**
 * Context copied onto each worksheet row in a class batch (extend with custom keys as needed).
 */
export type WorksheetBatchAssessmentContext = {
  assessmentType: 'numeracy' | 'literacy';
  dialectContext?: string;
} & Record<string, unknown>;

export interface QueuedAssessment {
  id: string;
  /**
   * Required for single-learner / hybrid flows. Use `null` when `autoDetectStudent` is true
   * (class batch worksheets — student resolved after Gemini reads handwritten names).
   */
  studentId?: string | null;
  assessmentType: 'numeracy' | 'literacy';
  inputMode: QueuedAssessmentInputMode;
  /**
   * Teacher voice clip as data URL or raw base64 (`hybrid_voice` / future voice modes).
   */
  audioBase64?: string;
  /** From Blob.type, e.g. audio/webm */
  audioMimeType?: string;
  /**
   * For uploads, always store as an array (single-page uploads have length 1).
   * For manual entry, omit.
   */
  imageBase64s?: string[];
  /**
   * For manual entry, include at least one of manualRubric/observations.
   * For uploads, omit.
   */
  manualRubric?: string[];
  observations?: string;
  dialectContext?: string;
  /** Curriculum RAG: Ghana GES pilot vs Cambridge Primary Math taxonomy. */
  curriculumFramework?: 'GES' | 'Cambridge';
  /** Parsed from roster grade when available (Cambridge filtering). */
  gradeLevel?: number;
  /** Formal class/cohort (Firestore `cohorts` id). */
  cohortId?: string;
  /** Display label for gradebook / rollups (usually cohort name). */
  classLabel?: string;
  timestamp: number;
  /** Groups multiple queued rows from one class batch enqueue. */
  batchId?: string;
  /** When true, `studentId` may be null; sync pipeline must resolve learner before saving. */
  autoDetectStudent?: boolean;
  /** Original batch context (immutable snapshot per row). */
  batchAssessmentContext?: Record<string, unknown>;
  /**
   * Sync attempts that failed (analysis null/error, save failure). Removed from queue after max retries.
   */
  retryCount?: number;
  /**
   * Discriminator for Premium live bypass. Omitted or `standard` for normal offline assessments.
   * Rows with `live_classroom_ephemeral` in IndexedDB are treated as orphans and removed by the sync manager.
   */
  offlineQueueChannel?: OfflineQueueChannel;
}

/** Shown in alerts when enqueue fails due to device / IndexedDB storage limits. */
export const STORAGE_QUOTA_EXCEEDED_USER_MESSAGE =
  'BaseCamp could not save to the offline queue — your device storage is full. Free some space and try again.';

export class StorageQuotaExceededError extends Error {
  override readonly name = 'StorageQuotaExceededError';
  constructor(message: string = STORAGE_QUOTA_EXCEEDED_USER_MESSAGE) {
    super(message);
    Object.setPrototypeOf(this, StorageQuotaExceededError.prototype);
  }
}

function isQuotaExceededError(e: unknown): boolean {
  if (e instanceof StorageQuotaExceededError) return true;
  if (!e || typeof e !== 'object') return false;
  const err = e as { name?: string; message?: string };
  if (err.name === 'QuotaExceededError') return true;
  const msg = String(err.message ?? '');
  return /quota/i.test(msg) || msg.includes('QuotaExceeded');
}

function generateBatchId(): string {
  const suffix =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `batch_${Date.now()}_${suffix}`;
}

function newQueueItemId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export type AddToQueueRouting = OfflineQueueRoutingInput;

export type AddToQueueResult = { status: 'queued' } | { status: 'bypassed' };

/**
 * Adds an assessment to the offline queue when routing selects IndexedDB; otherwise dispatches
 * to the live-classroom bypass handler (no IndexedDB write).
 */
export async function addToQueue(
  item: Omit<QueuedAssessment, 'id' | 'timestamp'>,
  routing: AddToQueueRouting
): Promise<AddToQueueResult> {
  if (!shouldEnqueueToIndexedDb(routing)) {
    dispatchLiveClassroomQueueBypass(item);
    return { status: 'bypassed' };
  }

  try {
    const id = newQueueItemId();
    const timestamp = Date.now();
    const queuedItem: QueuedAssessment = {
      ...item,
      id,
      timestamp,
      offlineQueueChannel: 'standard',
    };

    await update(QUEUE_KEY, (existing: QueuedAssessment[] | undefined) => {
      const queue = existing ?? [];
      return [...queue, queuedItem];
    });
    return { status: 'queued' };
  } catch (error) {
    if (isQuotaExceededError(error)) {
      console.error('offlineQueueService.addToQueue: storage quota exceeded', error);
      throw new StorageQuotaExceededError();
    }
    console.error('offlineQueueService.addToQueue failed:', error);
    throw error;
  }
}

export type EnqueueWorksheetBatchResult = {
  batchId: string;
  /** Number of files successfully written to IndexedDB (may be less than files.length on quota / errors). */
  queuedCount: number;
};

/**
 * Queues each worksheet image as its own row, all sharing `batchId`, with `studentId: null`
 * and `autoDetectStudent: true` for a future Gemini name-detection pipeline.
 *
 * Uses `compressImage` (same as live upload) then stores a single-page data URL in `imageBase64s`.
 * On storage quota exhaustion, shows an alert and stops; earlier files remain queued.
 */
export async function enqueueWorksheetBatch(
  files: File[],
  assessmentContext: WorksheetBatchAssessmentContext
): Promise<EnqueueWorksheetBatchResult> {
  const batchId = generateBatchId();
  if (!files.length) {
    return { batchId, queuedCount: 0 };
  }

  if (!assessmentContext?.assessmentType) {
    console.warn('enqueueWorksheetBatch: missing assessmentType in assessmentContext');
  }

  const { assessmentType, dialectContext, ...restContext } = assessmentContext;
  const batchAssessmentContext: Record<string, unknown> = {
    assessmentType,
    ...(dialectContext !== undefined ? { dialectContext } : {}),
    ...restContext,
  };

  let queuedCount = 0;
  const total = files.length;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const compressed = await compressImage(file);
      const dataUrl = compressed.base64;
      if (!dataUrl?.trim()) {
        console.warn(`enqueueWorksheetBatch: empty data URL for file index ${i}`, file.name);
        continue;
      }

      await addToQueue(
        {
          studentId: null,
          assessmentType,
          inputMode: 'upload_batch',
          imageBase64s: [dataUrl],
          dialectContext,
          batchId,
          autoDetectStudent: true,
          batchAssessmentContext,
        },
        WORKSHEET_BATCH_ROUTING
      );
      queuedCount++;
    } catch (e) {
      if (e instanceof StorageQuotaExceededError || isQuotaExceededError(e)) {
        if (typeof alert !== 'undefined') {
          const base = e instanceof StorageQuotaExceededError ? e.message : STORAGE_QUOTA_EXCEEDED_USER_MESSAGE;
          alert(
            queuedCount > 0
              ? `${base} (${queuedCount} of ${total} worksheet(s) were saved before storage filled up.)`
              : base
          );
        }
        console.error('enqueueWorksheetBatch: quota exceeded', { batchId, queuedCount, index: i }, e);
        break;
      }
      console.error(`enqueueWorksheetBatch: failed on file ${i + 1}/${total}`, file.name, e);
      // Non-quota: skip this file and continue so the rest of the batch can still queue.
    }
  }

  return { batchId, queuedCount };
}

/**
 * Returns all queued assessments, or an empty array if none or on error.
 */
export async function getQueue(): Promise<QueuedAssessment[]> {
  try {
    const queue = await get<QueuedAssessment[]>(QUEUE_KEY);
    return queue ?? [];
  } catch (error) {
    console.error('offlineQueueService.getQueue failed:', error);
    return [];
  }
}

/**
 * Merges fields into an existing queued item (matched by `id`). Does nothing if id is missing.
 */
export async function updateInQueue(
  id: string,
  updates: Partial<Omit<QueuedAssessment, 'id' | 'timestamp'>>
): Promise<void> {
  try {
    await update(QUEUE_KEY, (existing: QueuedAssessment[] | undefined) => {
      const queue = existing ?? [];
      return queue.map((q) => (q.id === id ? { ...q, ...updates } : q));
    });
  } catch (error) {
    console.error('offlineQueueService.updateInQueue failed:', error);
    throw error;
  }
}

/**
 * Removes a queued assessment by id.
 */
export async function removeFromQueue(id: string): Promise<void> {
  try {
    await update(QUEUE_KEY, (existing: QueuedAssessment[] | undefined) => {
      const queue = existing ?? [];
      return queue.filter((item) => item.id !== id);
    });
  } catch (error) {
    console.error('offlineQueueService.removeFromQueue failed:', error);
    throw error;
  }
}

/**
 * Clears all queued assessments.
 */
export async function clearQueue(): Promise<void> {
  try {
    await set(QUEUE_KEY, []);
  } catch (error) {
    console.error('offlineQueueService.clearQueue failed:', error);
    throw error;
  }
}
