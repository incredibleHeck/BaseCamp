/**
 * Canonical learner L1 options (onboarding, student record, guardian message language).
 * Keep assessment translanguaging list in sync: every entry except English should appear in
 * {@link ASSESSMENT_TRANSLANGUAGING_LANGUAGES} so primaryLanguage auto-maps to dialect in AssessmentSetup.
 */
export const STUDENT_PRIMARY_LANGUAGE_OPTIONS = [
  'English',
  'Twi',
  'Ga',
  'Ewe',
  'Hausa',
  'Dagbani',
] as const;

/** Languages that enable ESL / translanguaging in Gemini (excludes English). */
export const ASSESSMENT_TRANSLANGUAGING_LANGUAGES = ['Twi', 'Ga', 'Ewe', 'Dagbani', 'Hausa'] as const;

/** Guardian weekly digest translation target — aligned with learner L1 set. */
export const GUARDIAN_MESSAGE_LANGUAGE_OPTIONS = STUDENT_PRIMARY_LANGUAGE_OPTIONS;

export const STUDENT_SEN_STATUS_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'Dyslexia', label: 'Dyslexia' },
  { value: 'Dyscalculia', label: 'Dyscalculia' },
  { value: 'ADHD', label: 'ADHD' },
  { value: 'Other', label: 'Other' },
] as const;

/**
 * Returns the canonical translanguaging label if the string matches (case-insensitive), else undefined.
 * English and empty never enable translanguaging.
 */
export function matchTranslanguagingDialect(primaryOrGuardian: string | undefined | null): string | undefined {
  const t = primaryOrGuardian?.trim();
  if (!t) return undefined;
  if (/^english$/i.test(t)) return undefined;
  const match = (ASSESSMENT_TRANSLANGUAGING_LANGUAGES as readonly string[]).find(
    (d) => d.toLowerCase() === t.toLowerCase()
  );
  return match;
}

/** Prefer learner L1, then guardian message language, for lesson-plan translanguaging. */
export function resolveLessonTranslanguagingDialect(
  student: { primaryLanguage?: string; guardianLanguage?: string } | null | undefined
): string | undefined {
  if (!student) return undefined;
  return (
    matchTranslanguagingDialect(student.primaryLanguage) ??
    matchTranslanguagingDialect(student.guardianLanguage)
  );
}
