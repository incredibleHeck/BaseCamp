import type { Cohort, Student } from '../types/domain';

type RowObject = Record<string, string>;

function escapeCsvCell(s: string): string {
  const t = String(s).replace(/"/g, '""');
  if (/[",\n\r]/.test(t)) return `"${t}"`;
  return t;
}

/** Local calendar date YYYY-MM-DD (export "today" in user's timezone). */
function formatLocalIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function sanitizeFilenameSegment(name: string, fallback = 'School'): string {
  const cleaned = name
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '_')
    .slice(0, 80);
  return cleaned.length > 0 ? cleaned : fallback;
}

/** Best-effort YYYY-MM-DD; never uses `updatedAt` as enrollment proxy. */
function enrollmentDateCell(student: Student): string {
  const r = student as unknown as Record<string, unknown>;

  const fromMs = (ms: unknown): string | undefined => {
    if (typeof ms !== 'number' || !Number.isFinite(ms)) return undefined;
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) return undefined;
    return formatLocalIsoDate(d);
  };

  const enrolledAt = fromMs(r.enrolledAt);
  if (enrolledAt) return enrolledAt;

  const createdMs = r.createdAt as { seconds?: unknown; nanoseconds?: unknown } | number | undefined;
  if (createdMs !== undefined && createdMs !== null) {
    if (typeof createdMs === 'number' && Number.isFinite(createdMs)) {
      const d = createdMs > 1e12 ? createdMs : createdMs * 1000;
      const out = fromMs(d);
      if (out) return out;
    }
    const sec =
      typeof createdMs === 'object' && createdMs !== null && 'seconds' in createdMs
        ? typeof (createdMs as { seconds?: unknown }).seconds === 'number'
          ? ((createdMs as { seconds: number }).seconds ?? 0) * 1000
          : undefined
        : undefined;
    const out = sec !== undefined ? fromMs(sec) : undefined;
    if (out) return out;
  }

  if (typeof r.enrollmentDate === 'string' && r.enrollmentDate.trim()) {
    return r.enrollmentDate.trim();
  }

  const consent = fromMs(r.consentRecordedAt);
  if (consent) return consent;

  return '';
}

/** Build UID → name lookups from cohorts + roster. */
export function buildRowsForCampusRosterCompliance(
  students: Student[],
  cohorts: Cohort[],
  teacherNameById: Map<string, string>
): RowObject[] {
  const cohortById = new Map(cohorts.map((c) => [c.id, c] as const));

  const sorted = [...students].sort((a, b) =>
    (a.name ?? '').localeCompare(b.name ?? '', undefined, { sensitivity: 'base' })
  );

  return sorted.map((s) => {
    const cid = typeof s.cohortId === 'string' ? s.cohortId.trim() : '';
    const cohort = cid ? cohortById.get(cid) : undefined;

    let gradeLevel = '';
    if (typeof s.numericGradeLevel === 'number' && Number.isFinite(s.numericGradeLevel) && s.numericGradeLevel > 0) {
      gradeLevel = String(Math.round(s.numericGradeLevel));
    } else if (cohort && Number.isFinite(cohort.gradeLevel) && cohort.gradeLevel > 0) {
      gradeLevel = String(cohort.gradeLevel);
    } else if (typeof s.grade === 'string' && s.grade.trim()) {
      gradeLevel = s.grade.trim();
    }

    const cohortLabel =
      cid && cohort ? cohort.name : cid ? '(Unknown cohort)' : 'Unassigned';

    let assignedTeachers = '';
    if (cohort?.assignedTeacherIds?.length) {
      assignedTeachers = cohort.assignedTeacherIds
        .map((id) => (typeof id === 'string' ? id.trim() : ''))
        .filter(Boolean)
        .map((id) => teacherNameById.get(id) ?? id)
        .filter(Boolean)
        .join(', ');
    }

    return {
      'Student Name': s.name ?? '',
      'Grade Level': gradeLevel,
      'Class/Cohort': cohortLabel,
      'Assigned Teachers': assignedTeachers,
      'Enrollment Date': enrollmentDateCell(s),
    };
  });
}

function rowsToCsvBom(rows: RowObject[]): string {
  const headers = [
    'Student Name',
    'Grade Level',
    'Class/Cohort',
    'Assigned Teachers',
    'Enrollment Date',
  ] as const;

  const lines = rows.map((row) =>
    headers.map((h) => escapeCsvCell(row[h] ?? '')).join(',')
  );
  const bom = '\uFEFF';
  return bom + [headers.join(','), ...lines].join('\r\n');
}

/**
 * One-click CSV download for campus roster / compliance reporting.
 *
 * **`teacherNameById`** is required to resolve cohort `assignedTeacherIds` into display names (cohorts do not carry names alone).
 *
 * Filename: `{schoolName}_Roster_{YYYY-MM-DD}.csv` (today in local TZ; `schoolName` sanitized).
 */
export function downloadCampusRosterCSV(
  students: Student[],
  cohorts: Cohort[],
  schoolName: string,
  teacherNameById: Map<string, string>
): void {
  const rows = buildRowsForCampusRosterCompliance(students, cohorts, teacherNameById);
  const csv = rowsToCsvBom(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const stamp = formatLocalIsoDate(new Date());
  const base = sanitizeFilenameSegment(schoolName);
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${base}_Roster_${stamp}.csv`;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}
