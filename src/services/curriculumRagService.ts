import { GES_CURRICULUM_PILOT, type GesCurriculumChunk } from '../data/gesCurriculumPilot';
import { cambridgeMathTaxonomy, type CurriculumObjective } from '../data/cambridgeTaxonomy';
import { cambridgeEnglishTaxonomy } from '../data/cambridgeEnglishTaxonomy';

export type CurriculumFramework = 'GES' | 'Cambridge';

const CAMBRIDGE_NO_MATCH_LITERACY =
  'No specific Cambridge Literacy standard found for this input. Please analyze using general pedagogical principles.';

const CAMBRIDGE_NO_MATCH_NUMERACY =
  'No specific Cambridge Primary Mathematics standard found for this input. Please analyze using general pedagogical principles.';

/** Best-effort parse from roster grade labels (e.g. "Grade 2", "P3"). */
export function parseGradeLevelFromLabel(grade: string | undefined): number | undefined {
  if (!grade?.trim()) return undefined;
  const m = grade.match(/\b([1-9]|1[0-2])\b/);
  if (m) return Number(m[1]);
  return undefined;
}

function normalizeSubject(subject: string): 'numeracy' | 'literacy' {
  const s = subject.toLowerCase();
  return s.includes('liter') ? 'literacy' : 'numeracy';
}

function scoreGesChunk(chunk: GesCurriculumChunk, subject: 'numeracy' | 'literacy', haystack: string): number {
  let score = 0;
  if (chunk.subject === subject || chunk.subject === 'both') score += 3;
  const h = haystack.toLowerCase();
  for (const kw of chunk.keywords) {
    if (h.includes(kw.toLowerCase())) score += 2;
  }
  return score;
}

/**
 * Keyword-based GES retrieval MVP (no embeddings).
 */
export function retrieveGesForAnalysis(subject: string, hintText: string): {
  chunks: GesCurriculumChunk[];
  formattedContext: string;
  allowedObjectiveIds: string[];
} {
  const subj = normalizeSubject(subject);
  const haystack = `${hintText} ${subject}`.trim();
  const ranked = [...GES_CURRICULUM_PILOT]
    .map((c) => ({ c, s: scoreGesChunk(c, subj, haystack) }))
    .sort((a, b) => b.s - a.s);

  const top = ranked.filter((r) => r.s > 0).slice(0, 4).map((r) => r.c);
  const chunks = top.length > 0 ? top : ranked.slice(0, 3).map((r) => r.c);

  const lines = chunks.map((ch) => {
    return [
      `OBJECTIVE_ID: ${ch.objectiveId}`,
      `TITLE: ${ch.objectiveTitle}`,
      `STRAND: ${ch.strand} | GRADE: ${ch.gradeBand}`,
      `EXCERPT: ${ch.excerpt}`,
    ].join('\n');
  });

  const formattedContext = [
    'The following Ghana Education Service (GES) curriculum excerpts were retrieved for alignment. You MUST only cite objective IDs that appear exactly below (copy the OBJECTIVE_ID string verbatim).',
    '',
    ...lines,
  ].join('\n\n');

  return {
    chunks,
    formattedContext,
    allowedObjectiveIds: chunks.map((c) => c.objectiveId),
  };
}

function tokenizeHint(haystack: string): string[] {
  return haystack
    .toLowerCase()
    .split(/[^a-z0-9+]+/g)
    .filter((t) => t.length > 1);
}

function scoreCambridgeObjective(
  obj: CurriculumObjective,
  haystack: string,
  subj: 'numeracy' | 'literacy'
): number {
  const h = haystack.toLowerCase();
  const blob = `${obj.ixlStyleSkill} ${obj.domain} ${obj.cambridgeStandard} ${obj.diagnosticTrigger}`.toLowerCase();
  let score = 0;
  for (const tok of tokenizeHint(haystack)) {
    if (tok.length > 2 && blob.includes(tok)) score += 2;
  }
  if (subj === 'numeracy') {
    if (h.includes('numer') || h.includes('fraction') || h.includes('add') || h.includes('subtract')) {
      if (blob.includes('add') || blob.includes('subtract') || blob.includes('digit') || blob.includes('number'))
        score += 1;
    }
  } else {
    if (
      h.includes('read') ||
      h.includes('spell') ||
      h.includes('writ') ||
      h.includes('story') ||
      h.includes('senten') ||
      h.includes('phon') ||
      h.includes('word')
    ) {
      if (
        blob.includes('read') ||
        blob.includes('spell') ||
        blob.includes('senten') ||
        blob.includes('story') ||
        blob.includes('phonic') ||
        blob.includes('word')
      )
        score += 1;
    }
  }
  return score;
}

function formatCambridgeObjectivesBlock(
  objectives: CurriculumObjective[],
  stream: 'numeracy' | 'literacy'
): string {
  const lines = objectives.map((o) => {
    return [
      `OBJECTIVE_ID: ${o.id}`,
      `GRADE_LEVEL: ${o.gradeLevel}`,
      `DOMAIN: ${o.domain}`,
      `SKILL: ${o.ixlStyleSkill}`,
      `CAMBRIDGE_STANDARD: ${o.cambridgeStandard}`,
      `DIAGNOSTIC_TRIGGER: ${o.diagnosticTrigger}`,
    ].join('\n');
  });

  const header =
    stream === 'literacy'
      ? 'The following Cambridge Primary English / Literacy objectives were retrieved (top matches). You MUST only cite objective IDs that appear exactly below (copy OBJECTIVE_ID verbatim, e.g. ENG-G1-PHO-01).'
      : 'The following Cambridge Primary Mathematics objectives were retrieved (top matches). You MUST only cite objective IDs that appear exactly below (copy OBJECTIVE_ID verbatim, e.g. MATH-G1-NUM-01).';

  return [header, '', ...lines].join('\n\n');
}

