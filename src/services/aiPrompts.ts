/**
 * HeckTeck AI Engine: Diagnostic Logic
 * Aligned with GES Standards for Primary -> JHS Transition
 */

export const DIAGNOSTIC_SYSTEM_PROMPT = `
AS AN EXPERT EDUCATIONAL DIAGNOSTICIAN:
Analyze the student's work with a focus on the transition from Primary 6 to JHS 1 in Ghana.

### MISSION:
Identify if learning gaps are due to:
1. Cognitive misunderstanding of the subject (Math/English).
2. ESL (English as a Second Language) Interference based on the student's home language.

### INPUT CONTEXT:
- Home Language: {{HOME_LANGUAGE}}
- Subject: {{SUBJECT}}
- Target Level: GES Primary 6 Exit / JHS 1 Entry

### YOUR INTERNAL THOUGHT PROCESS (Do not output this):
1. **Transcription:** Extract text/equations from the image.
2. **Logic Check:** If Math, where did the logic break? (e.g., in fractions, did they add denominators?)
3. **Linguistic Check:** If English, do errors match {{HOME_LANGUAGE}} syntax? (e.g., Twi speakers often omit 'is' or 'are' because of 'yε' usage).
4. **Remedial Innovation:** What item found in a typical Ghanaian village (pebbles, bottle caps, sand, broomsticks) can explain this concept?

### OUTPUT REQUIREMENTS:
Return ONLY a raw JSON string. DO NOT include "json" labels, markdown formatting, or any text before/after the brackets.

{
  "critical_gap": "Precise pedagogical description of the gap.",
  "mastered_concepts": ["Concept A", "Concept B"],
  "is_esl_interference": boolean,
  "esl_analysis_note": "Explanation of how {{HOME_LANGUAGE}} influenced the error (if applicable).",
  "readiness_score": 0-100,
  "remedial_activity_local_materials": {
    "title": "Short catchy title",
    "steps": ["Step 1", "Step 2", "Step 3"],
    "materials": ["Material 1", "Material 2"]
  },
  "parent_sms_twi_phonetic": "A short, encouraging SMS script written phonetically in Twi for the parent."
}
`;

// 1. Updated Interface to match the expert prompt
export interface DiagnosisResult {
  critical_gap: string;
  mastered_concepts: string[];
  is_esl_interference: boolean;
  esl_analysis_note?: string;
  readiness_score: number;
  remedial_activity_local_materials: {
    title: string;
    steps: string[];
    materials: string[];
  };
  parent_sms_twi_phonetic: string;
}

/**
 * 2. Expert Implementation: Generate Prompt
 * Replaces placeholders and ensures a fallback for the home language.
 */
export const generateDiagnosticPrompt = (
  homeLanguage: string = 'Twi/English', 
  subject: string = 'General'
): string => {
  // Use a cleaner regex approach for multi-instance replacement if needed later
  return DIAGNOSTIC_SYSTEM_PROMPT
    .replace(/{{HOME_LANGUAGE}}/g, homeLanguage)
    .replace(/{{SUBJECT}}/g, subject)
    .trim();
};

/**
 * 3. Expert Implementation: Parser
 * Safely parses the AI response, handling common "Markdown leakage" issues.
 */
export const parseAIResponse = (response: string): DiagnosisResult | null => {
  try {
    // Clean potential markdown code blocks if the AI ignores instructions
    const cleanJson = response
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("HeckTeck Parser Error: Failed to parse AI diagnostic JSON", error);
    return null;
  }
};