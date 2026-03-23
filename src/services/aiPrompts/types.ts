/**
 * Longitudinal / developmental SEN screening hint from the diagnostic model (non-clinical;
 * flags errors that may be unusual for the learner's grade band).
 */
export interface SenWarningFlag {
  severity: 'low' | 'medium' | 'high';
  category:
    | 'Dyscalculia'
    | 'Dyslexia'
    | 'Dysgraphia'
    | 'Visual-Spatial'
    | 'Auditory-Processing'
    | 'Other';
  /** Why this error at this grade level triggered the flag. */
  reason: string;
}

/** GES curriculum alignment (RAG-assisted; verified = ID was in retrieved allowlist). */
export interface GesAlignment {
  objectiveId: string;
  objectiveTitle: string;
  excerpt: string;
  verified: boolean;
}

export interface DiagnosticReport {
  diagnosis: string;
  masteredConcepts: string;
  gapTags: string[];
  masteryTags: string[];
  recommendations: string[];
  remedialPlan: string;
  lessonPlan: {
    title: string;
    instructions: string[];
  };
  smsDraft: string;
  /** 0–100 mastery score from the model (canonical). */
  score: number;
  /**
   * Optional raw score when the pipeline exposes it separately from `score`.
   * Routing uses `rawScore` when present, otherwise `score`.
   */
  rawScore?: number;
  /** When `"mastered"`, triggers A* extension routing alongside high scores. */
  masteryLevel?: string;
  gesAlignment?: GesAlignment | null;
  /**
   * Official Cambridge shorthand from the standard line (e.g. "1Nc2"), for judge-facing UI.
   * null when GES-only or no code appears in curriculum context.
   */
  alignedStandardCode?: string | null;
  /** Set when worksheet analysis used class roster + handwriting match (batch queue). */
  detectedStudentId?: string | null;
  /** Optional developmental / SEN screening signal from the model (not a medical diagnosis). */
  senWarningFlag?: SenWarningFlag;
  /**
   * A* / gifted-extension challenge (markdown). Populated when the learner shows very high mastery (e.g. ≥95%);
   * distinct from remedial `lessonPlan`.
   */
  extensionActivity?: string;
}

export interface SenRiskReport {
  riskLevel: 'Low' | 'Moderate' | 'High';
  identifiedPatterns: string[];
  potentialIndicators: string[];
  specialistRecommendation: string;
}

export interface LessonPlanResult {
  title: string;
  instructions: string[];
}

/**
 * Cambridge Primary Mathematics remedial micro-lesson (5-minute CPA + TWM).
 * Returned by `generateMathLessonPlan` (strict JSON from Gemini).
 */
export interface MathLessonPlanResult {
  title: string;
  /** Human-readable duration, e.g. "5 minutes". */
  estimatedDuration: string;
  /** Low-resource, locally available items (paper, pencil, found objects; empty array if none). */
  materialsNeeded: string[];
  /** Ordered steps; must include explicit Concrete → Pictorial → Abstract phases. */
  instructions: string[];
  /** Phrase-level cues for local language ↔ academic English (empty if no dialect). */
  translanguagingCues: string[];
}

export interface WorksheetResult {
  title: string;
  questions: string[];
}

/** Required diagnostic context so the worksheet always aligns with the full report. */
export interface WorksheetContext {
  diagnosis: string;
  remedialPlan: string;
  lessonPlan: { title: string; instructions: string[] };
}

export interface WeeklyDigestEnglish {
  body: string;
  homeActivity: string;
}

export interface PortalPracticeItem {
  id: string;
  question: string;
  choices: string[];
  correctIndex: number;
  hint: string;
  points: number;
}

export interface PortalPracticeRound {
  subject: 'numeracy' | 'literacy';
  items: PortalPracticeItem[];
}