/**
 * Cambridge pilot RAG: chooses **math** vs **English** taxonomy from `assessmentType` / subject (`numeracy` | `literacy`).
 * If keyword scores are all zero (e.g. math worksheet mis-tagged as literacy), returns a safe fallback and an empty allowlist.
 */
export function retrieveCambridgeForAnalysis(
  subject: string,
  hintText: string,
  gradeLevel?: number
): {
  objectives: CurriculumObjective[];
  formattedContext: string;
  allowedObjectiveIds: string[];
  stream: 'numeracy' | 'literacy';
} {
  const subj = normalizeSubject(subject);
  const haystack = `${hintText} ${subject}`.trim();
  const taxonomy = subj === 'literacy' ? cambridgeEnglishTaxonomy : cambridgeMathTaxonomy;

  let pool = [...taxonomy];
  if (typeof gradeLevel === 'number' && gradeLevel >= 1 && gradeLevel <= 12) {
    const filtered = pool.filter((o) => o.gradeLevel === gradeLevel);
    if (filtered.length > 0) pool = filtered;
  }

  const ranked = pool
    .map((o) => ({ o, s: scoreCambridgeObjective(o, haystack, subj) }))
    .sort((a, b) => b.s - a.s);

  const positive = ranked.filter((r) => r.s > 0);
  if (positive.length === 0) {
    const formattedContext = subj === 'literacy' ? CAMBRIDGE_NO_MATCH_LITERACY : CAMBRIDGE_NO_MATCH_NUMERACY;
    return {
      objectives: [],
      formattedContext,
      allowedObjectiveIds: [],
      stream: subj,
    };
  }

  const objectives = positive.slice(0, 3).map((r) => r.o);
  const formattedContext = formatCambridgeObjectivesBlock(objectives, subj);

  return {
    objectives,
    formattedContext,
    allowedObjectiveIds: objectives.map((o) => o.id),
    stream: subj,
  };
}

/**
 * @deprecated Prefer {@link retrieveCambridgeForAnalysis}; kept for named clarity in math-only call sites.
 * Delegates to unified retrieval (still respects `subject` for numeracy vs literacy).
 */
export function retrieveCambridgeMathForAnalysis(
  subject: string,
  hintText: string,
  gradeLevel?: number
): {
  objectives: CurriculumObjective[];
  formattedContext: string;
  allowedObjectiveIds: string[];
} {
  const r = retrieveCambridgeForAnalysis(subject, hintText, gradeLevel);
  return {
    objectives: r.objectives,
    formattedContext: r.formattedContext,
    allowedObjectiveIds: r.allowedObjectiveIds,
  };
}

/**
 * Unified curriculum RAG entry: Ghana GES pilot vs Cambridge International (math + English pilots by assessment type).
 */
export function getCurriculumContext(
  subject: string,
  hintText: string,
  curriculumFramework: CurriculumFramework,
  gradeLevel?: number
): {
  formattedContext: string;
  allowedObjectiveIds: string[];
  framework: CurriculumFramework;
} {
  if (curriculumFramework === 'Cambridge') {
    const { formattedContext, allowedObjectiveIds } = retrieveCambridgeForAnalysis(subject, hintText, gradeLevel);
    return { formattedContext, allowedObjectiveIds, framework: 'Cambridge' };
  }
  const { formattedContext, allowedObjectiveIds } = retrieveGesForAnalysis(subject, hintText);
  return { formattedContext, allowedObjectiveIds, framework: 'GES' };
}

export function validateGesObjectiveId(
  claimedId: string | undefined,
  allowed: string[]
): { objectiveId: string; objectiveTitle: string; excerpt: string; verified: boolean } | null {
  return validateCurriculumObjectiveId(claimedId, allowed, 'GES');
}

function findCambridgeObjectiveById(id: string): CurriculumObjective | undefined {
  return cambridgeMathTaxonomy.find((o) => o.id === id) ?? cambridgeEnglishTaxonomy.find((o) => o.id === id);
}

export function validateCurriculumObjectiveId(
  claimedId: string | undefined,
  allowed: string[],
  framework: CurriculumFramework
): { objectiveId: string; objectiveTitle: string; excerpt: string; verified: boolean } | null {
  if (!claimedId || typeof claimedId !== 'string') return null;
  const trimmed = claimedId.trim();

  if (framework === 'Cambridge') {
    const obj = findCambridgeObjectiveById(trimmed);
    if (!obj) return null;
    const verified = allowed.includes(trimmed);
    return {
      objectiveId: obj.id,
      objectiveTitle: obj.ixlStyleSkill,
      excerpt: `${obj.cambridgeStandard} — Typical gap signal: ${obj.diagnosticTrigger}`,
      verified,
    };
  }

  const chunk = GES_CURRICULUM_PILOT.find((c) => c.objectiveId === trimmed);
  if (!chunk) return null;
  const verified = allowed.includes(trimmed);
  return {
    objectiveId: chunk.objectiveId,
    objectiveTitle: chunk.objectiveTitle,
    excerpt: chunk.excerpt,
    verified,
  };
}
