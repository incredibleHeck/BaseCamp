import { getCurriculumContext, type CurriculumFramework } from '../curriculumRagService';
import { API_KEY, genAI, GEMINI_MODEL } from './geminiClient';
import type { DiagnosticReport } from './types';
import {
  buildGlobalCurriculumEngineInstructions,
  buildLearnerTemporalContextBlock,
  cleanJsonResponse,
  getAlignmentJsonInstruction,
  getAlignedStandardCodeJsonInstruction,
  getDialectInstruction,
  getSenWarningFlagJsonInstruction,
  LONGITUDINAL_DIAGNOSIS_BLOCK,
  mergeGesAlignment,
  normalizeTagArray,
  parseAlignedStandardCodeFromModel,
  parseSenWarningFlagFromModel,
} from './utils';

export type ClassRosterEntry = {
  studentId: string;
  name: string;
};

export type AnalyzeWorksheetOptions = {
  /** When true with `classRoster`, model must read handwritten name and return `detectedStudentId`. */
  autoDetectStudent?: boolean;
  classRoster?: ClassRosterEntry[];
  curriculumFramework?: CurriculumFramework;
  gradeLevel?: number;
  /**
   * Global Curriculum Engine output (with `allowedObjectiveIds`). When both are set, internal RAG is skipped.
   */
  curriculumContext?: string;
  allowedObjectiveIds?: string[];
  /** Learner grade for developmental appropriateness (e.g. 1 = P1, 6 = P6, 7 = JHS1). */
  studentGradeLevel?: number;
  /** Compact text summary of recent performance for longitudinal context. */
  recentHistorySummary?: string;
};

export type WorksheetRagOptions = {
  curriculumFramework?: CurriculumFramework;
  gradeLevel?: number;
  curriculumContext?: string;
  allowedObjectiveIds?: string[];
  /** Developmental band for time-aware diagnosis (may match `gradeLevel` or be sourced separately). */
  studentGradeLevel?: number;
  recentHistorySummary?: string;
};

function resolveCurriculumPayload(
  subject: string,
  ragHint: string,
  framework: CurriculumFramework,
  gradeLevel: number | undefined,
  injected?: { curriculumContext?: string; allowedObjectiveIds?: string[] }
): { formattedContext: string; allowedObjectiveIds: string[] } {
  const ctx = injected?.curriculumContext?.trim();
  const ids = injected?.allowedObjectiveIds;
  if (ctx && Array.isArray(ids)) {
    return { formattedContext: ctx, allowedObjectiveIds: ids };
  }
  return getCurriculumContext(subject, ragHint, framework, gradeLevel);
}

function mimeFromDataUrl(dataUrl: string): string | undefined {
  const m = /^data:([^;]+);base64,/i.exec(dataUrl.trim());
  return m ? m[1].trim() : undefined;
}

function validateDetectedStudentId(
  raw: unknown,
  roster: ClassRosterEntry[]
): string | null {
  const allow = new Set(roster.map((r) => r.studentId));
  if (typeof raw !== 'string' || !raw.trim()) return null;
  const id = raw.trim();
  return allow.has(id) ? id : null;
}

