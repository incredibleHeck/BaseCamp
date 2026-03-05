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

    const prompt = `
      You are an expert Ghanaian GES (Ghana Education Service) Educational Diagnostician. 
      Your task is to analyze the attached student's worksheet photo. The subject is ${subject}.
      
      ${dialectContext ? `IMPORTANT CONTEXT: This student primarily speaks ${dialectContext} at home. Factor this into your analysis, distinguishing between genuine learning gaps and potential English as a Second Language (ESL) translation challenges.` : ''}

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
