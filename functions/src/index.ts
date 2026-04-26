import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret } from 'firebase-functions/params';
import * as logger from 'firebase-functions/logger';
import { runAggregateCambridgeExecutive } from './aggregateCambridgeExecutive.js';
import { runWeeklyParentDigest } from './weeklyParentDigest.js';
import { buildManagedStaffEmail, generateTeacherUsername } from './managedEmail.js';
import { createOnLiveSessionConcluded } from './liveSessionConcluded.js';
import { createOnShowYourWorkVideoFinalized } from './onShowYourWorkVideoFinalized.js';

if (!getApps().length) {
  initializeApp();
}
const db = getFirestore();
const auth = getAuth();

const REGION = process.env.FUNCTIONS_REGION || 'europe-west1';

/** Optional: pin Storage trigger to the same bucket as the web app (`VITE_FIREBASE_STORAGE_BUCKET`). */
const STORAGE_BUCKET = process.env.STORAGE_BUCKET?.trim() || undefined;

const geminiApiKey = defineSecret('GEMINI_API_KEY');

/**
 * Realtime Database: when `live_sessions/{sessionId}/state/status` becomes `concluded`,
 * persist scores to `assessments` and remove the RTDB subtree.
 */
export const onLiveSessionConcluded = createOnLiveSessionConcluded(REGION);

/**
 * When a student portal "Show your work" MP4 is finalized under
 * `students/{studentId}/showYourWork/`. Requires `GEMINI_API_KEY` secret (multimodal Gemini).
 */
export const onShowYourWorkVideoFinalized = createOnShowYourWorkVideoFinalized(REGION, {
  bucket: STORAGE_BUCKET,
  geminiApiKey,
});

/**
 * Friday 16:00 Africa/Accra: weekly parent digest to `parent_digests/{studentId}`.
 * Requires secret `GEMINI_API_KEY` (see Firebase console / Secret Manager). Optional env `GEMINI_MODEL` overrides the model.
 */
export const weeklyParentDigestJob = onSchedule(
  {
    schedule: '0 16 * * 5',
    timeZone: 'Africa/Accra',
    region: REGION,
    memory: '1GiB',
    timeoutSeconds: 540,
    secrets: [geminiApiKey],
  },
  async () => {
    const key = geminiApiKey.value();
    if (!key?.trim()) {
      logger.error('weeklyParentDigestJob: GEMINI_API_KEY secret is empty');
      return;
    }
    const result = await runWeeklyParentDigest(db, key.trim());
    if (result.errors.length > 0) {
      logger.warn('weeklyParentDigestJob partial errors', { errors: result.errors });
    }
    logger.info('weeklyParentDigestJob complete', {
      studentsProcessed: result.studentsProcessed,
      studentsSkipped: result.studentsSkipped,
    });
  }
);

/**
 * Nightly (Africa/Accra): aggregate last 24h `assessments` per Cambridge/both school into
 * `aggregations/{schoolId}`. Client reads are O(1); writes are Admin-only (see firestore.rules).
 */
export const aggregateCambridgeExecutiveSummary = onSchedule(
  {
    schedule: '0 2 * * *',
    timeZone: 'Africa/Accra',
    region: REGION,
    memory: '512MiB',
    timeoutSeconds: 540,
  },
  async () => {
    const result = await runAggregateCambridgeExecutive(db);
    if (result.errors.length > 0) {
      logger.warn('aggregateCambridgeExecutiveSummary partial errors', { errors: result.errors });
    }
    logger.info('aggregateCambridgeExecutiveSummary complete', {
      schoolsProcessed: result.schoolsProcessed,
    });
  }
);

function randomPassword(length = 14): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  let out = '';
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

async function assertSuperAdmin(uid: string): Promise<void> {
  const snap = await db.collection('users').doc(uid).get();
  if (!snap.exists) {
    throw new HttpsError('permission-denied', 'No user profile.');
  }
  const data = snap.data() as Record<string, unknown>;
  if (data.role !== 'super_admin') {
    throw new HttpsError('permission-denied', 'Only super admins can manage premium claims.');
  }
}

async function assertHeadteacher(uid: string): Promise<{ schoolId: string; organizationId: string }> {
  const snap = await db.collection('users').doc(uid).get();
  if (!snap.exists) {
    throw new HttpsError('permission-denied', 'No user profile.');
  }
  const data = snap.data() as Record<string, unknown>;
  if (data.role !== 'headteacher') {
    throw new HttpsError('permission-denied', 'Only headteachers can manage school staff.');
  }
  const schoolId = typeof data.schoolId === 'string' ? data.schoolId.trim() : '';
  const organizationId =
    (typeof data.organizationId === 'string' ? data.organizationId.trim() : '') ||
    (typeof data.districtId === 'string' ? data.districtId.trim() : '');
  if (!schoolId) {
    throw new HttpsError('failed-precondition', 'Headteacher has no school assigned.');
  }
  return { schoolId, organizationId };
}

