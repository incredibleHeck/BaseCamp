import { GoogleGenerativeAI } from "@google/generative-ai";

export interface DiagnosticReport {
  diagnosis: string;
  masteredConcepts: string;
  gapTags: string[];
  masteryTags: string[];
  recommendations: string[];
  remedialPlan: string;
  lessonPlan: {
    title: string;
    instructions: string[];
  };
  smsDraft: string;
  score: number;
}

export interface SenRiskReport {
  riskLevel: 'Low' | 'Moderate' | 'High';
  identifiedPatterns: string[];
  potentialIndicators: string[];
  specialistRecommendation: string;
}

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("VITE_GEMINI_API_KEY is not set. Please add it to your .env file.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

function cleanJsonResponse(jsonString: string): string {
  // Remove Markdown code block syntax and any leading/trailing whitespace
  return jsonString.replace(/```json\n?|```/g, '').trim();
}

/** Ensure we always have string[] for tag fields (model may return array or comma-separated string). */
function normalizeTagArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v) => typeof v === 'string' && v.trim()).map((v) => v.trim());
  if (typeof value === 'string' && value.trim())
    return value.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
  return [];
}

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v) => typeof v === 'string' && v.trim()).map((v) => v.trim());
  return [];
}

/** Only inject translation rule when a dialect is actually selected (not "None" or empty). */
function getDialectInstruction(dialectContext: string): string {
  const hasDialect = dialectContext && dialectContext !== 'None' && dialectContext.trim() !== '';
  return hasDialect
    ? `CRITICAL ESL CONTEXT: The student's primary home language is ${dialectContext}. If the error is related to an English vocabulary misunderstanding (ESL context), you MUST explicitly include the translation of the misunderstood English mathematical term into ${dialectContext} within the Remedial Plan to help the teacher bridge the linguistic divide.`
    : `Analyze the error purely based on standard mathematical/literacy concepts without assuming an ESL translation gap.`;
}

/**
 * Analyzes a student's worksheet image using the Gemini 3 Flash Preview model.
 * 
 * @param imageBase64 The base64 encoded image string (including the data URL prefix).
 * @param subject The subject of the worksheet ('literacy' or 'numeracy').
 * @param dialectContext Additional context if the student primarily speaks a local dialect.
 * @returns A promise that resolves to the parsed DiagnosticReport JSON object.
 */
export const analyzeWorksheet = async (imageBase64: string, subject: string, dialectContext: string): Promise<DiagnosticReport | null> => {
  if (!API_KEY) {
    alert("Gemini API key is not configured. Please check the console.");
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-pro-preview" });

    // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
    const base64Data = imageBase64.split(',')[1];
    
    if (!base64Data) {
      throw new Error("Invalid base64 string provided.");
    }

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: "image/jpeg",
      },
    };

    const dialectInstruction = getDialectInstruction(dialectContext);
    const prompt = `
      You are an expert Ghanaian GES (Ghana Education Service) Educational Diagnostician. 
      Your task is to analyze the attached student's worksheet photo. The subject is ${subject}.
      
      ${dialectInstruction}

      Analyze the image to identify the student's primary learning gap. Based on this, provide a concise diagnosis, mastered concepts, recommendations, a simple remedial activity using local materials, a structured lesson plan, and a professional SMS draft to a guardian. Finally, provide a score from 0-100 representing the student's mastery of the topic shown.

      Your response MUST be in a strict JSON format. Do not include any text or formatting outside of the JSON object.

      The JSON structure must be:
      {
        "diagnosis": "A string clearly explaining the primary learning gap identified.",
        "masteredConcepts": "A string listing concepts the student seems to understand.",
        "gapTags": ["Array of 1 to 3 short phrases (max 4 words) naming the exact learning gaps (e.g., 'ESL Vocabulary', 'Subtraction', 'Word Problems')."],
        "masteryTags": ["Array of 1 to 3 short phrases (max 4 words) naming the exact skills mastered (e.g., 'Fraction Addition', 'Simplifying Fractions')."],
        "recommendations": ["An array of strings providing simple remedial actions"],
        "remedialPlan": "A string describing a simple, 5-minute remedial activity using local Ghanaian materials.",
        "lessonPlan": {
          "title": "A short, engaging title for the activity.",
          "instructions": ["Step 1", "Step 2", "Step 3"]
        },
        "smsDraft": "A short, professional draft SMS message to the parent summarizing progress and the focus area.",
        "score": A number from 0 to 100 representing the student's mastery level on this specific worksheet.
      }
    `;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const jsonString = response.text();
    
    // Clean the response to ensure it's valid JSON
    const cleanedJson = cleanJsonResponse(jsonString);

    const parsedData = JSON.parse(cleanedJson);
    const report: DiagnosticReport = {
      ...parsedData,
      gapTags: normalizeTagArray(parsedData.gapTags),
      masteryTags: normalizeTagArray(parsedData.masteryTags),
    };
    return report;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    alert("An error occurred while analyzing the worksheet. Please check the console for details.");
    return null;
  }
};

