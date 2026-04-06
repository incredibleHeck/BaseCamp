/** Firestore doc id for `accessLookups` / teacher–headteacher portal login. */
export function normalizeAccessLookupKey(raw: string): string {
  return raw.trim().toLowerCase();
}

/** Firestore doc id for `portalLookups` (student portal code, uppercase). */
export function normalizePortalLookupKey(raw: string): string {
  return raw.trim().toUpperCase();
}
