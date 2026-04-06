/**
 * Pseudo-email identity for managed staff (teacher/headteacher) login.
 * Must match server-side logic in Cloud Functions (`functions/src/managedEmail.ts`).
 */

const DEFAULT_MANAGED_DOMAIN = 'basecamp.internal';

export function sanitizeEmailLocalPart(raw: string): string {
  const s = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '.')
    .replace(/\.+/g, '.')
    .replace(/^\.|\.$/g, '');
  return s.slice(0, 64) || 'user';
}

export function sanitizeSchoolIdForEmail(raw: string): string {
  const s = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return s.slice(0, 63) || 'school';
}

export function managedEmailDomain(): string {
  const d = import.meta.env.VITE_MANAGED_EMAIL_DOMAIN;
  return typeof d === 'string' && d.trim().length > 0 ? d.trim().toLowerCase() : DEFAULT_MANAGED_DOMAIN;
}

/** e.g. john.smith@sch-mando.basecamp.internal */
export function buildManagedStaffEmail(username: string, schoolId: string): string {
  const local = sanitizeEmailLocalPart(username);
  const host = `${sanitizeSchoolIdForEmail(schoolId)}.${managedEmailDomain()}`;
  return `${local}@${host}`;
}
