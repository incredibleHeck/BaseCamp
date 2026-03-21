import { retrieveGesForAnalysis } from '../gesRagService';
import { API_KEY, genAI, GEMINI_MODEL } from './geminiClient';
import type { DiagnosticReport } from './types';
import {
  cleanJsonResponse,
  GES_ALIGNMENT_JSON_INSTRUCTION,
  getDialectInstruction,
  mergeGesAlignment,
  normalizeTagArray,
} from './utils';

export const analyzeWorksheet = async (
  imageBase64: string,
  subject: string,
  dialectContext: string
): Promise<DiagnosticReport | null> => {
  if (!API_KEY) {
    alert('Gemini API key is not configured. Please check the console.');
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const base64Data = imageBase64.split(',')[1];
    if (!base64Data) throw new Error('Invalid base64 string provided.');
    const imagePart = {
      inlineData: { data: base64Data, mimeType: 'image/jpeg' },
    };
    const dialectInstruction = getDialectInstruction(dialectContext);
    const { formattedContext, allowedObjectiveIds } = retrieveGesForAnalysis(subject, '');
    const prompt = `
      You are an expert Ghanaian GES (Ghana Education Service) Educational Diagnostician. 
      Your task is to analyze the attached student's worksheet photo. The subject is ${subject}.
      
      ${dialectInstruction}

      RETRIEVED_GES_CONTEXT:
      ${formattedContext}

      Analyze the image to identify the student's primary learning gap. Based on this, provide a concise diagnosis, mastered concepts, recommendations, a simple remedial activity using local materials, a structured lesson plan, and a professional SMS draft to a guardian. Finally, provide a score from 0-100 representing the student's mastery of the topic shown.

      Your response MUST be in a strict JSON format. Do not include any text or formatting outside of the JSON object.

      ${GES_ALIGNMENT_JSON_INSTRUCTION}

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
        "score": A number from 0 to 100 representing the student's mastery level on this specific worksheet,
        "gesAlignment": null OR { "objectiveId": "", "objectiveTitle": "", "curriculumQuote": "" }
      }
    `;

    const result = await model.generateContent([prompt, imagePart]);
    const jsonString = (await result.response).text();
    const cleanedJson = cleanJsonResponse(jsonString);
    const parsedData = JSON.parse(cleanedJson) as Record<string, unknown>;
    const gesAlignment = mergeGesAlignment(parsedData, allowedObjectiveIds);
    delete parsedData.gesAlignment;
    const report: DiagnosticReport = {
      ...(parsedData as unknown as DiagnosticReport),
      gapTags: normalizeTagArray(parsedData.gapTags),
      masteryTags: normalizeTagArray(parsedData.masteryTags),
      gesAlignment: gesAlignment === undefined ? undefined : gesAlignment,
    };
    return report;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    alert('An error occurred while analyzing the worksheet. Please check the console for details.');
    return null;
  }
};

const MAX_WORKSHEET_PAGES = 10;

