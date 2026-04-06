import { API_KEY, genAI, GEMINI_MODEL } from './geminiClient';
import type { AiCurriculumPromptType, DiagnosticReport, MathLessonPlanResult } from './types';
import { cleanJsonResponse, escapeForPrompt, getCurriculumPromptAlignmentBlock, normalizeStringArray } from './utils';

const DEFAULT_GRADE_LEVEL = 4;
/** Full K–9 product scope; grades 10–12 still accepted from rosters and map to the 7–9 concrete band. */
const MIN_GRADE = 1;
const MAX_GRADE_ACCEPTED = 12;
const K9_MAX = 9;

function resolveGradeLevel(raw?: number): number {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    const g = Math.round(raw);
    if (g >= MIN_GRADE && g <= MAX_GRADE_ACCEPTED) return g;
  }
  return DEFAULT_GRADE_LEVEL;
}

function resolveDialect(raw?: string | null): { label: string; active: boolean } {
  const t = raw?.trim() ?? '';
  if (!t || t.toLowerCase() === 'none') return { label: '', active: false };
  return { label: t, active: true };
}

/** Cambridge TWM strand labels (Cambridge Primary Mathematics — Thinking and Working Mathematically). */
const TWM_STRANDS = [
  'Specialising',
  'Generalising',
  'Conjecturing',
  'Convincing',
  'Characterising',
  'Classifying',
  'Critiquing',
  'Improving',
] as const;

/**
 * Multi-shot system-style instructions: CPA, TWM, age-scaled concrete materials (Grades 1–9), optional translanguaging.
 */
