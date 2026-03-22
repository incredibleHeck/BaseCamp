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
  score: number;
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
