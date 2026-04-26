import type { Assessment, Student } from '../../types/domain';
import { AGGREGATION_MIN_N, DEFAULT_ORGANIZATION_ID, circuitName } from '../../config/organizationDefaults';
import { effectiveOrganizationId } from '../../utils/organizationScope';
import { computeTopLearningGap, effectiveNumericScore } from '../../utils/analyticsUtils';
import { fetchAllAssessments, getStudentHistory } from '../assessmentService';
import { getSchoolsInOrganization } from '../schoolService';
import { getStudents } from '../studentService';

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

const UNKNOWN_SCHOOL_KEY = 'Unknown School';

type SchoolBucket = {
  students: Student[];
  histories: Assessment[][];
};

function schoolGroupKey(student: Student): string {
  return student.schoolId?.trim() || UNKNOWN_SCHOOL_KEY;
}

/**
 * Resolve display names from the canonical `schools` collection when documents exist.
 * Falls back to denormalized `student.schoolName`, then the grouping key (often equals `schoolId`).
 * TODO: After `schools` is fully seeded and IDs on students are stable, drop the student `schoolName` fallback.
 */
async function schoolCatalogNameById(
  organizationIdParam: string | undefined,
  scopedStudents: Student[]
): Promise<Map<string, string>> {
  const organizationIds = organizationIdParam?.trim()
    ? [organizationIdParam.trim()]
    : [
        ...new Set(
          scopedStudents
            .map((s) => effectiveOrganizationId(s))
            .filter((d): d is string => Boolean(d))
        ),
      ];
  const toQuery = organizationIds.length > 0 ? organizationIds : [DEFAULT_ORGANIZATION_ID];
  const lists = await Promise.all(toQuery.map((d) => getSchoolsInOrganization(d)));
  const map = new Map<string, string>();
  for (const list of lists) {
    for (const sch of list) {
      map.set(sch.id, sch.name);
    }
  }
  return map;
}

function buildSchoolMetrics(schoolId: string, bucket: SchoolBucket): SchoolMetrics {
  const scores: number[] = [];
  for (const history of bucket.histories) {
    for (const a of history) {
      const v = effectiveNumericScore(a);
      if (v !== null) scores.push(v);
    }
  }

  const avgScore =
    scores.length > 0 ? round1(scores.reduce((sum, x) => sum + x, 0) / scores.length) : 0;

  let activeSenCount = 0;
  for (const history of bucket.histories) {
    if (history[0]?.senWarningFlag != null) activeSenCount += 1;
  }

  const topLearningGap = computeTopLearningGap(bucket.histories);

  return {
    schoolId,
    schoolName: schoolId,
    studentCount: bucket.students.length,
    avgScore,
    activeSenCount,
    topLearningGap,
  };
}

export interface NetworkOverviewMetrics {
  totalSchools: number;
  totalStudents: number;
  totalAssessments: number;
  activeSenFlags: number;
  networkAverageScore: number;
}

export interface SchoolMetrics {
  schoolId: string;
  schoolName: string;
  studentCount: number;
  avgScore: number;
  activeSenCount: number;
  topLearningGap: string | null;
}

export interface NetworkAnalyticsPayload {
  overview: NetworkOverviewMetrics;
  schools: SchoolMetrics[];
}

function emptyNetworkOverview(): NetworkOverviewMetrics {
  return {
    totalSchools: 0,
    totalStudents: 0,
    totalAssessments: 0,
    activeSenFlags: 0,
    networkAverageScore: 0,
  };
}

/**
 * Placeholder bundle for upcoming school-administrator rollups (keeps domain types wired into this module).
 */
export type NetworkAnalyticsJoinPreview = {
  students: Student[];
  assessments: Assessment[];
};

export interface NetworkAnalyticsOptions {
  /** B2B organization / school-network scope. */
  organizationId?: string;
  subject?: 'Literacy' | 'Numeracy' | 'All';
  term?: string;
}

