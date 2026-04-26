const ROOT = 'live_sessions';

export function liveSessionRootPath(sessionId: string): string {
  return `${ROOT}/${sessionId}`;
}

export function liveSessionStatePath(sessionId: string): string {
  return `${ROOT}/${sessionId}/state`;
}

export function liveSessionPresencePath(sessionId: string, studentId: string): string {
  return `${ROOT}/${sessionId}/presence/${studentId}`;
}

export function liveSessionAnswerPath(sessionId: string, questionId: string, studentId: string): string {
  return `${ROOT}/${sessionId}/answers/${questionId}/${studentId}`;
}

export function liveSessionStudentLinkPath(sessionId: string, anonAuthUid: string): string {
  return `${ROOT}/${sessionId}/student_links/${anonAuthUid}`;
}
