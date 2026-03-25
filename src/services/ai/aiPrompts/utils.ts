import { validateCurriculumObjectiveId, type CurriculumFramework } from '../curriculumRagService';
import type { GesAlignment, SenWarningFlag } from './types';

const SEN_WARNING_SEVERITIES = new Set(['low', 'medium', 'high']);
const SEN_WARNING_CATEGORIES = new Set<string>([
  'Dyscalculia',
  'Dyslexia',
  'Dysgraphia',
  'Visual-Spatial',
  'Auditory-Processing',
  'Other',
]);

/**
 * Escape backslashes and double quotes so untrusted text is safer inside structured prompts.
 */
export function escapeForPrompt(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * Strip markdown code fences, then extract the outermost JSON object or array by bracket span.
 * Falls back to fence-stripped trimmed text if no `{`/`[` opener is found (legacy / non-JSON).
 */
export function cleanJsonResponse(jsonString: string): string {
  let s = jsonString.replace(/```json\s*/gi, '').replace(/```/g, '').trim();

  const iBrace = s.indexOf('{');
  const iBracket = s.indexOf('[');

  let start = -1;
  let open: '{' | '[' | null = null;

  if (iBrace >= 0 && iBracket >= 0) {
    start = Math.min(iBrace, iBracket);
    open = start === iBrace ? '{' : '[';
  } else if (iBrace >= 0) {
    start = iBrace;
    open = '{';
  } else if (iBracket >= 0) {
    start = iBracket;
    open = '[';
  }

  if (start < 0 || !open) {
    return s;
  }

  const close = open === '{' ? '}' : ']';
  const end = s.lastIndexOf(close);
  if (end < start) {
    return s;
  }

  return s.slice(start, end + 1);
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
      CURRICULUM ALIGNMENT (Ghana GES pilot RAG):
      Use ONLY the RETRIEVED_CURRICULUM_CONTEXT block below. You MUST cite exactly one OBJECTIVE_ID from that list, or set gesAlignment to null if none fit.
      "gesAlignment": null OR {
        "objectiveId": "Exact OBJECTIVE_ID string from the list (e.g. GES Numeracy 6.2.1)",
        "objectiveTitle": "Short title matching the curriculum",
        "curriculumQuote": "One short sentence tying the student's gap to that objective"
      }
`;

export function getAlignmentJsonInstruction(framework: CurriculumFramework = 'GES'): string {
  if (framework === 'Cambridge') {
    return `
      CURRICULUM ALIGNMENT (Cambridge Primary pilot — Mathematics and/or English as provided in context):
      Use ONLY the RETRIEVED_CURRICULUM_CONTEXT block below. If the block is a fallback message with no OBJECTIVE_ID lines, set gesAlignment and alignedStandardCode to null. Otherwise cite exactly one OBJECTIVE_ID from the list, or set gesAlignment to null if none fit.
      "gesAlignment": null OR {
        "objectiveId": "Exact OBJECTIVE_ID from the list (e.g. MATH-G1-NUM-01 or ENG-G1-PHO-01)",
        "objectiveTitle": "Short title matching the skill line in the list",
        "curriculumQuote": "One short sentence tying the learner gap to CAMBRIDGE_STANDARD / DIAGNOSTIC_TRIGGER language"
      }
`;
  }
  return GES_ALIGNMENT_JSON_INSTRUCTION;
}

export function mergeGesAlignment(
  parsedData: Record<string, unknown>,
  allowedObjectiveIds: string[],
  curriculumFramework: CurriculumFramework = 'GES'
): GesAlignment | null | undefined {
  const raw = parsedData.gesAlignment;
  if (raw === null) return null;
  if (!raw || typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;
  const id = typeof o.objectiveId === 'string' ? o.objectiveId.trim() : '';
  if (!id) return null;
  const validated = validateCurriculumObjectiveId(id, allowedObjectiveIds, curriculumFramework);
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

/**
 * Two-step Global Curriculum Engine workflow: align to retrieved standards/triggers, then localize remediation.
 * `dialectContext` is the teacher-facing locale label (e.g. "Twi", "Ghanaian/Twi", "French", or empty).
 */
export function buildGlobalCurriculumEngineInstructions(dialectContext: string): string {
  const trimmed = dialectContext?.trim() ?? '';
  const localeExamples = describeLocaleExamplesForDialect(trimmed);

  return `
      GLOBAL CURRICULUM ENGINE — FOLLOW THESE STEPS IN ORDER:

      Step 1: Analyze the error (or observation evidence) against the provided curriculumContext delivered below as RETRIEVED_CURRICULUM_CONTEXT (e.g. Cambridge standards with CAMBRIDGE_STANDARD and DIAGNOSTIC_TRIGGER lines, or GES objectives). Identify the best-matching objective and the exact diagnosticTrigger language that fits the learner's mistake or gap.

      Step 2: Generate the remedial plan, lessonPlan instructions, and concrete recommendations. You MUST adhere to the chosen standard's learning objective and conceptual target (e.g. Cambridge learning outcome), BUT you MUST translate all practical examples, numbers-in-context, and manipulatives into the local reality implied by dialectContext. ${localeExamples}

      TEACHER_LOCAL_CONTEXT (dialectContext): ${trimmed ? `"${trimmed.replace(/"/g, '\\"')}"` : '"None specified — use British/international classroom norms: pounds or euros if money examples are needed, standard classroom manipulatives, culturally neutral names unless the worksheet already specifies names."'}
`;
}

function describeLocaleExamplesForDialect(dialectContext: string): string {
  const d = dialectContext.toLowerCase();
  if (!d || d === 'none') {
    return 'If dialectContext is empty or "None", treat as British/international: use pounds/euros where currency appears and standard classroom manipulatives.';
  }
  if (/twi|ga|ewe|dagbani|ghana|ghanaian|cedis?|cedi|akan/.test(d)) {
    return 'If the context is Ghana (e.g. Ghanaian/Twi or related): use Ghana Cedis (GH₵) for money; use local names (e.g. Kwame, Ama, Kofi, Abena); use materials common in Ghanaian classrooms or homes — bottle caps, pebbles, sticks, recycled containers — not Western-only specialty kits unless already on the page.';
  }
  return 'If dialectContext suggests another locale (e.g. French): match currencies, typical names, and manipulatives to that context.';
}

/** JSON fragment for DiagnosticReport — keep in sync with worksheet + hybrid prompts. */
export function getAlignedStandardCodeJsonInstruction(): string {
  return `
        "alignedStandardCode": null OR "Official Cambridge code string copied from the CAMBRIDGE_STANDARD line in RETRIEVED_CURRICULUM_CONTEXT (the shorthand before the em dash, e.g. 1Nc2 or 1Rw1). Use null when the framework is GES-only, no Cambridge line applies, or no code appears."
`;
}

export function parseAlignedStandardCodeFromModel(raw: unknown): string | null | undefined {
  if (raw === null) return null;
  if (typeof raw !== 'string') return undefined;
  const t = raw.trim();
  if (!t || /^null$/i.test(t)) return null;
  return t;
}

/** JSON fragment for DiagnosticReport.senWarningFlag — must match {@link SenWarningFlag} exactly. */
export function getSenWarningFlagJsonInstruction(): string {
  return `
        "senWarningFlag": null OR {
          "severity": "low" | "medium" | "high",
          "category": "Dyscalculia" | "Dyslexia" | "Dysgraphia" | "Visual-Spatial" | "Auditory-Processing" | "Other",
          "reason": "Brief non-clinical explanation referencing grade band and/or history when applicable"
        }`;
}

/**
 * Validates model output against {@link SenWarningFlag}. Returns undefined if malformed (field omitted from report).
 */
/** Injected into worksheet / hybrid prompts when grade and/or history are provided. */
export function buildLearnerTemporalContextBlock(
  studentGradeLevel?: number,
  recentHistorySummary?: string,
  officialSenStatus?: string
): string {
  const parts: string[] = [];
  if (typeof studentGradeLevel === 'number' && Number.isFinite(studentGradeLevel)) {
    parts.push(
      `STUDENT_GRADE_LEVEL (developmental band for time-aware analysis): ${studentGradeLevel} — interpret as the learner's current grade/year (e.g. P1≈1 … P6≈6, JHS1≈7 as used locally).`
    );
  }
  if (recentHistorySummary?.trim()) {
    parts.push(`RECENT_HISTORY_SUMMARY:\n${recentHistorySummary.trim()}`);
  }
  if (officialSenStatus?.trim()) {
    parts.push(`OFFICIAL_SEN_STATUS:\n${officialSenStatus.trim()}`);
  }
  if (!parts.length) return '';
  return `
      TIME-AWARE LEARNER CONTEXT (use with LONGITUDINAL DIAGNOSIS):
      ${parts.join('\n\n')}
`;
}

