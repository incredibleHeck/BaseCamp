/**
 * One-off production backfill: `accessLookups` + `portalLookups` + `portalSessionToken`
 *
 * Prerequisites:
 * - Download a Firebase service account JSON (Project settings → Service accounts → Generate new private key).
 * - Set credentials before running, e.g. PowerShell:
 *     $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\serviceAccount.json"
 *   Optional: add the same variable to `.env` at the repo root (this script loads dotenv).
 *
 * Dry run (no writes):
 *     npx tsx scripts/backfillSecurityLookups.ts --dry-run
 *
 * Apply:
 *     npx tsx scripts/backfillSecurityLookups.ts
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomBytes } from 'node:crypto';
import { config as loadEnv } from 'dotenv';
import { cert, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import {
  FieldPath,
  getFirestore,
  type Firestore,
  type WriteBatch,
  type QueryDocumentSnapshot,
} from 'firebase-admin/firestore';

loadEnv({ path: resolve(process.cwd(), '.env') });

const DRY_RUN = process.argv.includes('--dry-run');
const BATCH_LIMIT = 450;

function normalizeAccessLookupKey(raw: string): string {
  return raw.trim().toLowerCase();
}

function normalizePortalLookupKey(raw: string): string {
  return raw.trim().toUpperCase();
}

function generatePortalSessionToken(): string {
  return randomBytes(24).toString('hex');
}

async function commitBatch(
  batch: WriteBatch,
  dryRun: boolean,
  label: string,
  opCount: number
): Promise<void> {
  if (opCount <= 0) return;
  if (dryRun) {
    console.log(`[dry-run] ${label}: ${opCount} write operation(s)`);
    return;
  }
  await batch.commit();
  console.log(`Committed ${label}: ${opCount} write operation(s)`);
}

function initAdmin(): void {
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  if (!credPath) {
    console.error(
      'Missing GOOGLE_APPLICATION_CREDENTIALS. Point it at your service account JSON (absolute or cwd-relative path).'
    );
    process.exit(1);
  }
  const resolved = resolve(process.cwd(), credPath);
  if (!existsSync(resolved)) {
    console.error(`Service account file not found: ${resolved}`);
    process.exit(1);
  }
  const raw = readFileSync(resolved, 'utf8');
  const serviceAccount = JSON.parse(raw) as ServiceAccount;
  initializeApp({ credential: cert(serviceAccount) });
}

async function backfillAccessLookups(db: Firestore, dryRun: boolean): Promise<void> {
  let batch = db.batch();
  let opCount = 0;
  let teachersSeen = 0;
  let lookupsWritten = 0;
  let skippedConflict = 0;
  let skippedNoKey = 0;

  const flush = async (label: string) => {
    await commitBatch(batch, dryRun, label, opCount);
    batch = db.batch();
    opCount = 0;
  };

  const roles = ['teacher', 'headteacher'] as const;

  for (const role of roles) {
    const snap = await db.collection('users').where('role', '==', role).get();
    for (const docSnap of snap.docs) {
      teachersSeen += 1;
      const uid = docSnap.id;
      const d = docSnap.data();
      const name = typeof d.name === 'string' ? d.name : '';
      const schoolId = typeof d.schoolId === 'string' ? d.schoolId : '';
      const districtId = typeof d.districtId === 'string' ? d.districtId : '';
      const email = typeof d.email === 'string' ? d.email.trim() : '';
      const username = typeof d.username === 'string' ? d.username.trim() : '';

      const keySet = new Set<string>();
      if (username) keySet.add(normalizeAccessLookupKey(username));
      if (email) keySet.add(normalizeAccessLookupKey(email));

      if (keySet.size === 0) {
        skippedNoKey += 1;
        console.warn(`[accessLookups] Skip user ${uid} (${role}): no username or email`);
        continue;
      }

      const payload = {
        profileUserId: uid,
        role,
        name,
        schoolId,
        districtId,
        email,
        username: username || email,
      };

      for (const key of keySet) {
        if (!key) continue;
        const ref = db.collection('accessLookups').doc(key);
        if (!dryRun) {
          const existing = await ref.get();
          if (existing.exists) {
            const prev = existing.data()?.profileUserId;
            if (prev && prev !== uid) {
              skippedConflict += 1;
              console.warn(
                `[accessLookups] Key "${key}" already maps to ${prev}; refusing to overwrite with ${uid}`
              );
              continue;
            }
          }
        }

        batch.set(ref, payload, { merge: true });
        opCount += 1;
        lookupsWritten += 1;

        if (opCount >= BATCH_LIMIT) {
          await flush('accessLookups');
        }
      }
    }
  }

  await flush('accessLookups-final');

  console.log(
    `[accessLookups] User docs scanned (teacher+headteacher): ${teachersSeen}, lookup writes: ${lookupsWritten}, skipped (no key): ${skippedNoKey}, skipped (key conflict): ${skippedConflict}`
  );
}

async function* paginateByDocId(
  db: Firestore,
  collectionName: string,
  pageSize: number
): AsyncGenerator<QueryDocumentSnapshot> {
  let last: QueryDocumentSnapshot | undefined;
  while (true) {
    let q = db.collection(collectionName).orderBy(FieldPath.documentId()).limit(pageSize);
    if (last) q = q.startAfter(last);
    const snap = await q.get();
    if (snap.empty) break;
    for (const d of snap.docs) yield d;
    last = snap.docs[snap.docs.length - 1];
  }
}

async function backfillPortalLookups(db: Firestore, dryRun: boolean): Promise<void> {
  let batch = db.batch();
  let opCount = 0;
  let studentsWithCode = 0;
  let portalsWritten = 0;
  let skippedConflict = 0;

  const flush = async (label: string) => {
    await commitBatch(batch, dryRun, label, opCount);
    batch = db.batch();
    opCount = 0;
  };

  for await (const docSnap of paginateByDocId(db, 'students', 400)) {
    const d = docSnap.data();
    const rawCode = d.portalAccessCode;
    if (typeof rawCode !== 'string' || rawCode.trim().length < 4) continue;

    studentsWithCode += 1;
    const studentId = docSnap.id;
    const codeKey = normalizePortalLookupKey(rawCode);
    const existingToken = typeof d.portalSessionToken === 'string' ? d.portalSessionToken.trim() : '';
    const token = existingToken || generatePortalSessionToken();

    const studentRef = docSnap.ref;
    const lookupRef = db.collection('portalLookups').doc(codeKey);

    if (!dryRun) {
      const lookupSnap = await lookupRef.get();
      if (lookupSnap.exists) {
        const prevSid = lookupSnap.data()?.studentId;
        if (prevSid && prevSid !== studentId) {
          skippedConflict += 1;
          console.warn(
            `[portalLookups] Code "${codeKey}" already tied to student ${prevSid}; skip ${studentId}`
          );
          continue;
        }
      }
    }

    batch.set(
      studentRef,
      {
        portalAccessCode: codeKey,
        portalSessionToken: token,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
    batch.set(lookupRef, { studentId, portalSessionToken: token }, { merge: true });
    opCount += 2;
    portalsWritten += 1;

    if (opCount >= BATCH_LIMIT) {
      await flush('portalLookups');
    }
  }

  await flush('portalLookups-final');

  console.log(
    `[portalLookups] Students with portal code (len≥4): ${studentsWithCode}, student+lookup pairs written: ${portalsWritten}, skipped (code conflict): ${skippedConflict}`
  );
}

async function main(): Promise<void> {
  console.log(`BaseCamp security lookups backfill — dryRun=${DRY_RUN}`);
  initAdmin();
  const db = getFirestore();

  await backfillAccessLookups(db, DRY_RUN);
  await backfillPortalLookups(db, DRY_RUN);

  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