export const createSchoolTeacher = onCall(
  { region: REGION },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError('unauthenticated', 'Sign in required.');
    }

    const { name } = request.data as { name?: string };
    const trimmedName = typeof name === 'string' ? name.trim() : '';
    if (!trimmedName) {
      throw new HttpsError('invalid-argument', 'Teacher name is required.');
    }

    const { schoolId: headSchoolId, organizationId: headOrganizationId } = await assertHeadteacher(request.auth.uid);

    let username = '';
    let email = '';
    let password = '';
    let createdUid = '';

    for (let attempt = 0; attempt < 8; attempt++) {
      username = generateTeacherUsername(trimmedName, headSchoolId);
      email = buildManagedStaffEmail(username, headSchoolId);
      password = randomPassword(14);
      try {
        const userRecord = await auth.createUser({
          email,
          password,
          displayName: trimmedName,
        });
        createdUid = userRecord.uid;
        break;
      } catch (e: unknown) {
        const code = e && typeof e === 'object' && 'code' in e ? String((e as { code: unknown }).code) : '';
        logger.warn('createUser attempt failed', { attempt, code, email });
        if (code === 'auth/email-already-exists' && attempt < 7) {
          continue;
        }
        if (code === 'auth/email-already-exists') {
          throw new HttpsError('already-exists', 'Could not generate a unique username. Try again.');
        }
        throw new HttpsError('internal', 'Failed to create authentication account.');
      }
    }

    if (!createdUid) {
      throw new HttpsError('internal', 'Failed to create authentication account.');
    }

    const userPayload: Record<string, unknown> = {
      name: trimmedName,
      role: 'teacher',
      schoolId: headSchoolId,
      username,
      email,
      createdBy: request.auth.uid,
      createdAt: FieldValue.serverTimestamp(),
      location: 'School Campus',
    };
    if (headOrganizationId) {
      userPayload.organizationId = headOrganizationId;
      userPayload.districtId = headOrganizationId;
    }

    try {
      await db.collection('users').doc(createdUid).set(userPayload);
    } catch (e) {
      logger.error('Firestore user doc failed; rolling back Auth user', e);
      try {
        await auth.deleteUser(createdUid);
      } catch (rollbackErr) {
        logger.error('Rollback deleteUser failed', rollbackErr);
      }
      throw new HttpsError('internal', 'Failed to save teacher profile.');
    }

    return {
      uid: createdUid,
      username,
      email,
      temporaryPassword: password,
    };
  }
);

/**
 * Sets or clears the `premiumTier` custom claim on a Firebase Auth user. Merge-preserves
 * other custom claims. Invokable only by `super_admin` (Firestore `users/{uid}.role`).
 * The client also gates the visible Premium tier on school `curriculumType`.
 */
export const adminSetPremiumClaim = onCall(
  { region: REGION },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError('unauthenticated', 'Sign in required.');
    }

    await assertSuperAdmin(request.auth.uid);

    const { targetUid, premiumTier } = request.data as { targetUid?: string; premiumTier?: unknown };
    const tid = typeof targetUid === 'string' ? targetUid.trim() : '';
    if (!tid) {
      throw new HttpsError('invalid-argument', 'targetUid is required.');
    }
    if (typeof premiumTier !== 'boolean') {
      throw new HttpsError('invalid-argument', 'premiumTier must be a boolean.');
    }

    const userRecord = await auth.getUser(tid);
    const existing: Record<string, unknown> = { ...(userRecord.customClaims as Record<string, unknown> | null | undefined) };
    if (premiumTier) {
      existing.premiumTier = true;
    } else {
      delete existing.premiumTier;
    }
    await auth.setCustomUserClaims(tid, existing);
    return { ok: true };
  }
);

export const deleteSchoolTeacher = onCall(
  { region: REGION },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError('unauthenticated', 'Sign in required.');
    }

    const { teacherUid } = request.data as { teacherUid?: string };
    const tid = typeof teacherUid === 'string' ? teacherUid.trim() : '';
    if (!tid) {
      throw new HttpsError('invalid-argument', 'teacherUid is required.');
    }

    const { schoolId: headSchoolId } = await assertHeadteacher(request.auth.uid);

    const tSnap = await db.collection('users').doc(tid).get();
    if (!tSnap.exists) {
      throw new HttpsError('not-found', 'Teacher not found.');
    }
    const t = tSnap.data() as Record<string, unknown>;
    if (t.role !== 'teacher') {
      throw new HttpsError('invalid-argument', 'Target is not a teacher.');
    }
    if (typeof t.schoolId !== 'string' || t.schoolId !== headSchoolId) {
      throw new HttpsError('permission-denied', 'Teacher is not in your school.');
    }

    const cohortQs = await db.collection('cohorts').where('teacherId', '==', tid).get();
    if (!cohortQs.empty) {
      const batch = db.batch();
      cohortQs.forEach((d) => {
        batch.update(d.ref, { teacherId: FieldValue.delete() });
      });
      await batch.commit();
    }

    try {
      await auth.deleteUser(tid);
    } catch (e: unknown) {
      const code = e && typeof e === 'object' && 'code' in e ? String((e as { code: unknown }).code) : '';
      if (code !== 'auth/user-not-found') {
        logger.error('deleteUser failed', e);
        throw new HttpsError('internal', 'Failed to remove authentication account.');
      }
    }

    try {
      await db.collection('users').doc(tid).delete();
    } catch (e) {
      logger.error('delete teacher doc failed', e);
      throw new HttpsError('internal', 'Failed to remove teacher profile.');
    }

    return { ok: true };
  }
);

export { inviteStaffMember } from './users/inviteStaffMember.js';
export { registerOrganization } from './organizations/registerOrganization.js';
