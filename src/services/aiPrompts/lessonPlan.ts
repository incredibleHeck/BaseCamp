import { API_KEY, genAI, GEMINI_MODEL } from './geminiClient';
import type { GesAlignment, LessonPlanResult } from './types';
import { cleanJsonResponse } from './utils';

export const generateRemedialLessonPlan = async (
  diagnosis: string,
  remedialPlan: string,
  subject: string,
  gesAlignment?: GesAlignment | null
): Promise<LessonPlanResult | null> => {
  if (!API_KEY) {
    alert('Gemini API key is not configured. Please check the console.');
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const gesBlock =
      gesAlignment && gesAlignment.objectiveId
        ? `
      Official curriculum alignment to preserve in the activity (cite this in the activity title or first step when natural):
      - GES objective: ${gesAlignment.objectiveId} — ${gesAlignment.objectiveTitle}
      - Curriculum note: ${gesAlignment.excerpt}
      `
        : '';
    const prompt = `
      You are an expert Ghanaian GES (Ghana Education Service) educator. Create a NEW 5-minute remedial activity for a Primary 6 student.

      Learning gap / diagnosis: ${diagnosis}
      Context / existing remedial idea: ${remedialPlan}
      Subject: ${subject}
      ${gesBlock}

      Provide a DIFFERENT activity than the one in the context above. Use simple local Ghanaian materials (e.g. stones, sticks, bottle caps, paper). Keep it to 3–5 clear steps a teacher can do in 5 minutes.

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
