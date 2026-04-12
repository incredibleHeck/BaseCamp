import type { GamifiedQuiz } from '../../../types/domain';
import { API_KEY, genAI, GEMINI_MODEL } from './geminiClient';
import type { AiCurriculumPromptType } from './types';
import { cleanJsonResponse, getCurriculumPromptAlignmentBlock } from './utils';

function isGamifiedQuizShape(value: unknown): value is GamifiedQuiz {
  if (!value || typeof value !== 'object') return false;
  const o = value as Record<string, unknown>;
  if (typeof o.title !== 'string' || !o.title.trim()) return false;
  if (!Array.isArray(o.questions) || o.questions.length < 3 || o.questions.length > 5) return false;
  for (const q of o.questions) {
    if (!q || typeof q !== 'object') return false;
    const item = q as Record<string, unknown>;
    if (typeof item.question !== 'string' || !item.question.trim()) return false;
    if (!Array.isArray(item.options) || item.options.length !== 4) return false;
    if (!item.options.every((opt) => typeof opt === 'string' && opt.trim())) return false;
    if (
      typeof item.correctIndex !== 'number' ||
      !Number.isInteger(item.correctIndex) ||
      item.correctIndex < 0 ||
      item.correctIndex > 3
    ) {
      return false;
    }
    if (typeof item.explanation !== 'string' || !item.explanation.trim()) return false;
  }
  return true;
}

export async function generateGamifiedQuiz(
  studentName: string,
  diagnosis: string,
  curriculumType?: AiCurriculumPromptType
): Promise<GamifiedQuiz | null> {
  if (!API_KEY) {
    alert('Gemini API key is not configured. Please check the console.');
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const prompt = `
      You are an expert Ghanaian educator. Generate a short gamified multiple-choice practice quiz for a learner, based on their diagnostic context.

      Student name: ${studentName}
      Diagnosis / learning focus (you MUST align every question to this):
      ${diagnosis}

      ${getCurriculumPromptAlignmentBlock(curriculumType)}

      Requirements:
      - Create exactly 3 to 5 questions. Each question must have exactly four answer options.
      - Keep difficulty appropriate to the diagnosis; use culturally relevant Ghanaian contexts where natural (names, cedis, local settings).
      - One correct answer per question; set correctIndex to 0, 1, 2, or 3 matching the winning option.
      - explanation must briefly justify the correct answer for the learner.

      You are generating a gamified practice quiz. You MUST respond with ONLY valid JSON matching this exact structure: { title: string, questions: [{ question: string, options: string[4], correctIndex: number, explanation: string }] }. Do not wrap in markdown blocks, just raw JSON.
    `;

    const result = await model.generateContent(prompt);
    const text = (await result.response).text();
    const cleaned = cleanJsonResponse(text);
    const parsed: unknown = JSON.parse(cleaned);
    if (!isGamifiedQuizShape(parsed)) {
      throw new Error('Invalid gamified quiz structure');
    }
    return {
      title: parsed.title.trim(),
      questions: parsed.questions.map((q) => ({
        question: q.question.trim(),
        options: q.options.map((o) => o.trim()),
        correctIndex: q.correctIndex,
        explanation: q.explanation.trim(),
      })),
    };
  } catch (error) {
    console.error('Error generating gamified quiz:', error);
    alert('Could not generate the gamified quiz. Please try again or check the console.');
    return null;
  }
}
