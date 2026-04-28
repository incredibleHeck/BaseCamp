import type { Cohort, Student } from '../types/domain';
import { getStudentsBySchool } from '../services/studentService';
import { getCohortsForCampus } from '../services/cohortService';
import { getTeachersBySchool } from '../services/userService';

export type CampusRosterCsvRow = {
  studentName: string;
  cohortName: string;
  assignedTeachers: string;
};

function escapeCsvCell(s: string): string {
  const t = s.replace(/"/g, '""');
  if (/[",\n\r]/.test(t)) return `"${t}"`;
  return t;
}

/** UTF-8 with BOM for Excel-friendly open. */
export function buildCampusRosterCsv(rows: CampusRosterCsvRow[]): string {
  const header = ['Student name', 'Cohort name', 'Assigned teachers'];
  const lines = rows.map((r) =>
    [escapeCsvCell(r.studentName), escapeCsvCell(r.cohortName), escapeCsvCell(r.assignedTeachers)].join(',')
  );
  const bom = '\uFEFF';
  return bom + [header.join(','), ...lines].join('\r\n');
}

export function buildCampusRosterRowsForExport(
  students: Student[],
  cohortById: Map<string, Cohort>,
  teacherNameById: Map<string, string>
): CampusRosterCsvRow[] {
  return students.map((s) => {
    const cid = typeof s.cohortId === 'string' ? s.cohortId.trim() : '';
    const cohort = cid ? cohortById.get(cid) : undefined;
    const cohortName =
      cid && cohort
        ? cohort.name
        : cid
          ? '(Unknown cohort)'
          : 'Unassigned';
    const ids = cohort?.assignedTeacherIds ?? [];
    const assignedTeachers =
      ids.length > 0
        ? ids
            .map((id) => teacherNameById.get(id.trim()) ?? id.trim())
            .filter(Boolean)
            .join(', ')
        : '';
    return {
      studentName: s.name ?? '',
      cohortName,
      assignedTeachers,
    };
  });
}

export async function downloadCampusRosterCsv(schoolId: string, filenameBase = 'campus-roster'): Promise<void> {
  const sid = schoolId.trim();
  if (!sid) return;

  const [students, cohorts, teachers] = await Promise.all([
    getStudentsBySchool(sid),
    getCohortsForCampus(sid),
    getTeachersBySchool(sid),
  ]);

  const cohortById = new Map(cohorts.map((c) => [c.id, c] as const));
  const teacherNameById = new Map(teachers.map((t) => [t.id, t.name]));

  students.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', undefined, { sensitivity: 'base' }));

  const rows = buildCampusRosterRowsForExport(students, cohortById, teacherNameById);
  const csv = buildCampusRosterCsv(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filenameBase}-${sid}.csv`;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}
