import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  limit,
  writeBatch,
  deleteField,
  setDoc,
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { normalizePortalLookupKey } from '../utils/accessLookupKeys';
import {
  DEFAULT_CIRCUIT_ID,
  DEFAULT_DISTRICT_ID,
  DEFAULT_SCHOOL_ID,
  DEFAULT_SCHOOL_NAME,
  schoolById,
} from '../config/organizationDefaults';
import type { Student } from '../types/domain';

export type { Student };

/** Firestore create payload: same as {@link Student} but `id` is assigned by the server. */
export type AddStudentInput = Omit<Student, 'id'>;

/**
 * Saves a new student to the Firestore "students" collection.
 * @param studentData The student data to save (onboarding fields `cohortId`, `numericGradeLevel`, `enrollmentStatus`, `primaryLanguage`, `officialSenStatus`, `dataProcessingConsent` are optional; `enrollmentStatus` defaults to `active`). When `numericGradeLevel` is a finite number > 0 it is denormalized onto the document for AI routing.
 * @returns The generated document ID, or null if an error occurred.
 */
export const addStudent = async (studentData: AddStudentInput): Promise<string | null> => {
  try {
    const schoolId = studentData.schoolId ?? DEFAULT_SCHOOL_ID;
    const meta = schoolById(schoolId);
    const now = Date.now();
    const enrollmentStatus = studentData.enrollmentStatus ?? 'active';
    const payload: Record<string, unknown> = {
      name: studentData.name,
      grade: studentData.grade,
      districtId: studentData.districtId ?? DEFAULT_DISTRICT_ID,
      schoolId,
      schoolName: studentData.schoolName ?? meta?.name ?? DEFAULT_SCHOOL_NAME,
      circuitId: studentData.circuitId ?? meta?.circuitId ?? DEFAULT_CIRCUIT_ID,
      enrollmentStatus,
      updatedAt: now,
    };
    if (studentData.cohortId !== undefined) payload.cohortId = studentData.cohortId;
    const ngl = studentData.numericGradeLevel;
    if (typeof ngl === 'number' && Number.isFinite(ngl) && ngl > 0) payload.numericGradeLevel = ngl;
    if (studentData.primaryLanguage !== undefined) payload.primaryLanguage = studentData.primaryLanguage;
    if (studentData.officialSenStatus !== undefined) payload.officialSenStatus = studentData.officialSenStatus;
    if (studentData.guardianPhone !== undefined) payload.guardianPhone = studentData.guardianPhone;
    if (studentData.guardianLanguage !== undefined) payload.guardianLanguage = studentData.guardianLanguage;
    if (studentData.whatsappOptIn !== undefined) payload.whatsappOptIn = studentData.whatsappOptIn;
    if (studentData.consentRecordedAt !== undefined) payload.consentRecordedAt = studentData.consentRecordedAt;
    if (studentData.portalAccessCode !== undefined) payload.portalAccessCode = studentData.portalAccessCode;
    if (studentData.trainingDataOptIn !== undefined) payload.trainingDataOptIn = studentData.trainingDataOptIn;
    if (studentData.dataProcessingConsent !== undefined) payload.dataProcessingConsent = studentData.dataProcessingConsent;
    const docRef = await addDoc(collection(db, 'students'), payload as Omit<Student, 'id'>);
    return docRef.id;
  } catch (error) {
    console.error('Error adding student document: ', error);
    return null;
  }
};

/**
 * Retrieves all students from the Firestore "students" collection.
 * @returns Student rows (may include `cohortId` when provisioned).
 */
export const getStudents = async (): Promise<Student[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'students'));
    const students: Student[] = [];
    querySnapshot.forEach((doc) => {
      students.push({ id: doc.id, ...doc.data() } as Student);
    });
    return students;
  } catch (error) {
    console.error('Error fetching students: ', error);
    return [];
  }
};

/**
 * Retrieves students for a specific school.
 */
export const getStudentsBySchool = async (schoolId: string): Promise<Student[]> => {
  try {
    const q = query(collection(db, 'students'), where('schoolId', '==', schoolId));
    const querySnapshot = await getDocs(q);
    const students: Student[] = [];
    querySnapshot.forEach((doc) => {
      students.push({ id: doc.id, ...doc.data() } as Student);
    });
    return students;
  } catch (error) {
    console.error('Error fetching students by school: ', error);
    return [];
  }
};

