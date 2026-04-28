import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

const REGION = process.env.FUNCTIONS_REGION || 'europe-west1';

const CURRICULUM_TYPES = ['cambridge', 'ges', 'both'] as const;
type CurriculumType = (typeof CURRICULUM_TYPES)[number];

const MAX_BRANCHES = 50;

function ensureAdminApp() {
  if (!getApps().length) {
    initializeApp();
  }
  return { db: getFirestore(), auth: getAuth() };
}

function isCurriculumType(x: string): x is CurriculumType {
  return (CURRICULUM_TYPES as readonly string[]).includes(x);
}

type RegisterPayload = {
  organizationName?: unknown;
  branches?: unknown;
};

/**
 * Self-serve B2B onboarding: creates `organizations/{id}`, one `schools/{id}` per branch,
 * updates the caller's `users/{uid}` to org_admin, and sets merged Auth custom claims.
 *
 * If the Firestore batch succeeds but `setCustomUserClaims` fails, ops may need to repair
 * claims manually (no cross-service transaction with Auth).
 */
export const registerOrganization = onCall({ region: REGION }, async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Sign in required.');
  }

  const uid = request.auth.uid;
  const { db, auth } = ensureAdminApp();

  const data = request.data as RegisterPayload;
  const orgNameRaw = typeof data.organizationName === 'string' ? data.organizationName.trim() : '';
  if (!orgNameRaw) {
    throw new HttpsError('invalid-argument', 'organizationName is required.');
  }

  if (!Array.isArray(data.branches) || data.branches.length === 0) {
    throw new HttpsError('invalid-argument', 'branches must be a non-empty array.');
  }
  if (data.branches.length > MAX_BRANCHES) {
    throw new HttpsError('invalid-argument', `At most ${MAX_BRANCHES} branches per request.`);
  }

  const normalizedBranches: { name: string; curriculumType: CurriculumType }[] = [];
  for (let i = 0; i < data.branches.length; i++) {
    const b = data.branches[i];
    if (!b || typeof b !== 'object') {
      throw new HttpsError('invalid-argument', `branches[${i}] must be an object.`);
    }
    const rec = b as Record<string, unknown>;
    const name = typeof rec.name === 'string' ? rec.name.trim() : '';
    const ctRaw = typeof rec.curriculumType === 'string' ? rec.curriculumType.trim().toLowerCase() : '';
    if (!name) {
      throw new HttpsError('invalid-argument', `branches[${i}].name is required.`);
    }
    if (!isCurriculumType(ctRaw)) {
      throw new HttpsError(
        'invalid-argument',
        `branches[${i}].curriculumType must be one of: ${CURRICULUM_TYPES.join(', ')}.`
      );
    }
    normalizedBranches.push({ name, curriculumType: ctRaw });
  }

  const userRef = db.collection('users').doc(uid);
  const userSnap = await userRef.get();
  if (userSnap.exists) {
    const u = userSnap.data() as Record<string, unknown>;
    const existingOrg = typeof u.organizationId === 'string' && u.organizationId.trim();
    if (existingOrg) {
      throw new HttpsError(
        'failed-precondition',
        'This account is already linked to an organization.'
      );
    }
  }

  const batch = db.batch();
  const orgRef = db.collection('organizations').doc();
  const organizationId = orgRef.id;

  batch.set(orgRef, {
    name: orgNameRaw,
    createdAt: FieldValue.serverTimestamp(),
    ownerId: uid,
  });

  for (const branch of normalizedBranches) {
    const schoolRef = db.collection('schools').doc();
    batch.set(schoolRef, {
      name: branch.name,
      curriculumType: branch.curriculumType,
      organizationId,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  batch.set(
    userRef,
    {
      role: 'org_admin',
      organizationId: organizationId,
      name: 'Organization Admin',
    },
    { merge: true }
  );

  try {
    await batch.commit();
  } catch (e) {
    logger.error('registerOrganization: batch.commit failed', e);
    throw new HttpsError('internal', 'Failed to provision organization.');
  }

  try {
    const userRecord = await auth.getUser(uid);
    const merged: Record<string, unknown> = {
      ...(userRecord.customClaims as Record<string, unknown> | null | undefined),
      role: 'org_admin',
      organizationId: organizationId,
    };
    delete merged.schoolId;
    delete merged.districtId;
    await auth.setCustomUserClaims(uid, merged);
  } catch (e) {
    logger.error(
      'registerOrganization: setCustomUserClaims failed after Firestore commit; repair claims manually',
      e
    );
    throw new HttpsError(
      'internal',
      'Organization created but account claims could not be updated. Contact support.'
    );
  }

  return { ok: true as const, organizationId };
});
