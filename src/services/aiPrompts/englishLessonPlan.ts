import { API_KEY, genAI, GEMINI_MODEL } from './geminiClient';
import type { DiagnosticReport, EnglishLessonPlanResult } from './types';
import { cleanJsonResponse, normalizeStringArray } from './utils';

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

function escapeForPrompt(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * Multi-shot system-style instructions: Cambridge Primary English literacy phases, age-scaled focus, optional translanguaging.
 */
function buildCambridgeEnglishMasterEducatorPrompt(
  grade: number,
  dialectLabel: string,
  translanguaging: boolean
): string {
  const gradeBandNote =
    grade > K9_MAX
      ? `\nNOTE: studentGradeLevel is ${grade} (above the K–9 taxonomy cap). Use the same literacy depth as Grades 7–9 (JHS): advanced grammar in context, cohesion, and critical analysis—pitched to this older band.\n`
      : '';

  const ageScaledLiteracy =
    grade <= 3
      ? `GRADES 1–3 (Literacy focus): Prioritise Systematic Synthetic Phonics—blending and segmenting CVC and related decodable patterns. Use embodied, multisensory work: sound buttons (dots under graphemes), clapping syllables, air-writing letters/words, physical letter cards or scrap-paper graphemes. Keep all grammar and meaning inside short spoken-and-written phrases (never decontextualised drills). Materials must be zero-cost (scrap paper, chalk, finger tracing in sand/dust if available).`
      : grade <= 6
        ? `GRADES 4–6 (Literacy focus): Prioritise reading comprehension, sentence structure (syntax), and contextual grammar—always anchored in a short authentic text, dialogue, or learner-generated sentence. Avoid isolated grammar worksheets; teach the rule as it functions in meaning (who did what, how ideas link, what the word does in context).`
        : `GRADES 7–9 / JHS (Literacy focus): Prioritise advanced grammar in authentic contexts, paragraph and text cohesion (connectives, reference chains, theme), and critical reading (inference, viewpoint, writer’s purpose). Use age-appropriate, dignified texts (article excerpt, dialogue, poem stanza)—never infantilising scenarios.`;

  const translanguagingBlock = translanguaging
    ? `
THE TRANSLANGUAGING BRIDGE (ESL) — REQUIRED FOR THIS LEARNER:
- dialectContext is set to: "${escapeForPrompt(dialectLabel)}".
- Phase 1 — Oracy: Conduct the ENTIRE Oracy phase in "${escapeForPrompt(dialectLabel)}" FIRST. Secure the concept through hearing, speaking, or discussion (sounds, word meaning, story event, opinion) before any heavy reading of English print.
- Ask explicitly how the learner would say or express the idea, word, or feeling in their mother tongue / home language; accept and validate their wording.
- Phase 2 — Decoding / Text analysis: Move to written English. Explicitly CONTRAST or MAP: what they said in "${escapeForPrompt(dialectLabel)}" ↔ the English grapheme, word, sentence pattern, or grammar rule in the text (e.g. word order, marker words, agreement). Name the bridge aloud (“In English we write/say it this way because…”).
- Phase 3 — Application: Short English output (write a target sentence or read aloud a crafted line applying the rule). Re-link briefly to the home-language phrasing if it helps retention.
- In JSON, populate "translanguagingCues" with 2–5 short, actionable lines the teacher can say (mix of "${escapeForPrompt(dialectLabel)}" and clear English glosses).
`.trim()
    : `
LANGUAGE:
- No local dialect specified. Conduct all phases in clear academic English appropriate to grade ${grade}.
- Set "translanguagingCues" to [] (empty array).
`.trim();

  return `
You are a Master Cambridge Primary English and ESL educator. You design 5-minute remedial micro-interventions that align with the spirit and pedagogy of the Cambridge Primary English programme and Teacher Guide: explicit literacy progression, oracy-first where appropriate, and text-anchored grammar and comprehension.

PLATFORM SCOPE: The product’s Cambridge English standards span Grades 1 through 9 (full K–9). Match vocabulary, text length, and task demand to studentGradeLevel (${grade}) within that progression.${gradeBandNote}

=== NON-NEGOTIABLE: THE CAMBRIDGE LITERACY FRAMEWORK (THREE PHASES) ===
Every lesson plan MUST contain three explicit phases IN ORDER (label each step with the phase name):
1) Phase 1 — Oracy (Speaking & Listening): The learner hears, speaks, or discusses the concept FIRST (e.g. clapping syllables, describing a picture, articulating a phoneme, debating a character’s choice, retelling in own words).
2) Phase 2 — Decoding / Text analysis: Connect the spoken idea to written English—grapheme–phoneme links, highlighting a grammar pattern in a real sentence, mapping word structure, or close reading of a short line.
3) Phase 3 — Application (Reading / Writing): The learner produces a brief, structured outcome—writes a target sentence/phrase OR reads aloud a sentence applying the rule; keep it achievable in the time left.

=== AGE-SCALED LITERACY FOCUS ===
${ageScaledLiteracy}

=== MATERIALS ===
- "materialsNeeded": ONLY zero-cost items (paper, pencil, scrap card, found objects as letter counters). If minimal, use e.g. ["Paper", "Pencil"].

${translanguagingBlock}

=== MULTI-SHOT EXEMPLARS (style only — do not copy exact wording/topics) ===

Exemplar A (Grade 1, phonics / blending, Twi translanguaging):
- Phase 1 — Oracy (Twi): Teacher models the sound; learners say it; discuss a picture of the word in Twi (“Ɛyɛ dɛn?” / how do we say this?). Clap syllables or tap sounds in the home language first.
- Phase 2 — Decoding / Text analysis: Show the written English word; map Twi spoken chunk to English graphemes; sound buttons or finger-trace; blend aloud into English.
- Phase 3 — Application: Child writes the word once on scrap paper OR reads it in a two-word phrase; teacher praises accurate segmenting.

Exemplar B (Grade 4, adjectives / grammar in context, English only):
- Phase 1 — Oracy: Show a simple picture or one-sentence scenario; pairs name nouns and brainstorm “better describing words” orally.
- Phase 2 — Decoding / Text analysis: Display two short sentences (weak vs strong adjective); learner highlights the adjective; discuss how it changes meaning (in context, not abstract rule chart).
- Phase 3 — Application: Learner writes one new sentence about the picture using a precise adjective OR reads aloud the improved sentence with expression.

Exemplar C (Grade 6, reading comprehension / inference, English only):
- Phase 1 — Oracy: Read a short line aloud; ask “What do we know for sure?” vs “What might be true?” orally.
- Phase 2 — Decoding / Text analysis: Highlight clue words; label explicit vs inferred on the page margin in pencil.
- Phase 3 — Application: Learner writes one inference as a full sentence starting with “The text suggests…” OR reads their sentence aloud.

=== OUTPUT DISCIPLINE ===
- Total time: about 5 minutes; keep instructions concise (typically 6–10 steps including phase labels).
- "estimatedDuration": always a string such as "5 minutes".
- Never output markdown code fences around JSON.
`.trim();
}

function buildReportPayload(report: DiagnosticReport): string {
  const rec = report.recommendations?.length ? report.recommendations.join(' | ') : '(none)';
  const gaps = report.gapTags?.length ? report.gapTags.join(', ') : '(none)';
  const ges =
    report.gesAlignment?.objectiveId != null
      ? `GES: ${report.gesAlignment.objectiveId} — ${report.gesAlignment.objectiveTitle}\nExcerpt: ${report.gesAlignment.excerpt}`
      : '(no GES block)';
  const cam =
    report.alignedStandardCode != null && report.alignedStandardCode !== ''
      ? `Cambridge standard code: ${report.alignedStandardCode}`
      : '(no Cambridge code)';

  return `
DIAGNOSTIC REPORT (bind remediation to this evidence):
- Diagnosis / learning gap: ${report.diagnosis}
- Mastered concepts (do not re-teach as new): ${report.masteredConcepts}
- Gap tags: ${gaps}
- Recommendations: ${rec}
- Remedial plan (distil; do not paste verbatim): ${report.remedialPlan}
- ${cam}
- ${ges}
`.trim();
}

function parseEnglishLessonPlan(raw: unknown): EnglishLessonPlanResult | null {
  if (raw == null || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const title = typeof o.title === 'string' ? o.title.trim() : '';
  const estimatedDuration =
    typeof o.estimatedDuration === 'string' ? o.estimatedDuration.trim() : '5 minutes';
  const materialsNeeded = normalizeStringArray(o.materialsNeeded);
  const instructions = normalizeStringArray(o.instructions);
  const translanguagingCues = normalizeStringArray(o.translanguagingCues);

  if (!title || instructions.length < 3) return null;
  return {
    title,
    estimatedDuration: estimatedDuration || '5 minutes',
    materialsNeeded,
    instructions,
    translanguagingCues,
  };
}

/**
 * Generate a Cambridge-aligned 5-minute English / literacy remedial lesson (Oracy → Decoding → Application + optional translanguaging).
 *
 * @param report — Full diagnostic report (gap, mastery, curriculum hooks).
 * @param studentGradeLevel — Numeric grade 1–12 (Cambridge stage / JHS aligned).
 * @param dialectContext — Local language label for ESL bridge, or null/empty/"None" for English-only.
 * @param curriculumContext — RAG or teacher-pasted Cambridge / syllabus text to ground vocabulary and objectives.
 */
export async function generateEnglishLessonPlan(
  report: DiagnosticReport,
  studentGradeLevel: number,
  dialectContext: string | null | undefined,
  curriculumContext: string
): Promise<EnglishLessonPlanResult | null> {
  if (!API_KEY) {
    console.error('Gemini API key is not configured.');
    return null;
  }

  const grade = resolveGradeLevel(studentGradeLevel);
  const { label: dialectLabel, active: translanguaging } = resolveDialect(dialectContext);
  const cc = typeof curriculumContext === 'string' ? curriculumContext.trim() : '';
  const curriculumBlock =
    cc.length > 0
      ? cc
      : '(No extra curriculum context supplied — use Cambridge Primary English progression appropriate to the gap.)';

  const masterPrompt = buildCambridgeEnglishMasterEducatorPrompt(grade, dialectLabel, translanguaging);
  const reportBlock = buildReportPayload(report);

  const userTask = `
${masterPrompt}

=== CURRICULUM / RAG CONTEXT (ground objectives and wording) ===
${curriculumBlock}

=== LEARNER REPORT ===
${reportBlock}

=== TASK ===
Produce ONE new 5-minute remedial lesson plan for the LITERACY / English gap above. Ground remediation in Cambridge Primary English–aligned progression at studentGradeLevel ${grade}. Follow the three phases explicitly (Phase 1 — Oracy, Phase 2 — Decoding / Text analysis, Phase 3 — Application), respect the age-scaled literacy focus for this grade band, use only zero-cost materials, and comply with translanguaging rules if a dialect was specified.

Respond with STRICT JSON ONLY (no markdown fences, no commentary):
{
  "title": "Short engaging title",
  "estimatedDuration": "5 minutes",
  "materialsNeeded": ["Low-resource item 1", "Low-resource item 2"],
  "instructions": [
    "Phase 1 — Oracy: ...",
    "Phase 2 — Decoding / Text analysis: ...",
    "Phase 3 — Application: ...",
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
    const plan = parseEnglishLessonPlan(parsed);
    if (!plan) throw new Error('Invalid English lesson plan JSON structure');
    return plan;
  } catch (e) {
    console.error('generateEnglishLessonPlan failed:', e);
    return null;
  }
}
