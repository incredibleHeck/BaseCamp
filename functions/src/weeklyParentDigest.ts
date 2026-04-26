import type { Firestore } from 'firebase-admin/firestore';
import { FieldValue } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import {
  curriculumTypeFromSchool,
  generateWeeklyParentDigestEnglishServer,
} from './lib/weeklyParentDigestPrompt.js';

const DIGEST_KIND = 'weekly_parent' as const;
const SCHEMA_VERSION = 1;

/** Mon 00:00 through Fri 16:00 in the job timezone, expressed as 112h ending at `windowEndMs`. */
export const WEEK_BLOCK_MS = 112 * 60 * 60 * 1000;

const DEFAULT_MODEL = 'gemini-3-flash-preview';
const CONCURRENCY = 4;
const MAX_GEMINI_RETRIES = 2;
const RETRY_MS = 1500;

type StudentRow = {
  id: string;
  name: string;
  schoolId: string;
  enrollmentStatus?: string;
  guardianPhone?: string;
};

type AssessmentRow = {
  type: string;
  studentId: string;
  score?: number;
  gapTags?: string[];
  diagnosis?: string;
  timestamp?: unknown;
};

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function firstNameFromDisplayName(name: string): string {
  const t = name.trim();
  if (!t) return 'Student';
  const w = t.split(/\s+/)[0];
  return w && w.length > 0 ? w : 'Student';
}

function shouldSkipStudent(s: StudentRow): boolean {
  if (s.enrollmentStatus === 'inactive' || s.enrollmentStatus === 'graduated') return true;
  if (!s.guardianPhone || !String(s.guardianPhone).trim()) return true;
  return false;
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let last: unknown;
  for (let attempt = 0; attempt <= MAX_GEMINI_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      if (attempt < MAX_GEMINI_RETRIES) await sleep(RETRY_MS * (attempt + 1));
    }
  }
  throw last;
}

/**
 * Map Firestore assessment doc to prompt history row.
 */
function rowFromSnap(data: Record<string, unknown>): AssessmentRow {
  return {
    type: typeof data.type === 'string' ? data.type : 'Literacy',
    studentId: typeof data.studentId === 'string' ? data.studentId : '',
    score: typeof data.score === 'number' && Number.isFinite(data.score) ? data.score : undefined,
    gapTags: Array.isArray(data.gapTags) ? data.gapTags.filter((x: unknown) => typeof x === 'string') : undefined,
    diagnosis: typeof data.diagnosis === 'string' ? data.diagnosis : undefined,
    timestamp: data.timestamp,
  };
}

function timestampMs(ts: unknown): number {
  if (typeof ts === 'number' && Number.isFinite(ts)) return ts;
  if (ts != null && typeof ts === 'object' && 'toMillis' in ts && typeof (ts as { toMillis: () => number }).toMillis === 'function') {
    return (ts as { toMillis: () => number }).toMillis();
  }
  if (
    typeof ts === 'object' &&
    ts !== null &&
    'seconds' in (ts as object) &&
    typeof (ts as { seconds: number }).seconds === 'number'
  ) {
    return (ts as { seconds: number }).seconds * 1000;
  }
  return 0;
}

/** Recent assessments, then keep those whose timestamp falls in the window (supports number or Timestamp in Firestore). */
async function loadAssessmentsInWindow(
  db: Firestore,
  studentId: string,
  windowStartMs: number,
  windowEndMs: number
): Promise<AssessmentRow[]> {
  const snap = await db
    .collection('assessments')
    .where('studentId', '==', studentId)
    .orderBy('timestamp', 'desc')
    .limit(100)
    .get();

  const out: AssessmentRow[] = [];
  snap.forEach((d) => out.push(rowFromSnap(d.data() as Record<string, unknown>)));
  return out.filter((a) => {
    const t = timestampMs(a.timestamp);
    return t >= windowStartMs && t <= windowEndMs;
  });
}

/**
 * @param windowEndMs — typically `Date.now()` when the job runs (Friday 16:00 Accra).
 * Window = `[windowEndMs - WEEK_BLOCK_MS, windowEndMs]`.
 */
export async function runWeeklyParentDigest(
  db: Firestore,
  apiKey: string,
  options?: { windowEndMs?: number; modelName?: string }
): Promise<{ studentsProcessed: number; studentsSkipped: number; errors: string[] }> {
  const windowEndMs = options?.windowEndMs ?? Date.now();
  const windowStartMs = windowEndMs - WEEK_BLOCK_MS;
  const modelName = options?.modelName?.trim() || process.env.GEMINI_MODEL || DEFAULT_MODEL;

  const schoolSnap = await db.collection('schools').where('curriculumType', 'in', ['cambridge', 'both']).get();

  type Job = { student: StudentRow; schoolCurriculum: 'cambridge' | 'ges' | 'both' | undefined };
  const jobs: Job[] = [];

  for (const schoolDoc of schoolSnap.docs) {
    const schoolId = schoolDoc.id;
    const sdata = schoolDoc.data() as { curriculumType?: string };
    const curriculum = sdata.curriculumType;
    const schoolCurriculum =
      curriculum === 'cambridge' || curriculum === 'ges' || curriculum === 'both' ? curriculum : undefined;

    const stSnap = await db.collection('students').where('schoolId', '==', schoolId).get();
    stSnap.forEach((doc) => {
      const data = doc.data();
      const student: StudentRow = {
        id: doc.id,
        name: typeof data.name === 'string' ? data.name : 'Student',
        schoolId,
        enrollmentStatus: typeof data.enrollmentStatus === 'string' ? data.enrollmentStatus : undefined,
        guardianPhone: typeof data.guardianPhone === 'string' ? data.guardianPhone : undefined,
      };
      if (shouldSkipStudent(student)) return;
      jobs.push({ student, schoolCurriculum });
    });
  }

  const errors: string[] = [];
  let studentsProcessed = 0;
  let studentsSkipped = 0;
  const weekKey = new Date(windowEndMs).toISOString().slice(0, 10);

  async function runOne(job: Job): Promise<void> {
    const { student, schoolCurriculum } = job;
    const history = await loadAssessmentsInWindow(db, student.id, windowStartMs, windowEndMs);
    if (history.length === 0) {
      studentsSkipped += 1;
      return;
    }
    const curriculumType = curriculumTypeFromSchool(schoolCurriculum);
    const first = firstNameFromDisplayName(student.name);
    let digest: { body: string; homeActivity: string } | null = null;
    try {
      digest = await withRetry(() =>
        generateWeeklyParentDigestEnglishServer(apiKey, modelName, first, history, curriculumType)
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`${student.id}: ${msg}`);
      logger.warn('Gemini parent digest failed', { studentId: student.id, msg });
      return;
    }
    if (!digest) {
      studentsSkipped += 1;
      return;
    }
    await db
      .collection('parent_digests')
      .doc(student.id)
      .set({
        digestKind: DIGEST_KIND,
        schemaVersion: SCHEMA_VERSION,
        schoolId: student.schoolId,
        studentName: first,
        body: digest.body,
        homeActivity: digest.homeActivity,
        weekKey,
        windowStartMs,
        windowEndMs,
        generatedAt: FieldValue.serverTimestamp(),
      });
    studentsProcessed += 1;
  }

  for (let i = 0; i < jobs.length; i += CONCURRENCY) {
    const batch = jobs.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map((job) => runOne(job)));
  }
  return { studentsProcessed, studentsSkipped, errors };
}

