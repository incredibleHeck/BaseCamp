import {
  addDoc,
  collection,
  deleteField,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

import { db } from '../lib/firebase';
import type { Cohort } from '../types/domain';

const COHORTS_COLLECTION = 'cohorts';

/** Parse Firestore cohort payloads: prefers `assignedTeacherIds`, falls back to legacy `teacherId`. */
function normalizeAssignedTeacherIds(data: Record<string, unknown>): string[] {
  const rawList = data.assignedTeacherIds;
  if (Array.isArray(rawList)) {
    const out = rawList.filter((x): x is string => typeof x === 'string').map((s) => s.trim()).filter(Boolean);
    return [...new Set(out)];
  }
  const legacy = data.teacherId;
  if (typeof legacy === 'string' && legacy.trim()) {
    return [legacy.trim()];
  }
  return [];
}

function cohortFromDoc(docSnapId: string, schoolIdFallback: string, data: Record<string, unknown>): Cohort {
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const sidRaw = typeof data.schoolId === 'string' ? data.schoolId.trim() : schoolIdFallback;
  const gradeLevel =
    typeof data.gradeLevel === 'number' && Number.isFinite(data.gradeLevel) ? data.gradeLevel : 0;
  return {
    id: docSnapId,
    schoolId: sidRaw,
    name: name || docSnapId,
    gradeLevel,
    assignedTeacherIds: normalizeAssignedTeacherIds(data),
  };
}

/**
 * Formal cohorts for a campus — Firestore `cohorts` where `schoolId` matches (Headteacher / admin view).
 */
export async function getCohortsForCampus(schoolId: string): Promise<Cohort[]> {
  const trimmed = schoolId?.trim();
  if (!trimmed) return [];

  try {
    const q = query(collection(db, COHORTS_COLLECTION), where('schoolId', '==', trimmed));
    const snap = await getDocs(q);
    const out: Cohort[] = [];

    snap.forEach((docSnap) => {
      const data = docSnap.data() as Record<string, unknown>;
      out.push(cohortFromDoc(docSnap.id, trimmed, data));
    });

    out.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    return out;
  } catch (error) {
    console.error('cohortService.getCohortsForCampus failed:', error);
    return [];
  }
}

/** @deprecated Prefer {@link getCohortsForCampus}; kept for existing imports. */
export const getCohortsBySchool = getCohortsForCampus;

async function fetchCohortsWithLegacyTeacherField(teacherUid: string): Promise<Cohort[]> {
  const trimmed = teacherUid?.trim();
  if (!trimmed) return [];
  try {
    const q = query(collection(db, COHORTS_COLLECTION), where('teacherId', '==', trimmed));
    const snap = await getDocs(q);
    const out: Cohort[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data() as Record<string, unknown>;
      const sid = typeof data.schoolId === 'string' ? data.schoolId.trim() : '';
      out.push(cohortFromDoc(docSnap.id, sid, data));
    });
    return out;
  } catch (error) {
    console.error('cohortService.fetchCohortsWithLegacyTeacherField failed:', error);
    return [];
  }
}

async function fetchCohortsByAssignedTeacherIds(teacherUid: string): Promise<Cohort[]> {
  const trimmed = teacherUid?.trim();
  if (!trimmed) return [];

  try {
    const q = query(
      collection(db, COHORTS_COLLECTION),
      where('assignedTeacherIds', 'array-contains', trimmed)
    );
    const snap = await getDocs(q);
    const out: Cohort[] = [];

    snap.forEach((docSnap) => {
      const data = docSnap.data() as Record<string, unknown>;
      const sid = typeof data.schoolId === 'string' ? data.schoolId.trim() : '';
      out.push(cohortFromDoc(docSnap.id, sid, data));
    });

    return out;
  } catch (error) {
    console.error('cohortService.fetchCohortsByAssignedTeacherIds failed:', error);
    return [];
  }
}

/**
 * Cohorts assigned to a teacher — `assignedTeacherIds` array-contains, plus legacy `teacherId` documents.
 */
export async function getCohortsForTeacher(teacherUid: string): Promise<Cohort[]> {
  const trimmed = teacherUid?.trim();
  if (!trimmed) return [];

  try {
    const [fromArray, fromLegacy] = await Promise.all([
      fetchCohortsByAssignedTeacherIds(trimmed),
      fetchCohortsWithLegacyTeacherField(trimmed),
    ]);
    const byId = new Map<string, Cohort>();
    for (const c of fromArray) byId.set(c.id, c);
    for (const c of fromLegacy) {
      if (!byId.has(c.id)) byId.set(c.id, c);
    }
    const merged = [...byId.values()];
    merged.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    return merged;
  } catch (error) {
    console.error('cohortService.getCohortsForTeacher failed:', error);
    return [];
  }
}

