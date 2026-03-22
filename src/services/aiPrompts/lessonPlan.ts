import { API_KEY, genAI, GEMINI_MODEL } from './geminiClient';
import type { GesAlignment, LessonPlanResult } from './types';
import { cleanJsonResponse } from './utils';

/** Options for age-scaled pedagogy and ESL translanguaging in remedial activities. */
export interface GenerateLessonPlanOptions {
  /** Numeric grade band (e.g. 1–9 for P1–JHS3). Defaults to 4 (Primary 4) if omitted/invalid. */
  studentGradeLevel?: number;
  /** Home/local language for translanguaging (e.g. "Twi", "Ga"). Empty or "None" → standard English only. */
  dialectContext?: string;
}

const DEFAULT_GRADE_LEVEL = 4;

function resolveLessonPlanGradeLevel(raw?: number): number {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    const g = Math.round(raw);
    if (g >= 1 && g <= 12) return g;
  }
  return DEFAULT_GRADE_LEVEL;
}

function resolveLessonPlanDialect(raw?: string | null): { display: string; translanguaging: boolean } {
  const t = raw?.trim() ?? '';
  if (!t || t.toLowerCase() === 'none') {
    return { display: 'Standard English (no local dialect specified)', translanguaging: false };
  }
  return { display: t, translanguaging: true };
}

