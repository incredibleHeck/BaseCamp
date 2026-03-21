import { validateGesObjectiveId } from '../gesRagService';
import type { GesAlignment } from './types';

export function cleanJsonResponse(jsonString: string): string {
  return jsonString.replace(/```json\n?|```/g, '').trim();
}

/** Ensure we always have string[] for tag fields (model may return array or comma-separated string). */
export function normalizeTagArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v) => typeof v === 'string' && v.trim()).map((v) => v.trim());
  if (typeof value === 'string' && value.trim()) return value.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
  return [];
}

export function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v) => typeof v === 'string' && v.trim()).map((v) => v.trim());
  return [];
}

export const GES_ALIGNMENT_JSON_INSTRUCTION = `
      GES CURRICULUM ALIGNMENT (Phase 2 RAG):
      Use ONLY the RETRIEVED_GES_CONTEXT block below. You MUST cite exactly one objective ID from that list, or set gesAlignment to null if none fit.
      "gesAlignment": null OR {
        "objectiveId": "Exact OBJECTIVE_ID string from the list (e.g. GES Numeracy 6.2.1)",
        "objectiveTitle": "Short title matching the curriculum",
        "curriculumQuote": "One short sentence tying the student's gap to that objective"
      }
`;

export function mergeGesAlignment(
  parsedData: Record<string, unknown>,
  allowedObjectiveIds: string[]
): GesAlignment | null | undefined {
  const raw = parsedData.gesAlignment;
  if (raw === null) return null;
  if (!raw || typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;
  const id = typeof o.objectiveId === 'string' ? o.objectiveId.trim() : '';
  if (!id) return null;
  const validated = validateGesObjectiveId(id, allowedObjectiveIds);
  if (!validated) return null;
  const title =
    typeof o.objectiveTitle === 'string' && o.objectiveTitle.trim()
      ? o.objectiveTitle.trim()
      : validated.objectiveTitle;
  const excerpt =
    typeof o.curriculumQuote === 'string' && o.curriculumQuote.trim()
      ? o.curriculumQuote.trim()
      : validated.excerpt;
  return {
    objectiveId: validated.objectiveId,
    objectiveTitle: title,
    excerpt,
    verified: validated.verified,
  };
}

/** Only inject translation rule when a dialect is actually selected (not "None" or empty). */
export function getDialectInstruction(dialectContext: string): string {
  const hasDialect = dialectContext && dialectContext !== 'None' && dialectContext.trim() !== '';
  return hasDialect
    ? `CRITICAL ESL CONTEXT: The student's primary home language is ${dialectContext}. If the error is related to an English vocabulary misunderstanding (ESL context), you MUST explicitly include the translation of the misunderstood English mathematical term into ${dialectContext} within the Remedial Plan to help the teacher bridge the linguistic divide.`
    : `Analyze the error purely based on standard mathematical/literacy concepts without assuming an ESL translation gap.`;
}
