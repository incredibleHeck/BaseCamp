import { collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';

import { db } from '../lib/firebase';

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

/**
 * Users in `users` with matching `districtId` and role `headteacher` (for district school directory).
 */
export async function getHeadteachersByDistrict(districtId: string): Promise<HeadteacherSummary[]> {
  const trimmed = districtId?.trim();
  if (!trimmed) return [];

  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('districtId', '==', trimmed),
      where('role', '==', 'headteacher')
    );
    const snap = await getDocs(q);
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
    console.error('userService.getHeadteachersByDistrict failed:', error);
    return [];
  }
}

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
 * Adds a new teacher to a school and generates a username.
 */
export async function addTeacher(name: string, schoolId: string, headteacherId: string): Promise<string> {
  const trimmedName = name.trim();
  if (!trimmedName || !schoolId) {
    throw new Error('Name and schoolId are required to add a teacher.');
  }

  // Generate a simple username: firstname.lastname.sch
  const nameParts = trimmedName.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/);
  const firstName = nameParts[0] || 'teacher';
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
  const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  let username = `${firstName}`;
  if (lastName) username += `.${lastName}`;
  username += `.sch${randomSuffix}`;

  try {
    await addDoc(collection(db, USERS_COLLECTION), {
      name: trimmedName,
      role: 'teacher',
      schoolId: schoolId,
      username: username,
      createdBy: headteacherId,
      createdAt: serverTimestamp(),
      location: 'School Campus', // Default location
    });

    return username;
  } catch (error) {
    console.error('userService.addTeacher failed:', error);
    throw new Error('Failed to add teacher.');
  }
}
