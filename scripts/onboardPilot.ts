/**
 * Pilot onboarding from CSV (Admin SDK). Creates organizations, schools, headteachers, and teachers
 * with managed pseudo-emails (same convention as Cloud Functions).
 *
 * Prerequisites:
 *   Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path.
 *
 * Usage:
 *   npx tsx scripts/onboardPilot.ts path/to/onboard.csv
 *   npx tsx scripts/onboardPilot.ts path/to/onboard.csv --dry-run
 *
 * CSV columns (header row required):
 *   organizationId,organizationName,region,schoolId,schoolName,headteacherName,headteacherUsername,teacherName,teacherUsername
 *
 * One row per teacher to onboard; repeat organization/school/headteacher columns when adding multiple teachers per school.
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomBytes } from 'node:crypto';
import { config as loadEnv } from 'dotenv';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
loadEnv({ path: resolve(process.cwd(), '.env') });

const DEFAULT_MANAGED_DOMAIN = 'basecamp.internal';

function sanitizeEmailLocalPart(raw: string): string {
  const s = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '.')
    .replace(/\.+/g, '.')
    .replace(/^\.|\.$/g, '');
  return s.slice(0, 64) || 'user';
}

function sanitizeSchoolIdForEmail(raw: string): string {
  const s = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return s.slice(0, 63) || 'school';
}

function managedEmailDomainFromEnv(): string {
  const d = process.env.MANAGED_EMAIL_DOMAIN;
  return typeof d === 'string' && d.trim().length > 0 ? d.trim().toLowerCase() : DEFAULT_MANAGED_DOMAIN;
}

function buildManagedStaffEmail(username: string, schoolId: string): string {
  const local = sanitizeEmailLocalPart(username);
  const host = `${sanitizeSchoolIdForEmail(schoolId)}.${managedEmailDomainFromEnv()}`;
  return `${local}@${host}`;
}

const DRY_RUN = process.argv.includes('--dry-run');

function parseCsv(content: string): Record<string, string>[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((h, j) => {
      row[h] = parts[j] ?? '';
    });
    rows.push(row);
  }
  return rows;
}

function randomPassword(length = 14): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  let out = '';
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

async function main() {
  const fileArg = process.argv.find((a) => a.endsWith('.csv'));
  if (!fileArg || !existsSync(fileArg)) {
    console.error('Usage: npx tsx scripts/onboardPilot.ts <file.csv> [--dry-run]');
    process.exit(1);
  }

  if (!getApps().length) {
    initializeApp();
  }

  const auth = getAuth();
  const db = getFirestore();
  const raw = readFileSync(fileArg, 'utf-8');
  const rows = parseCsv(raw);
  if (rows.length === 0) {
    console.error('No data rows in CSV.');
    process.exit(1);
  }

  const organizationsDone = new Set<string>();
  const schoolsDone = new Set<string>();
  const headDone = new Set<string>();

  for (const row of rows) {
    const organizationId = row.organizationId?.trim();
    const organizationName = row.organizationName?.trim();
    const region = row.region?.trim();
    const schoolId = row.schoolId?.trim();
    const schoolName = row.schoolName?.trim();
    const headteacherName = row.headteacherName?.trim();
    const headteacherUsername = row.headteacherUsername?.trim();
    const teacherName = row.teacherName?.trim();
    const teacherUsername = row.teacherUsername?.trim();

    if (!organizationId || !organizationName || !schoolId || !schoolName || !headteacherName || !headteacherUsername) {
      console.error('Skipping row (missing organization/school/headteacher fields):', row);
      continue;
    }

    if (!organizationsDone.has(organizationId)) {
      console.log(`${DRY_RUN ? '[dry-run] ' : ''}organization ${organizationId}`);
      if (!DRY_RUN) {
        await db.collection('organizations').doc(organizationId).set({
          name: organizationName,
          region: region || '',
          createdAt: Date.now(),
        });
      }
      organizationsDone.add(organizationId);
    }

    if (!schoolsDone.has(schoolId)) {
      console.log(`${DRY_RUN ? '[dry-run] ' : ''}school ${schoolId}`);
      if (!DRY_RUN) {
        await db.collection('schools').doc(schoolId).set({
          name: schoolName,
          organizationId,
          region: region || '',
          updatedAt: Date.now(),
        });
      }
      schoolsDone.add(schoolId);
    }

    if (!headDone.has(schoolId)) {
      const htEmail = buildManagedStaffEmail(headteacherUsername, schoolId);
      const htPassword = randomPassword(14);
      console.log(`${DRY_RUN ? '[dry-run] ' : ''}headteacher ${headteacherName} <${htEmail}>`);
      if (!DRY_RUN) {
        const htUser = await auth.createUser({
          email: htEmail,
          password: htPassword,
          displayName: headteacherName,
        });
        await db
          .collection('users')
          .doc(htUser.uid)
          .set({
            name: headteacherName,
            role: 'headteacher',
            schoolId,
            organizationId,
            username: headteacherUsername,
            email: htEmail,
            location: 'School Campus',
            createdAt: FieldValue.serverTimestamp(),
          });
        console.log(`  uid=${htUser.uid} password=${htPassword}`);
      }
      headDone.add(schoolId);
    }

    if (teacherName && teacherUsername) {
      const tEmail = buildManagedStaffEmail(teacherUsername, schoolId);
      const tPassword = randomPassword(14);
      console.log(`${DRY_RUN ? '[dry-run] ' : ''}teacher ${teacherName} <${tEmail}>`);
      if (!DRY_RUN) {
        const tUser = await auth.createUser({
          email: tEmail,
          password: tPassword,
          displayName: teacherName,
        });
        await db
          .collection('users')
          .doc(tUser.uid)
          .set({
            name: teacherName,
            role: 'teacher',
            schoolId,
            organizationId,
            username: teacherUsername,
            email: tEmail,
            location: 'School Campus',
            createdAt: FieldValue.serverTimestamp(),
          });
        console.log(`  uid=${tUser.uid} password=${tPassword}`);
      }
    }
  }

  console.log(DRY_RUN ? 'Dry run finished.' : 'Onboarding finished.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
