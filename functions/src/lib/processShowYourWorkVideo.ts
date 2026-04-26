import { createHash } from 'crypto';
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import * as logger from 'firebase-functions/logger';
import {
  analyzeShowYourWorkVideo,
  DEFAULT_SHOW_YOUR_WORK_MODEL,
  type ShowYourWorkAiInsights,
} from './showYourWorkGemini.js';

export type ProcessShowYourWorkInput = {
  apiKey: string;
  bucket: string;
  objectName: string;
  studentId: string;
  contentType?: string;
  sizeBytes: number;
  storageGeneration: string | number;
  encoder?: string;
};

/** Skip duplicate Gemini work if another invocation claimed this object recently. */
const PROCESSING_LEASE_MS = 180_000;

function dedupeDocId(bucket: string, objectName: string, generation: string | number): string {
  const h = createHash('sha256').update(`${bucket}\0${objectName}\0${String(generation)}`).digest('hex');
  return h.slice(0, 40);
}

type ClaimResult = 'proceed' | 'skip_completed' | 'skip_in_flight';

/**
 * Download portal MP4, run Gemini, write `showYourWorkInsights/{dedupeId}`.
 * Skips when already `completed`, or when a fresh `processing` lease is held (retries after lease expiry).
 */
export async function processShowYourWorkVideo(input: ProcessShowYourWorkInput): Promise<void> {
  const db = getFirestore();
  const docId = dedupeDocId(input.bucket, input.objectName, input.storageGeneration);
  const ref = db.collection('showYourWorkInsights').doc(docId);

  const claim = await db.runTransaction(async (tx): Promise<ClaimResult> => {
    const snap = await tx.get(ref);
    if (snap.exists) {
      const d = snap.data() as Record<string, unknown>;
      if (d.status === 'completed') return 'skip_completed';
      if (d.status === 'processing') {
        const started = d.processingStartedAt;
        if (started instanceof Timestamp) {
          if (Date.now() - started.toMillis() < PROCESSING_LEASE_MS) return 'skip_in_flight';
        }
      }
    }
    tx.set(
      ref,
      {
        status: 'processing',
        processingStartedAt: FieldValue.serverTimestamp(),
        studentId: input.studentId,
        storagePath: input.objectName,
        storageGeneration: String(input.storageGeneration),
        sizeBytes: input.sizeBytes,
        encoder: input.encoder ?? null,
        contentType: input.contentType ?? 'video/mp4',
      },
      { merge: true },
    );
    return 'proceed';
  });

  if (claim === 'skip_completed') {
    logger.info('processShowYourWorkVideo: skip duplicate (already completed)', {
      docId,
      objectName: input.objectName,
    });
    return;
  }
  if (claim === 'skip_in_flight') {
    logger.info('processShowYourWorkVideo: skip duplicate (processing lease active)', {
      docId,
      objectName: input.objectName,
    });
    return;
  }

  const studentSnap = await db.collection('students').doc(input.studentId).get();
  const schoolId =
    studentSnap.exists && typeof studentSnap.data()?.schoolId === 'string'
      ? (studentSnap.data()?.schoolId as string).trim()
      : '';

  const modelUsed = (process.env.GEMINI_MODEL || DEFAULT_SHOW_YOUR_WORK_MODEL).trim();

  let insights: ShowYourWorkAiInsights | null = null;
  let errorMessage: string | null = null;

  try {
    const [buf] = await getStorage().bucket(input.bucket).file(input.objectName).download();
    insights = await analyzeShowYourWorkVideo({
      apiKey: input.apiKey,
      modelName: modelUsed,
      videoBuffer: buf,
    });
  } catch (e) {
    errorMessage = e instanceof Error ? e.message : String(e);
    logger.error('processShowYourWorkVideo: gemini or download failed', {
      studentId: input.studentId,
      objectName: input.objectName,
      error: errorMessage,
    });
  }

  const payload: Record<string, unknown> = {
    studentId: input.studentId,
    schoolId: schoolId || null,
    storagePath: input.objectName,
    storageGeneration: String(input.storageGeneration),
    encoder: input.encoder ?? null,
    contentType: input.contentType ?? 'video/mp4',
    sizeBytes: input.sizeBytes,
    createdAt: FieldValue.serverTimestamp(),
    model: modelUsed,
    status: insights ? 'completed' : 'failed',
  };

  if (insights) {
    payload.insights = { ...insights };
  } else {
    payload.error = errorMessage ?? 'Unknown error';
  }

  await ref.set(payload, { merge: false });

  logger.info('processShowYourWorkVideo: persisted', {
    docId,
    studentId: input.studentId,
    status: payload.status,
  });
}