const MAX_WORKSHEET_PAGES = 10;

/**
 * Analyzes multiple worksheet/exercise book page images in one request and returns a single combined DiagnosticReport.
 * Use when the teacher uploads more than one photo (e.g. multi-page worksheet).
 */
export const analyzeWorksheetMultiple = async (
  imageBase64s: string[],
  subject: string,
  dialectContext: string
): Promise<DiagnosticReport | null> => {
  if (!API_KEY) {
    alert("Gemini API key is not configured. Please check the console.");
    return null;
  }
  if (!imageBase64s.length) return null;
  const capped = imageBase64s.slice(0, MAX_WORKSHEET_PAGES);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-pro-preview" });

    const imageParts = capped.map((imageBase64) => {
      const base64Data = imageBase64.split(",")[1];
      if (!base64Data) throw new Error("Invalid base64 string in one of the images.");
      return {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg",
        },
      };
    });

    const prompt = `
      You are an expert Ghanaian GES (Ghana Education Service) Educational Diagnostician.
      The following ${imageParts.length} image(s) are multiple pages of the same worksheet or exercise book. Analyze all pages together and provide a single combined diagnosis and report.

      The subject is ${subject}.
      ${getDialectInstruction(dialectContext)}

      Analyze every page to identify the student's primary learning gap across the work. Provide one concise diagnosis, what the student has mastered, recommendations, a simple 5-minute remedial activity using local Ghanaian materials, a structured lesson plan, and a professional SMS draft to a guardian. Give one score from 0-100 for overall mastery across the pages.

      Your response MUST be strict JSON only, no other text:
      {
        "diagnosis": "A string clearly explaining the primary learning gap across the pages.",
        "masteredConcepts": "A string listing concepts the student seems to understand.",
        "gapTags": ["Array of 1 to 3 short phrases (max 4 words) naming the exact learning gaps (e.g., 'ESL Vocabulary', 'Subtraction', 'Word Problems')."],
        "masteryTags": ["Array of 1 to 3 short phrases (max 4 words) naming the exact skills mastered (e.g., 'Fraction Addition', 'Simplifying Fractions')."],
        "recommendations": ["An array of strings with simple remedial actions"],
        "remedialPlan": "A string describing a simple 5-minute remedial activity using local materials.",
        "lessonPlan": {
          "title": "A short, engaging title for the activity.",
          "instructions": ["Step 1", "Step 2", "Step 3"]
        },
        "smsDraft": "A short, professional draft SMS to the parent.",
        "score": A number from 0 to 100 for overall mastery across the worksheet.
      }
    `;

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const jsonString = response.text();
    const cleanedJson = cleanJsonResponse(jsonString);
    const parsedData = JSON.parse(cleanedJson);
    const report: DiagnosticReport = {
      ...parsedData,
      gapTags: normalizeTagArray(parsedData.gapTags),
      masteryTags: normalizeTagArray(parsedData.masteryTags),
    };
    return report;
  } catch (error) {
    console.error("Error calling Gemini API (multi-page):", error);
    alert("An error occurred while analyzing the worksheet. Please check the console for details.");
    return null;
  }
};

/**
 * Generates a diagnostic report from manual rubric selection and teacher observations (no image).
 * Uses the same DiagnosticReport shape as analyzeWorksheet for consistent UI.
 */
