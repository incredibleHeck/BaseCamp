/** Keep in sync with `src/utils/managedCredentials.ts` (client). */

import { randomBytes } from 'node:crypto';

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

export function managedEmailDomainFromEnv(): string {
  const d = process.env.MANAGED_EMAIL_DOMAIN;
  return typeof d === 'string' && d.trim().length > 0 ? d.trim().toLowerCase() : DEFAULT_MANAGED_DOMAIN;
}

export function buildManagedStaffEmail(username: string, schoolId: string): string {
  const local = sanitizeEmailLocalPart(username);
  const host = `${sanitizeSchoolIdForEmail(schoolId)}.${managedEmailDomainFromEnv()}`;
  return `${local}@${host}`;
}

export function generateTeacherUsername(name: string, schoolId: string): string {
  const trimmedName = name.trim();
  const nameParts = trimmedName.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/);
  const firstName = nameParts[0] || 'teacher';
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
  const randomSuffix = randomBytes(3).toString('hex');
  let username = `${firstName}`;
  if (lastName) username += `.${lastName}`;
  username += `.sch${randomSuffix}`;
  return sanitizeEmailLocalPart(`${username}.${sanitizeSchoolIdForEmail(schoolId).slice(0, 20)}`);
}
