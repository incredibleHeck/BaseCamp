import { get, set, update } from 'idb-keyval';

const VOICE_QUEUE_KEY = 'basecamp-voice-observation-queue';

export type VoiceObservationQueueStatus = 'pending' | 'syncing' | 'failed';

/** Normalized row stored in IndexedDB (base64 only, never raw Blob). */
export interface QueuedVoiceObservation {
  id: string;
  studentId: string;
  /** Raw base64 without data URL prefix */
  audioBase64: string;
  mimeType: string;
  durationMs: number;
  /** When the clip was enqueued (ms epoch). */
  timestamp: number;
  status: VoiceObservationQueueStatus;
}

/** Legacy shape (pre-status / pre-timestamp field). */
interface LegacyQueuedVoiceObservation {
  id: string;
  studentId: string;
  audioBase64: string;
  mimeType: string;
  durationMs: number;
  createdAt?: number;
  timestamp?: number;
  status?: VoiceObservationQueueStatus;
}

export type AddVoiceObservationResult =
  | { ok: true; id: string }
  | { ok: false; error: 'quota_exceeded' | 'encode_failed' | 'unknown'; message: string };

/** Enqueue from a raw recording Blob (offline-first). */
export type AddVoiceObservationFromBlobParams = {
  audioBlob: Blob;
  studentId: string;
  durationMs: number;
  /** Optional; falls back to `audioBlob.type` or `audio/webm`. */
  mimeType?: string;
};

/** Enqueue when caller already has base64 (e.g. tests or legacy callers). */
export type AddVoiceObservationFromBase64Params = {
  audioBase64: string;
  mimeType: string;
  studentId: string;
  durationMs: number;
};

export type AddVoiceObservationParams = AddVoiceObservationFromBlobParams | AddVoiceObservationFromBase64Params;

function isBlobPayload(p: AddVoiceObservationParams): p is AddVoiceObservationFromBlobParams {
  return 'audioBlob' in p && p.audioBlob instanceof Blob;
}

/**
 * Converts a Blob to a raw base64 string (no data: prefix) for idb-keyval storage.
 */
export async function blobToAudioBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      if (!base64) {
        reject(new Error('Could not read audio as base64'));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error ?? new Error('FileReader failed'));
    reader.readAsDataURL(blob);
  });
}

function isQuotaError(e: unknown): boolean {
  if (!e || typeof e !== 'object') return false;
  const name = (e as DOMException).name;
  if (name === 'QuotaExceededError') return true;
  const code = (e as DOMException).code;
  return code === 22; // legacy QUOTA_EXCEEDED_ERR
}

function normalizeQueuedItem(raw: LegacyQueuedVoiceObservation): QueuedVoiceObservation {
  const timestamp = raw.timestamp ?? raw.createdAt ?? Date.now();
  const status: VoiceObservationQueueStatus =
    raw.status === 'syncing' || raw.status === 'failed' || raw.status === 'pending' ? raw.status : 'pending';
  return {
    id: raw.id,
    studentId: raw.studentId,
    audioBase64: raw.audioBase64,
    mimeType: raw.mimeType,
    durationMs: typeof raw.durationMs === 'number' ? raw.durationMs : 500,
    timestamp,
    status,
  };
}

/**
 * Payload ready for multimodal / Gemini-style APIs (no AI call here).
 */
export function prepareVoiceObservationForAI(item: QueuedVoiceObservation): {
  audioBase64: string;
  mimeType: string;
  studentId: string;
  durationMs: number;
} {
  return {
    audioBase64: item.audioBase64,
    mimeType: item.mimeType.split(';')[0].trim() || 'audio/webm',
    studentId: item.studentId,
    durationMs: item.durationMs,
  };
}

/**
 * Add a voice clip to the offline queue. Accepts either a Blob (converted to base64 here) or pre-encoded base64.
 */