/**
 * Retrieves students for a list of cohort IDs.
 */
export const getStudentsByCohorts = async (cohortIds: string[]): Promise<Student[]> => {
  if (!cohortIds || cohortIds.length === 0) return [];
  try {
    // Firestore 'in' queries support up to 10 items.
    // If a teacher has more than 10 cohorts, we need to chunk the queries.
    const students: Student[] = [];
    
    // Chunk cohortIds into arrays of 10
    const chunks = [];
    for (let i = 0; i < cohortIds.length; i += 10) {
      chunks.push(cohortIds.slice(i, i + 10));
    }
    
    for (const chunk of chunks) {
      const q = query(collection(db, 'students'), where('cohortId', 'in', chunk));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        students.push({ id: doc.id, ...doc.data() } as Student);
      });
    }
    
    return students;
  } catch (error) {
    console.error('Error fetching students by cohorts: ', error);
    return [];
  }
};

/**
 * Retrieves a single student by ID from the Firestore "students" collection.
 * @param studentId The ID of the student.
 * @returns The Student object or null if not found.
 */
export const getStudent = async (studentId: string): Promise<Student | null> => {
  try {
    const docRef = doc(db, 'students', studentId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Student;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching student: ', error);
    return null;
  }
};

function generatePortalSessionToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export const updateStudent = async (studentId: string, updates: Partial<Student>): Promise<void> => {
  const { id: _id, portalAccessCode: portalPatch, ...rest } = updates as Student & { id?: string };
  const patch: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rest)) {
    if (v !== undefined) patch[k] = v;
  }

  if (portalPatch !== undefined) {
    const prevSnap = await getDoc(doc(db, 'students', studentId));
    const prev = prevSnap.data() as Record<string, unknown> | undefined;
    const oldCodeRaw = typeof prev?.portalAccessCode === 'string' ? prev.portalAccessCode : '';
    const oldKey = oldCodeRaw ? normalizePortalLookupKey(oldCodeRaw) : '';

    const newKey =
      typeof portalPatch === 'string' && portalPatch.trim()
        ? normalizePortalLookupKey(portalPatch)
        : '';

    const batch = writeBatch(db);
    if (oldKey) {
      batch.delete(doc(db, 'portalLookups', oldKey));
    }

    if (newKey) {
      const portalSessionToken = generatePortalSessionToken();
      patch.portalAccessCode = newKey;
      patch.portalSessionToken = portalSessionToken;
      batch.set(doc(db, 'portalLookups', newKey), { studentId, portalSessionToken });
    } else {
      patch.portalAccessCode = '';
      patch.portalSessionToken = deleteField();
    }

    patch.updatedAt = Date.now();
    batch.update(doc(db, 'students', studentId), patch);
    await batch.commit();
    return;
  }

  if (Object.keys(patch).length === 0) return;
  patch.updatedAt = Date.now();
  await updateDoc(doc(db, 'students', studentId), patch);
};

/**
 * Student portal entry: resolves code via `portalLookups`, then establishes an anonymous Auth session
 * whose user doc carries `portalStudentId` + `portalSessionToken` for tight Firestore rules.
 */
export const getStudentByPortalCode = async (code: string): Promise<Student | null> => {
  const normalized = normalizePortalLookupKey(code);
  if (normalized.length < 4) return null;
  try {
    const lookupSnap = await getDoc(doc(db, 'portalLookups', normalized));
    if (!lookupSnap.exists()) return null;
    const raw = lookupSnap.data() as Record<string, unknown>;
    const sid = typeof raw.studentId === 'string' ? raw.studentId : '';
    const portalSessionToken = typeof raw.portalSessionToken === 'string' ? raw.portalSessionToken : '';
    if (!sid || !portalSessionToken) return null;

    const cred = await signInAnonymously(auth);
    const uid = cred.user.uid;
    await setDoc(
      doc(db, 'users', uid),
      {
        role: 'student_portal',
        portalStudentId: sid,
        portalSessionToken,
        name: 'Student',
      },
      { merge: true }
    );

    const stSnap = await getDoc(doc(db, 'students', sid));
    if (!stSnap.exists()) return null;
    return { id: stSnap.id, ...stSnap.data() } as Student;
  } catch (e) {
    console.error('getStudentByPortalCode', e);
    return null;
  }
};

export function generatePortalAccessCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}
