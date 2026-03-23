/**
 * Shared curriculum objective shape for Cambridge (and future) subject taxonomies.
 * Used by RAG retrieval and model alignment — keep in sync across Math, English, Science, etc.
 */
export interface CurriculumObjective {
  id: string;
  gradeLevel: number;
  domain: string;
  ixlStyleSkill: string;
  cambridgeStandard: string;
  diagnosticTrigger: string;
}
