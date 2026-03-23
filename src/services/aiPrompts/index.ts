/**
 * AI prompt / Gemini integrations — split by domain; import from `services/aiPrompts` (this index).
 */

export type {
  DiagnosticReport,
  EnglishLessonPlanResult,
  GesAlignment,
  LessonPlanResult,
  MathLessonPlanResult,
  SenWarningFlag,
  PortalPracticeItem,
  PortalPracticeRound,
  SenRiskReport,
  WeeklyDigestEnglish,
  WorksheetContext,
  WorksheetResult,
} from './types';

export {
  analyzeManualEntry,
  analyzeWorksheet,
  analyzeWorksheetMultiple,
  type AnalyzeWorksheetOptions,
  type ClassRosterEntry,
  type WorksheetRagOptions,
} from './worksheetAnalysis';
export { generateRemedialLessonPlan, type GenerateLessonPlanOptions } from './lessonPlan';
export { generateMathLessonPlan } from './mathLessonPlan';
export { generateEnglishLessonPlan } from './englishLessonPlan';
export {
  generateExtensionActivity,
  shouldUseExtensionActivity,
  MASTERY_EXTENSION_LESSON_PLACEHOLDER,
  type GenerateExtensionActivityOptions,
} from './extensionActivity';
export { generatePracticeWorksheet } from './worksheetGeneration';
export {
  analyzeHybridTeacherDiagnostic,
  analyzeMultimodalVoiceObservation,
  buildStudentContextForHybridPrompt,
  mimeFromDataUrl,
  stripInlineBase64,
  transcribeAndAnalyzeVoiceObservation,
  type MultimodalVoiceObservationParams,
  type WorksheetImageInline,
} from './voiceObservation';
export { analyzeLongitudinalSEN } from './senAnalysis';
export {
  generateStudentPortalPracticeRound,
  generateWeeklyParentDigestEnglish,
  suggestGapTagsFromObservations,
  translateParentDigest,
} from './phase4Ecosystem';
