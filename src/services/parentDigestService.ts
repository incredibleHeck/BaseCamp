import type { Assessment } from './assessmentService';
import { generateWeeklyParentDigestEnglish, translateParentDigest } from './aiPrompts';

export interface ParentDigestResult {
  english: string;
  localized: string;
  homeActivityEn: string;
}

/**
 * Build a short weekly-style message for guardians from recent assessments, then translate.
 */
export async function buildWeeklyParentDigest(
  studentName: string,
  history: Assessment[],
  targetLanguage: string
): Promise<ParentDigestResult | null> {
  const en = await generateWeeklyParentDigestEnglish(studentName, history);
  if (!en) return null;
  const combinedEn = `${en.body}\n\nHome activity: ${en.homeActivity}`;
  const localized =
    targetLanguage === 'English' || !targetLanguage.trim()
      ? combinedEn
      : (await translateParentDigest(combinedEn, targetLanguage)) ?? combinedEn;
  return {
    english: combinedEn,
    localized,
    homeActivityEn: en.homeActivity,
  };
}
