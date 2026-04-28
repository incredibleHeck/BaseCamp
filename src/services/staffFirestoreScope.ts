import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';

import { auth, db } from '../lib/firebase';
import { getCohortsForTeacher } from './cohortService';
import { getSchoolsInOrganization } from './schoolService';

/** Matches demo seed super-admin Auth emails (see firestore.rules.demo). */
const DEMO_SUPER_ADMIN_EMAILS = new Set(['superadmin@basecamp.com', 'super_admin@basecamp.com']);

export type StaffAccessScope =
  | { kind: 'full' }
  | { kind: 'school'; schoolId: string }
  | { kind: 'cohorts'; cohortIds: string[] }
  | { kind: 'schools'; schoolIds: string[] }
  | { kind: 'none' };

function isDemoSuperAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return DEMO_SUPER_ADMIN_EMAILS.has(email.trim().toLowerCase());
}

/**
 * Resolves how this signed-in staff user may query Firestore instructional data.
 * Unscoped collection reads fail security rules for teachers/headteachers; callers must use this for `students` / `assessments` list queries.
 */
export async function getStaffAccessScope(): Promise<StaffAccessScope> {
  const u = auth.currentUser;
  if (!u) return { kind: 'none' };

  const snap = await getDoc(doc(db, 'users', u.uid));
  if (!snap.exists()) {
    return isDemoSuperAdminEmail(u.email) ? { kind: 'full' } : { kind: 'none' };
  }

  const d = snap.data() as Record<string, unknown>;
  const role = typeof d.role === 'string' ? d.role : '';

  if (role === 'super_admin' || isDemoSuperAdminEmail(u.email)) {
    return { kind: 'full' };
  }

  if (role === 'headteacher') {
    const sid = typeof d.schoolId === 'string' ? d.schoolId.trim() : '';
    return sid ? { kind: 'school', schoolId: sid } : { kind: 'none' };
  }

  if (role === 'teacher') {
    const tid =
      (typeof d.linkedTeacherId === 'string' && d.linkedTeacherId.trim()) ||
      (typeof d.linkedProfileId === 'string' && d.linkedProfileId.trim()) ||
      u.uid;
    const cohorts = await getCohortsForTeacher(tid);
    const cohortIds = cohorts.map((c) => c.id).filter(Boolean);
    return cohortIds.length > 0 ? { kind: 'cohorts', cohortIds } : { kind: 'none' };
  }

  if (role === 'org_admin' || role === 'school_admin' || role === 'sen_coordinator') {
    const oid = typeof d.organizationId === 'string' ? d.organizationId.trim() : '';
    if (!oid) return { kind: 'none' };
    const schools = await getSchoolsInOrganization(oid);
    const schoolIds = schools.map((s) => s.id).filter(Boolean);
    return schoolIds.length > 0 ? { kind: 'schools', schoolIds } : { kind: 'none' };
  }

  return { kind: 'none' };
}

/** Firestore `in` queries allow at most 10 values. */
export function chunkIds<T>(ids: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < ids.length; i += size) {
    out.push(ids.slice(i, i + size));
  }
  return out;
}
