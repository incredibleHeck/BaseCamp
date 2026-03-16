import { get, set, update } from 'idb-keyval';

const QUEUE_KEY = 'basecamp-offline-queue';

export interface QueuedAssessment {
  id: string;
  studentId: string;
  subject: string;
  imageBase64: string;
  dialectContext: string;
  timestamp: number;
}

/**
 * Adds an assessment to the offline queue. Generates id and timestamp automatically.
 */
export async function addToQueue(
  item: Omit<QueuedAssessment, 'id' | 'timestamp'>
): Promise<void> {
  try {
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString();
    const timestamp = Date.now();
    const queuedItem: QueuedAssessment = { ...item, id, timestamp };

    await update(QUEUE_KEY, (existing: QueuedAssessment[] | undefined) => {
      const queue = existing ?? [];
      return [...queue, queuedItem];
    });
  } catch (error) {
    console.error('offlineQueueService.addToQueue failed:', error);
    throw error;
  }
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
