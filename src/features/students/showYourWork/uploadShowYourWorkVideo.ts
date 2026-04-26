import { ref, uploadBytes } from 'firebase/storage';
import { storage } from '../../../lib/firebase';
import type { ShowYourWorkMeta } from './types';

export async function uploadShowYourWorkVideo(params: {
  studentId: string;
  blob: Blob;
  meta: ShowYourWorkMeta;
}): Promise<{ path: string }> {
  if (!storage) {
    throw new Error('Firebase Storage is not configured (missing VITE_FIREBASE_STORAGE_BUCKET).');
  }
  const path = `students/${params.studentId}/showYourWork/${Date.now()}.mp4`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, params.blob, {
    contentType: 'video/mp4',
    customMetadata: {
      encoder: params.meta.encoder,
    },
  });
  return { path };
}
