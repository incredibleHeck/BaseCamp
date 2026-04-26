/**
 * Student portal "Follow Me" join URL. Same host; hash is handled by `StudentPortalApp`.
 * Example: `https://host/#/portal?liveSession=<sessionId>`
 */
export function buildStudentFollowMePortalUrl(liveSessionId: string): string {
  if (typeof window === 'undefined') {
    return `#/portal?liveSession=${encodeURIComponent(liveSessionId)}`;
  }
  const { origin, pathname, search } = window.location;
  return `${origin}${pathname}${search}#/portal?liveSession=${encodeURIComponent(liveSessionId)}`;
}

/**
 * Read `liveSession` from the hash query (`#/portal?liveSession=...`) or from `location.search`.
 */
export function getLiveSessionIdFromLocation(): string | null {
  if (typeof window === 'undefined') return null;
  const h = window.location.hash;
  if (h && h.length > 1) {
    const afterHash = h.slice(1);
    const q = afterHash.indexOf('?');
    if (q >= 0) {
      const p = new URLSearchParams(afterHash.slice(q + 1));
      const v = p.get('liveSession')?.trim();
      if (v) return v;
    }
  }
  return new URLSearchParams(window.location.search).get('liveSession')?.trim() ?? null;
}
