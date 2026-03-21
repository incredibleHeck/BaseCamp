import type { VoiceObservationAnalysis } from '../observationService';
import { API_KEY, genAI, GEMINI_MODEL } from './geminiClient';
import { cleanJsonResponse, normalizeStringArray } from './utils';

export const transcribeAndAnalyzeVoiceObservation = async (
  audioBase64Raw: string,
  mimeType: string
): Promise<VoiceObservationAnalysis | null> => {
  if (!API_KEY) {
    alert('Gemini API key is not configured. Please check the console.');
    return null;
  }
  if (!audioBase64Raw?.trim()) return null;

  const safeMime = mimeType.split(';')[0].trim() || 'audio/webm';

  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const audioPart = { inlineData: { data: audioBase64Raw, mimeType: safeMime } };
    const prompt = `
      You are a Ghanaian GES literacy specialist assistant.

      TASK:
      1) Transcribe the attached audio faithfully (teacher observation about a learner, possibly in English or mixed with local language names).
      2) From the transcript only, provide pedagogical notes — NOT a medical diagnosis.

      OUTPUT: strict JSON only, no markdown:
      {
        "transcript": "Full transcription text",
        "eslNotes": "If relevant, note English/L2 vocabulary or grammar issues implied; else a brief 'None noted'.",
        "phoneticObservations": "If relevant, note phoneme/grapheme or decoding patterns mentioned (e.g. 'ch' in church); else brief 'None noted'.",
        "suggestedTeacherActions": ["1-3 concrete next steps for the teacher"],
        "senScreeningHints": "Non-medical screening-style note: whether to monitor or discuss with SEN coordinator based on patterns; never state a diagnosis."
      }
    `;

    const result = await model.generateContent([prompt, audioPart]);
    const jsonString = (await result.response).text();
    const cleanedJson = cleanJsonResponse(jsonString);
    const parsed = JSON.parse(cleanedJson) as Partial<VoiceObservationAnalysis>;
    const transcript = typeof parsed.transcript === 'string' ? parsed.transcript.trim() : '';
    if (!transcript) throw new Error('Empty transcript');

    return {
      transcript,
      eslNotes: typeof parsed.eslNotes === 'string' ? parsed.eslNotes.trim() : '',
      phoneticObservations:
        typeof parsed.phoneticObservations === 'string' ? parsed.phoneticObservations.trim() : '',
      suggestedTeacherActions: normalizeStringArray(parsed.suggestedTeacherActions),
      senScreeningHints: typeof parsed.senScreeningHints === 'string' ? parsed.senScreeningHints.trim() : '',
    };
  } catch (error) {
    console.error('transcribeAndAnalyzeVoiceObservation failed:', error);
    return null;
  }
};
