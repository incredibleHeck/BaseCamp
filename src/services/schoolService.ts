import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { School } from '../types/domain';

export type { School };

const SCHOOLS_COLLECTION = 'schools';

function schoolFromFirestoreDoc(docId: string, data: Record<string, unknown>): School | null {
  const districtId = typeof data.districtId === 'string' ? data.districtId.trim() : '';
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  if (!districtId || !name) return null;
  return {
    id: docId,
    districtId,
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
 * Schools in a district (matches `districtId` on the school document).
 */
export async function getSchoolsByDistrict(districtId: string): Promise<School[]> {
  const trimmed = districtId?.trim();
  if (!trimmed) return [];
  try {
    const q = query(collection(db, SCHOOLS_COLLECTION), where('districtId', '==', trimmed));
    const snap = await getDocs(q);
    const out: School[] = [];
    snap.forEach((d) => {
      const row = schoolFromFirestoreDoc(d.id, d.data() as Record<string, unknown>);
      if (row) out.push(row);
    });
    return out;
  } catch (error) {
    console.error('schoolService.getSchoolsByDistrict failed:', error);
    return [];
  }
}
