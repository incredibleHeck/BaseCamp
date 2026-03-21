/**
 * Defaults for gradebook / reporting until school-level settings exist.
 * Override via localStorage keys for demos: basecamp_academic_year, basecamp_term
 */
export function getDefaultAcademicYear(): string {
  if (typeof window !== 'undefined') {
    const y = localStorage.getItem('basecamp_academic_year');
    if (y?.trim()) return y.trim();
  }
  return String(new Date().getFullYear());
}

export function getDefaultTerm(): string {
  if (typeof window !== 'undefined') {
    const t = localStorage.getItem('basecamp_term');
    if (t?.trim()) return t.trim();
  }
  const m = new Date().getMonth();
  if (m < 4) return 'Term 2';
  if (m < 8) return 'Term 3';
  return 'Term 1';
}

export const DEFAULT_CLASS_LABEL = 'Primary 6A';
