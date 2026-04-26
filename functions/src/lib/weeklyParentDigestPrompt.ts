import { GoogleGenerativeAI } from '@google/generative-ai';
import { cleanJsonResponse } from './cleanJsonResponse.js';

export type AiCurriculumPromptType = 'cambridge' | 'ges' | 'both';

type BriefAssessment = {
  type: string;
  score?: number;
  gapTags: string[];
  diagnosis: string;
  dateHint: string | number;
};

/** Mirrors `getCurriculumPromptAlignmentBlock` in client `aiPrompts/utils.ts` (branches only). */
export function getCurriculumPromptAlignmentBlock(curriculumType?: AiCurriculumPromptType): string {
  if (curriculumType === 'cambridge') {
    return 'CRITICAL: You must align all pedagogy, terminology, and standards strictly with the Cambridge International Curriculum.';
  }
  if (curriculumType === 'ges') {
    return 'CRITICAL: You must align all pedagogy, terminology, and standards strictly with the Ghana Education Service (GES) NaCCA curriculum.';
  }
  return 'CRITICAL: Align pedagogy, terminology, and standards using a balanced blend of the Cambridge International Curriculum and the Ghana Education Service (GES) NaCCA curriculum where appropriate to the learner evidence and retrieved curriculum context.';
}

/**
 * School document `curriculumType` to prompt alignment.
 * Mirrors `resolveAiCurriculumPromptType` behavior for school-only input.
 */
export function curriculumTypeFromSchool(
  ct: 'cambridge' | 'ges' | 'both' | undefined
): AiCurriculumPromptType | undefined {
  if (ct === 'cambridge' || ct === 'ges' || ct === 'both') return ct;
  return undefined;
}

function toMillis(ts: unknown): number {
  if (typeof ts === 'number' && Number.isFinite(ts)) return ts;
  if (ts != null && typeof ts === 'object' && 'toMillis' in ts && typeof (ts as { toMillis: () => number }).toMillis === 'function') {
    return (ts as { toMillis: () => number }).toMillis();
  }
  if (
    typeof ts === 'object' &&
    ts !== null &&
    'seconds' in (ts as object) &&
    typeof (ts as { seconds: unknown }).seconds === 'number'
  ) {
    return (ts as { seconds: number }).seconds * 1000;
  }
  return 0;
}

/**
 * Build brief JSON for the model (newest first), up to `maxItems` (matches client `phase4Ecosystem.ts`).
 */
export function assessmentHistoryToBriefJson(
  history: { type: string; score?: number; gapTags?: string[]; diagnosis?: string; timestamp?: unknown }[],
  maxItems: number
): string {
  const slice = [...history]
    .sort((a, b) => toMillis(b.timestamp) - toMillis(a.timestamp))
    .slice(0, maxItems);
  return JSON.stringify(
    slice.map(
      (h): BriefAssessment => ({
        type: h.type,
        score: h.score,
        gapTags: h.gapTags ?? [],
        diagnosis: (h.diagnosis ?? '').slice(0, 280),
        dateHint: typeof h.timestamp === 'number' ? h.timestamp : String(h.timestamp ?? ''),
      })
    )
  );
}

export type WeeklyDigestJson = {
  body: string;
  homeActivity: string;
};

/**
 * Call Gemini with the same contract as `generateWeeklyParentDigestEnglish` in the Vite app.
 */
export async function generateWeeklyParentDigestEnglishServer(
  apiKey: string,
  modelName: string,
  studentFirstName: string,
  history: { type: string; score?: number; gapTags?: string[]; diagnosis?: string; timestamp?: unknown }[],
  curriculumType?: AiCurriculumPromptType
): Promise<WeeklyDigestJson | null> {
  if (!history.length) return null;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });
  const brief = assessmentHistoryToBriefJson(history, 6);
  const prompt = `
You are HecTech Connect, helping Ghanaian teachers message parents in simple, respectful language.

${getCurriculumPromptAlignmentBlock(curriculumType)}

TASK: Write a SHORT weekly progress summary for a guardian (SMS/WhatsApp length ~ 2–4 sentences + one home activity).
STUDENT_FIRST_NAME: ${studentFirstName}
ASSESSMENT_JSON (most recent first): ${brief}

RULES:
- Positive and honest; no medical or diagnostic claims.
- Mention 1–2 learning focus areas from gap tags or diagnosis if present.
- Include ONE concrete zero-cost home activity using everyday objects (e.g. plantains, stones, bottle caps).

OUTPUT: strict JSON only, no markdown:
{ "body": "English message for parent", "homeActivity": "One-line activity instruction" }
`;
  const result = await model.generateContent(prompt);
  const text = (await result.response).text();
  const parsed = JSON.parse(cleanJsonResponse(text)) as Record<string, unknown>;
  const body = typeof parsed.body === 'string' ? parsed.body.trim() : '';
  const homeActivity = typeof parsed.homeActivity === 'string' ? parsed.homeActivity.trim() : '';
  if (!body) return null;
  return {
    body,
    homeActivity: homeActivity || 'Ask your child to explain one thing they learned today in their own words.',
  };
}
