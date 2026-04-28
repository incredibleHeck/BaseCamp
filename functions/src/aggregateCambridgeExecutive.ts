import type { Firestore } from 'firebase-admin/firestore';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { effectiveNumericScore, type AssessmentRow } from './lib/effectiveNumericScore.js';
import { topLearningGapFromAssessments } from './lib/assessmentGaps.js';

export const SUMMARY_KIND = 'cambridge_executive_summary' as const;
export const SCHEMA_VERSION = 1;

type CohortKey = string;

export type CohortWindowMetrics = {
  cohortId: CohortKey;
  assessmentCount: number;
  averageScore: number;
  assessmentsWithSenFlag: number;
  topLearningGap: string | null;
};

export type WindowOverviewMetrics = {
  assessmentCount: number;
  averageScore: number;
  assessmentsWithSenFlag: number;
  topLearningGap: string | null;
};

export type CambridgeExecutiveSummaryDoc = {
  summaryKind: typeof SUMMARY_KIND;
  schemaVersion: typeof SCHEMA_VERSION;
  schoolId: string;
  organizationId?: string;
  windowStartMs: number;
  windowEndMs: number;
  /** `FieldValue.serverTimestamp()` on write. */
  generatedAt: object;
  window: WindowOverviewMetrics;
  byCohort: CohortWindowMetrics[];
  /** Reserved for day-over-day deltas (Sprint 1.2 MVP: null). */
  deltas: null;
};

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

type RawAssessment = AssessmentRow & {
  schoolId?: unknown;
  cohortId?: unknown;
  studentId?: unknown;
  classLabel?: unknown;
  senWarningFlag?: unknown;
  updatedAt?: unknown;
};

function parseUpdatedAtMs(data: RawAssessment): number | null {
  const u = data.updatedAt;
  if (typeof u === 'number' && Number.isFinite(u)) return u;
  if (u != null && typeof u === 'object' && typeof (u as Timestamp).toMillis === 'function') {
    return (u as Timestamp).toMillis();
  }
  return null;
}

function hasSenFlag(data: RawAssessment): boolean {
  return data.senWarningFlag != null;
}

function accumulateCohortMetrics(
  cohortId: string,
  rows: RawAssessment[]
): CohortWindowMetrics {
  const scores: number[] = [];
  let sen = 0;
  for (const a of rows) {
    const v = effectiveNumericScore(a);
    if (v !== null) scores.push(v);
    if (hasSenFlag(a)) sen += 1;
  }
  const avg =
    scores.length > 0 ? round1(scores.reduce((s, x) => s + x, 0) / scores.length) : 0;
  return {
    cohortId,
    assessmentCount: rows.length,
    averageScore: avg,
    assessmentsWithSenFlag: sen,
    topLearningGap: topLearningGapFromAssessments(rows),
  };
}

export async function runAggregateCambridgeExecutive(
  db: Firestore,
  options?: { windowEndMs?: number; windowHours?: number }
): Promise<{ schoolsProcessed: number; errors: string[] }> {
  const windowEndMs = options?.windowEndMs ?? Date.now();
  const windowHours = options?.windowHours ?? 24;
  const windowStartMs = windowEndMs - windowHours * 60 * 60 * 1000;

  const schoolsSnap = await db
    .collection('schools')
    .where('curriculumType', 'in', ['cambridge', 'both'])
    .get();

  const errors: string[] = [];
  let schoolsProcessed = 0;

  for (const schoolDoc of schoolsSnap.docs) {
    const schoolId = schoolDoc.id;
    const schoolData = schoolDoc.data() as { organizationId?: string };
    const organizationIdFromSchool =
      typeof schoolData.organizationId === 'string' ? schoolData.organizationId : undefined;

    try {
      const assessmentsSnap = await db
        .collection('assessments')
        .where('schoolId', '==', schoolId)
        .where('updatedAt', '>=', windowStartMs)
        .where('updatedAt', '<=', windowEndMs)
        .orderBy('updatedAt', 'asc')
        .get();

      const byCohort = new Map<string, RawAssessment[]>();
      const flat: RawAssessment[] = [];
      for (const d of assessmentsSnap.docs) {
        const data = d.data() as RawAssessment;
        if (parseUpdatedAtMs(data) == null) continue;
        flat.push(data);
        const rawC = data.cohortId;
        const key = typeof rawC === 'string' && rawC.trim() ? rawC.trim() : '_unassigned';
        let arr = byCohort.get(key);
        if (!arr) {
          arr = [];
          byCohort.set(key, arr);
        }
        arr.push(data);
      }

      const scores: number[] = [];
      let senAll = 0;
      for (const a of flat) {
        const v = effectiveNumericScore(a);
        if (v !== null) scores.push(v);
        if (hasSenFlag(a)) senAll += 1;
      }
      const schoolAvg = scores.length > 0 ? round1(scores.reduce((s, x) => s + x, 0) / scores.length) : 0;

      const cohortRows: CohortWindowMetrics[] = [];
      for (const [cohortId, list] of byCohort) {
        cohortRows.push(accumulateCohortMetrics(cohortId, list));
      }
      cohortRows.sort((a, b) => a.cohortId.localeCompare(b.cohortId, undefined, { sensitivity: 'base' }));

      const payload: CambridgeExecutiveSummaryDoc = {
        summaryKind: SUMMARY_KIND,
        schemaVersion: SCHEMA_VERSION,
        schoolId,
        ...(organizationIdFromSchool ? { organizationId: organizationIdFromSchool } : {}),
        windowStartMs,
        windowEndMs,
        generatedAt: FieldValue.serverTimestamp(),
        window: {
          assessmentCount: flat.length,
          averageScore: schoolAvg,
          assessmentsWithSenFlag: senAll,
          topLearningGap: topLearningGapFromAssessments(flat),
        },
        byCohort: cohortRows,
        deltas: null,
      };

      await db.collection('aggregations').doc(schoolId).set(payload);
      schoolsProcessed += 1;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      logger.error('aggregateCambridgeExecutive failed for school', { schoolId, msg });
      errors.push(`${schoolId}: ${msg}`);
    }
  }

  return { schoolsProcessed, errors };
}
