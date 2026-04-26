/**
 * Student portal uploads use: students/{studentId}/showYourWork/{file}.mp4
 * so this trigger ignores all other Storage paths under students/.
 */

const SHOW_YOUR_WORK_PREFIX = /^students\/([^/]+)\/showYourWork\/([^/]+)$/;

export type ParsedShowYourWorkObject = {
  studentId: string;
  /** Object name segment under showYourWork/ (should end with .mp4). */
  objectBaseName: string;
};

export function parseShowYourWorkUpload(objectName: string): ParsedShowYourWorkObject | null {
  if (!objectName || typeof objectName !== 'string') return null;
  const m = objectName.match(SHOW_YOUR_WORK_PREFIX);
  if (!m) return null;
  const studentId = m[1];
  const objectBaseName = m[2];
  if (!studentId || !objectBaseName.toLowerCase().endsWith('.mp4')) return null;
  return { studentId, objectBaseName };
}
