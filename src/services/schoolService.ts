import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { effectiveOrganizationId } from '../utils/organizationScope';
import type { School } from '../types/domain';

export type { School };

const SCHOOLS_COLLECTION = 'schools';

function schoolFromFirestoreDoc(docId: string, data: Record<string, unknown>): School | null {
  const organizationId = effectiveOrganizationId(
    data as { organizationId?: string; districtId?: string }
  );
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
 * Branches (Firestore `schools` docs) in an organization scope.
 * Queries both `organizationId` and legacy `districtId` and merges.
 */
export async function getSchoolsInOrganization(organizationId: string): Promise<School[]> {
  const trimmed = organizationId?.trim();
  if (!trimmed) return [];
  try {
    const [byOrg, byLegacy] = await Promise.all([
      getDocs(query(collection(db, SCHOOLS_COLLECTION), where('organizationId', '==', trimmed))),
      getDocs(query(collection(db, SCHOOLS_COLLECTION), where('districtId', '==', trimmed))),
    ]);
    const map = new Map<string, School>();
    for (const snap of [byOrg, byLegacy]) {
      snap.forEach((d) => {
        const row = schoolFromFirestoreDoc(d.id, d.data() as Record<string, unknown>);
        if (row) map.set(d.id, row);
      });
    }
    return [...map.values()];
  } catch (error) {
    console.error('schoolService.getSchoolsInOrganization failed:', error);
    return [];
  }
}

/** @deprecated use getSchoolsInOrganization */
export const getSchoolsInJurisdiction = getSchoolsInOrganization;
/** @deprecated */
export const getSchoolsByDistrict = getSchoolsInOrganization;
