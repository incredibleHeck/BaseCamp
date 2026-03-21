import { getDocs, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Assessment } from './assessmentService';
import type { Student } from './studentService';
import { getStudents } from './studentService';
import {
  AGGREGATION_MIN_N,
  DEFAULT_DISTRICT_ID,
  circuitName,
  schoolById,
} from '../config/organizationDefaults';

export interface AnalyticsScope {
  role: string;
  districtId?: string;
  circuitId?: string;
  schoolId?: string;
}

export interface LearningGapRollup {
  id: string;
  topic: string;
  subject: string;
  percentage: number;
  severity: 'critical' | 'warning' | 'monitor';
}

export interface SchoolPerformanceRow {
  id: string;
  name: string;
  studentsTracked: number;
  readinessScore: number;
  status: 'High Performing' | 'Average' | 'Needs Support';
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

function normalizeAssessment(docId: string, data: Record<string, unknown>): Assessment {
  return {
    id: docId,
    studentId: data.studentId as string,
    type: data.type as Assessment['type'],
    diagnosis: (data.diagnosis as string) ?? '',
    masteredConcepts: data.masteredConcepts as string | undefined,
    gapTags: (data.gapTags as string[]) ?? [],
    masteryTags: (data.masteryTags as string[]) ?? [],
    remedialPlan: data.remedialPlan as string | undefined,
    lessonPlan: data.lessonPlan as Assessment['lessonPlan'],
    worksheet: data.worksheet as Assessment['worksheet'],
    score: typeof data.score === 'number' ? data.score : undefined,
    term: typeof data.term === 'string' ? data.term : undefined,
    academicYear: typeof data.academicYear === 'string' ? data.academicYear : undefined,
    classLabel: typeof data.classLabel === 'string' ? data.classLabel : undefined,
    gesObjectiveId: typeof data.gesObjectiveId === 'string' ? data.gesObjectiveId : undefined,
    gesObjectiveTitle: typeof data.gesObjectiveTitle === 'string' ? data.gesObjectiveTitle : undefined,
    gesCurriculumExcerpt: typeof data.gesCurriculumExcerpt === 'string' ? data.gesCurriculumExcerpt : undefined,
    gesVerified: typeof data.gesVerified === 'boolean' ? data.gesVerified : undefined,
    playbookKey: typeof data.playbookKey === 'string' ? data.playbookKey : undefined,
    playbookTitle: typeof data.playbookTitle === 'string' ? data.playbookTitle : undefined,
    timestamp: data.timestamp as Assessment['timestamp'],
    status: (data.status as Assessment['status']) ?? 'Completed',
  };
}

export async function fetchAllAssessments(): Promise<Assessment[]> {
  try {
    const snap = await getDocs(collection(db, 'assessments'));
    const list: Assessment[] = [];
    snap.forEach((d) => list.push(normalizeAssessment(d.id, d.data() as Record<string, unknown>)));
    return list;
  } catch (e) {
    console.error('fetchAllAssessments', e);
    return [];
  }
}

function studentInScope(s: Student, scope: AnalyticsScope): boolean {
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

function latestAssessmentByStudent(assessments: Assessment[], studentIds: Set<string>): Map<string, Assessment> {
  const sorted = [...assessments].filter((a) => studentIds.has(a.studentId)).sort((a, b) => timestampMs(b.timestamp) - timestampMs(a.timestamp));
  const map = new Map<string, Assessment>();
  for (const a of sorted) {
    if (!map.has(a.studentId)) map.set(a.studentId, a);
  }
  return map;
}

function readinessFromScore(score: number | undefined): number {
  if (typeof score !== 'number' || Number.isNaN(score)) return 62;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function schoolStatus(readiness: number): SchoolPerformanceRow['status'] {
  if (readiness >= 70) return 'High Performing';
  if (readiness >= 55) return 'Average';
  return 'Needs Support';
}

/**
 * District / scoped analytics for dashboards and heatmap inputs.
 */
export async function fetchEnterpriseDashboard(scope: AnalyticsScope): Promise<{
  totalStudents: number;
  avgReadiness: number;
  atRiskCount: number;
  learningGaps: LearningGapRollup[];
  schools: SchoolPerformanceRow[];
  students: Student[];
  assessments: Assessment[];
}> {
  const [students, assessments] = await Promise.all([getStudents(), fetchAllAssessments()]);
  const scopedStudents = students.filter((s) => studentInScope(s, scope));
  const ids = new Set(scopedStudents.map((s) => s.id).filter(Boolean) as string[]);
  const latest = latestAssessmentByStudent(assessments, ids);

  let sumReadiness = 0;
  let counted = 0;
  let atRisk = 0;
  for (const sid of ids) {
    const a = latest.get(sid);
    const r = readinessFromScore(a?.score);
    sumReadiness += r;
    counted += 1;
    if (r < 50) atRisk += 1;
  }

  const avgReadiness = counted ? Math.round(sumReadiness / counted) : 0;

  // Gap tag rollup: among students with a latest assessment, count tag presence
  const tagCounts = new Map<string, { count: number; subject: string }>();
  for (const sid of ids) {
    const a = latest.get(sid);
    if (!a?.gapTags?.length) continue;
    const subject = a.type === 'Literacy' ? 'Literacy' : 'Numeracy';
    for (const tag of a.gapTags) {
      const key = `${subject}::${tag}`;
      const prev = tagCounts.get(key) ?? { count: 0, subject };
      prev.count += 1;
      tagCounts.set(key, prev);
    }
  }
  const learningGaps: LearningGapRollup[] = [...tagCounts.entries()]
    .map(([key, v], i) => {
      const topic = key.split('::')[1] ?? key;
      const pct = counted ? Math.round((v.count / counted) * 100) : 0;
      const severity: LearningGapRollup['severity'] =
        pct >= 35 ? 'critical' : pct >= 18 ? 'warning' : 'monitor';
      return {
        id: String(i + 1),
        topic,
        subject: v.subject,
        percentage: pct,
        severity,
      };
    })
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 8);

  // Schools
  const bySchool = new Map<string, { scores: number[]; name: string }>();
  for (const s of scopedStudents) {
    if (!s.id) continue;
    const sid = s.schoolId ?? 'unknown';
    const name = s.schoolName ?? schoolById(sid)?.name ?? 'School';
    const a = latest.get(s.id);
    const r = readinessFromScore(a?.score);
    const bucket = bySchool.get(sid) ?? { scores: [], name };
    bucket.scores.push(r);
    bySchool.set(sid, bucket);
  }

  const schools: SchoolPerformanceRow[] = [...bySchool.entries()].map(([id, v]) => {
    const readiness =
      v.scores.length > 0 ? Math.round(v.scores.reduce((a, b) => a + b, 0) / v.scores.length) : 55;
    return {
      id,
      name: v.name,
      studentsTracked: v.scores.length,
      readinessScore: readiness,
      status: schoolStatus(readiness),
    };
  });

  return {
    totalStudents: counted,
    avgReadiness,
    atRiskCount: atRisk,
    learningGaps,
    schools,
    students: scopedStudents,
    assessments,
  };
}

/**
 * Skill keyword match on latest assessment per student (gap tags + diagnosis).
 */
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

  const allAssessments = assessments;
  const idsAll = new Set(students.map((s) => s.id).filter(Boolean) as string[]);
  const latest = latestAssessmentByStudent(allAssessments, idsAll);

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
    const band: CircuitSkillRollup['band'] =
      pct >= 45 ? 'high' : pct >= 22 ? 'moderate' : 'low';
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
