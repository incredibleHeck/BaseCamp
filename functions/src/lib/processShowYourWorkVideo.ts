import { createHash } from 'crypto';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
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

function dedupeDocId(bucket: string, objectName: string, generation: string | number): string {
  const h = createHash('sha256').update(`${bucket}\0${objectName}\0${String(generation)}`).digest('hex');
  return h.slice(0, 40);
}

/**
 * Download portal MP4, run Gemini, write `showYourWorkInsights/{dedupeId}` (idempotent when already completed).
 */
export async function processShowYourWorkVideo(input: ProcessShowYourWorkInput): Promise<void> {
  const db = getFirestore();
  const docId = dedupeDocId(input.bucket, input.objectName, input.storageGeneration);
  const ref = db.collection('showYourWorkInsights').doc(docId);
  const existing = await ref.get();
  if (existing.exists) {
    const st = existing.data()?.status;
    if (st === 'completed') {
      logger.info('processShowYourWorkVideo: skip duplicate (already completed)', {
        docId,
        objectName: input.objectName,
      });
      return;
    }
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