export const analyzeWorksheet = async (
  imageBase64: string,
  subject: string,
  dialectContext: string,
  options?: AnalyzeWorksheetOptions
): Promise<DiagnosticReport | null> => {
  if (!API_KEY) {
    alert('Gemini API key is not configured. Please check the console.');
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const base64Data = imageBase64.split(',')[1];
    if (!base64Data) throw new Error('Invalid base64 string provided.');
    const imageMime = mimeFromDataUrl(imageBase64) ?? 'image/jpeg';
    const imagePart = {
      inlineData: { data: base64Data, mimeType: imageMime },
    };
    const dialectInstruction = getDialectInstruction(dialectContext);
    const framework = options?.curriculumFramework ?? 'GES';
    const { formattedContext, allowedObjectiveIds } = resolveCurriculumPayload(
      subject,
      '',
      framework,
      options?.gradeLevel,
      {
        curriculumContext: options?.curriculumContext,
        allowedObjectiveIds: options?.allowedObjectiveIds,
      }
    );
    const globalEngineBlock = buildGlobalCurriculumEngineInstructions(dialectContext);
    const alignmentInstruction = getAlignmentJsonInstruction(framework);
    const alignedCodeInstruction = getAlignedStandardCodeJsonInstruction();
    const senWarningJson = getSenWarningFlagJsonInstruction();
    const temporalBlock = buildLearnerTemporalContextBlock(
      options?.studentGradeLevel,
      options?.recentHistorySummary
    );

    const autoDetect =
      Boolean(options?.autoDetectStudent) &&
      Array.isArray(options?.classRoster) &&
      options!.classRoster!.length > 0;

    const rosterJson = autoDetect
      ? JSON.stringify(
          options!.classRoster!.map((r) => ({ studentId: r.studentId, name: r.name })),
          null,
          0
        )
      : '';

    const studentIdBlock = autoDetect
      ? `
      STUDENT IDENTIFICATION (REQUIRED FOR THIS REQUEST):
      The teacher did not pre-select a learner. A CLASS_ROSTER is provided below with canonical studentId and display name.

      CLASS_ROSTER (JSON array — you MUST ONLY return a studentId that appears exactly in this list):
      ${rosterJson}

      Carefully read any handwritten name, label, or identifier at the top or margin of the worksheet (Ghanaian names may include spelling variations or nicknames). Match it to the SINGLE closest name in CLASS_ROSTER (prefer exact or very close orthographic match; use fuzzy match only when clearly the same person). If unreadable, ambiguous between multiple roster names, or no reasonable match exists, set detectedStudentId to null.

      Your JSON MUST include the field "detectedStudentId": either the exact "studentId" string from CLASS_ROSTER or null.
      `
      : '';

    const jsonDetectedField = autoDetect
      ? `,
        "detectedStudentId": "Exact studentId string from CLASS_ROSTER, or null if no confident match"`
      : '';

    const prompt = `
      You are an expert educational diagnostician for multilingual classrooms. Map learner evidence to the official standard in the curriculumContext below (GES and/or Cambridge as provided), then design remediation grounded in the teacher's dialectContext.

      Subject: ${subject}

      ${dialectInstruction}
      ${temporalBlock}
      ${LONGITUDINAL_DIAGNOSIS_BLOCK}

      ${globalEngineBlock}

      curriculumContext (Global Curriculum Engine — authoritative block):
      RETRIEVED_CURRICULUM_CONTEXT:
      ${formattedContext}

      ${studentIdBlock}

      Using Step 1 and Step 2 above, analyze the image for the primary learning gap. Produce diagnosis, mastered concepts, recommendations, remedialPlan and lessonPlan that honor the standard while localizing examples per dialectContext.

      Your response MUST be in a strict JSON format. Do not include any text or formatting outside of the JSON object.

      ${alignmentInstruction}

      The JSON structure must be:
      {
        "diagnosis": "A string clearly explaining the primary learning gap identified.",
        "masteredConcepts": "A string listing concepts the student seems to understand.",
        "gapTags": ["Array of 1 to 3 short phrases (max 4 words) naming the exact learning gaps (e.g., 'ESL Vocabulary', 'Subtraction', 'Word Problems')."],
        "masteryTags": ["Array of 1 to 3 short phrases (max 4 words) naming the exact skills mastered (e.g., 'Fraction Addition', 'Simplifying Fractions')."],
        "recommendations": ["An array of strings providing simple remedial actions"],
        "remedialPlan": "5-minute activity: must follow Step 2 localization rules (dialectContext).",
        "lessonPlan": {
          "title": "A short, engaging title for the activity.",
          "instructions": ["Step 1", "Step 2", "Step 3"]
        },
        "smsDraft": "A short, professional draft SMS message to the parent summarizing progress and the focus area.",
        "score": A number from 0 to 100 representing the student's mastery level on this specific worksheet,
        "gesAlignment": null OR { "objectiveId": "", "objectiveTitle": "", "curriculumQuote": "" },
        ${alignedCodeInstruction.trim()},
        ${senWarningJson.trim()}${jsonDetectedField}
      }
    `;

    const result = await model.generateContent([prompt, imagePart]);
    const jsonString = (await result.response).text();
    const cleanedJson = cleanJsonResponse(jsonString);
    const parsedData = JSON.parse(cleanedJson) as Record<string, unknown>;
    const gesAlignment = mergeGesAlignment(parsedData, allowedObjectiveIds, framework);
    delete parsedData.gesAlignment;
    const alignedStandardCode = parseAlignedStandardCodeFromModel(parsedData.alignedStandardCode);
    delete parsedData.alignedStandardCode;
    const senWarningFlag = parseSenWarningFlagFromModel(parsedData.senWarningFlag);
    delete parsedData.senWarningFlag;

    let detectedStudentId: string | null | undefined;
    if (autoDetect && options?.classRoster?.length) {
      detectedStudentId = validateDetectedStudentId(parsedData.detectedStudentId, options.classRoster);
    }
    delete parsedData.detectedStudentId;

    const report: DiagnosticReport = {
      ...(parsedData as unknown as DiagnosticReport),
      gapTags: normalizeTagArray(parsedData.gapTags),
      masteryTags: normalizeTagArray(parsedData.masteryTags),
      gesAlignment: gesAlignment === undefined ? undefined : gesAlignment,
      alignedStandardCode,
      ...(senWarningFlag !== undefined ? { senWarningFlag } : {}),
      ...(autoDetect ? { detectedStudentId: detectedStudentId ?? null } : {}),
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
  dialectContext: string,
  ragOptions?: WorksheetRagOptions
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
    const framework = ragOptions?.curriculumFramework ?? 'GES';
    const { formattedContext, allowedObjectiveIds } = resolveCurriculumPayload(
      subject,
      '',
      framework,
      ragOptions?.gradeLevel,
      {
        curriculumContext: ragOptions?.curriculumContext,
        allowedObjectiveIds: ragOptions?.allowedObjectiveIds,
      }
    );
    const globalEngineBlock = buildGlobalCurriculumEngineInstructions(dialectContext);
    const alignmentInstruction = getAlignmentJsonInstruction(framework);
    const alignedCodeInstruction = getAlignedStandardCodeJsonInstruction();
    const senWarningJson = getSenWarningFlagJsonInstruction();
    const temporalBlock = buildLearnerTemporalContextBlock(
      ragOptions?.studentGradeLevel,
      ragOptions?.recentHistorySummary
    );
    const prompt = `
      You are an expert educational diagnostician for multilingual classrooms. Map learner evidence to the standard in curriculumContext, then localize remediation per dialectContext.

      The following ${imageParts.length} image(s) are multiple pages of the same worksheet or exercise book. Analyze all pages together for one combined diagnosis.

      Subject: ${subject}
      ${getDialectInstruction(dialectContext)}
      ${temporalBlock}
      ${LONGITUDINAL_DIAGNOSIS_BLOCK}

      ${globalEngineBlock}

      curriculumContext (Global Curriculum Engine):
      RETRIEVED_CURRICULUM_CONTEXT:
      ${formattedContext}

      Apply Step 1 and Step 2 across all pages. Provide one diagnosis, mastered concepts, recommendations, localized remedialPlan and lessonPlan, SMS draft, and one overall score.

      ${alignmentInstruction}

      Your response MUST be strict JSON only, no other text:
      {
        "diagnosis": "A string clearly explaining the primary learning gap across the pages.",
        "masteredConcepts": "A string listing concepts the student seems to understand.",
        "gapTags": ["Array of 1 to 3 short phrases (max 4 words) naming the exact learning gaps (e.g., 'ESL Vocabulary', 'Subtraction', 'Word Problems')."],
        "masteryTags": ["Array of 1 to 3 short phrases (max 4 words) naming the exact skills mastered (e.g., 'Fraction Addition', 'Simplifying Fractions')."],
        "recommendations": ["An array of strings with simple remedial actions"],
        "remedialPlan": "5-minute activity following Step 2 localization (dialectContext).",
        "lessonPlan": {
          "title": "A short, engaging title for the activity.",
          "instructions": ["Step 1", "Step 2", "Step 3"]
        },
        "smsDraft": "A short, professional draft SMS to the parent.",
        "score": A number from 0 to 100 for overall mastery across the worksheet,
        "gesAlignment": null OR { "objectiveId": "", "objectiveTitle": "", "curriculumQuote": "" },
        ${alignedCodeInstruction.trim()},
        ${senWarningJson.trim()}
      }
    `;

    const result = await model.generateContent([prompt, ...imageParts]);
    const jsonString = (await result.response).text();
    const cleanedJson = cleanJsonResponse(jsonString);
    const parsedData = JSON.parse(cleanedJson) as Record<string, unknown>;
    const gesAlignment = mergeGesAlignment(parsedData, allowedObjectiveIds, framework);
    delete parsedData.gesAlignment;
    const alignedStandardCode = parseAlignedStandardCodeFromModel(parsedData.alignedStandardCode);
    delete parsedData.alignedStandardCode;
    const senWarningFlag = parseSenWarningFlagFromModel(parsedData.senWarningFlag);
    delete parsedData.senWarningFlag;
    const report: DiagnosticReport = {
      ...(parsedData as unknown as DiagnosticReport),
      gapTags: normalizeTagArray(parsedData.gapTags),
      masteryTags: normalizeTagArray(parsedData.masteryTags),
      gesAlignment: gesAlignment === undefined ? undefined : gesAlignment,
      alignedStandardCode,
      ...(senWarningFlag !== undefined ? { senWarningFlag } : {}),
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
  observations: string,
  ragOptions?: WorksheetRagOptions
): Promise<DiagnosticReport | null> => {
  if (!API_KEY) {
    alert('Gemini API key is not configured. Please check the console.');
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const rubricsText = manualRubrics.length > 0 ? manualRubrics.map((r) => `- ${r}`).join('\n') : 'None selected.';
    const ragHint = [observations, ...manualRubrics].join(' ');
    const framework = ragOptions?.curriculumFramework ?? 'GES';
    const { formattedContext, allowedObjectiveIds } = resolveCurriculumPayload(
      subject,
      ragHint,
      framework,
      ragOptions?.gradeLevel,
      {
        curriculumContext: ragOptions?.curriculumContext,
        allowedObjectiveIds: ragOptions?.allowedObjectiveIds,
      }
    );
    const globalEngineBlock = buildGlobalCurriculumEngineInstructions(dialectContext);
    const alignmentInstruction = getAlignmentJsonInstruction(framework);
    const alignedCodeInstruction = getAlignedStandardCodeJsonInstruction();
    const senWarningJson = getSenWarningFlagJsonInstruction();
    const temporalBlock = buildLearnerTemporalContextBlock(
      ragOptions?.studentGradeLevel,
      ragOptions?.recentHistorySummary
    );
    const prompt = `
      You are an expert educational diagnostician for multilingual classrooms. Map teacher rubric evidence to curriculumContext, then localize remediation per dialectContext.

      Subject: ${subject}
      ${getDialectInstruction(dialectContext)}
      ${temporalBlock}
      ${LONGITUDINAL_DIAGNOSIS_BLOCK}

      ${globalEngineBlock}

      Teacher-identified rubrics / focus areas:
      ${rubricsText}

      Teacher observations:
      ${observations.trim() || 'No additional observations provided.'}

      curriculumContext (Global Curriculum Engine):
      RETRIEVED_CURRICULUM_CONTEXT:
      ${formattedContext}

      Apply Step 1 and Step 2. Provide diagnosis, mastered concepts, recommendations, localized remedialPlan and lessonPlan, SMS draft, and score.

      ${alignmentInstruction}

      Your response MUST be in strict JSON format with no text outside the JSON object:

      {
        "diagnosis": "A string clearly explaining the primary learning gap.",
        "masteredConcepts": "A string listing concepts the student likely understands.",
        "gapTags": ["Array of 1 to 3 short phrases (max 4 words) naming the exact learning gaps (e.g., 'ESL Vocabulary', 'Subtraction', 'Word Problems')."],
        "masteryTags": ["Array of 1 to 3 short phrases (max 4 words) naming the exact skills mastered (e.g., 'Fraction Addition', 'Simplifying Fractions')."],
        "recommendations": ["An array of strings with simple remedial actions"],
        "remedialPlan": "5-minute activity following Step 2 localization (dialectContext).",
        "lessonPlan": {
          "title": "A short, engaging title for the activity.",
          "instructions": ["Step 1", "Step 2", "Step 3"]
        },
        "smsDraft": "A short, professional draft SMS to the parent.",
        "score": A number from 0 to 100,
        "gesAlignment": null OR { "objectiveId": "", "objectiveTitle": "", "curriculumQuote": "" },
        ${alignedCodeInstruction.trim()},
        ${senWarningJson.trim()}
      }
    `;

    const result = await model.generateContent(prompt);
    const jsonString = (await result.response).text();
    const cleanedJson = cleanJsonResponse(jsonString);
    const parsedData = JSON.parse(cleanedJson) as Record<string, unknown>;
    const gesAlignment = mergeGesAlignment(parsedData, allowedObjectiveIds, framework);
    delete parsedData.gesAlignment;
    const alignedStandardCode = parseAlignedStandardCodeFromModel(parsedData.alignedStandardCode);
    delete parsedData.alignedStandardCode;
    const senWarningFlag = parseSenWarningFlagFromModel(parsedData.senWarningFlag);
    delete parsedData.senWarningFlag;
    const report: DiagnosticReport = {
      ...(parsedData as unknown as DiagnosticReport),
      gapTags: normalizeTagArray(parsedData.gapTags),
      masteryTags: normalizeTagArray(parsedData.masteryTags),
      gesAlignment: gesAlignment === undefined ? undefined : gesAlignment,
      alignedStandardCode,
      ...(senWarningFlag !== undefined ? { senWarningFlag } : {}),
    };
    return report;
  } catch (error) {
    console.error('Error calling Gemini API (manual entry):', error);
    alert('An error occurred while generating the diagnosis. Please check the console for details.');
    return null;
  }
};
