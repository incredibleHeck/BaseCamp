import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import type { Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

const ORGS_COLLECTION = 'organizations';

export type OrganizationListItem = {
  id: string;
  name: string;
  /** ms since epoch, when known */
  createdAt?: number;
};

function createdAtToMs(data: Record<string, unknown>): number | undefined {
  const c = data.createdAt;
  if (typeof c === 'number' && Number.isFinite(c)) return c;
  if (c != null && typeof c === 'object' && 'toMillis' in c && typeof (c as Timestamp).toMillis === 'function') {
    return (c as Timestamp).toMillis();
  }
  return undefined;
}

function orgFromFirestoreDoc(docId: string, data: Record<string, unknown>): OrganizationListItem | null {
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  if (!name) return null;
  return {
    id: docId,
    name,
    createdAt: createdAtToMs(data),
  };
}

/** All school networks; super_admin directory. Sorted A–Z by name. */
export async function getAllOrganizations(): Promise<OrganizationListItem[]> {
  try {
    const snap = await getDocs(collection(db, ORGS_COLLECTION));
    const out: OrganizationListItem[] = [];
    snap.forEach((d) => {
      const row = orgFromFirestoreDoc(d.id, d.data() as Record<string, unknown>);
      if (row) out.push(row);
    });
    out.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    return out;
  } catch (error) {
    const code =
      error && typeof error === 'object' && 'code' in error
        ? String((error as { code: unknown }).code)
        : '';
    console.error(
      'organizationService.getAllOrganizations failed:',
      code === 'permission-denied'
        ? 'permission-denied (check Firestore rules and user role)'
        : error
    );
    return [];
  }
}

/** Single school network document; org_admin branding. */
export async function getOrganizationById(id: string): Promise<OrganizationListItem | null> {
  const trimmed = id?.trim();
  if (!trimmed) return null;
  try {
    const snap = await getDoc(doc(db, ORGS_COLLECTION, trimmed));
    if (!snap.exists()) return null;
    return orgFromFirestoreDoc(snap.id, snap.data() as Record<string, unknown>);
  } catch (error) {
    const code =
      error && typeof error === 'object' && 'code' in error
        ? String((error as { code: unknown }).code)
        : '';
    console.error(
      'organizationService.getOrganizationById failed:',
      code === 'permission-denied'
        ? 'permission-denied (check Firestore rules and user role)'
        : error
    );
    return null;
  }
}