function escapeForPrompt(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/** Injected variables + strict age-scaled intervention rules (materials & dignity). */
function buildAgeScaledPedagogyPrompt(grade: number): string {
  return `
LEARNER CONTEXT VARIABLES (bind these; do not contradict):
- studentGradeLevel: ${grade}
- Apply the intervention band below that matches this exact level.

AGE-SCALED INTERVENTION RULES: You must scale the tactile/kinesthetic activity to respect the dignity of the learner based on their studentGradeLevel.

- If Grade 1–3: Use direct physical manipulatives (stones, bottle caps, drawn shapes).
- If Grade 4–6: Use social/scenario-based manipulatives (e.g., acting as a market trader, drawing currency).
- If Grade 7–9 (JHS): NEVER suggest 'bottle caps' or childish games. Use abstract, real-world community problem-solving (e.g., measuring the school compound, agricultural yields, or budget planning).

FOR THIS LESSON: studentGradeLevel = ${grade}.
- If 1–3: follow the Grade 1–3 rule only.
- If 4–6: follow the Grade 4–6 rule only.
- If 7–9: follow the JHS rule only.
- If 10–12: treat like JHS (dignified, real-world, abstract/community contexts; never bottle caps or childish games).
`.trim();
}

/** ESL / translanguaging: full ratio rules + applicability for this learner. */
function buildEslTranslanguagingPrompt(grade: number, dialectLabel: string, translanguaging: boolean): string {
  const dialectQuoted = translanguaging ? `"${escapeForPrompt(dialectLabel)}"` : '(not provided)';

  const sharedHeader = `
ESL TRANS-LANGUAGING RATIO: Base the lesson's language strategy on the dialectContext (if provided) and the studentGradeLevel.

- If Grade 1–3: Instruct the teacher to explicitly introduce the concept entirely in the local dialect FIRST, before mapping it to the English vocabulary.
- If Grade 4–6: The core lesson should be in English, but provide specific 'Translation Cues' for the teacher to explain complex academic words using local dialect analogies.
- If Grade 7–9 (JHS): Use strict academic English to prepare them for BECE exams, but provide one localized, culturally relevant metaphor.
`.trim();

  if (!translanguaging) {
    return `
LEARNER CONTEXT VARIABLES (language):
- dialectContext: ${dialectQuoted}
- studentGradeLevel: ${grade}

${sharedHeader}

STRICT OVERRIDE (no local dialect): dialectContext is not provided or is standard English only.
- Do NOT introduce the concept first in a local language.
- Do NOT add Translation Cues in another language.
- Still scale English complexity to studentGradeLevel (${grade}): simple, concrete sentences for lower primary; clear academic English for upper primary; strict academic English for JHS (7–9), with at most ONE culturally relevant metaphor stated in English if it aids understanding (no foreign-language gloss required).
`.trim();
  }

  return `
LEARNER CONTEXT VARIABLES (language):
- dialectContext: ${dialectQuoted}
- studentGradeLevel: ${grade}

${sharedHeader}

FOR THIS LESSON: Apply ONLY the band that matches studentGradeLevel (${grade}), using dialectContext ${dialectQuoted}.
- Grades 1–3: Step 1 (or the opening instruction) must be dialect-first for the core idea; then explicitly map to English vocabulary in a later step.
- Grades 4–6: Write core steps in English; append or inline clear "Translation Cue:" lines for tricky academic terms, using ${dialectLabel} analogies.
- Grades 7–9: Predominantly strict academic English; include exactly one localized, culturally relevant metaphor (may reference community life in Ghana); keep tone exam-ready.
- Grades 10–12: Same language posture as JHS (7–9) unless the topic clearly demands otherwise.
`.trim();
}

export const generateRemedialLessonPlan = async (
  diagnosis: string,
  remedialPlan: string,
  subject: string,
  gesAlignment?: GesAlignment | null,
  options?: GenerateLessonPlanOptions
): Promise<LessonPlanResult | null> => {
  if (!API_KEY) {
    alert('Gemini API key is not configured. Please check the console.');
    return null;
  }

  const grade = resolveLessonPlanGradeLevel(options?.studentGradeLevel);
  const { display: dialectLabel, translanguaging } = resolveLessonPlanDialect(options?.dialectContext);

  const variablesPayload = `
=== INJECTED VARIABLES (Gemini payload) ===
studentGradeLevel: ${grade}
dialectContext: ${translanguaging ? `"${escapeForPrompt(dialectLabel)}"` : 'None / standard English (not provided)'}
=== END INJECTED VARIABLES ===
`.trim();

  const ageBlock = buildAgeScaledPedagogyPrompt(grade);
  const eslBlock = buildEslTranslanguagingPrompt(grade, dialectLabel, translanguaging);

  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const gesBlock =
      gesAlignment && gesAlignment.objectiveId
        ? `
Official curriculum alignment to preserve in the activity (cite this in the activity title or first step when natural):
- Objective: ${gesAlignment.objectiveId} — ${gesAlignment.objectiveTitle}
- Curriculum note: ${gesAlignment.excerpt}
`
        : '';
    const prompt = `
You are an expert Ghanaian GES-aligned educator. Create a NEW 5-minute remedial activity.

${variablesPayload}

${ageBlock}

${eslBlock}

CONTENT TO REMEDIATE:
- Learning gap / diagnosis: ${diagnosis}
- Context / existing remedial idea (do not repeat verbatim—differentiate): ${remedialPlan}
- Subject: ${subject}
${gesBlock}

OUTPUT RULES:
- Provide a DIFFERENT activity than the core idea above.
- Materials and activity type MUST comply with AGE-SCALED INTERVENTION RULES for studentGradeLevel ${grade} (no exceptions for JHS: no bottle caps, no childish games).
- Language and any Translation Cues MUST comply with ESL TRANS-LANGUAGING RATIO and the FOR THIS LESSON clauses above.
- Keep 3–5 clear steps a teacher can run in about 5 minutes.

Your response MUST be strict JSON only, no other text:
{
  "title": "A short, engaging title for this activity.",
  "instructions": ["Step 1...", "Step 2...", "Step 3..."]
}
`;

    const result = await model.generateContent(prompt);
    const jsonString = (await result.response).text();
    const cleanedJson = cleanJsonResponse(jsonString);
    const parsed = JSON.parse(cleanedJson) as LessonPlanResult;
    if (!parsed.title || !Array.isArray(parsed.instructions)) throw new Error('Invalid lesson plan structure');
    return { title: parsed.title, instructions: parsed.instructions };
  } catch (error) {
    console.error('Error generating lesson plan:', error);
    alert('Could not generate a new lesson plan. Please try again or check the console.');
    return null;
  }
};
