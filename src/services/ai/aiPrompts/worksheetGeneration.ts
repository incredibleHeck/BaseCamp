import { SchemaType, type ObjectSchema } from '@google/generative-ai';
import { API_KEY, genAI, GEMINI_MODEL } from './geminiClient';
import type { AiCurriculumPromptType, WorksheetContext, WorksheetResult } from './types';
import { alignParallelArray, normalizeGesTikzEntry, normalizePremiumFigure } from './worksheetFiguresNormalize';
import { cleanJsonResponse, getCurriculumPromptAlignmentBlock } from './utils';

const kvPairSchema: ObjectSchema = {
  type: SchemaType.OBJECT,
  properties: {
    key: { type: SchemaType.STRING },
    value: { type: SchemaType.STRING },
  },
  required: ['key', 'value'],
};

const premiumElementSchema: ObjectSchema = {
  type: SchemaType.OBJECT,
  properties: {
    type: {
      type: SchemaType.STRING,
      description: 'SVG primitive: path, circle, line, polygon, or text',
    },
    attrs: {
      type: SchemaType.ARRAY,
      items: kvPairSchema,
      description:
        'SVG attributes as key/value pairs (e.g. d, cx, cy, r, x1, y1, x2, y2, points, fill, stroke, stroke-width, font-size). For text, include key "text" for visible characters.',
    },
  },
  required: ['type', 'attrs'],
};

const premiumFigureObjectSchema: ObjectSchema = {
  type: SchemaType.OBJECT,
  nullable: true,
  properties: {
    viewBox: { type: SchemaType.STRING },
    elements: { type: SchemaType.ARRAY, items: premiumElementSchema },
  },
  required: ['viewBox', 'elements'],
};

const premiumWorksheetResponseSchema: ObjectSchema = {
  type: SchemaType.OBJECT,
  properties: {
    title: { type: SchemaType.STRING },
    questions: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      minItems: 3,
      maxItems: 5,
    },
    premiumFigures: {
      type: SchemaType.ARRAY,
      items: premiumFigureObjectSchema,
      description:
        'Must have the same length as questions. Use null for a question with no diagram. When a diagram helps (geometry, shapes, graphs), provide a compact SVG-style figure.',
    },
  },
  required: ['title', 'questions', 'premiumFigures'],
};

function buildWorksheetBase(
  parsed: Record<string, unknown>,
  isPremium: boolean,
  questions: string[]
): WorksheetResult {
  const title = String(parsed.title ?? '').trim();
  const qLen = questions.length;
  if (isPremium) {
    const rawFigures = parsed.premiumFigures;
    const list = Array.isArray(rawFigures)
      ? rawFigures.map((item) => normalizePremiumFigure(item))
      : [];
    const premiumFigures = alignParallelArray(list, qLen);
    return { title, questions, premiumFigures };
  }
  const rawTikz = parsed.gesTikzFigures;
  const list = Array.isArray(rawTikz) ? rawTikz.map((item) => normalizeGesTikzEntry(item)) : [];
  const gesTikzFigures = alignParallelArray(list, qLen);
  return { title, questions, gesTikzFigures };
}

const SHARED_REQUIREMENTS = `
      Requirements:
      - Create 3 to 5 simple, targeted practice questions or exercises that address the gap(s) above. If there are multiple gaps, spread the questions across them so the worksheet covers all gaps.
      - Make content culturally relevant to Ghana (e.g. use cedis, local names like Kofi or Ama, local items like plantain, trotro, or market settings in word problems).
      - Keep difficulty appropriate for the given grade.

      CRITICAL FORMATTING RULE — Mathematics in questions:
      You MUST use standard LaTeX notation for ALL numbers, fractions, indices, and mathematical expressions in the questions.
      - Wrap inline math in single dollar signs (e.g. $\\frac{3}{4}$, $x^2$, $5 \\times 10$).
      - Never use plain keyboard fractions like 3/4; always use $\\frac{numerator}{denominator}$.
      - Use LaTeX for powers (e.g. $x^2$), multiplication (e.g. $\\times$), and any numeric or symbolic math.
`;