function buildCambridgeMathMasterEducatorPrompt(
  grade: number,
  dialectLabel: string,
  translanguaging: boolean
): string {
  const twmList = TWM_STRANDS.join(', ');
  const gradeBandNote =
    grade > K9_MAX
      ? `\nNOTE: studentGradeLevel is ${grade} (above the K–9 taxonomy cap). Use the same concrete-resource and dignity rules as Grades 7–9, but pitch notation and exam language to this older band.\n`
      : '';

  const concreteMaterialsBand =
    grade <= 3
      ? `GRADES 1–3 (Concrete resources): Use locally-sourced, zero-cost manipulatives from the learner's immediate environment: small stones, bottle caps, sticks, leaves, seeds, or drawn counters on scrap paper. Keep activities dignified and culturally familiar.`
      : grade <= 6
        ? `GRADES 4–6 (Concrete resources): Prefer social or scenario-based “concrete” work: role-play (e.g. market trader, shopkeeper), sketching local currency, simple timetables, or measuring familiar spaces with a ruler/string—strictly low-resource (no purchased kits).`
        : `GRADES 7–9 / JHS (Concrete resources): Avoid childish games. Use geometric sketching, simple maps/scale drawings, community problems (budget slices, yield comparisons, distance/time planning), or data from a believable local context—all with paper/pencil and mental estimation.`;

  const translanguagingBlock = translanguaging
    ? `
THE TRANSLANGUAGING BRIDGE (ESL) — REQUIRED FOR THIS LEARNER:
- dialectContext is set to: "${escapeForPrompt(dialectLabel)}".
- Phase 1 (Concrete): Conduct the entire Concrete phase in "${escapeForPrompt(dialectLabel)}" FIRST to secure conceptual understanding (counting, comparing, explaining “what happened” in the manipulation).
- Phase 2 (Pictorial): Continue primarily in "${escapeForPrompt(dialectLabel)}" while labelling the drawing; begin introducing key English math terms beside the picture.
- Phase 3 (Abstract): Shift to clear academic English for symbols, equations, and Cambridge-style vocabulary; explicitly connect each new English term back to what was said/drawn in "${escapeForPrompt(dialectLabel)}".
- In JSON, populate "translanguagingCues" with 2–5 short, actionable lines the teacher can say (mix of "${escapeForPrompt(dialectLabel)}" and English glosses).
`.trim()
    : `
LANGUAGE:
- No local dialect specified. Conduct all phases in clear academic English appropriate to grade ${grade}.
- Set "translanguagingCues" to [] (empty array).
`.trim();

  return `
You are a Master Cambridge Primary Mathematics educator. You design 10-minute remedial micro-interventions that align with the spirit and pedagogy of the Cambridge Primary Mathematics programme and Teacher Guide: CPA progression, Thinking and Working Mathematically (TWM), and age-appropriate, locally-sourced resources.

PLATFORM SCOPE: The product’s Cambridge math standards span Grades 1 through 9 (full K–9). Always match CPA depth, vocabulary, and notation to studentGradeLevel (${grade}) within that progression.${gradeBandNote}

=== NON-NEGOTIABLE: CPA STRUCTURE ===
Every lesson plan MUST contain three explicit phases in order (label each in the instruction steps):
1) Phase 1 — Concrete: Physical or embodied manipulation using ONLY zero-cost, local materials (see band below).
2) Phase 2 — Pictorial: Learner draws or sketches the situation (number line, bar model, diagram, table) that mirrors the concrete action.
3) Phase 3 — Abstract: Connect to symbols, formal notation, and precise Cambridge-style vocabulary (e.g. “partition”, “quotient”, “multiple”) without skipping the prior phases.

=== NON-NEGOTIABLE: THINKING AND WORKING MATHEMATICALLY (TWM) ===
The eight Cambridge TWM characteristics are: ${twmList}.
- You MUST make at least ONE TWM strand visible in the teacher’s prompts (use the verb forms naturally), e.g. “Ask the learner to conjecture what will happen if…”, “Ask them to convince you why…”, “Have them classify these examples…”, “Invite them to critique this mistaken strategy…”.
- Name the chosen strand once in an instruction step (e.g. “TWM — Convincing: …”).

=== AGE-SCALED CONCRETE MATERIALS ===
${concreteMaterialsBand}

${translanguagingBlock}

=== MULTI-SHOT EXEMPLARS (style only — do not copy numbers/topics) ===

Exemplar A (Grade 2, subtraction as take-away, Twi translanguaging):
- Phase 1 — Concrete: “Fa aboɔ a ɛwɔ hɔ no ka …” [Learner physically separates a set.]
- Phase 2 — Pictorial: Draw circles and cross out; label “dɛn a aka?”
- Phase 3 — Abstract: Write the subtraction sentence in English; link “minus” to what they did in Twi.

Exemplar B (Grade 4, comparing fractions, English only):
- Phase 1 — Concrete: Fold scrap-paper strips to show halves and quarters.
- Phase 2 — Pictorial: Draw a bar model; shade parts; label numerators/denominators.
- Phase 3 — Abstract: Use inequality symbols; TWM — Convincing: “Convince your partner which fraction is larger and why.”

Exemplar C (Grade 6, introducing unknowns/algebra, English only):
- Phase 1 — Concrete: Use a sealed box and loose stones to represent an unknown quantity plus knowns.
- Phase 2 — Pictorial: Draw a bar model showing the total and the unknown section.
- Phase 3 — Abstract: Write the equation (e.g., x + 4 = 10); TWM — Characterising: “Ask the learner to characterise the relationship between the total and the parts.”

=== OUTPUT DISCIPLINE ===
- Total time: about 10 minutes; keep instructions concise (typically 6–10 steps including phase labels).
- "materialsNeeded": ONLY low-resource items (paper, pencil, found objects). If nothing special, list minimal items e.g. ["Paper", "Pencil"].
- "estimatedDuration": always a string such as "10 minutes".
`.trim();
}

function buildReportPayload(report: DiagnosticReport): string {
  const rec = escapeForPrompt(
    report.recommendations?.length ? report.recommendations.join(' | ') : '(none)'
  );
  const gaps = escapeForPrompt(report.gapTags?.length ? report.gapTags.join(', ') : '(none)');
  const isCambridgeRun = report.alignedStandardCode != null && report.alignedStandardCode !== '';
  const curriculumLabel = isCambridgeRun ? 'Cambridge' : 'GES';
  const curriculumLine =
    report.gesAlignment?.objectiveId != null
      ? `${curriculumLabel} Objective: ${report.gesAlignment.excerpt ?? report.gesAlignment.objectiveId} — ${report.gesAlignment.objectiveTitle}`
      : `(no ${curriculumLabel} objective)`;
  const cam = isCambridgeRun
    ? `Cambridge standard code: ${report.alignedStandardCode}`
    : '';

  return `
DIAGNOSTIC REPORT (bind remediation to this evidence):
- Diagnosis / learning gap: ${escapeForPrompt(report.diagnosis ?? '')}
- Mastered concepts (do not re-teach as new): ${escapeForPrompt(report.masteredConcepts ?? '')}
- Gap tags: ${gaps}
- Recommendations: ${rec}
- Remedial plan (distil; do not paste verbatim): ${escapeForPrompt(report.remedialPlan ?? '')}
${cam ? `- ${cam}` : ''}
- ${curriculumLine}
`.trim();
}

