import type { Assessment, Student } from '../types/domain';
import {
  AGGREGATION_MIN_N,
  DEFAULT_DISTRICT_ID,
  circuitName,
} from '../config/organizationDefaults';
import { computeTopLearningGap, effectiveNumericScore } from '../utils/analyticsUtils';
import { fetchAllAssessments, getStudentHistory } from './assessmentService';
import { getSchoolsByDistrict } from './schoolService';
import { getStudents } from './studentService';

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
  districtIdParam: string | undefined,
  scopedStudents: Student[]
): Promise<Map<string, string>> {
  const districtIds = districtIdParam?.trim()
    ? [districtIdParam.trim()]
    : [
        ...new Set(
          scopedStudents
            .map((s) => s.districtId?.trim())
            .filter((d): d is string => Boolean(d))
        ),
      ];
  const toQuery = districtIds.length > 0 ? districtIds : [DEFAULT_DISTRICT_ID];
  const lists = await Promise.all(toQuery.map((d) => getSchoolsByDistrict(d)));
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

export interface DistrictOverviewMetrics {
  totalSchools: number;
  totalStudents: number;
  totalAssessments: number;
  activeSenFlags: number;
  districtAverageScore: number;
}

export interface SchoolMetrics {
  schoolId: string;
  schoolName: string;
  studentCount: number;
  avgScore: number;
  activeSenCount: number;
  topLearningGap: string | null;
}

export interface DistrictAnalyticsPayload {
  overview: DistrictOverviewMetrics;
  schools: SchoolMetrics[];
}

function emptyDistrictOverview(): DistrictOverviewMetrics {
  return {
    totalSchools: 0,
    totalStudents: 0,
    totalAssessments: 0,
    activeSenFlags: 0,
    districtAverageScore: 0,
  };
}

/**
 * Placeholder bundle for upcoming district rollups (keeps domain types wired into this module).
 */
export type DistrictAnalyticsJoinPreview = {
  students: Student[];
  assessments: Assessment[];
};

export interface DistrictAnalyticsOptions {
  districtId?: string;
  subject?: 'Literacy' | 'Numeracy' | 'All';
  term?: string;
}

export async function generateDistrictAnalytics(options: DistrictAnalyticsOptions = {}): Promise<DistrictAnalyticsPayload | null> {
  try {
    const { districtId, subject, term } = options;
    const students = await getStudents();
    const scopedStudents = districtId ? students.filter((s) => s.districtId === districtId) : students;
    if (scopedStudents.length === 0) {
      return { overview: emptyDistrictOverview(), schools: [] };
    }

    const histories = await Promise.all(
      scopedStudents.map((s) => (s.id?.trim() ? getStudentHistory(s.id) : Promise.resolve([] as Assessment[])))
    );

    // Apply filters to histories
    const filteredHistories = histories.map(history => {
      return history.filter(a => {
        if (subject && subject !== 'All' && a.type !== subject) return false;
        if (term && term !== 'All' && a.term !== term) return false;
        return true;
      });
    });

    let totalAssessments = 0;
    const districtScores: number[] = [];
    let activeSenFlags = 0;

    for (const history of filteredHistories) {
      totalAssessments += history.length;
      for (const a of history) {
        const v = effectiveNumericScore(a);
        if (v !== null) districtScores.push(v);
      }
    }

    for (let i = 0; i < scopedStudents.length; i++) {
      const history = filteredHistories[i];
      const latest = history[0];
      if (latest?.senWarningFlag != null) activeSenFlags += 1;
    }

    const districtAverageScore =
      districtScores.length > 0
        ? round1(districtScores.reduce((sum, x) => sum + x, 0) / districtScores.length)
        : 0;

    const bySchoolId = new Map<string, SchoolBucket>();
    for (let i = 0; i < scopedStudents.length; i++) {
      const s = scopedStudents[i];
      const history = filteredHistories[i];
      // Only include students in school buckets if they have relevant assessments?
      // Actually, we should probably include them anyway, but their avg score will be 0 if no assessments.
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

    const catalogNames = await schoolCatalogNameById(districtId, scopedStudents);

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

    const overview: DistrictOverviewMetrics = {
      totalSchools: bySchoolId.size,
      totalStudents: scopedStudents.length,
      totalAssessments,
      activeSenFlags,
      districtAverageScore,
    };

    return { overview, schools: schoolsResolved };
  } catch (error) {
    console.error('districtAnalyticsService.generateDistrictAnalytics failed:', error);
    return null;
  }
}

/** Org slice for district-level panels (heatmap, playbook lift) — not persisted. */
export interface DistrictFeatureScope {
  districtId?: string;
  circuitId?: string;
  schoolId?: string;
}

function studentInDistrictFeatureScope(s: Student, scope: DistrictFeatureScope): boolean {
  const d = scope.districtId ?? DEFAULT_DISTRICT_ID;
  if (s.districtId && s.districtId !== d) return false;
  if (scope.schoolId) {
    if (!s.schoolId || s.schoolId !== scope.schoolId) return false;
  }
  if (scope.circuitId) {
    if (!s.circuitId || s.circuitId !== scope.circuitId) return false;
  }
  return true;
}

/**
 * Students and their assessments for scoped district analytics (circuit heatmap, playbook lift).
 */
export async function fetchScopedDistrictRollupInputs(
  scope: DistrictFeatureScope
): Promise<{ students: Student[]; assessments: Assessment[] }> {
  const [students, allAssessments] = await Promise.all([getStudents(), fetchAllAssessments()]);
  const scopedStudents = students.filter((s) => studentInDistrictFeatureScope(s, scope));
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
