import { GoogleGenerativeAI } from "@google/generative-ai";

export interface DiagnosticReport {
  diagnosis: string;
  masteredConcepts: string;
  recommendations: string[];
  remedialPlan: string;
  lessonPlan: {
    title: string;
    instructions: string[];
  };
  smsDraft: string;
  score: number;
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
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

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

    // Parse the JSON string into an object
    const report: DiagnosticReport = JSON.parse(cleanedJson);
    
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
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

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
    const report: DiagnosticReport = JSON.parse(cleanedJson);
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
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

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
    const report: DiagnosticReport = JSON.parse(cleanedJson);
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
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
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
