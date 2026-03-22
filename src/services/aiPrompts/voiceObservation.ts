import type { VoiceObservationAnalysis } from '../observationService';
import type { Assessment } from '../assessmentService';
import type { Student } from '../studentService';
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
  normalizeStringArray,
  normalizeTagArray,
  parseAlignedStandardCodeFromModel,
  parseSenWarningFlagFromModel,
} from './utils';

/** Strip `data:*;base64,` prefix if present — Gemini expects raw base64 in inlineData. */
export function stripInlineBase64(raw: string): string {
  const s = raw?.trim() ?? '';
  const i = s.indexOf(',');
  return i >= 0 ? s.slice(i + 1) : s;
}

/** Parse MIME from a `data:mime;base64,...` URL (returns undefined if not a data URL). */
export function mimeFromDataUrl(dataUrl: string): string | undefined {
  const m = /^data:([^;]+);base64,/i.exec(dataUrl.trim());
  return m ? m[1].trim() : undefined;
}

function safeAudioMime(mimeType: string): string {
  return mimeType.split(';')[0].trim() || 'audio/webm';
}

function safeImageMime(mimeType: string): string {
  const m = mimeType.split(';')[0].trim().toLowerCase();
  if (m === 'image/png' || m === 'image/webp' || m === 'image/gif') return m;
  return 'image/jpeg';
}

export type WorksheetImageInline = { base64: string; mimeType: string };

export interface MultimodalVoiceObservationParams {
  audioBase64: string;
  audioMimeType: string;
  studentDisplayName: string;
  /** Stringified JSON or text summary of historical gaps / assessments. */
  studentContext: string;
  /** Optional worksheet or exercise photo to align audio with written work. */
  worksheetImage?: WorksheetImageInline | null;
}

function assessmentTimeLabel(ts: Assessment['timestamp']): string {
  try {
    if (ts instanceof Date) return ts.toISOString().slice(0, 10);
    if (typeof ts === 'number') return new Date(ts).toISOString().slice(0, 10);
    const anyTs = ts as { toDate?: () => Date };
    if (anyTs && typeof anyTs.toDate === 'function') return anyTs.toDate().toISOString().slice(0, 10);
  } catch {
    /* ignore */
  }
  return 'unknown date';
}

/**
 * Compact, culturally aware context block for Gemini (Ghanaian classroom + prior gaps).
 */
export function buildStudentContextForHybridPrompt(
  student: Student | null,
  history: Assessment[],
  maxEntries = 8
): string {
  const lines: string[] = [];
  if (student) {
    lines.push(`Learner name: ${student.name}`);
    lines.push(`Grade / class context: ${student.grade || 'Not specified'}`);
  } else {
    lines.push('Learner profile: not loaded from roster.');
  }

  const slice = history.slice(0, maxEntries);
  if (!slice.length) {
    lines.push('Historical assessments in BaseCamp: none recorded yet for this learner.');
    return lines.join('\n');
  }

  lines.push('Recent formal assessments in BaseCamp (newest first; use to spot recurring gaps):');
  for (const a of slice) {
    const gaps = (a.gapTags ?? []).join(', ') || '—';
    const mastered = (a.masteryTags ?? []).join(', ') || '—';
    const diag = (a.diagnosis ?? '').replace(/\s+/g, ' ').trim();
    const excerpt = diag.length > 180 ? `${diag.slice(0, 177)}…` : diag;
    lines.push(
      `- [${a.type}] ${assessmentTimeLabel(a.timestamp)} | score: ${typeof a.score === 'number' ? a.score : 'n/a'} | gap tags: ${gaps} | mastered: ${mastered} | diagnosis: ${excerpt || '—'}`
    );
  }
  return lines.join('\n');
}

const VOICE_OBSERVATION_JSON_SCHEMA = `
      OUTPUT: strict JSON only, no markdown or prose outside the object:
      {
        "transcript": "Full transcription of the teacher audio (faithful; may include local names or code-switching).",
        "eslNotes": "If relevant, English/L2 vocabulary or grammar implied by the observation; else brief 'None noted'.",
        "phoneticObservations": "If relevant, phoneme/grapheme or decoding patterns; else brief 'None noted'.",
        "suggestedTeacherActions": ["1–3 concrete next steps grounded in the identified pedagogical gap"],
        "senScreeningHints": "Non-medical screening-style note for the SEN coordinator if patterns warrant follow-up; never state a medical diagnosis."
      }
`;