/** @deprecated Prefer {@link getCohortsForTeacher}; kept for existing imports. */
export const getCohortsByTeacher = getCohortsForTeacher;

/** Replaces `assignedTeacherIds` and clears legacy `teacherId` if present. */
export async function setCohortAssignedTeacherIds(
  cohortId: string,
  teacherIds: string[]
): Promise<boolean> {
  const id = cohortId?.trim();
  if (!id) return false;

  const uniq = [...new Set(teacherIds.map((t) => t.trim()).filter(Boolean))];

  try {
    const ref = doc(db, COHORTS_COLLECTION, id);
    await updateDoc(ref, {
      assignedTeacherIds: uniq,
      teacherId: deleteField(),
    });
    return true;
  } catch (error) {
    console.error('cohortService.setCohortAssignedTeacherIds failed:', error);
    return false;
  }
}

/** Sets a single teacher on a cohort (UI convenience); stored as a one-element `assignedTeacherIds` list. */
export async function setCohortTeacherId(cohortId: string, teacherId: string | null): Promise<boolean> {
  const tid = teacherId?.trim();
  return setCohortAssignedTeacherIds(cohortId, tid ? [tid] : []);
}

export type CreateCohortInput = {
  schoolId: string;
  name: string;
  gradeLevel: number;
  assignedTeacherIds?: string[];
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

  const assignedTeacherIds = [...new Set((input.assignedTeacherIds ?? []).map((t) => t.trim()).filter(Boolean))];

  try {
    const payload: Record<string, unknown> = { schoolId, name, gradeLevel };
    if (assignedTeacherIds.length > 0) payload.assignedTeacherIds = assignedTeacherIds;

    const docRef = await addDoc(collection(db, COHORTS_COLLECTION), payload);
    return docRef.id;
  } catch (error) {
    console.error('cohortService.createCohort failed:', error);
    return null;
  }
}

const MAX_BATCH_OPS = 500;

/**
 * Swaps `oldTeacherUid` for `newTeacherUid` on every cohort in `schoolId` where the departing
 * teacher appears (including legacy `teacherId` folded into cohort reads via normalization).
 * Commits in chunked Firestore batches.
 */
export async function reassignTeacherCohorts(
  oldTeacherUid: string,
  newTeacherUid: string,
  schoolId: string
): Promise<boolean> {
  const oldId = oldTeacherUid.trim();
  const newId = newTeacherUid.trim();
  const sid = schoolId.trim();
  if (!oldId || !newId || oldId === newId || !sid) return false;

  try {
    const campus = await getCohortsForCampus(sid);
    const affected = campus.filter((c) =>
      (c.assignedTeacherIds ?? []).some((x) => typeof x === 'string' && x.trim() === oldId)
    );

    const chunks: Cohort[][] = [];
    let cur: Cohort[] = [];
    for (const row of affected) {
      cur.push(row);
      if (cur.length >= MAX_BATCH_OPS) {
        chunks.push(cur);
        cur = [];
      }
    }
    if (cur.length) chunks.push(cur);

    for (const group of chunks) {
      const batch = writeBatch(db);
      for (const c of group) {
        const nextIds = [
          ...new Set(
            (c.assignedTeacherIds ?? [])
              .map((x) => (typeof x === 'string' ? x.trim() : ''))
              .filter(Boolean)
              .filter((id) => id !== oldId)
          ),
        ];
        if (!nextIds.includes(newId)) nextIds.push(newId);

        batch.update(doc(db, COHORTS_COLLECTION, c.id), {
          assignedTeacherIds: nextIds,
          teacherId: deleteField(),
        });
      }
      await batch.commit();
    }
    return true;
  } catch (error) {
    console.error('cohortService.reassignTeacherCohorts failed:', error);
    return false;
  }
}

export type UpdateCohortInput = {
  name: string;
  gradeLevel: number;
  assignedTeacherIds?: string[];
};

/**
 * Updates name, grade, and full teacher list for an existing cohort. Clears legacy `teacherId`.
 */
export async function updateCohort(cohortId: string, input: UpdateCohortInput): Promise<boolean> {
  const id = cohortId?.trim();
  if (!id) return false;
  const name = input.name?.trim();
  if (!name) return false;
  const gradeLevel = Math.round(input.gradeLevel);
  if (!Number.isFinite(gradeLevel) || gradeLevel < 1 || gradeLevel > 12) return false;

  const uniq = [...new Set((input.assignedTeacherIds ?? []).map((t) => t.trim()).filter(Boolean))];

  try {
    const ref = doc(db, COHORTS_COLLECTION, id);
    await updateDoc(ref, {
      name,
      gradeLevel,
      assignedTeacherIds: uniq,
      teacherId: deleteField(),
    });
    return true;
  } catch (error) {
    console.error('cohortService.updateCohort failed:', error);
    return false;
  }
}
