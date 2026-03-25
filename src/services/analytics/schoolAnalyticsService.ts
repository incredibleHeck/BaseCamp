import type { Assessment, Student } from '../../types/domain';
import { computeTopLearningGap, effectiveNumericScore } from '../../utils/analyticsUtils';
import { getStudentHistory } from '../assessmentService';
import { getStudents } from '../studentService';

function emptyOverviewMetrics(): SchoolOverviewMetrics {
  return {
    totalStudents: 0,
    totalAssessments: 0,
    activeSenFlags: 0,
    schoolAverageScore: 0,
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

const UNASSIGNED_CLASS = 'Unassigned';

type StudentWithClassFields = Student & { classLabel?: string; gradeLevel?: number };

function resolveStudentClassLabel(student: Student, history: Assessment[]): string {
  const direct = (student as StudentWithClassFields).classLabel?.trim();
  if (direct) return direct;
  const latest = history[0]?.classLabel?.trim();
  if (latest) return latest;
  const fromOlder = history.find((a) => a.classLabel?.trim())?.classLabel?.trim();
  if (fromOlder) return fromOlder;
  return UNASSIGNED_CLASS;
}

function parseGradeLevel(student: Student): number {
  const gl = (student as StudentWithClassFields).gradeLevel;
  if (typeof gl === 'number' && Number.isFinite(gl)) return gl;
  const g = student.grade?.trim();
  if (!g) return 0;
  const m = g.match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
}

type ClassBucket = {
  students: Student[];
  histories: Assessment[][];
};

function buildClassroomMetrics(classLabel: string, bucket: ClassBucket): ClassroomMetrics {
  const { students: groupStudents, histories } = bucket;

  const classScores: number[] = [];
  for (const history of histories) {
    for (const a of history) {
      const v = effectiveNumericScore(a);
      if (v !== null) classScores.push(v);
    }
  }

  const avgScore =
    classScores.length > 0
      ? round1(classScores.reduce((sum, x) => sum + x, 0) / classScores.length)
      : 0;

  let activeSenCount = 0;
  for (const history of histories) {
    if (history[0]?.senWarningFlag != null) activeSenCount += 1;
  }

  const gradeLevels = groupStudents.map((s) => parseGradeLevel(s));
  const gradeLevel =
    gradeLevels.length > 0
      ? Math.round(gradeLevels.reduce((sum, x) => sum + x, 0) / gradeLevels.length)
      : 0;

  const topLearningGap = computeTopLearningGap(histories);

  return {
    classLabel,
    gradeLevel,
    studentCount: groupStudents.length,
    avgScore,
    activeSenCount,
    topLearningGap,
  };
}

export interface SchoolOverviewMetrics {
  totalStudents: number;
  totalAssessments: number;
  activeSenFlags: number;
  schoolAverageScore: number;
}

export interface ClassroomMetrics {
  classLabel: string;
  gradeLevel: number;
  studentCount: number;
  avgScore: number;
  activeSenCount: number;
  topLearningGap: string | null;
}

export interface SchoolAnalyticsPayload {
  overview: SchoolOverviewMetrics;
  classrooms: ClassroomMetrics[];
}

/**
 * Placeholder bundle for upcoming aggregation (keeps `Assessment` / `Student` wired into this module).
 */
export type SchoolAnalyticsJoinPreview = {
  student: Student;
  assessments: Assessment[];
};

export async function generateSchoolAnalytics(schoolId?: string): Promise<SchoolAnalyticsPayload | null> {
  try {
    const students = await getStudents();
    const scopedStudents = schoolId ? students.filter((s) => s.schoolId === schoolId) : students;
    if (scopedStudents.length === 0) {
      return { overview: emptyOverviewMetrics(), classrooms: [] };
    }

    const histories = await Promise.all(
      scopedStudents.map((s) => (s.id?.trim() ? getStudentHistory(s.id) : Promise.resolve([] as Assessment[])))
    );

    let totalAssessments = 0;
    const scores: number[] = [];
    let activeSenFlags = 0;

    for (const history of histories) {
      totalAssessments += history.length;
      for (const a of history) {
        const v = effectiveNumericScore(a);
        if (v !== null) scores.push(v);
      }
    }

    for (let i = 0; i < scopedStudents.length; i++) {
      const history = histories[i];
      const latest = history[0];
      if (latest?.senWarningFlag != null) activeSenFlags += 1;
    }

    const schoolAverageScore =
      scores.length > 0 ? round1(scores.reduce((sum, x) => sum + x, 0) / scores.length) : 0;

    const overview: SchoolOverviewMetrics = {
      totalStudents: scopedStudents.length,
      totalAssessments,
      activeSenFlags,
      schoolAverageScore,
    };

    const byClassLabel = new Map<string, ClassBucket>();
    for (let i = 0; i < scopedStudents.length; i++) {
      const s = scopedStudents[i];
      const history = histories[i];
      const label = resolveStudentClassLabel(s, history);
      let bucket = byClassLabel.get(label);
      if (!bucket) {
        bucket = { students: [], histories: [] };
        byClassLabel.set(label, bucket);
      }
      bucket.students.push(s);
      bucket.histories.push(history);
    }

    const classrooms: ClassroomMetrics[] = [];
    for (const [label, bucket] of byClassLabel) {
      classrooms.push(buildClassroomMetrics(label, bucket));
    }
    classrooms.sort((a, b) => a.classLabel.localeCompare(b.classLabel, undefined, { sensitivity: 'base' }));

    return { overview, classrooms };
  } catch (error) {
    console.error('schoolAnalyticsService.generateSchoolAnalytics failed:', error);
    return null;
  }
}
