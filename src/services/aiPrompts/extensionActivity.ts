import { API_KEY, genAI, GEMINI_MODEL } from './geminiClient';
import type { DiagnosticReport } from './types';

/** Lesson plan stand-in when remedial steps are skipped for high mastery (UI + Firestore). */
export const MASTERY_EXTENSION_LESSON_PLACEHOLDER: { title: string; instructions: string[] } = {
  title: 'Mastery achieved. See Extension Activity.',
  instructions: [],
};

/**
 * A* extension path: very high score or explicit mastery flag from the diagnostic payload.
 */
export function shouldUseExtensionActivity(
  report: Pick<DiagnosticReport, 'score' | 'rawScore' | 'masteryLevel'>
): boolean {
  const raw =
    typeof report.rawScore === 'number' && Number.isFinite(report.rawScore) ? report.rawScore : report.score;
  const numeric = typeof raw === 'number' && Number.isFinite(raw) ? raw : NaN;
  return numeric >= 95 || report.masteryLevel === 'mastered';
}

/**
 * Inputs for the A* Extension Engine (high-mastery / Bloom upper tiers).
 * Mirrors the lesson-plan pattern: diagnostic context + grade, dialect, and optional RAG curriculum text.
 */
export interface GenerateExtensionActivityOptions {
  report: DiagnosticReport;
  studentGradeLevel?: number;
  dialectContext?: string;
  /** Formatted curriculum / standard context from RAG (may be empty). */
  curriculumContext?: string;
}

const DEFAULT_GRADE_LEVEL = 4;

function resolveExtensionGradeLevel(raw?: number): number {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    const g = Math.round(raw);
    if (g >= 1 && g <= 12) return g;
  }
  return DEFAULT_GRADE_LEVEL;
}

function resolveDialectLabel(raw?: string | null): string {
  const t = raw?.trim() ?? '';
  if (!t || t.toLowerCase() === 'none') {
    return 'Standard English (no local dialect specified)';
  }
  return t;
}

function stripOptionalMarkdownFence(text: string): string {
  const trimmed = text.trim();
  const fence = /^```(?:markdown|md)?\s*\n?([\s\S]*?)\n?```$/i;
  const m = trimmed.match(fence);
  return m ? m[1].trim() : trimmed;
}

/**
 * Generates a 10-minute extension challenge for learners who have mastered the standard (e.g. score ≥ 95%).
 * Returns markdown suitable for display or print; `null` if the API is unavailable or the call fails.
 */
export async function generateExtensionActivity(
  options: GenerateExtensionActivityOptions
): Promise<string | null> {
  if (!API_KEY) {
    console.error('generateExtensionActivity: Gemini API key is not configured.');
    return null;
  }

  const { report, curriculumContext } = options;
  const grade = resolveExtensionGradeLevel(options.studentGradeLevel);
  const dialectLabel = resolveDialectLabel(options.dialectContext);
  const curriculumBlock =
    curriculumContext?.trim() ?
      `
CURRICULUM / STANDARD CONTEXT (the learner has mastered this — do NOT re-teach it):
${curriculumContext.trim()}
`
    : '';

  const systemInstruction = `
You are an expert in Gifted and Talented education.

The student has mastered the attached curriculum standard. Do NOT teach the standard. Instead, generate a 10-minute "Extension Challenge" that pushes them into the upper tiers of Bloom's Taxonomy (Analyze, Evaluate, Create).

AGE SCALING:
- If Grade 1–3: Use advanced logic puzzles or localized pattern recognition.
- If Grade 4–6: Use community-based planning (e.g., managing a market stall's inventory).
- If JHS (Grades 7–9): Use complex real-world problem solving (e.g., engineering constraints, agricultural yields).

CONSTRAINTS: The activity must require ZERO budget, no internet, and be executable with standard paper/pencil or local surroundings only.

OUTPUT: Return only Markdown (no JSON): a ## title, Bloom rationale, numbered ~10-minute steps, and one Stretch question for early finishers.
`.trim();

  const userPayload = `
VARIABLES FOR THIS REQUEST:
- studentGradeLevel: ${grade}
- dialectContext (teacher/learner locale label): "${dialectLabel.replace(/"/g, '\\"')}"
- Assessment score (context): ${typeof report.score === 'number' ? report.score : 'high'}

DIAGNOSTIC SUMMARY (context only; do not remediate):
- Diagnosis / mastery picture: ${report.diagnosis}
- Mastered concepts: ${report.masteredConcepts}
- Prior remedial sketch (ignore for pacing; this is extension, not catch-up): ${report.remedialPlan}
${curriculumBlock}

Apply AGE SCALING for studentGradeLevel = ${grade}. If dialectContext is a real local language (not standard-English-only), you may add one short optional teacher note naming one key abstract term in that language — keep the challenge primarily in English.

Begin the Markdown extension challenge now.
`.trim();

  try {
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction,
    });
    const result = await model.generateContent(userPayload);
    const raw = (await result.response).text();
    if (!raw?.trim()) return null;
    return stripOptionalMarkdownFence(raw);
  } catch (error) {
    console.error('generateExtensionActivity: Gemini call failed', error);
    return null;
  }
}
