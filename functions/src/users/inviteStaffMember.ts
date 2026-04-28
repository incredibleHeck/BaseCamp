import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth, type UserRecord } from 'firebase-admin/auth';
import { FieldValue, getFirestore, type Firestore } from 'firebase-admin/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import * as logger from 'firebase-functions/logger';
import { sendTransactionalEmail, transactionalFromHeader } from '../managedEmail.js';

const REGION = process.env.FUNCTIONS_REGION || 'europe-west1';

const resendApiKey = defineSecret('RESEND_API_KEY');

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
  return undefined;
}

function orgIdFromSchoolData(schoolData: Record<string, unknown> | undefined): string | undefined {
  if (!schoolData) return undefined;
  if (typeof schoolData.organizationId === 'string' && schoolData.organizationId.trim()) {
    return schoolData.organizationId.trim();
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

async function resolveOrganizationDisplayName(
  db: Firestore,
  orgId: string | undefined,
  schoolData: Record<string, unknown> | undefined
): Promise<string> {
  if (orgId) {
    const orgSnap = await db.collection('organizations').doc(orgId).get();
    if (orgSnap.exists) {
      const d = orgSnap.data() as Record<string, unknown> | undefined;
      const n = d && typeof d.name === 'string' ? d.name.trim() : '';
      if (n) return n;
    }
  }
  const schoolName =
    schoolData && typeof schoolData.name === 'string' ? schoolData.name.trim() : '';
  if (schoolName) return schoolName;
  return 'your organization';
}

function roleLabel(role: InvitedRole): string {
  switch (role) {
    case 'org_admin':
      return 'Organization administrator';
    case 'headteacher':
      return 'Headteacher';
    case 'teacher':
      return 'Teacher';
    default:
      return 'Staff';
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildStaffInviteEmail(args: {
  roleLabel: string;
  organizationDisplayName: string;
  schoolName: string;
  inviteLink: string;
}): { subject: string; html: string; text: string } {
  const { roleLabel: role, organizationDisplayName, schoolName, inviteLink } = args;
  const subject = `You have been invited to join BaseCamp [${organizationDisplayName}]`;

  const safeOrg = escapeHtml(organizationDisplayName);
  const safeSchool = escapeHtml(schoolName);
  const safeRole = escapeHtml(role);

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f4f4f5;color:#18181b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:12px;padding:32px 28px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <tr><td style="font-size:18px;font-weight:600;color:#4f46e5;padding-bottom:16px;">BaseCamp</td></tr>
          <tr><td style="font-size:16px;line-height:1.55;padding-bottom:12px;">Hello,</td></tr>
          <tr><td style="font-size:16px;line-height:1.55;padding-bottom:16px;">
            You have been invited to join BaseCamp as a <strong>${safeRole}</strong>. You have been added to the workspace for <strong>${safeSchool}</strong> within <strong>${safeOrg}</strong>.
          </td></tr>
          <tr><td style="padding:8px 0 24px;">
            <a href="${inviteLink}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:8px;">Click here to set your password and log in</a>
          </td></tr>
          <tr><td style="font-size:13px;line-height:1.5;color:#71717a;">
            If the button does not work, copy and paste this link into your browser (link expires for security; request a new invite if needed).
          </td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    'Hello,',
    '',
    `You have been invited to join BaseCamp as a ${role}. You have been added to the workspace for ${schoolName} within ${organizationDisplayName}.`,
    '',
    'Set your password and log in:',
    inviteLink,
    '',
    '— BaseCamp',
  ].join('\n');

  return { subject, html, text };
}

/**
 * super_admin: any existing targetSchoolId; may invite org_admin (Sprint 2 will extend org-admin invite policy).
 * org_admin / school_admin: same organization as the branch; may invite headteacher or teacher to any branch in that org.
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

  if (role === 'org_admin' || role === 'school_admin') {
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
  targetRole: InvitedRole,
  organizationId: string | undefined
): Record<string, unknown> {
  const existing: Record<string, unknown> = {
    ...(userRecord.customClaims as Record<string, unknown> | null | undefined),
  };
  existing.schoolId = targetSchoolId;
  existing.role = targetRole;
  if (organizationId) {
    existing.organizationId = organizationId;
  } else {
    delete existing.organizationId;
  }
  delete existing.districtId;
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

function resolveResendApiKey(): string {
  const fromSecret = resendApiKey.value();
  if (typeof fromSecret === 'string' && fromSecret.trim()) return fromSecret.trim();
  const fromEnv = process.env.RESEND_API_KEY;
  if (typeof fromEnv === 'string' && fromEnv.trim()) return fromEnv.trim();
  return '';
}

export const inviteStaffMember = onCall({ region: REGION, secrets: [resendApiKey] }, async (request) => {
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

  const merged = mergeClaims(userRecord, targetSchoolId, targetRole, orgIdFromSchool);
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
  const organizationDisplayName = await resolveOrganizationDisplayName(db, orgIdFromSchool, schoolData);
  const schoolName =
    schoolData && typeof schoolData.name === 'string' && schoolData.name.trim()
      ? schoolData.name.trim()
      : 'your school';
  const { subject, html, text } = buildStaffInviteEmail({
    roleLabel: roleLabel(targetRole),
    organizationDisplayName,
    schoolName,
    inviteLink,
  });

  const apiKey = resolveResendApiKey();
  const from = transactionalFromHeader();

  try {
    const result = await sendTransactionalEmail({
      to: email,
      subject,
      html,
      text,
      apiKey,
      from,
    });
    logger.info('inviteStaffMember: invite email sent', {
      to: email,
      linkLength: inviteLink.length,
      resendId: result.id,
    });
    return { ok: true, uid };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error('inviteStaffMember: email send failed', {
      error: msg,
      to: email,
      linkLength: inviteLink.length,
    });
    return {
      ok: true,
      uid,
      warning: 'Email failed to send, manual link required',
    };
  }
});
