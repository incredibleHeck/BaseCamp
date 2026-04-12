import type { Assessment } from './assessmentService';
import { fetchAllAssessments, getStudentHistory } from './assessmentService';
import { getStudents, type Student } from './studentService';

export interface GradebookRow {
  studentId: string;
  studentName: string;
  classLabel: string;
  subject: string;
  score: number | '';
  assessmentDate: string;
  assessmentType: string;
  gesObjectiveId: string;
  term: string;
  academicYear: string;
  status: string;
  diagnosisShort: string;
}

function timestampToMs(ts: unknown): number {
  if (typeof ts === 'number') return ts;
  if (ts && typeof (ts as { toMillis?: () => number }).toMillis === 'function') {
    return (ts as { toMillis: () => number }).toMillis();
  }
  if (ts && typeof ts === 'object' && ts !== null && 'seconds' in ts) {
    return (ts as { seconds: number }).seconds * 1000;
  }
  return 0;
}

/**
 * Load all assessments and join student names for CSV export (teacher-gradebook MVP).
 */
export async function buildGradebookRows(classLabel: string): Promise<GradebookRow[]> {
  const [assessments, students] = await Promise.all([fetchAllAssessments(), getStudents()]);
  const nameById = new Map<string, string>();
  for (const s of students) {
    if (s.id) nameById.set(s.id, s.name);
  }

  const rows: GradebookRow[] = [];
  for (const assessment of assessments) {
    const data = assessment as unknown as Record<string, unknown>;
    const studentId = String(data.studentId ?? '');
    if (!studentId) continue;

    const a = data as unknown as Assessment;
    const ms = timestampToMs(a.timestamp);
    const dateStr = ms ? new Date(ms).toISOString().slice(0, 10) : '';

    rows.push({
      studentId,
      studentName: nameById.get(studentId) ?? studentId,
      classLabel,
      subject: a.type ?? '',
      score: typeof a.score === 'number' ? Math.max(0, Math.min(100, a.score)) : '',
      assessmentDate: dateStr,
      assessmentType: a.type ?? '',
      gesObjectiveId: typeof a.gesObjectiveId === 'string' ? a.gesObjectiveId : '',
      term: typeof a.term === 'string' ? a.term : '',
      academicYear: typeof a.academicYear === 'string' ? a.academicYear : '',
      status: a.status ?? '',
      diagnosisShort:
        typeof a.diagnosis === 'string'
          ? a.diagnosis.replace(/\s+/g, ' ').slice(0, 120) + (a.diagnosis.length > 120 ? '…' : '')
          : '',
    });
  }

  rows.sort((r1, r2) => {
    const n = r1.studentName.localeCompare(r2.studentName);
    if (n !== 0) return n;
    return r1.assessmentDate.localeCompare(r2.assessmentDate);
  });
  return rows;
}

const CSV_HEADERS = [
  'Student ID',
  'Student Name',
  'Class',
  'Subject',
  'Score (0-100)',
  'Assessment Date (ISO)',
  'Assessment Type',
  'GES Objective ID',
  'Term',
  'Academic Year',
  'Status',
  'Diagnosis (short)',
] as const;

export function gradebookRowsToCsv(rows: GradebookRow[]): string {
  const escape = (v: string | number) => {
    const s = String(v);
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const lines = [CSV_HEADERS.join(',')];
  for (const r of rows) {
    lines.push(
      [
        escape(r.studentId),
        escape(r.studentName),
        escape(r.classLabel),
        escape(r.subject),
        escape(r.score === '' ? '' : r.score),
        escape(r.assessmentDate),
        escape(r.assessmentType),
        escape(r.gesObjectiveId),
        escape(r.term),
        escape(r.academicYear),
        escape(r.status),
        escape(r.diagnosisShort),
      ].join(',')
    );
  }
  return lines.join('\r\n');
}

/** UTF-8 BOM for Excel-friendly CSV; triggers browser download (legacy helper). */
export function downloadGradebookCsv(filename: string, csvBody: string): void {
  void triggerClientCsvDownload(filename, csvBody);
}

// --- Class summary gradebook (one row per learner) ---

const SUMMARY_HEADERS = [
  'Student Name',
  'Student ID',
  'Class',
  'Last Numeracy Score',
  'Last Literacy Score',
  'SEN Warning Flags',
] as const;

function escapeCsvCell(value: string): string {
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function displayClassForStudent(student: Student, history: Assessment[]): string {
  const g = student.grade?.trim();
  if (g) return g;
  for (const a of history) {
    const c = a.classLabel?.trim();
    if (c) return c;
  }
  return '';
}

/** History from {@link getStudentHistory} is newest-first. */
function lastScoreForSubject(history: Assessment[], subject: 'Numeracy' | 'Literacy'): string {
  for (const a of history) {
    if (a.type === subject && typeof a.score === 'number' && Number.isFinite(a.score)) {
      return String(Math.round(Math.max(0, Math.min(100, a.score))));
    }
  }
  return '';
}

/** Distinct categories from medium/high SEN screening flags (most recent order preserved). */
function activeSenCategoriesFromHistory(history: Assessment[]): string {
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const a of history) {
    const f = a.senWarningFlag;
    if (!f?.category) continue;
    if (f.severity !== 'medium' && f.severity !== 'high') continue;
    if (seen.has(f.category)) continue;
    seen.add(f.category);
    ordered.push(f.category);
  }
  return ordered.join('; ');
}

function triggerClientCsvDownload(filename: string, csvBody: string): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const blob = new Blob([`\uFEFF${csvBody}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.setAttribute('aria-hidden', 'true');
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (e) {
    console.error('triggerClientCsvDownload', e);
    return false;
  }
}

/**
 * Client-side CSV export: one row per student with last Numeracy/Literacy scores and SEN categories.
 * @param classLabel When set, only students whose `grade` matches or who have an assessment with this `classLabel`.
 * @returns `true` if the file download was triggered successfully.
 */
export async function exportClassGradebookCsv(classLabel?: string): Promise<boolean> {
  try {
    const students = await getStudents();
    const needle = classLabel?.trim();
    const lines: string[] = [SUMMARY_HEADERS.join(',')];

    for (const s of students) {
      if (!s.id?.trim()) continue;
      const history = await getStudentHistory(s.id);

      if (needle) {
        const gradeMatch = (s.grade ?? '').trim() === needle;
        const assessmentClassMatch = history.some((a) => (a.classLabel ?? '').trim() === needle);
        if (!gradeMatch && !assessmentClassMatch) continue;
      }

      const row = [
        escapeCsvCell(s.name ?? ''),
        escapeCsvCell(s.id),
        escapeCsvCell(displayClassForStudent(s, history)),
        escapeCsvCell(lastScoreForSubject(history, 'Numeracy')),
        escapeCsvCell(lastScoreForSubject(history, 'Literacy')),
        escapeCsvCell(activeSenCategoriesFromHistory(history)),
      ];
      lines.push(row.join(','));
    }

    const csvBody = lines.join('\r\n');
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `Gradebook_${dateStr}.csv`;
    return triggerClientCsvDownload(filename, csvBody);
  } catch (error) {
    console.error('exportClassGradebookCsv failed', error);
    return false;
  }
}
