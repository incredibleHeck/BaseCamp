/**
 * Ephemeral live session model for Firebase Realtime Database.
 * @see PREMIUM_ARCHITECTURE_PLAN.md (Pillar 1, RTDB tree)
 */

export type LiveSessionStatus = 'waiting' | 'active' | 'concluded';

/** One MCQ; `correctIndex` is 0-based. */
export type LiveSessionQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
};

export type LiveSessionState = {
  status: LiveSessionStatus;
  /** Set on first write; required for security rules (teacher ownership). */
  teacherId: string;
  activeQuestionIndex?: number;
  cohortId?: string;
  /** Client wall timestamps (ms); optional serverTime can be added later. */
  startedAtMs?: number;
  endedAtMs?: number;
  /** Follow Me: optional title shown in the student portal. */
  roundTitle?: string;
  /** All questions in the round; teacher sets from UI (Sprint 2.3). */
  questions?: LiveSessionQuestion[];
  /** Id of the question current students should answer. */
  activeQuestionId?: string;
};

export type PresenceValue = {
  online: boolean;
  /** Optional; use server timestamp in service when writing. */
  lastSeen?: number | object;
  /** Shown on teacher UI when the student is identified by name (portal) but RTDB key is auth uid. */
  displayName?: string;
};

export type LiveAnswerValue = string | number | boolean;

/** Nested RTDB: answers[questionId][studentId] = selected option index, etc. */
export type AnswersByQuestion = Record<string, Record<string, LiveAnswerValue>>;

/** Map anonymous RTDB uid → Firestore `students` doc id (written by the portal client; Cloud Function uses for persistence). */
export type LiveSessionStudentLink = {
  firestoreStudentId: string;
};
