import { addDoc, collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { School } from '../types/domain';

export type { School };

const SCHOOLS_COLLECTION = 'schools';

function schoolFromFirestoreDoc(docId: string, data: Record<string, unknown>): School | null {
  const organizationId = typeof data.organizationId === 'string' ? data.organizationId.trim() : undefined;
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  if (!organizationId || !name) return null;
  return {
    id: docId,
    organizationId,
    circuitId: typeof data.circuitId === 'string' ? data.circuitId.trim() : undefined,
    name,
    region: typeof data.region === 'string' && data.region.trim() ? data.region.trim() : undefined,
    academicYearLabel:
      typeof data.academicYearLabel === 'string' && data.academicYearLabel.trim()
        ? data.academicYearLabel.trim()
        : undefined,
    currentTerm:
      typeof data.currentTerm === 'string' && data.currentTerm.trim() ? data.currentTerm.trim() : undefined,
    updatedAt:
      typeof data.updatedAt === 'number' && Number.isFinite(data.updatedAt) ? data.updatedAt : undefined,
  };
}

/**
 * Load a single school document by Firestore document id (campus branch).
 *
 * Alias for tooling / UI copy that calls this `getSchoolById`.
 */
export const getSchoolById = async (id: string): Promise<School | null> => getSchool(id);

/**
 * Load a single school document by Firestore document id.
 */
export async function getSchool(id: string): Promise<School | null> {
  const trimmed = id?.trim();
  if (!trimmed) return null;
  try {
    const docRef = doc(db, SCHOOLS_COLLECTION, trimmed);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return schoolFromFirestoreDoc(snap.id, snap.data() as Record<string, unknown>);
  } catch (error) {
    console.error('schoolService.getSchool failed:', error);
    return null;
  }
}

/**
 * Branches (Firestore `schools` docs) in a school-network scope.
 * B2B canonical field on documents is **`organizationId`**.
 */
export async function getSchoolsInOrganization(organizationId: string): Promise<School[]> {
  const trimmed = organizationId?.trim();
  if (!trimmed) return [];
  try {
    const snap = await getDocs(query(collection(db, SCHOOLS_COLLECTION), where('organizationId', '==', trimmed)));
    const out: School[] = [];
    snap.forEach((d) => {
      const row = schoolFromFirestoreDoc(d.id, d.data() as Record<string, unknown>);
      if (row) out.push(row);
    });
    return out;
  } catch (error) {
    const code =
      error && typeof error === 'object' && 'code' in error
        ? String((error as { code: unknown }).code)
        : '';
    console.error(
      'schoolService.getSchoolsInOrganization failed:',
      code === 'permission-denied'
        ? 'permission-denied (check Firestore rules and users/{uid}.organizationId vs schools.organizationId)'
        : error
    );
    return [];
  }
}

/** Preferred alias: load branches for a private school network / org id. */
export const getSchoolsByOrganization = getSchoolsInOrganization;

/**
 * All branches in Firestore `schools` (super_admin / platform-wide directory only).
 */
export async function getAllSchools(): Promise<School[]> {
  try {
    const snap = await getDocs(collection(db, SCHOOLS_COLLECTION));
    const out: School[] = [];
    snap.forEach((d) => {
      const row = schoolFromFirestoreDoc(d.id, d.data() as Record<string, unknown>);
      if (row) out.push(row);
    });
    return out;
  } catch (error) {
    console.error('schoolService.getAllSchools failed:', error);
    return [];
  }
}

/**
 * Creates a school/branch document in Firestore `schools`. Returns new document id or null on failure.
 */
export async function createSchoolBranch(
  data: Omit<School, 'id' | 'updatedAt'>
): Promise<string | null> {
  const organizationId = data.organizationId?.trim();
  const name = data.name?.trim();
  if (!organizationId || !name) return null;

  try {
    const docRef = await addDoc(collection(db, SCHOOLS_COLLECTION), {
      organizationId,
      name,
      updatedAt: Date.now(),
      ...(data.circuitId?.trim() ? { circuitId: data.circuitId.trim() } : {}),
      ...(data.region?.trim() ? { region: data.region.trim() } : {}),
      ...(data.academicYearLabel?.trim() ? { academicYearLabel: data.academicYearLabel.trim() } : {}),
      ...(data.currentTerm?.trim() ? { currentTerm: data.currentTerm.trim() } : {}),
      ...(data.curriculumType ? { curriculumType: data.curriculumType } : {}),
      ...(data.schoolType ? { schoolType: data.schoolType } : {}),
    });
    return docRef.id;
  } catch (error) {
    console.error('schoolService.createSchoolBranch failed:', error);
    return null;
  }
}

/** @deprecated use getSchoolsInOrganization */
export const getSchoolsInJurisdiction = getSchoolsInOrganization;
/** @deprecated */
export const getSchoolsByDistrict = getSchoolsInOrganization;