export const generatePracticeWorksheet = async (
  gapTags: string | string[],
  subject: string,
  grade: string = 'Primary 6',
  context: WorksheetContext,
  curriculumType: AiCurriculumPromptType | undefined,
  isPremiumTier: boolean
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
    if (isPremiumTier) {
      const model = genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: premiumWorksheetResponseSchema,
        },
      });
      const prompt = `
      You are an expert teacher. Generate a short targeted practice worksheet from an AI diagnostic report.

      ${getCurriculumPromptAlignmentBlock(curriculumType)}

      ${gapListText}
      Subject: ${subject}
      Grade level: ${grade}
      ${contextBlock}

      ${SHARED_REQUIREMENTS}

      GEOMETRY (Premium — structured SVG primitives only):
      - For each question index, set premiumFigures[i] to either null or an object { viewBox, elements }.
      - Use a viewBox string like "0 0 200 120" that fits all primitives.
      - elements is an array of { type, attrs } where type is one of: path, circle, line, polygon, text.
      - attrs is an array of { key, value } pairs for valid SVG attributes only (no HTML).
      - For type "text", put the visible label in attrs with key "text", and use x, y, font-size, fill as needed.
      - Keep diagrams simple, readable, and relevant to the question (angles, rectangles, number lines, etc.).
      `;

      const result = await model.generateContent(prompt);
      const jsonString = (await result.response).text();
      const cleanedJson = cleanJsonResponse(jsonString);
      const parsed = JSON.parse(cleanedJson) as Record<string, unknown>;
      if (!parsed.title || !Array.isArray(parsed.questions)) throw new Error('Invalid worksheet structure');
      const questions = (parsed.questions as unknown[])
        .filter((q) => typeof q === 'string' && (q as string).trim())
        .map((q) => (q as string).trim()) as string[];
      if (questions.length < 3 || questions.length > 5) throw new Error('Worksheet must have 3 to 5 questions');
      return buildWorksheetBase(parsed, true, questions);
    }

    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const prompt = `
      You are an expert Ghanaian GES (Ghana Education Service) teacher. Generate a short targeted practice worksheet to help a student overcome specific learning gaps from their AI diagnostic report.

      ${getCurriculumPromptAlignmentBlock(curriculumType)}

      ${gapListText}
      Subject: ${subject}
      Grade level: ${grade}
      ${contextBlock}

      ${SHARED_REQUIREMENTS}

      GEOMETRY (GES — TikZ for print / LaTeX pipeline):
      - Include an array gesTikzFigures with EXACTLY the same length as questions.
      - For each index i, gesTikzFigures[i] is either null (no diagram) or a single string containing a COMPLETE TikZ picture:
        the string must include \\\\begin{tikzpicture} and \\\\end{tikzpicture} (escaped for JSON).
      - Do not include LaTeX preamble or document wrapper; only the tikzpicture environment and standard TikZ commands.
      - When a diagram helps (geometry, fractions bars, simple plots), provide concise, valid TikZ.

      Your response MUST be strict JSON only, no other text:
      {
        "title": "A short, clear title for this practice worksheet.",
        "questions": ["Question or exercise 1", "Question or exercise 2", ...],
        "gesTikzFigures": [null, "\\\\begin{tikzpicture}...\\\\end{tikzpicture}", null, ...]
      }
    `;

    const result = await model.generateContent(prompt);
    const jsonString = (await result.response).text();
    const cleanedJson = cleanJsonResponse(jsonString);
    const parsed = JSON.parse(cleanedJson) as Record<string, unknown>;
    if (!parsed.title || !Array.isArray(parsed.questions)) throw new Error('Invalid worksheet structure');
    const questions = (parsed.questions as unknown[])
      .filter((q) => typeof q === 'string' && (q as string).trim())
      .map((q) => (q as string).trim()) as string[];
    if (questions.length < 3 || questions.length > 5) throw new Error('Worksheet must have 3 to 5 questions');
    return buildWorksheetBase(parsed, false, questions);
  } catch (error) {
    console.error('Error generating practice worksheet:', error);
    alert('Could not generate the practice worksheet. Please try again or check the console.');
    return null;
  }
};