export const LONGITUDINAL_DIAGNOSIS_BLOCK = `
      LONGITUDINAL DIAGNOSIS:
      Evaluate the student's error relative to their Grade Level (if provided above as STUDENT_GRADE_LEVEL). A spatial error (like misaligning decimals or writing letters backward) in Grade 1 or 2 is often a normal developmental phase. However, if the exact same spatial or phonetic error occurs in Grade 5, 6, or JHS, it is a severe developmental red flag.
      If you detect an error that is highly atypical for the student's age, OR if their RECENT_HISTORY_SUMMARY shows chronic failure in this specific domain, you MUST generate an "senWarningFlag" in your JSON output exactly matching the schema. If neither applies, set "senWarningFlag" to null. Non-clinical educational screening only — never state a medical diagnosis.
`;

export function parseSenWarningFlagFromModel(raw: unknown): SenWarningFlag | null | undefined {
  if (raw === null) return null;
  if (!raw || typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;
  const sevRaw = typeof o.severity === 'string' ? o.severity.trim().toLowerCase() : '';
  if (!SEN_WARNING_SEVERITIES.has(sevRaw)) return undefined;
  const category = typeof o.category === 'string' ? o.category.trim() : '';
  if (!SEN_WARNING_CATEGORIES.has(category)) return undefined;
  const reason = typeof o.reason === 'string' ? o.reason.trim() : '';
  if (!reason) return undefined;
  return {
    severity: sevRaw as SenWarningFlag['severity'],
    category: category as SenWarningFlag['category'],
    reason,
  };
}

/** Only inject translation rule when a dialect is actually selected (not "None" or empty). */
export function getDialectInstruction(dialectContext: string): string {
  const hasDialect = dialectContext && dialectContext !== 'None' && dialectContext.trim() !== '';
  return hasDialect
    ? `CRITICAL ESL CONTEXT: The student's primary home language is ${dialectContext}. If the error is related to an English vocabulary misunderstanding (ESL context), you MUST explicitly include the translation of the misunderstood English mathematical term into ${dialectContext} within the Remedial Plan to help the teacher bridge the linguistic divide.`
    : `Analyze the error purely based on standard mathematical/literacy concepts without assuming an ESL translation gap.`;
}
