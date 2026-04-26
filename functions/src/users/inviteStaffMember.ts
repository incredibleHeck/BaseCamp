import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth, type UserRecord } from 'firebase-admin/auth';
import { FieldValue, getFirestore, type Firestore } from 'firebase-admin/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { sendInviteEmailStub } from '../lib/inviteEmailStub.js';

const REGION = process.env.FUNCTIONS_REGION || 'europe-west1';

type InvitedRole = 'org_admin' | 'headteacher' | 'teacher';

function ensureAdminApp() {
  if (!getApps().length) {
    initializeApp();
  }
  return { db: getFirestore(), auth: getAuth() };
}

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

function isInvitedRole(x: unknown): x is InvitedRole {
  return x === 'org_admin' || x === 'headteacher' || x === 'teacher';
}

function orgIdFromUserProfile(data: Record<string, unknown>): string | undefined {
  const o = data.organizationId;
  if (typeof o === 'string' && o.trim()) return o.trim();
  const d = data.districtId;
  if (typeof d === 'string' && d.trim()) return d.trim();
  return undefined;
}

function orgIdFromSchoolData(schoolData: Record<string, unknown> | undefined): string | undefined {
  if (!schoolData) return undefined;
  if (typeof schoolData.organizationId === 'string' && schoolData.organizationId.trim()) {
    return schoolData.organizationId.trim();
  }
  if (typeof schoolData.districtId === 'string' && schoolData.districtId.trim()) {
    return schoolData.districtId.trim();
  }
  return undefined;
}

async function loadUserDoc(db: Firestore, uid: string) {
  const snap = await db.collection('users').doc(uid).get();
  if (!snap.exists) {
    throw new HttpsError('permission-denied', 'No user profile.');
  }
  return snap.data() as Record<string, unknown>;
}

/**
 * super_admin: any existing targetSchoolId; may invite org_admin (Sprint 2 will extend org-admin invite policy).
 * org_admin / school_admin / district (legacy): same organization as the branch; may invite headteacher or teacher to any branch in that org.
 * headteacher: same school, may invite teacher only.
 */
async function assertCanInvite(
  inviterData: Record<string, unknown>,
  targetSchoolId: string,
  targetRole: InvitedRole,
  schoolOrgId: string | undefined
): Promise<void> {
  const role = inviterData.role;

  if (targetRole === 'org_admin') {
    if (role !== 'super_admin') {
      throw new HttpsError(
        'permission-denied',
        'Inviting organization administrators is limited to platform admins until Sprint 2.'
      );
    }
    return;
  }

  if (role === 'super_admin') {
    return;
  }

  const inviterOrgId = orgIdFromUserProfile(inviterData);

  if (role === 'org_admin' || role === 'school_admin' || role === 'district') {
    if (!schoolOrgId || !inviterOrgId || inviterOrgId !== schoolOrgId) {
      throw new HttpsError(
        'permission-denied',
        'You can only invite staff to schools in your organization.'
      );
    }
    return;
  }

  if (role === 'headteacher') {
    const sid = typeof inviterData.schoolId === 'string' ? inviterData.schoolId.trim() : '';
    if (sid !== targetSchoolId) {
      throw new HttpsError('permission-denied', 'You can only invite staff to your own school.');
    }
    if (targetRole === 'headteacher') {
      throw new HttpsError(
        'permission-denied',
        'Headteachers can only invite teachers. Ask your school administrator to invite a headteacher.'
      );
    }
    return;
  }
  throw new HttpsError('permission-denied', 'You are not allowed to send invitations.');
}

function mergeClaims(
  userRecord: UserRecord,
  targetSchoolId: string,
  targetRole: InvitedRole
): Record<string, unknown> {
  const existing: Record<string, unknown> = {
    ...(userRecord.customClaims as Record<string, unknown> | null | undefined),
  };
  existing.schoolId = targetSchoolId;
  existing.role = targetRole;
  return existing;
}

function defaultDisplayNameFromEmail(e: string): string {
  const local = e.split('@')[0]?.trim() || '';
  return local ? local.charAt(0).toUpperCase() + local.slice(1) : 'Staff';
}

/**
 * Reject if the account is already bound to a different school (Auth claims or Firestore profile).
 */
