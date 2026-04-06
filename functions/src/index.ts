import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { buildManagedStaffEmail, generateTeacherUsername } from './managedEmail.js';

if (!getApps().length) {
  initializeApp();
}
const db = getFirestore();
const auth = getAuth();

const REGION = process.env.FUNCTIONS_REGION || 'europe-west1';

function randomPassword(length = 14): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  let out = '';
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

async function assertHeadteacher(uid: string): Promise<{ schoolId: string; districtId: string }> {
  const snap = await db.collection('users').doc(uid).get();
  if (!snap.exists) {
    throw new HttpsError('permission-denied', 'No user profile.');
  }
  const data = snap.data() as Record<string, unknown>;
  if (data.role !== 'headteacher') {
    throw new HttpsError('permission-denied', 'Only headteachers can manage school staff.');
  }
  const schoolId = typeof data.schoolId === 'string' ? data.schoolId.trim() : '';
  const districtId = typeof data.districtId === 'string' ? data.districtId.trim() : '';
  if (!schoolId) {
    throw new HttpsError('failed-precondition', 'Headteacher has no school assigned.');
  }
  return { schoolId, districtId };
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

    const { schoolId: headSchoolId, districtId } = await assertHeadteacher(request.auth.uid);

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
    if (districtId) userPayload.districtId = districtId;

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
