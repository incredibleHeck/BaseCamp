import { collection, getDocs, query, where } from 'firebase/firestore';

import { httpsCallable } from 'firebase/functions';

import { auth, db, functions } from '../lib/firebase';

const createSchoolTeacherCallable = httpsCallable(functions, 'createSchoolTeacher');
const deleteSchoolTeacherCallable = httpsCallable(functions, 'deleteSchoolTeacher');

const USERS_COLLECTION = 'users';

export type SchoolTeacherSummary = {
  id: string;
  name: string;
  username?: string;
};

export type HeadteacherSummary = {
  id: string;
  name: string;
  schoolId?: string;
};

export type CreateTeacherResult = {
  uid: string;
  username: string;
  email: string;
  temporaryPassword: string;
};

/**
 * Headteachers in `users` under an `organizationId`, for org admin branch directory.
 */
export async function getHeadteachersInOrganization(organizationId: string): Promise<HeadteacherSummary[]> {
  const trimmed = organizationId?.trim();
  if (!trimmed) return [];

  try {
    const snap = await getDocs(
      query(
        collection(db, USERS_COLLECTION),
        where('organizationId', '==', trimmed),
        where('role', '==', 'headteacher')
      )
    );
    const out: HeadteacherSummary[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data() as Record<string, unknown>;
      const name = typeof data.name === 'string' ? data.name.trim() : '';
      const schoolId = typeof data.schoolId === 'string' ? data.schoolId.trim() : undefined;
      out.push({
        id: docSnap.id,
        name: name || docSnap.id,
        schoolId,
      });
    });
    return out;
  } catch (error) {
    console.error('userService.getHeadteachersInOrganization failed:', error);
    return [];
  }
}

/**
 * All headteacher profiles (`role == headteacher`). Intended for `super_admin` UI only — unscoped
 * queries are not safe for `org_admin` because rules require org alignment per document.
 */
export async function getAllHeadteachers(): Promise<HeadteacherSummary[]> {
  try {
    const snap = await getDocs(
      query(collection(db, USERS_COLLECTION), where('role', '==', 'headteacher'))
    );
    const map = new Map<string, HeadteacherSummary>();
    snap.forEach((docSnap) => {
      const data = docSnap.data() as Record<string, unknown>;
      const name = typeof data.name === 'string' ? data.name.trim() : '';
      const schoolId = typeof data.schoolId === 'string' ? data.schoolId.trim() : undefined;
      map.set(docSnap.id, {
        id: docSnap.id,
        name: name || docSnap.id,
        schoolId,
      });
    });
    return [...map.values()];
  } catch (error) {
    console.error('userService.getAllHeadteachers failed:', error);
    return [];
  }
}

/** @deprecated use getHeadteachersInOrganization */
export const getHeadteachersInJurisdiction = getHeadteachersInOrganization;
/** @deprecated */
export const getHeadteachersByDistrict = getHeadteachersInOrganization;

/**
 * Users in `users` with matching `schoolId` and role `teacher` (for headteacher assignment UI).
 */
export async function getTeachersBySchool(schoolId: string): Promise<SchoolTeacherSummary[]> {
  const trimmed = schoolId?.trim();
  if (!trimmed) return [];

  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('schoolId', '==', trimmed),
      where('role', '==', 'teacher')
    );
    const snap = await getDocs(q);
    const out: SchoolTeacherSummary[] = [];

    snap.forEach((docSnap) => {
      const data = docSnap.data() as Record<string, unknown>;
      const name = typeof data.name === 'string' ? data.name.trim() : '';
      const username = typeof data.username === 'string' ? data.username : undefined;
      out.push({
        id: docSnap.id,
        name: name || docSnap.id,
        username,
      });
    });

    out.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    return out;
  } catch (error) {
    console.error('userService.getTeachersBySchool failed:', error);
    return [];
  }
}

/**
 * Adds a new teacher via Cloud Function (Firebase Auth + `users/{uid}`).
 * The function verifies the caller is a headteacher and uses their school from Firestore.
 */
export async function addTeacher(name: string, schoolId: string, _headteacherId: string): Promise<CreateTeacherResult> {
  const trimmedName = name.trim();
  if (!trimmedName || !schoolId) {
    throw new Error('Name and schoolId are required to add a teacher.');
  }

  if (!auth.currentUser) {
    throw new Error('Sign in required.');
  }

  try {
    const res = await createSchoolTeacherCallable({ name: trimmedName });
    const data = res.data as CreateTeacherResult;
    if (!data?.uid || !data.username || !data.temporaryPassword) {
      throw new Error('Invalid response from createSchoolTeacher.');
    }
    return data;
  } catch (error) {
    console.error('userService.addTeacher failed:', error);
    throw new Error('Failed to add teacher.');
  }
}

/**
 * Removes a teacher: Cloud Function deletes Auth user, cohort unassign, and Firestore user doc.
 */
export async function deleteTeacher(
  teacherId: string,
  options?: { successorTeacherUid?: string | null }
): Promise<void> {
  const id = teacherId?.trim();
  if (!id) throw new Error('teacherId is required.');

  const succ = typeof options?.successorTeacherUid === 'string' ? options.successorTeacherUid.trim() : '';
  try {
    await deleteSchoolTeacherCallable({
      teacherUid: id,
      ...(succ ? { successorTeacherUid: succ } : {}),
    });
  } catch (error) {
    console.error('userService.deleteTeacher failed:', error);
    throw new Error('Failed to remove teacher.');
  }
}
