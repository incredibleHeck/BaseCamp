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
import { chunkIds, getStaffAccessScope } from './staffFirestoreScope';
import { normalizePortalLookupKey } from '../utils/accessLookupKeys';
import {
  DEFAULT_CIRCUIT_ID,
  DEFAULT_ORGANIZATION_ID,
  DEFAULT_SCHOOL_ID,
  DEFAULT_SCHOOL_NAME,
  schoolById,
} from '../config/organizationDefaults';
import type { Student, Cohort } from '../types/domain';

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
    const org =
      studentData.organizationId ?? DEFAULT_ORGANIZATION_ID;
    const payload: Record<string, unknown> = {
      name: studentData.name,
      grade: studentData.grade,
      organizationId: org,
      schoolId,
      schoolName: studentData.schoolName ?? meta?.name ?? DEFAULT_SCHOOL_NAME,
      circuitId: studentData.circuitId ?? meta?.circuitId ?? DEFAULT_CIRCUIT_ID,
      enrollmentStatus,
      updatedAt: now,
    };
    if (studentData.cohortId !== undefined) payload.cohortId = studentData.cohortId;
    const cid = typeof studentData.cohortId === 'string' ? studentData.cohortId.trim() : '';
    if (cid) {
      try {
        const cohortSnap = await getDoc(doc(db, 'cohorts', cid));
        const cohortData = cohortSnap.data() as Record<string, unknown> | undefined;
        const fromList = cohortData?.assignedTeacherIds;
        let primaryTeacher: string | undefined;
        if (Array.isArray(fromList)) {
          const first = fromList.find((x): x is string => typeof x === 'string' && x.trim().length > 0);
          if (first) primaryTeacher = first.trim();
        }
        if (!primaryTeacher) {
          const rawTid = cohortData?.teacherId;
          if (typeof rawTid === 'string' && rawTid.trim()) primaryTeacher = rawTid.trim();
        }
        if (primaryTeacher) payload.cohortTeacherId = primaryTeacher;
      } catch {
        /* cohort read may fail offline; rules still allow via cohortId path when possible */
      }
    }
    if (studentData.cohortTeacherId !== undefined && payload.cohortTeacherId === undefined) {
      const t = studentData.cohortTeacherId.trim();
      if (t) payload.cohortTeacherId = t;
    }
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
 * Retrieves students visible to the current user (scoped queries — required by Firestore rules).
 * Super admin uses a full collection read; teachers/headteachers use cohort/school filters.
 */
export const getStudents = async (): Promise<Student[]> => {
  try {
    const scope = await getStaffAccessScope();
    if (scope.kind === 'none') {
      return [];
    }
    if (scope.kind === 'full') {
      const querySnapshot = await getDocs(collection(db, 'students'));
      const students: Student[] = [];
      querySnapshot.forEach((d) => {
        students.push({ id: d.id, ...d.data() } as Student);
      });
      return students;
    }
    if (scope.kind === 'school') {
      return getStudentsBySchool(scope.schoolId);
    }
    if (scope.kind === 'cohorts') {
      return getStudentsByCohorts(scope.cohortIds);
    }
    if (scope.kind === 'schools') {
      const students: Student[] = [];
      for (const part of chunkIds(scope.schoolIds, 10)) {
        const q = query(collection(db, 'students'), where('schoolId', 'in', part));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((d) => {
          students.push({ id: d.id, ...d.data() } as Student);
        });
      }
      return students;
    }
    return [];
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
 * Move a learner to a campus cohort (or clear placement) with denormalized grade and cohortTeacherId.
 */
export const updateStudentCohortPlacement = async (studentId: string, cohort: Cohort | null): Promise<void> => {
  const sid = studentId?.trim();
  if (!sid) return;
  const ref = doc(db, 'students', sid);
  if (!cohort) {
    await updateDoc(ref, {
      cohortId: deleteField(),
      cohortTeacherId: deleteField(),
      updatedAt: Date.now(),
    });
    return;
  }
  const primaryTid = cohort.assignedTeacherIds[0]?.trim() ?? '';
  const patch: Record<string, unknown> = {
    cohortId: cohort.id,
    grade: cohort.name,
    numericGradeLevel: cohort.gradeLevel,
    updatedAt: Date.now(),
  };
  if (primaryTid) {
    patch.cohortTeacherId = primaryTid;
  } else {
    patch.cohortTeacherId = deleteField();
  }
  await updateDoc(ref, patch);
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