export const analyzeWorksheetMultiple = async (
  imageBase64s: string[],
  subject: string,
  dialectContext: string
): Promise<DiagnosticReport | null> => {
  if (!API_KEY) {
    alert('Gemini API key is not configured. Please check the console.');
    return null;
  }
  if (!imageBase64s.length) return null;
  const capped = imageBase64s.slice(0, MAX_WORKSHEET_PAGES);

  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const imageParts = capped.map((imageBase64) => {
      const base64Data = imageBase64.split(',')[1];
      if (!base64Data) throw new Error('Invalid base64 string in one of the images.');
      return { inlineData: { data: base64Data, mimeType: 'image/jpeg' } };
    });
    const { formattedContext, allowedObjectiveIds } = retrieveGesForAnalysis(subject, '');
    const prompt = `
      You are an expert Ghanaian GES (Ghana Education Service) Educational Diagnostician.
      The following ${imageParts.length} image(s) are multiple pages of the same worksheet or exercise book. Analyze all pages together and provide a single combined diagnosis and report.

      The subject is ${subject}.
      ${getDialectInstruction(dialectContext)}

      RETRIEVED_GES_CONTEXT:
      ${formattedContext}

      Analyze every page to identify the student's primary learning gap across the work. Provide one concise diagnosis, what the student has mastered, recommendations, a simple 5-minute remedial activity using local Ghanaian materials, a structured lesson plan, and a professional SMS draft to a guardian. Give one score from 0-100 for overall mastery across the pages.

      ${GES_ALIGNMENT_JSON_INSTRUCTION}

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
        "score": A number from 0 to 100 for overall mastery across the worksheet,
        "gesAlignment": null OR { "objectiveId": "", "objectiveTitle": "", "curriculumQuote": "" }
      }
    `;

    const result = await model.generateContent([prompt, ...imageParts]);
    const jsonString = (await result.response).text();
    const cleanedJson = cleanJsonResponse(jsonString);
    const parsedData = JSON.parse(cleanedJson) as Record<string, unknown>;
    const gesAlignment = mergeGesAlignment(parsedData, allowedObjectiveIds);
    delete parsedData.gesAlignment;
    const report: DiagnosticReport = {
      ...(parsedData as unknown as DiagnosticReport),
      gapTags: normalizeTagArray(parsedData.gapTags),
      masteryTags: normalizeTagArray(parsedData.masteryTags),
      gesAlignment: gesAlignment === undefined ? undefined : gesAlignment,
    };
    return report;
  } catch (error) {
    console.error('Error calling Gemini API (multi-page):', error);
    alert('An error occurred while analyzing the worksheet. Please check the console for details.');
    return null;
  }
};

export const analyzeManualEntry = async (
  subject: string,
  dialectContext: string,
  manualRubrics: string[],
  observations: string
): Promise<DiagnosticReport | null> => {
  if (!API_KEY) {
    alert('Gemini API key is not configured. Please check the console.');
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const rubricsText = manualRubrics.length > 0 ? manualRubrics.map((r) => `- ${r}`).join('\n') : 'None selected.';
    const ragHint = [observations, ...manualRubrics].join(' ');
    const { formattedContext, allowedObjectiveIds } = retrieveGesForAnalysis(subject, ragHint);
    const prompt = `
      You are an expert Ghanaian GES (Ghana Education Service) Educational Diagnostician.
      A teacher has submitted a manual assessment for the subject: ${subject}.
      ${getDialectInstruction(dialectContext)}

      Teacher-identified rubrics / focus areas:
      ${rubricsText}

      Teacher observations:
      ${observations.trim() || 'No additional observations provided.'}

      RETRIEVED_GES_CONTEXT:
      ${formattedContext}

      Based only on this information, provide a concise diagnosis, what the student has likely mastered, recommendations, a simple 5-minute remedial activity using local Ghanaian materials, a structured lesson plan, and a professional SMS draft to a guardian. Provide a score from 0-100 representing estimated mastery for this topic.

      ${GES_ALIGNMENT_JSON_INSTRUCTION}

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
        "score": A number from 0 to 100,
        "gesAlignment": null OR { "objectiveId": "", "objectiveTitle": "", "curriculumQuote": "" }
      }
    `;

    const result = await model.generateContent(prompt);
    const jsonString = (await result.response).text();
    const cleanedJson = cleanJsonResponse(jsonString);
    const parsedData = JSON.parse(cleanedJson) as Record<string, unknown>;
    const gesAlignment = mergeGesAlignment(parsedData, allowedObjectiveIds);
    delete parsedData.gesAlignment;
    const report: DiagnosticReport = {
      ...(parsedData as unknown as DiagnosticReport),
      gapTags: normalizeTagArray(parsedData.gapTags),
      masteryTags: normalizeTagArray(parsedData.masteryTags),
      gesAlignment: gesAlignment === undefined ? undefined : gesAlignment,
    };
    return report;
  } catch (error) {
    console.error('Error calling Gemini API (manual entry):', error);
    alert('An error occurred while generating the diagnosis. Please check the console for details.');
    return null;
  }
};