function parseMathLessonPlan(raw: unknown): MathLessonPlanResult | null {
  if (raw == null || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const title = typeof o.title === 'string' ? o.title.trim() : '';
  const objective = typeof o.objective === 'string' ? o.objective.trim() : undefined;
  const estimatedDuration =
    typeof o.estimatedDuration === 'string' ? o.estimatedDuration.trim() : '10 minutes';
  const materialsNeeded = normalizeStringArray(o.materialsNeeded);
  const instructions = normalizeStringArray(o.instructions);
  const translanguagingCues = normalizeStringArray(o.translanguagingCues);

  if (!title || instructions.length < 3) return null;
  return {
    title,
    objective,
    estimatedDuration: estimatedDuration || '10 minutes',
    materialsNeeded,
    instructions,
    translanguagingCues,
  };
}

/**
 * Generate a Cambridge-aligned 10-minute math remedial lesson (CPA + TWM + optional translanguaging).
 *
 * @param report — Full diagnostic report (gap, mastery, curriculum hooks).
 * @param studentGradeLevel — Numeric grade 1–12 (Cambridge stage / JHS aligned).
 * @param dialectContext — Local language label for ESL bridge, or null/empty/\"None\" for English-only.
 * @param curriculumContext — RAG or teacher-pasted Cambridge / syllabus text to ground vocabulary and objectives.
 * @param curriculumType — Cambridge vs GES vs blended alignment for the model.
 */
export async function generateMathLessonPlan(
  report: DiagnosticReport,
  studentGradeLevel: number,
  dialectContext: string | null | undefined,
  curriculumContext: string,
  curriculumType?: AiCurriculumPromptType
): Promise<MathLessonPlanResult | null> {
  if (!API_KEY) {
    console.error('Gemini API key is not configured.');
    return null;
  }

  const grade = resolveGradeLevel(studentGradeLevel);
  const { label: dialectLabel, active: translanguaging } = resolveDialect(dialectContext);
  const cc = typeof curriculumContext === 'string' ? curriculumContext.trim() : '';
  const curriculumBlock =
    cc.length > 0
      ? escapeForPrompt(cc)
      : '(No extra curriculum context supplied — use Cambridge Primary Mathematics progression appropriate to the gap.)';

  const masterPrompt = buildCambridgeMathMasterEducatorPrompt(grade, dialectLabel, translanguaging);
  const reportBlock = buildReportPayload(report);

  const isCambridge = report.alignedStandardCode != null && report.alignedStandardCode !== '';
  const objectiveInstruction = isCambridge 
    ? `\n- You MUST explicitly output the specific Cambridge taxonomy/objective at the very beginning of your response in the "objective" field.`
    : '';

  const userTask = `
${masterPrompt}

${getCurriculumPromptAlignmentBlock(curriculumType)}

=== CURRICULUM / RAG CONTEXT (ground objectives and wording) ===
${curriculumBlock}

=== LEARNER REPORT ===
${reportBlock}

=== TASK ===
Produce ONE new 10-minute remedial lesson plan for the mathematics gap above. Ground remediation in Cambridge-aligned progression for Grades 1–9 at studentGradeLevel ${grade}. Follow CPA explicitly, include at least one TWM strand with a clear teacher prompt, respect the age band for concrete materials, and comply with translanguaging rules if a dialect was specified.${objectiveInstruction}

Respond with STRICT JSON ONLY (no markdown fences, no commentary):
{
  "title": "Short engaging title",
  "objective": "The specific taxonomy/objective for this lesson",
  "estimatedDuration": "10 minutes",
  "materialsNeeded": ["Low-resource item 1", "Low-resource item 2"],
  "instructions": [
    "Phase 1 — Concrete: ...",
    "Phase 2 — Pictorial: ...",
    "Phase 3 — Abstract: ...",
    "(additional micro-steps as needed)"
  ],
  "translanguagingCues": ["Cue 1", "Cue 2"]
}
`.trim();

  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const result = await model.generateContent(userTask);
    const text = (await result.response).text();
    const cleaned = cleanJsonResponse(text);
    const parsed = JSON.parse(cleaned) as unknown;
    const plan = parseMathLessonPlan(parsed);
    if (!plan) throw new Error('Invalid math lesson plan JSON structure');
    return plan;
  } catch (e) {
    console.error('generateMathLessonPlan failed:', e);
    return null;
  }
}