export const analyzeManualEntry = async (
  subject: string,
  dialectContext: string,
  manualRubrics: string[],
  observations: string
): Promise<DiagnosticReport | null> => {
  if (!API_KEY) {
    alert("Gemini API key is not configured. Please check the console.");
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-pro-preview" });

    const rubricsText = manualRubrics.length > 0 ? manualRubrics.map((r) => `- ${r}`).join("\n") : "None selected.";
    const prompt = `
      You are an expert Ghanaian GES (Ghana Education Service) Educational Diagnostician.
      A teacher has submitted a manual assessment for the subject: ${subject}.
      ${getDialectInstruction(dialectContext)}

      Teacher-identified rubrics / focus areas:
      ${rubricsText}

      Teacher observations:
      ${observations.trim() || "No additional observations provided."}

      Based only on this information, provide a concise diagnosis, what the student has likely mastered, recommendations, a simple 5-minute remedial activity using local Ghanaian materials, a structured lesson plan, and a professional SMS draft to a guardian. Provide a score from 0-100 representing estimated mastery for this topic.

      Your response MUST be in strict JSON format with no text outside the JSON object:

      {
        "diagnosis": "A string clearly explaining the primary learning gap.",
        "masteredConcepts": "A string listing concepts the student likely understands.",
        "gapTags": ["Array of 1 to 3 short phrases (max 4 words) naming the exact learning gaps (e.g., 'ESL Vocabulary', 'Subtraction', 'Word Problems')."],
        "masteryTags": ["Array of 1 to 3 short phrases (max 4 words) naming the exact skills mastered (e.g., 'Fraction Addition', 'Simplifying Fractions')."],
        "recommendations": ["An array of strings with simple remedial actions"],
        "remedialPlan": "A string describing a simple 5-minute remedial activity using local materials.",
        "lessonPlan": {
          "title": "A short, engaging title for the activity.",
          "instructions": ["Step 1", "Step 2", "Step 3"]
        },
        "smsDraft": "A short, professional draft SMS to the parent.",
        "score": A number from 0 to 100
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonString = response.text();
    const cleanedJson = cleanJsonResponse(jsonString);
    const parsedData = JSON.parse(cleanedJson);
    const report: DiagnosticReport = {
      ...parsedData,
      gapTags: normalizeTagArray(parsedData.gapTags),
      masteryTags: normalizeTagArray(parsedData.masteryTags),
    };
    return report;
  } catch (error) {
    console.error("Error calling Gemini API (manual entry):", error);
    alert("An error occurred while generating the diagnosis. Please check the console for details.");
    return null;
  }
};

export interface LessonPlanResult {
  title: string;
  instructions: string[];
}

export interface WorksheetResult {
  title: string;
  questions: string[];
}

/**
 * Generates a new 5-minute remedial lesson plan (or a variant) from the diagnosis and context.
 * Call this for "Generate" or "Regenerate" so each click can produce a fresh lesson.
 */
export const generateRemedialLessonPlan = async (
  diagnosis: string,
  remedialPlan: string,
  subject: string
): Promise<LessonPlanResult | null> => {
  if (!API_KEY) {
    alert("Gemini API key is not configured. Please check the console.");
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-pro-preview" });
    const prompt = `
      You are an expert Ghanaian GES (Ghana Education Service) educator. Create a NEW 5-minute remedial activity for a Primary 6 student.

      Learning gap / diagnosis: ${diagnosis}
      Context / existing remedial idea: ${remedialPlan}
      Subject: ${subject}

      Provide a DIFFERENT activity than the one in the context above. Use simple local Ghanaian materials (e.g. stones, sticks, bottle caps, paper). Keep it to 3–5 clear steps a teacher can do in 5 minutes.

      Your response MUST be strict JSON only, no other text:
      {
        "title": "A short, engaging title for this activity.",
        "instructions": ["Step 1...", "Step 2...", "Step 3..."]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonString = response.text();
    const cleanedJson = cleanJsonResponse(jsonString);
    const parsed = JSON.parse(cleanedJson) as LessonPlanResult;
    if (!parsed.title || !Array.isArray(parsed.instructions)) {
      throw new Error("Invalid lesson plan structure");
    }
    return { title: parsed.title, instructions: parsed.instructions };
  } catch (error) {
    console.error("Error generating lesson plan:", error);
    alert("Could not generate a new lesson plan. Please try again or check the console.");
    return null;
  }
};

/** Required diagnostic context so the worksheet always aligns with the full report. */
export interface WorksheetContext {
  diagnosis: string;
  remedialPlan: string;
  lessonPlan: { title: string; instructions: string[] };
}

/**
 * Generates a targeted practice worksheet (3-5 questions) for one or more learning gaps.
 * Diagnosis, remedial plan, and lesson plan are always included so the worksheet aligns with the full diagnostic report.
 * Culturally relevant to Ghana; appropriate for the given grade (default Primary 6).
 */
export const generatePracticeWorksheet = async (
  gapTags: string | string[],
  subject: string,
  grade: string = "Primary 6",
  context: WorksheetContext
): Promise<WorksheetResult | null> => {
  if (!API_KEY) {
    alert("Gemini API key is not configured. Please check the console.");
    return null;
  }

  const gapList = Array.isArray(gapTags) ? gapTags : [gapTags];
  const gapListText = gapList.length === 1
    ? `Learning gap to target: ${gapList[0]}`
    : `Learning gaps to target (address ALL of these in the worksheet): ${gapList.join(", ")}`;

  const lessonStepsText = context.lessonPlan.instructions?.length
    ? context.lessonPlan.instructions.join(" | ")
    : "None specified.";

  const contextBlock = `
      REQUIRED diagnostic context (you MUST use this to align your practice questions with the full report):
      - Diagnosis: ${context.diagnosis}
      - Remedial plan (5-minute activity idea): ${context.remedialPlan}
      - Lesson plan title: ${context.lessonPlan.title}
      - Lesson plan steps: ${lessonStepsText}

      Your practice questions must reinforce and extend this diagnosis and remedial approach; do not repeat the same steps but create exercises the student can do to practice the skills identified.
      `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-pro-preview" });
    const prompt = `
      You are an expert Ghanaian GES (Ghana Education Service) teacher. Generate a short targeted practice worksheet to help a student overcome specific learning gaps from their AI diagnostic report.

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
    const response = await result.response;
    const jsonString = response.text();
    const cleanedJson = cleanJsonResponse(jsonString);
    const parsed = JSON.parse(cleanedJson) as WorksheetResult;
    if (!parsed.title || !Array.isArray(parsed.questions)) {
      throw new Error("Invalid worksheet structure");
    }
    const questions = parsed.questions.filter((q) => typeof q === "string" && q.trim());
    if (questions.length < 3 || questions.length > 5) {
      throw new Error("Worksheet must have 3 to 5 questions");
    }
    return { title: parsed.title.trim(), questions };
  } catch (error) {
    console.error("Error generating practice worksheet:", error);
    alert("Could not generate the practice worksheet. Please try again or check the console.");
    return null;
  }
};

/**
 * Analyzes a student's longitudinal assessment history to detect patterns indicative of SEN / learning-disability risk.
 * IMPORTANT: This flags pedagogical indicators only and must not provide a medical diagnosis.
 */
export const analyzeLongitudinalSEN = async (history: any[]): Promise<SenRiskReport | null> => {
  if (!API_KEY) {
    alert("Gemini API key is not configured. Please check the console.");
    return null;
  }

  if (!Array.isArray(history) || history.length === 0) return null;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-pro-preview" });

    let historyJson = "";
    try {
      historyJson = JSON.stringify(history);
    } catch {
      historyJson = JSON.stringify({ error: "Could not serialize history", count: history?.length ?? 0 });
    }

    // Keep the prompt bounded so very large histories don't blow up tokens.
    const MAX_HISTORY_CHARS = 12000;
    const historyJsonCapped = historyJson.length > MAX_HISTORY_CHARS
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
    const response = await result.response;
    const jsonString = response.text();
    const cleanedJson = cleanJsonResponse(jsonString);
    const parsed = JSON.parse(cleanedJson) as Partial<SenRiskReport>;

    const riskLevel = parsed.riskLevel;
    if (riskLevel !== "Low" && riskLevel !== "Moderate" && riskLevel !== "High") {
      throw new Error("Invalid SEN riskLevel");
    }

    const identifiedPatterns = normalizeStringArray(parsed.identifiedPatterns);
    const potentialIndicators = normalizeStringArray(parsed.potentialIndicators);
    const specialistRecommendation = typeof parsed.specialistRecommendation === "string"
      ? parsed.specialistRecommendation.trim()
      : "";

    if (!specialistRecommendation) {
      throw new Error("Invalid specialistRecommendation");
    }

    const report: SenRiskReport = {
      riskLevel,
      identifiedPatterns,
      potentialIndicators,
      specialistRecommendation,
    };

    return report;
  } catch (error) {
    console.error("Error calling Gemini API (longitudinal SEN):", error);
    alert("An error occurred while analyzing SEN risk patterns. Please check the console for details.");
    return null;
  }
};