function buildVoiceObservationUserPrompt(
  studentDisplayName: string,
  studentContext: string,
  hasWorksheetImage: boolean
): string {
  const visualClause = hasWorksheetImage
    ? 'Listen to the teacher audio and view the attached worksheet image. Use both together to infer what the learner actually produced or struggled with.'
    : 'Listen to the teacher audio only.';

  return `
      You are an expert Ghanaian educational diagnostician working in the tradition of careful classroom observation (GES-aligned, culturally grounded).

      You are evaluating a student named ${studentDisplayName}.

      HISTORICAL PROFILE (from this school's records — weigh recurring gap tags heavily):
      ${studentContext.trim() || 'No prior context supplied.'}

      ${visualClause}
      Determine the exact pedagogical learning gap implied by the evidence. Ground your reasoning in West African classroom realities (large classes, multilingual learners, local materials) without stereotyping individuals.

      ${VOICE_OBSERVATION_JSON_SCHEMA}
    `;
}

/**
 * Multimodal voice (and optional worksheet image) → structured observation JSON for storage / SEN hints.
 */
export async function analyzeMultimodalVoiceObservation(
  params: MultimodalVoiceObservationParams
): Promise<VoiceObservationAnalysis | null> {
  if (!API_KEY) {
    alert('Gemini API key is not configured. Please check the console.');
    return null;
  }
  const audioData = stripInlineBase64(params.audioBase64);
  if (!audioData) return null;

  const safeMime = safeAudioMime(params.audioMimeType);
  const hasImage = Boolean(params.worksheetImage?.base64?.trim());

  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const audioPart = { inlineData: { data: audioData, mimeType: safeMime } };
    const parts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [
      { text: buildVoiceObservationUserPrompt(params.studentDisplayName, params.studentContext, hasImage) },
      audioPart,
    ];

    if (hasImage && params.worksheetImage) {
      const imgData = stripInlineBase64(params.worksheetImage.base64);
      if (imgData) {
        parts.push({
          inlineData: {
            data: imgData,
            mimeType: safeImageMime(params.worksheetImage.mimeType),
          },
        });
      }
    }

    const result = await model.generateContent(parts);
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
    console.error('analyzeMultimodalVoiceObservation failed:', error);
    return null;
  }
}

/**
 * Same multimodal payload as above, but returns a full {@link DiagnosticReport} for the assessment pipeline
 * (action plan, GES alignment, Firestore save).
 */
