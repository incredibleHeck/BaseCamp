import { generateEnglishLessonPlan } from './englishLessonPlan';
import { generateMathLessonPlan } from './mathLessonPlan';
import type { AiCurriculumPromptType, DiagnosticReport, LessonPlanResult, MathLessonPlanResult } from './types';

/** Maps CPA / Oracy-style JSON lesson output into the `{ title, instructions }` shape used across the app. */
export function mapSpecializedLessonPlanToLessonPlanResult(plan: MathLessonPlanResult): LessonPlanResult {
  const prefix: string[] = [];
  if (plan.estimatedDuration?.trim()) {
    prefix.push(`Estimated duration: ${plan.estimatedDuration.trim()}`);
  }
  if (plan.materialsNeeded?.length) {
    prefix.push(`Materials needed: ${plan.materialsNeeded.join(', ')}`);
  }
  for (const c of plan.translanguagingCues ?? []) {
    if (typeof c === 'string' && c.trim()) {
      prefix.push(`Translanguaging: ${c.trim()}`);
    }
  }
  return { title: plan.title, objective: plan.objective, instructions: [...prefix, ...plan.instructions] };
}

/**
 * Dual-engine router: Cambridge Primary Mathematics vs English / literacy remedial micro-lessons.
 */
export async function generateSubjectRoutedLessonPlan(
  report: DiagnosticReport,
  assessmentType: string,
  subject: string | undefined,
  studentGradeLevel: number,
  dialectContext: string | null | undefined,
  curriculumContext: string,
  curriculumType?: AiCurriculumPromptType
): Promise<LessonPlanResult | null> {
  const isMath =
    assessmentType === 'numeracy' ||
    assessmentType === 'math' ||
    subject?.toLowerCase() === 'math';

  const raw = isMath
    ? await generateMathLessonPlan(report, studentGradeLevel, dialectContext, curriculumContext, curriculumType)
    : await generateEnglishLessonPlan(report, studentGradeLevel, dialectContext, curriculumContext, curriculumType);

  return raw ? mapSpecializedLessonPlanToLessonPlanResult(raw) : null;
}
