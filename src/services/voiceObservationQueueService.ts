import { get, set, update } from 'idb-keyval';

const VOICE_QUEUE_KEY = 'basecamp-voice-observation-queue';

export interface QueuedVoiceObservation {
  id: string;
  studentId: string;
  /** Raw base64 without data URL prefix */
  audioBase64: string;
  mimeType: string;
  durationMs: number;
  createdAt: number;
}

export async function addVoiceObservationToQueue(
  item: Omit<QueuedVoiceObservation, 'id' | 'createdAt'>
): Promise<void> {
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `v_${Date.now()}`;
  const createdAt = Date.now();
  const row: QueuedVoiceObservation = { ...item, id, createdAt };
  await update(VOICE_QUEUE_KEY, (existing: QueuedVoiceObservation[] | undefined) => [
    ...(existing ?? []),
    row,
  ]);
}

export async function getVoiceObservationQueue(): Promise<QueuedVoiceObservation[]> {
  try {
    const q = await get<QueuedVoiceObservation[]>(VOICE_QUEUE_KEY);
    return q ?? [];
  } catch (e) {
    console.error('getVoiceObservationQueue failed', e);
    return [];
  }
}

export async function removeVoiceObservationFromQueue(id: string): Promise<void> {
  await update(VOICE_QUEUE_KEY, (existing: QueuedVoiceObservation[] | undefined) =>
    (existing ?? []).filter((x) => x.id !== id)
  );
}

export async function clearVoiceObservationQueue(): Promise<void> {
  await set(VOICE_QUEUE_KEY, []);
}