export async function analyzeHybridTeacherDiagnostic(
  params: MultimodalVoiceObservationParams & {
    subject: string;
    /** Teacher locale label (e.g. Twi, Ghanaian/Twi, French) — drives remedial localization. */
    dialectContext: string;
    curriculumFramework?: CurriculumFramework;
    gradeLevel?: number;
    /** Global Curriculum Engine formatted block; pass with `allowedObjectiveIds` to skip internal RAG. */
    curriculumContext?: string;
    allowedObjectiveIds?: string[];
    studentGradeLevel?: number;
    recentHistorySummary?: string;
  }
): Promise<DiagnosticReport | null> {
  if (!API_KEY) {
    alert('Gemini API key is not configured. Please check the console.');
    return null;
  }
  const audioData = stripInlineBase64(params.audioBase64);
  if (!audioData) return null;

  const safeMime = safeAudioMime(params.audioMimeType);
  const hasImage = Boolean(params.worksheetImage?.base64?.trim());
  const ragHint = [params.studentContext, params.studentDisplayName].join(' ').slice(0, 800);
  const framework = params.curriculumFramework ?? 'GES';
  const injectedCtx = params.curriculumContext?.trim();
  const injectedIds = params.allowedObjectiveIds;

  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const { formattedContext, allowedObjectiveIds } =
      injectedCtx && Array.isArray(injectedIds)
        ? { formattedContext: injectedCtx, allowedObjectiveIds: injectedIds }
        : getCurriculumContext(params.subject, ragHint, framework, params.gradeLevel);
    const globalEngineBlock = buildGlobalCurriculumEngineInstructions(params.dialectContext);
    const alignmentInstruction = getAlignmentJsonInstruction(framework);
    const alignedCodeInstruction = getAlignedStandardCodeJsonInstruction();
    const senWarningJson = getSenWarningFlagJsonInstruction();
    const temporalBlock = buildLearnerTemporalContextBlock(
      params.studentGradeLevel,
      params.recentHistorySummary
    );
    const dialectInstruction = getDialectInstruction(params.dialectContext);

    const visualBlock = hasImage
      ? 'A worksheet or written exercise image is attached. Combine what you hear in the audio with what you see on the page to localize the primary learning gap.'
      : 'Only audio is attached; infer the gap from the teacher’s oral observation.';

    const prompt = `
      You are an expert educational diagnostician for multilingual classrooms. Map audio (+ optional image) evidence to curriculumContext, then localize remediation per dialectContext.

      LEARNER: ${params.studentDisplayName}

      PRIOR CONTEXT (recurring gaps and mastery — use to avoid misdiagnosis):
      ${params.studentContext.trim() || 'No structured history supplied.'}

      ${dialectInstruction}
      ${temporalBlock}
      ${LONGITUDINAL_DIAGNOSIS_BLOCK}

      ${globalEngineBlock}

      ${visualBlock}

      curriculumContext (Global Curriculum Engine):
      RETRIEVED_CURRICULUM_CONTEXT:
      ${formattedContext}

      Apply Step 1 and Step 2. Produce one integrated diagnostic: primary gap, mastered concepts, recommendations, remedialPlan and lessonPlan localized per dialectContext, SMS draft, score 0–100.

      ${alignmentInstruction}

      Your response MUST be strict JSON only, no other text:
      {
        "diagnosis": "Clear explanation of the primary pedagogical learning gap.",
        "masteredConcepts": "Concepts the learner likely understands given audio (+ image if any).",
        "gapTags": ["1–3 short phrases (max 4 words) for gaps"],
        "masteryTags": ["1–3 short phrases (max 4 words) for strengths"],
        "recommendations": ["Remedial actions for the teacher"],
        "remedialPlan": "5-minute activity following Step 2 localization (dialectContext).",
        "lessonPlan": { "title": "Short title", "instructions": ["Step 1", "Step 2", "Step 3"] },
        "smsDraft": "Professional SMS to parent/guardian.",
        "score": 0,
        "gesAlignment": null OR { "objectiveId": "", "objectiveTitle": "", "curriculumQuote": "" },
        ${alignedCodeInstruction.trim()},
        ${senWarningJson.trim()}
      }
    `;

    const parts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [
      { text: prompt },
      { inlineData: { data: audioData, mimeType: safeMime } },
    ];

    if (hasImage && params.worksheetImage) {
      const imgData = stripInlineBase64(params.worksheetImage.base64);
      if (imgData) {
        parts.push({
          inlineData: {
            data: imgData,
            mimeType: safeImageMime(params.worksheetImage.mimeType),
          },
        });
      }
    }

    const result = await model.generateContent(parts);
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
    console.error('analyzeHybridTeacherDiagnostic failed:', error);
    alert('An error occurred during hybrid assessment. Please check the console for details.');
    return null;
  }
}

/** Backward-compatible entry for voice queue sync; defaults context when omitted. */
export async function transcribeAndAnalyzeVoiceObservation(
  audioBase64Raw: string,
  mimeType: string,
  options?: Partial<Pick<MultimodalVoiceObservationParams, 'studentDisplayName' | 'studentContext' | 'worksheetImage'>>
): Promise<VoiceObservationAnalysis | null> {
  return analyzeMultimodalVoiceObservation({
    audioBase64: audioBase64Raw,
    audioMimeType: mimeType,
    studentDisplayName: options?.studentDisplayName ?? 'the learner',
    studentContext: options?.studentContext?.trim()
      ? options.studentContext
      : 'No prior assessment history was provided for this learner.',
    worksheetImage: options?.worksheetImage ?? undefined,
  });
}