export async function getNetworkMetrics(
  options: NetworkAnalyticsOptions = {}
): Promise<NetworkAnalyticsPayload | null> {
  try {
    const { subject, term } = options;
    const organizationId = options.organizationId;
    const students = await getStudents();
    const scopedStudents = organizationId
      ? students.filter((s) => effectiveOrganizationId(s) === organizationId)
      : students;
    if (scopedStudents.length === 0) {
      return { overview: emptyNetworkOverview(), schools: [] };
    }

    const histories = await Promise.all(
      scopedStudents.map((s) => (s.id?.trim() ? getStudentHistory(s.id) : Promise.resolve([] as Assessment[])))
    );

    const filteredHistories = histories.map((history) => {
      return history.filter((a) => {
        if (subject && subject !== 'All' && a.type !== subject) return false;
        if (term && term !== 'All' && a.term !== term) return false;
        return true;
      });
    });

    let totalAssessments = 0;
    const scopeScores: number[] = [];
    let activeSenFlags = 0;

    for (const history of filteredHistories) {
      totalAssessments += history.length;
      for (const a of history) {
        const v = effectiveNumericScore(a);
        if (v !== null) scopeScores.push(v);
      }
    }

    for (let i = 0; i < scopedStudents.length; i++) {
      const history = filteredHistories[i];
      const latest = history[0];
      if (latest?.senWarningFlag != null) activeSenFlags += 1;
    }

    const networkAverageScore =
      scopeScores.length > 0
        ? round1(scopeScores.reduce((sum, x) => sum + x, 0) / scopeScores.length)
        : 0;

    const bySchoolId = new Map<string, SchoolBucket>();
    for (let i = 0; i < scopedStudents.length; i++) {
      const s = scopedStudents[i];
      const history = filteredHistories[i];
      const key = schoolGroupKey(s);
      let bucket = bySchoolId.get(key);
      if (!bucket) {
        bucket = { students: [], histories: [] };
        bySchoolId.set(key, bucket);
      }
      bucket.students.push(s);
      bucket.histories.push(history);
    }

    const denormSchoolNameById = new Map<string, string>();
    for (const s of scopedStudents) {
      const sid = s.schoolId?.trim();
      if (sid && s.schoolName?.trim() && !denormSchoolNameById.has(sid)) {
        denormSchoolNameById.set(sid, s.schoolName.trim());
      }
    }

    const catalogNames = await schoolCatalogNameById(organizationId, scopedStudents);

    const schools: SchoolMetrics[] = [];
    for (const [schoolKey, bucket] of bySchoolId) {
      schools.push(buildSchoolMetrics(schoolKey, bucket));
    }

    const schoolsResolved: SchoolMetrics[] = schools.map((row) => ({
      ...row,
      schoolName:
        row.schoolId === UNKNOWN_SCHOOL_KEY
          ? UNKNOWN_SCHOOL_KEY
          : catalogNames.get(row.schoolId) ??
            denormSchoolNameById.get(row.schoolId) ??
            row.schoolName,
    }));

    schoolsResolved.sort((a, b) =>
      a.schoolName.localeCompare(b.schoolName, undefined, { sensitivity: 'base' })
    );

    const overview: NetworkOverviewMetrics = {
      totalSchools: bySchoolId.size,
      totalStudents: scopedStudents.length,
      totalAssessments,
      activeSenFlags,
      networkAverageScore,
    };

    return { overview, schools: schoolsResolved };
  } catch (error) {
    console.error('organizationAnalyticsService.getNetworkMetrics failed:', error);
    return null;
  }
}

/** @deprecated use getNetworkMetrics */
export const generateJurisdictionAnalytics = getNetworkMetrics;

/** @deprecated use getNetworkMetrics */
export const generateDistrictAnalytics = getNetworkMetrics;

/** Org / network scope for org-admin panels (heatmap, playbook lift) — not persisted. */
export interface OrganizationFeatureScope {
  organizationId?: string;
  circuitId?: string;
  schoolId?: string;
}

/** @deprecated use OrganizationFeatureScope */
export type JurisdictionFeatureScope = OrganizationFeatureScope;

function studentInOrganizationScope(s: Student, scope: OrganizationFeatureScope): boolean {
  const o = scope.organizationId ?? DEFAULT_ORGANIZATION_ID;
  const sid = effectiveOrganizationId(s);
  if (sid && sid !== o) return false;
  if (scope.schoolId) {
    if (!s.schoolId || s.schoolId !== scope.schoolId) return false;
  }
  if (scope.circuitId) {
    if (!s.circuitId || s.circuitId !== scope.circuitId) return false;
  }
  return true;
}

/**
 * Students and their assessments for scoped organization analytics (circuit heatmap, playbook lift).
 */
