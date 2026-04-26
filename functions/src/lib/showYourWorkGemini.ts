import { GoogleGenerativeAI } from '@google/generative-ai';
import { cleanJsonResponse } from './cleanJsonResponse.js';

/** Default aligned with weekly parent digest (`weeklyParentDigest.ts`). Override with `GEMINI_MODEL` in Functions runtime. */
export const DEFAULT_SHOW_YOUR_WORK_MODEL = 'gemini-3-flash';

/**
 * Inline video payloads above this size may exceed Gemini request limits (base64 expands ~4/3).
 * For larger files, a Files API path would be needed (not implemented here).
 */
export const MAX_INLINE_VIDEO_BYTES = 12 * 1024 * 1024;

export type ShowYourWorkAiInsights = {
  teacherSummary: string;
  speechCadence: string;
  vocabularyHighlights: string[];
  problemSolvingSteps: string[];
  limitations: string;
};

function coerceInsights(raw: Record<string, unknown>): ShowYourWorkAiInsights {
  const teacherSummary =
    typeof raw.teacherSummary === 'string' ? raw.teacherSummary.trim() : '';
  const speechCadence = typeof raw.speechCadence === 'string' ? raw.speechCadence.trim() : '';
  const limitations = typeof raw.limitations === 'string' ? raw.limitations.trim() : '';

  let vocabularyHighlights: string[] = [];
  if (Array.isArray(raw.vocabularyHighlights)) {
    vocabularyHighlights = raw.vocabularyHighlights
      .filter((x): x is string => typeof x === 'string')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 20);
  }

  let problemSolvingSteps: string[] = [];
  if (Array.isArray(raw.problemSolvingSteps)) {
    problemSolvingSteps = raw.problemSolvingSteps
      .filter((x): x is string => typeof x === 'string')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 20);
  }

  return {
    teacherSummary: teacherSummary || 'No summary returned.',
    speechCadence: speechCadence || 'Not enough audio signal to describe cadence.',
    vocabularyHighlights,
    problemSolvingSteps,
    limitations: limitations || 'Model did not state limitations.',
  };
}

/**
 * Multimodal analysis of a short "Show your work" classroom clip (MP4).
 * Expects strict JSON in the model reply; uses `cleanJsonResponse` like other server prompts.
 */
export async function analyzeShowYourWorkVideo(args: {
  apiKey: string;
  modelName?: string;
  videoBuffer: Buffer;
}): Promise<ShowYourWorkAiInsights> {
  if (args.videoBuffer.length > MAX_INLINE_VIDEO_BYTES) {
    throw new Error(
      `Video exceeds inline limit (${MAX_INLINE_VIDEO_BYTES} bytes). Re-encode a shorter clip or raise limit with Files API support.`,
    );
  }

  const modelName = (args.modelName || process.env.GEMINI_MODEL || DEFAULT_SHOW_YOUR_WORK_MODEL).trim();
  const genAI = new GoogleGenerativeAI(args.apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  const base64Video = args.videoBuffer.toString('base64');

  const prompt = `You are an expert educator reviewing a short student "show your work" video (worked example on paper/whiteboard/tablet, often with narration).

TASK: Observe only what is reasonably visible or audible. Do not invent medical, psychological, or diagnostic labels. Stay constructive and classroom-appropriate.

Analyze:
1) Speech cadence — pacing, clarity, hesitations, confidence (from audio if present).
2) Specialized / academic vocabulary — terms the student uses correctly or confuses.
3) Visual problem-solving sequence — ordered steps you see (equations, diagrams, erasures, final answer).

OUTPUT: strict JSON only, no markdown, no code fences. Use this exact shape with string arrays (may be empty):
{
  "teacherSummary": "2-4 sentences for a teacher: strengths + one concrete next step",
  "speechCadence": "1-3 sentences",
  "vocabularyHighlights": ["short bullet strings"],
  "problemSolvingSteps": ["ordered step strings"],
  "limitations": "1-2 sentences on what was hard to see/hear or uncertain"
}`;

  const result = await model.generateContent([
    { text: prompt },
    {
      inlineData: {
        mimeType: 'video/mp4',
        data: base64Video,
      },
    },
  ]);

  const text = (await result.response).text();
  const parsed = JSON.parse(cleanJsonResponse(text)) as Record<string, unknown>;
  return coerceInsights(parsed);
}
