import { addDoc, collection, deleteField, doc, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { GamifiedQuiz } from '../../types/domain';

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

/** Writes an AI-generated quiz onto the student document so the portal can load it on the next read. */
export async function pushQuizToPortal(studentId: string, quiz: GamifiedQuiz): Promise<void> {
  await updateDoc(doc(db, 'students', studentId), {
    activeQuiz: quiz,
    updatedAt: Date.now(),
  });
}

/** Student portal: remove teacher-pushed quiz after completion (see Firestore rules). */
export async function clearActiveQuiz(studentId: string): Promise<void> {
  await updateDoc(doc(db, 'students', studentId), {
    activeQuiz: deleteField(),
    updatedAt: Date.now(),
  });
}
