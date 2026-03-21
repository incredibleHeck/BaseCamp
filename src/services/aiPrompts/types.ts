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
