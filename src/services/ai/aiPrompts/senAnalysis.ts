import { API_KEY, genAI, GEMINI_MODEL } from './geminiClient';
import type { SenRiskReport } from './types';
import { cleanJsonResponse, normalizeStringArray } from './utils';

export const analyzeLongitudinalSEN = async (history: unknown[]): Promise<SenRiskReport | null> => {
  if (!API_KEY) {
    alert('Gemini API key is not configured. Please check the console.');
    return null;
  }
  if (!Array.isArray(history) || history.length === 0) return null;

  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    let historyJson = '';
    try {
      historyJson = JSON.stringify(history);
    } catch {
      historyJson = JSON.stringify({ error: 'Could not serialize history', count: history?.length ?? 0 });
    }
    const MAX_HISTORY_CHARS = 12000;
    const historyJsonCapped =
      historyJson.length > MAX_HISTORY_CHARS
        ? historyJson.slice(0, MAX_HISTORY_CHARS) + `... (truncated, totalChars=${historyJson.length})`
        : historyJson;

    const prompt = `
      You are a Special Educational Needs Coordinator working within Ghana Education Service (GES).

      TASK:
      Analyze the student's ENTIRE assessment history over time to identify repeated learning patterns that may indicate SEN / learning disability risks.
      Look across multiple dates/assessments for consistent traits that can be seen in pedagogical data (not medical data).

      Conditions / areas to consider (non-exhaustive):
      - Dyslexia risk (phonological awareness, decoding, letter reversals, spelling patterns, slow reading fluency)
      - Dysgraphia risk (handwriting clarity/consistency, writing stamina, letter formation, copying difficulty)
      - Dyscalculia risk (number sense, numerical sequencing, place value, basic facts persistence)
      - Processing difficulties (working memory, processing speed, attention patterns visible in work quality/consistency)

      CRITICAL SAFETY RULE:
      Do not provide a medical diagnosis. Instead, flag 'indicators' or 'risks' based on pedagogical data patterns.

      INPUT (JSON):
      ${historyJsonCapped}

      OUTPUT REQUIREMENTS:
      - Output MUST be strict JSON only.
      - Do not include any explanatory text, markdown, or code fences outside the JSON.
      - The JSON MUST match this TypeScript interface exactly:
      {
        "riskLevel": "Low" | "Moderate" | "High",
        "identifiedPatterns": ["Pattern 1", "Pattern 2", "..."],
        "potentialIndicators": ["Indicator 1", "Indicator 2", "..."],
        "specialistRecommendation": "Clear advice on whether to refer to a GES SEN Coordinator (and what to do next)."
      }

      GUIDANCE FOR QUALITY:
      - Patterns must be longitudinal (spanning multiple entries) where possible; include time spans (e.g., weeks/months) when supported by the input.
      - If the history is too sparse to infer, set riskLevel to "Low" and explain uncertainty in specialistRecommendation, not outside JSON.
    `;

    const result = await model.generateContent(prompt);
    const jsonString = (await result.response).text();
    const cleanedJson = cleanJsonResponse(jsonString);
    const parsed = JSON.parse(cleanedJson) as Partial<SenRiskReport>;
    const riskLevel = parsed.riskLevel;
    if (riskLevel !== 'Low' && riskLevel !== 'Moderate' && riskLevel !== 'High') throw new Error('Invalid SEN riskLevel');
    const identifiedPatterns = normalizeStringArray(parsed.identifiedPatterns);
    const potentialIndicators = normalizeStringArray(parsed.potentialIndicators);
    const specialistRecommendation =
      typeof parsed.specialistRecommendation === 'string' ? parsed.specialistRecommendation.trim() : '';
    if (!specialistRecommendation) throw new Error('Invalid specialistRecommendation');

    return {
      riskLevel,
      identifiedPatterns,
      potentialIndicators,
      specialistRecommendation,
    };
  } catch (error) {
    console.error('Error calling Gemini API (longitudinal SEN):', error);
    alert('An error occurred while analyzing SEN risk patterns. Please check the console for details.');
    return null;
  }
};
