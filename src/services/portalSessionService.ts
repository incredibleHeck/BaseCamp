import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

/** Lightweight analytics for student portal MVP (time-on-task proxy). */
export async function logPortalSessionSummary(params: {
  studentId: string;
  subject: string;
  pointsEarned: number;
  itemsCorrect: number;
  itemsTotal: number;
}): Promise<void> {
  try {
    await addDoc(collection(db, 'portalSessions'), {
      ...params,
      createdAt: Timestamp.now(),
    });
  } catch (e) {
    console.error('logPortalSessionSummary', e);
  }
}
