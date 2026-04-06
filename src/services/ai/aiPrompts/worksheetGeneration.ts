import { API_KEY, genAI, GEMINI_MODEL } from './geminiClient';
import type { AiCurriculumPromptType, WorksheetContext, WorksheetResult } from './types';
import { cleanJsonResponse, getCurriculumPromptAlignmentBlock } from './utils';

export const generatePracticeWorksheet = async (
  gapTags: string | string[],
  subject: string,
  grade: string = 'Primary 6',
  context: WorksheetContext,
  curriculumType?: AiCurriculumPromptType
): Promise<WorksheetResult | null> => {
  if (!API_KEY) {
    alert('Gemini API key is not configured. Please check the console.');
    return null;
  }

  const gapList = Array.isArray(gapTags) ? gapTags : [gapTags];
  const gapListText =
    gapList.length === 1
      ? `Learning gap to target: ${gapList[0]}`
      : `Learning gaps to target (address ALL of these in the worksheet): ${gapList.join(', ')}`;

  const lessonStepsText = context.lessonPlan.instructions?.length
    ? context.lessonPlan.instructions.join(' | ')
    : 'None specified.';

  const contextBlock = `
      REQUIRED diagnostic context (you MUST use this to align your practice questions with the full report):
      - Diagnosis: ${context.diagnosis}
      - Remedial plan (10-minute activity idea): ${context.remedialPlan}
      - Lesson plan title: ${context.lessonPlan.title}
      - Lesson plan steps: ${lessonStepsText}

      Your practice questions must reinforce and extend this diagnosis and remedial approach; do not repeat the same steps but create exercises the student can do to practice the skills identified.
      `;

  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const prompt = `
      You are an expert Ghanaian GES (Ghana Education Service) teacher. Generate a short targeted practice worksheet to help a student overcome specific learning gaps from their AI diagnostic report.

      ${getCurriculumPromptAlignmentBlock(curriculumType)}

      ${gapListText}
      Subject: ${subject}
      Grade level: ${grade}
      ${contextBlock}

      Requirements:
      - Create 3 to 5 simple, targeted practice questions or exercises that address the gap(s) above. If there are multiple gaps, spread the questions across them so the worksheet covers all gaps.
      - Make content culturally relevant to Ghana (e.g. use cedis, local names like Kofi or Ama, local items like plantain, trotro, or market settings in word problems).
      - Keep difficulty appropriate for ${grade}.

      CRITICAL FORMATTING RULE — Mathematics in questions:
      You MUST use standard LaTeX notation for ALL numbers, fractions, indices, and mathematical expressions in the questions.
      - Wrap inline math in single dollar signs (e.g. $\\frac{3}{4}$, $x^2$, $5 \\times 10$).
      - Never use plain keyboard fractions like 3/4; always use $\\frac{numerator}{denominator}$.
      - Use LaTeX for powers (e.g. $x^2$), multiplication (e.g. $\\times$), and any numeric or symbolic math.

      Your response MUST be strict JSON only, no other text:
      {
        "title": "A short, clear title for this practice worksheet.",
        "questions": ["Question or exercise 1", "Question or exercise 2", "Question or exercise 3", ...]
      }
    `;

    const result = await model.generateContent(prompt);
    const jsonString = (await result.response).text();
    const cleanedJson = cleanJsonResponse(jsonString);
    const parsed = JSON.parse(cleanedJson) as WorksheetResult;
    if (!parsed.title || !Array.isArray(parsed.questions)) throw new Error('Invalid worksheet structure');
    const questions = parsed.questions.filter((q) => typeof q === 'string' && q.trim());
    if (questions.length < 3 || questions.length > 5) throw new Error('Worksheet must have 3 to 5 questions');
    return { title: parsed.title.trim(), questions };
  } catch (error) {
    console.error('Error generating practice worksheet:', error);
    alert('Could not generate the practice worksheet. Please try again or check the console.');
    return null;
  }
};
