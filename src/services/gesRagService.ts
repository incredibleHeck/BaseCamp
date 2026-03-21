import { GES_CURRICULUM_PILOT, type GesCurriculumChunk } from '../data/gesCurriculumPilot';

function normalizeSubject(subject: string): 'numeracy' | 'literacy' {
  const s = subject.toLowerCase();
  return s.includes('liter') ? 'literacy' : 'numeracy';
}

function scoreChunk(chunk: GesCurriculumChunk, subject: 'numeracy' | 'literacy', haystack: string): number {
  let score = 0;
  if (chunk.subject === subject || chunk.subject === 'both') score += 3;
  const h = haystack.toLowerCase();
  for (const kw of chunk.keywords) {
    if (h.includes(kw.toLowerCase())) score += 2;
  }
  return score;
}

/**
 * Keyword-based retrieval MVP (no embeddings). Returns formatted context for prompts and allowlisted IDs.
 */
export function retrieveGesForAnalysis(subject: string, hintText: string): {
  chunks: GesCurriculumChunk[];
  formattedContext: string;
  allowedObjectiveIds: string[];
} {
  const subj = normalizeSubject(subject);
  const haystack = `${hintText} ${subject}`.trim();
  const ranked = [...GES_CURRICULUM_PILOT]
    .map((c) => ({ c, s: scoreChunk(c, subj, haystack) }))
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

export function validateGesObjectiveId(
  claimedId: string | undefined,
  allowed: string[]
): { objectiveId: string; objectiveTitle: string; excerpt: string; verified: boolean } | null {
  if (!claimedId || typeof claimedId !== 'string') return null;
  const trimmed = claimedId.trim();
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
