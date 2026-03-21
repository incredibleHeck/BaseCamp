/**
 * AI prompt / Gemini integrations — split by domain; import from `services/aiPrompts` (this index).
 */

export type {
  DiagnosticReport,
  GesAlignment,
  LessonPlanResult,
  PortalPracticeItem,
  PortalPracticeRound,
  SenRiskReport,
  WeeklyDigestEnglish,
  WorksheetContext,
  WorksheetResult,
} from './types';

export { analyzeManualEntry, analyzeWorksheet, analyzeWorksheetMultiple } from './worksheetAnalysis';
export { generateRemedialLessonPlan } from './lessonPlan';
export { generatePracticeWorksheet } from './worksheetGeneration';
export { transcribeAndAnalyzeVoiceObservation } from './voiceObservation';
export { analyzeLongitudinalSEN } from './senAnalysis';
export {
  generateStudentPortalPracticeRound,
  generateWeeklyParentDigestEnglish,
  suggestGapTagsFromObservations,
  translateParentDigest,
} from './phase4Ecosystem';
