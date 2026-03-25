import { addDoc, collection, deleteField, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';

import { db } from '../lib/firebase';
import type { Cohort } from '../types/domain';

const COHORTS_COLLECTION = 'cohorts';

/**
 * Lists formal cohorts for a school (Firestore `cohorts` where `schoolId` matches).
 */
export async function getCohortsBySchool(schoolId: string): Promise<Cohort[]> {
  const trimmed = schoolId?.trim();
  if (!trimmed) return [];

  try {
    const q = query(collection(db, COHORTS_COLLECTION), where('schoolId', '==', trimmed));
    const snap = await getDocs(q);
    const out: Cohort[] = [];

    snap.forEach((docSnap) => {
      const data = docSnap.data() as Record<string, unknown>;
      const name = typeof data.name === 'string' ? data.name.trim() : '';
      const sid = typeof data.schoolId === 'string' ? data.schoolId.trim() : trimmed;
      const gradeLevel =
        typeof data.gradeLevel === 'number' && Number.isFinite(data.gradeLevel) ? data.gradeLevel : 0;
      out.push({
        id: docSnap.id,
        schoolId: sid,
        name: name || docSnap.id,
        gradeLevel,
        teacherId: typeof data.teacherId === 'string' ? data.teacherId.trim() : undefined,
      });
    });

    out.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    return out;
  } catch (error) {
    console.error('cohortService.getCohortsBySchool failed:', error);
    return [];
  }
}

/**
 * Lists cohorts assigned to a teacher (Firestore `cohorts` where `teacherId` matches).
 */
export async function getCohortsByTeacher(teacherId: string): Promise<Cohort[]> {
  const trimmed = teacherId?.trim();
  if (!trimmed) return [];

  try {
    const q = query(collection(db, COHORTS_COLLECTION), where('teacherId', '==', trimmed));
    const snap = await getDocs(q);
    const out: Cohort[] = [];

    snap.forEach((docSnap) => {
      const data = docSnap.data() as Record<string, unknown>;
      const name = typeof data.name === 'string' ? data.name.trim() : '';
      const sid = typeof data.schoolId === 'string' ? data.schoolId.trim() : '';
      const gradeLevel =
        typeof data.gradeLevel === 'number' && Number.isFinite(data.gradeLevel) ? data.gradeLevel : 0;
      out.push({
        id: docSnap.id,
        schoolId: sid,
        name: name || docSnap.id,
        gradeLevel,
        teacherId: typeof data.teacherId === 'string' ? data.teacherId.trim() : undefined,
      });
    });

    out.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    return out;
  } catch (error) {
    console.error('cohortService.getCohortsByTeacher failed:', error);
    return [];
  }
}

/**
 * Sets or clears the assigned teacher on a cohort document. Returns false on failure.
 */
export async function setCohortTeacherId(cohortId: string, teacherId: string | null): Promise<boolean> {
  const id = cohortId?.trim();
  if (!id) return false;

  try {
    const ref = doc(db, COHORTS_COLLECTION, id);
    const tid = teacherId?.trim();
    if (tid) {
      await updateDoc(ref, { teacherId: tid });
    } else {
      await updateDoc(ref, { teacherId: deleteField() });
    }
    return true;
  } catch (error) {
    console.error('cohortService.setCohortTeacherId failed:', error);
    return false;
  }
}

export type CreateCohortInput = {
  schoolId: string;
  name: string;
  gradeLevel: number;
  teacherId?: string;
};

/**
 * Creates a cohort document for a school. Returns new document id or null on failure.
 */
export async function createCohort(input: CreateCohortInput): Promise<string | null> {
  const schoolId = input.schoolId?.trim();
  const name = input.name?.trim();
  if (!schoolId || !name) return null;
  const gradeLevel = Math.round(input.gradeLevel);
  if (!Number.isFinite(gradeLevel) || gradeLevel < 1 || gradeLevel > 12) return null;

  try {
    const docRef = await addDoc(collection(db, COHORTS_COLLECTION), {
      schoolId,
      name,
      gradeLevel,
      ...(input.teacherId?.trim() ? { teacherId: input.teacherId.trim() } : {}),
    });
    return docRef.id;
  } catch (error) {
    console.error('cohortService.createCohort failed:', error);
    return null;
  }
}
