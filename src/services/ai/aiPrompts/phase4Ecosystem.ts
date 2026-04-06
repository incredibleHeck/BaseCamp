import type { Assessment } from '../../assessmentService';
import { getGapTagPilotMode } from '../../../config/featureFlags';
import { API_KEY, genAI, GEMINI_MODEL } from './geminiClient';
import type { AiCurriculumPromptType, PortalPracticeItem, PortalPracticeRound, WeeklyDigestEnglish } from './types';
import { cleanJsonResponse, getCurriculumPromptAlignmentBlock, normalizeTagArray } from './utils';

function assessmentHistoryToBriefJson(history: Assessment[], maxItems: number): string {
  const slice = [...history]
    .sort((a, b) => {
      const ta =
        typeof a.timestamp === 'number'
          ? a.timestamp
          : (a.timestamp as { toMillis?: () => number })?.toMillis?.() ?? 0;
      const tb =
        typeof b.timestamp === 'number'
          ? b.timestamp
          : (b.timestamp as { toMillis?: () => number })?.toMillis?.() ?? 0;
      return tb - ta;
    })
    .slice(0, maxItems);
  return JSON.stringify(
    slice.map((h) => ({
      type: h.type,
      score: h.score,
      gapTags: h.gapTags ?? [],
      diagnosis: (h.diagnosis ?? '').slice(0, 280),
      dateHint: typeof h.timestamp === 'number' ? h.timestamp : String(h.timestamp),
    }))
  );
}

export const generateWeeklyParentDigestEnglish = async (
  studentFirstName: string,
  history: Assessment[],
  curriculumType?: AiCurriculumPromptType
): Promise<WeeklyDigestEnglish | null> => {
  if (!API_KEY) return null;
  if (!history.length) return null;
  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
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
    const parsed = JSON.parse(cleanJsonResponse((await result.response).text())) as Record<string, unknown>;
    const body = typeof parsed.body === 'string' ? parsed.body.trim() : '';
    const homeActivity = typeof parsed.homeActivity === 'string' ? parsed.homeActivity.trim() : '';
    if (!body) return null;
    return {
      body,
      homeActivity: homeActivity || 'Ask your child to explain one thing they learned today in their own words.',
    };
  } catch (e) {
    console.error('generateWeeklyParentDigestEnglish', e);
    return null;
  }
};

export const translateParentDigest = async (
  englishText: string,
  targetLanguage: string,
  curriculumType?: AiCurriculumPromptType
): Promise<string | null> => {
  if (!API_KEY) return null;
  const lang = targetLanguage.trim();
  if (!lang || lang === 'English') return englishText;
  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const prompt = `
Translate the following parent message into ${lang} for WhatsApp.
Keep it short, natural, and simple (parent may have low literacy). No medical claims.
Use plain text only — no quotes or JSON.

${getCurriculumPromptAlignmentBlock(curriculumType)}

MESSAGE:
${englishText}
`;
    const result = await model.generateContent(prompt);
    const out = (await result.response).text().trim();
    return out || null;
  } catch (e) {
    console.error('translateParentDigest', e);
    return null;
  }
};

export const generateStudentPortalPracticeRound = async (
  gapTags: string[],
  subject: 'numeracy' | 'literacy',
  curriculumType?: AiCurriculumPromptType
): Promise<PortalPracticeRound | null> => {
  if (!API_KEY) return null;
  const tags = gapTags.filter(Boolean).slice(0, 5);
  if (!tags.length) return null;
  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const prompt = `
You create short gamified practice for Ghanaian Primary students (P4–P6).

${getCurriculumPromptAlignmentBlock(curriculumType)}

SUBJECT: ${subject}
GAP_TAGS: ${JSON.stringify(tags)}

OUTPUT: strict JSON only, no markdown. Exactly 4 multiple-choice items.
Each item:
- "id": stable string id1..id4
- "question": one sentence, clear language
- "choices": array of exactly 4 short strings (one correct)
- "correctIndex": 0-3
- "hint": one short sentence scaffold (not full answer)
- "points": 10, 15, 15, 20 for items 1-4 respectively

Example shape:
{ "subject": "${subject}", "items": [ ... ] }
`;
    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(cleanJsonResponse((await result.response).text())) as Record<string, unknown>;
    const itemsRaw = parsed.items;
    if (!Array.isArray(itemsRaw) || itemsRaw.length < 2) return null;
    const items: PortalPracticeItem[] = [];
    for (let i = 0; i < itemsRaw.length; i++) {
      const it = itemsRaw[i] as Record<string, unknown>;
      const choices = Array.isArray(it.choices) ? it.choices.filter((c) => typeof c === 'string') : [];
      const correctIndex = typeof it.correctIndex === 'number' ? it.correctIndex : 0;
      if (choices.length < 2) continue;
      items.push({
        id: typeof it.id === 'string' ? it.id : `q${i}`,
        question: String(it.question ?? ''),
        choices,
        correctIndex: Math.max(0, Math.min(choices.length - 1, correctIndex)),
        hint: String(it.hint ?? 'Think step by step.'),
        points: typeof it.points === 'number' ? it.points : 10,
      });
    }
    if (!items.length) return null;
    return { subject, items };
  } catch (e) {
    console.error('generateStudentPortalPracticeRound', e);
    return null;
  }
};

export const suggestGapTagsFromObservations = async (
  observations: string,
  curriculumType?: AiCurriculumPromptType
): Promise<string[] | null> => {
  if (!API_KEY) return null;
  const text = observations.trim();
  if (!text) return null;
  const mode = getGapTagPilotMode();
  const localHead =
    mode === 'mock_local_head'
      ? `You are a compact Ghana-tuned tagging head (simulated). Prefer short GES-style gap labels. Max 6 tags.`
      : `You are an expert literacy/numeracy assessor. Max 6 concise gap tags.`;
  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const prompt = `
${localHead}

${getCurriculumPromptAlignmentBlock(curriculumType)}

TEACHER_OBSERVATIONS:
${text.slice(0, 2000)}

OUTPUT: strict JSON only: { "gapTags": ["tag1", "tag2"] }
`;
    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(cleanJsonResponse((await result.response).text())) as Record<string, unknown>;
    return normalizeTagArray(parsed.gapTags);
  } catch (e) {
    console.error('suggestGapTagsFromObservations', e);
    return null;
  }
};
