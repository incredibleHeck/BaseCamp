import { getDocs, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Assessment } from './assessmentService';
import { getStudents } from './studentService';

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
  const [snap, students] = await Promise.all([
    getDocs(collection(db, 'assessments')),
    getStudents(),
  ]);
  const nameById = new Map<string, string>();
  for (const s of students) {
    if (s.id) nameById.set(s.id, s.name);
  }

  const rows: GradebookRow[] = [];
  snap.forEach((docSnap) => {
    const data = docSnap.data() as Record<string, unknown>;
    const studentId = String(data.studentId ?? '');
    if (!studentId) return;

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
  });

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

/** UTF-8 BOM for Excel-friendly CSV */
export function downloadGradebookCsv(filename: string, csvBody: string): void {
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvBody], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