export async function addVoiceObservationToQueue(
  params: AddVoiceObservationParams
): Promise<AddVoiceObservationResult> {
  let audioBase64: string;
  let mimeType: string;

  try {
    if (isBlobPayload(params)) {
      audioBase64 = await blobToAudioBase64(params.audioBlob);
      mimeType =
        (params.mimeType && params.mimeType.trim()) ||
        params.audioBlob.type.split(';')[0].trim() ||
        'audio/webm';
    } else {
      audioBase64 = params.audioBase64;
      mimeType = params.mimeType.split(';')[0].trim() || 'audio/webm';
    }
  } catch (e) {
    console.error('addVoiceObservationToQueue: encode failed', e);
    return {
      ok: false,
      error: 'encode_failed',
      message: e instanceof Error ? e.message : 'Could not encode audio',
    };
  }

  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `v_${Date.now()}`;
  const timestamp = Date.now();
  const row: QueuedVoiceObservation = {
    id,
    studentId: params.studentId,
    audioBase64,
    mimeType,
    durationMs: params.durationMs,
    timestamp,
    status: 'pending',
  };

  try {
    await update(VOICE_QUEUE_KEY, (existing: LegacyQueuedVoiceObservation[] | undefined) => [
      ...(existing ?? []).map((x) => normalizeQueuedItem(x)),
      row,
    ]);
    return { ok: true, id };
  } catch (e) {
    if (isQuotaError(e)) {
      console.warn('Voice observation queue: storage quota exceeded', e);
      return {
        ok: false,
        error: 'quota_exceeded',
        message:
          'This device is out of storage. Free space or delete old recordings, then try again.',
      };
    }
    console.error('addVoiceObservationToQueue failed', e);
    return {
      ok: false,
      error: 'unknown',
      message: e instanceof Error ? e.message : 'Could not save recording to queue',
    };
  }
}

export async function getVoiceObservationQueue(): Promise<QueuedVoiceObservation[]> {
  try {
    const q = await get<LegacyQueuedVoiceObservation[]>(VOICE_QUEUE_KEY);
    return (q ?? []).map((x) => normalizeQueuedItem(x));
  } catch (e) {
    console.error('getVoiceObservationQueue failed', e);
    return [];
  }
}

export async function removeVoiceObservationFromQueue(id: string): Promise<void> {
  try {
    await update(VOICE_QUEUE_KEY, (existing: LegacyQueuedVoiceObservation[] | undefined) =>
      (existing ?? []).filter((x) => x.id !== id)
    );
  } catch (e) {
    if (isQuotaError(e)) {
      console.warn('removeVoiceObservationFromQueue: quota while updating', e);
    } else {
      console.error('removeVoiceObservationFromQueue failed', e);
    }
    throw e;
  }
}

/**
 * Update one queued row (e.g. status during sync).
 */
export async function patchVoiceObservationQueueItem(
  id: string,
  patch: Partial<Pick<QueuedVoiceObservation, 'status' | 'audioBase64' | 'mimeType'>>
): Promise<void> {
  try {
    await update(VOICE_QUEUE_KEY, (existing: LegacyQueuedVoiceObservation[] | undefined) =>
      (existing ?? []).map((x) => {
        const n = normalizeQueuedItem(x);
        return n.id === id ? { ...n, ...patch } : n;
      })
    );
  } catch (e) {
    if (isQuotaError(e)) {
      console.warn('patchVoiceObservationQueueItem: quota exceeded', e);
    }
    throw e;
  }
}

/** Reset stuck `syncing` rows so a retry can run after a crash or dropped connection. */
export async function resetStaleVoiceObservationSyncing(): Promise<void> {
  try {
    await update(VOICE_QUEUE_KEY, (existing: LegacyQueuedVoiceObservation[] | undefined) =>
      (existing ?? []).map((x) => {
        const n = normalizeQueuedItem(x);
        return n.status === 'syncing' ? { ...n, status: 'pending' as const } : n;
      })
    );
  } catch (e) {
    console.error('resetStaleVoiceObservationSyncing failed', e);
  }
}

export async function clearVoiceObservationQueue(): Promise<void> {
  try {
    await set(VOICE_QUEUE_KEY, []);
  } catch (e) {
    if (isQuotaError(e)) {
      console.warn('clearVoiceObservationQueue: quota', e);
    }
    throw e;
  }
}