function assertNotWrongSchool(
  userRecord: UserRecord,
  profileSnap: { exists: boolean; data: () => Record<string, unknown> | undefined },
  targetSchoolId: string
): void {
  const claimSchool = (userRecord.customClaims as { schoolId?: string } | undefined)?.schoolId;
  if (typeof claimSchool === 'string' && claimSchool.trim() && claimSchool.trim() !== targetSchoolId) {
    throw new HttpsError(
      'failed-precondition',
      'This email is already associated with another school. Use a different email or ask an admin to resolve the account.'
    );
  }
  if (profileSnap.exists) {
    const d = profileSnap.data() as Record<string, unknown>;
    const fsSchool = typeof d.schoolId === 'string' ? d.schoolId.trim() : '';
    if (fsSchool && fsSchool !== targetSchoolId) {
      throw new HttpsError(
        'failed-precondition',
        'This email is already associated with another school. Use a different email or ask an admin to resolve the account.'
      );
    }
  }
}

export const inviteStaffMember = onCall({ region: REGION }, async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Sign in required.');
  }

  const { db, auth } = ensureAdminApp();
  const inviterUid = request.auth.uid;

  const raw = request.data as { email?: unknown; role?: unknown; targetSchoolId?: unknown };
  const targetSchoolId = typeof raw.targetSchoolId === 'string' ? raw.targetSchoolId.trim() : '';
  if (!targetSchoolId) {
    throw new HttpsError('invalid-argument', 'targetSchoolId is required.');
  }
  if (typeof raw.email !== 'string' || !raw.email.trim()) {
    throw new HttpsError('invalid-argument', 'email is required.');
  }
  if (!isInvitedRole(raw.role)) {
    throw new HttpsError(
      'invalid-argument',
      'role must be "org_admin", "headteacher", or "teacher".'
    );
  }
  const targetRole = raw.role;
  const email = normalizeEmail(raw.email);

  const schoolSnap = await db.collection('schools').doc(targetSchoolId).get();
  if (!schoolSnap.exists) {
    throw new HttpsError('not-found', 'School not found.');
  }
  const schoolData = schoolSnap.data() as Record<string, unknown> | undefined;
  const orgIdFromSchool = orgIdFromSchoolData(schoolData);

  const inviterData = await loadUserDoc(db, inviterUid);
  await assertCanInvite(inviterData, targetSchoolId, targetRole, orgIdFromSchool);

  let uid: string;
  let userRecord: UserRecord;

  try {
    const created = await auth.createUser({
      email,
      emailVerified: false,
      displayName: defaultDisplayNameFromEmail(email),
    });
    uid = created.uid;
    userRecord = await auth.getUser(uid);
  } catch (e: unknown) {
    const code = e && typeof e === 'object' && 'code' in e ? String((e as { code: unknown }).code) : '';
    if (code === 'auth/email-already-exists') {
      userRecord = await auth.getUserByEmail(email);
      uid = userRecord.uid;
    } else {
      const message = e instanceof Error ? e.message : String(e);
      throw new HttpsError('internal', `Failed to create or load user: ${message}`);
    }
  }

  const profileRef = db.collection('users').doc(uid);
  const profileSnap = await profileRef.get();
  assertNotWrongSchool(userRecord, profileSnap, targetSchoolId);

  const merged = mergeClaims(userRecord, targetSchoolId, targetRole);
  await auth.setCustomUserClaims(uid, merged);

  const priorName = profileSnap.exists
    ? (typeof (profileSnap.data() as Record<string, unknown>)?.name === 'string'
        ? String((profileSnap.data() as Record<string, unknown>).name)
        : null)
    : null;
  const fresh = await auth.getUser(uid);
  const name = priorName || fresh.displayName || defaultDisplayNameFromEmail(email);

  const userPayload: Record<string, unknown> = {
    name,
    email,
    role: targetRole,
    schoolId: targetSchoolId,
    location: 'School Campus',
    invitedBy: inviterUid,
    invitedAt: FieldValue.serverTimestamp(),
  };
  if (orgIdFromSchool) {
    userPayload.organizationId = orgIdFromSchool;
  }
  await profileRef.set(userPayload, { merge: true });

  const inviteLink = await auth.generatePasswordResetLink(email);
  await sendInviteEmailStub({ to: email, role: targetRole, inviteLink });

  return { ok: true, uid };
});