export async function fetchScopedJurisdictionRollupInputs(
  scope: OrganizationFeatureScope
): Promise<{ students: Student[]; assessments: Assessment[] }> {
  const [students, allAssessments] = await Promise.all([getStudents(), fetchAllAssessments()]);
  const scopedStudents = students.filter((s) => studentInOrganizationScope(s, scope));
  const ids = new Set(scopedStudents.map((s) => s.id).filter(Boolean) as string[]);
  const assessments = allAssessments.filter((a) => ids.has(a.studentId));
  return { students: scopedStudents, assessments };
}

export interface CircuitSkillRollup {
  circuitId: string;
  circuitName: string;
  studentCount: number;
  /** Share of students in circuit with recent weakness on skill (0–100), or null if suppressed */
  pctWeak: number | null;
  band: 'low' | 'moderate' | 'high' | 'suppressed';
}

function timestampMs(raw: unknown): number {
  if (typeof raw === 'number') return raw;
  if (raw && typeof (raw as { toMillis?: () => number }).toMillis === 'function') {
    return (raw as { toMillis: () => number }).toMillis();
  }
  if (raw && typeof raw === 'object' && raw !== null && 'seconds' in raw) {
    return (raw as { seconds: number }).seconds * 1000;
  }
  return 0;
}

function latestAssessmentByStudent(assessments: Assessment[], studentIds: Set<string>): Map<string, Assessment> {
  const sorted = [...assessments]
    .filter((a) => studentIds.has(a.studentId))
    .sort((a, b) => timestampMs(b.timestamp) - timestampMs(a.timestamp));
  const map = new Map<string, Assessment>();
  for (const a of sorted) {
    if (!map.has(a.studentId)) map.set(a.studentId, a);
  }
  return map;
}

function studentWeakOnSkill(a: Assessment | undefined, skillKeyword: string): boolean {
  if (!a) return false;
  const kw = skillKeyword.toLowerCase();
  const inTags = (a.gapTags ?? []).some((t) => t.toLowerCase().includes(kw));
  const inDiag = (a.diagnosis ?? '').toLowerCase().includes(kw);
  return inTags || inDiag;
}

export function buildCircuitSkillRollups(
  students: Student[],
  assessments: Assessment[],
  skillKeyword: string
): CircuitSkillRollup[] {
  const byCircuit = new Map<string, Student[]>();
  for (const s of students) {
    if (!s.id) continue;
    const cid = s.circuitId ?? 'unknown';
    const list = byCircuit.get(cid) ?? [];
    list.push(s);
    byCircuit.set(cid, list);
  }

  const idsAll = new Set(students.map((s) => s.id).filter(Boolean) as string[]);
  const latest = latestAssessmentByStudent(assessments, idsAll);

  const result: CircuitSkillRollup[] = [];
  for (const [circuitId, cohort] of byCircuit.entries()) {
    const n = cohort.length;
    if (n < AGGREGATION_MIN_N) {
      result.push({
        circuitId,
        circuitName: circuitName(circuitId === 'unknown' ? undefined : circuitId),
        studentCount: n,
        pctWeak: null,
        band: 'suppressed',
      });
      continue;
    }
    let weak = 0;
    for (const s of cohort) {
      if (!s.id) continue;
      const a = latest.get(s.id);
      if (studentWeakOnSkill(a, skillKeyword)) weak += 1;
    }
    const pct = Math.round((weak / n) * 100);
    const band: CircuitSkillRollup['band'] = pct >= 45 ? 'high' : pct >= 22 ? 'moderate' : 'low';
    result.push({
      circuitId,
      circuitName: circuitName(circuitId === 'unknown' ? undefined : circuitId),
      studentCount: n,
      pctWeak: pct,
      band,
    });
  }

  return result.sort((a, b) => (b.pctWeak ?? -1) - (a.pctWeak ?? -1));
}

export function heatmapRowsToCsv(rows: CircuitSkillRollup[], skillLabel: string): string {
  const header = ['circuitId', 'circuitName', 'studentCount', 'pctWeak', 'band', 'skill'];
  const lines = [
    header.join(','),
    ...rows.map((r) =>
      [
        r.circuitId,
        `"${r.circuitName.replace(/"/g, '""')}"`,
        r.studentCount,
        r.pctWeak === null ? '' : r.pctWeak,
        r.band,
        `"${skillLabel.replace(/"/g, '""')}"`,
      ].join(',')
    ),
  ];
  return '\uFEFF' + lines.join('\n');
}
