import type { Assessment } from './assessmentService';
import type { Student } from './studentService';

/** One JSONL line for a pilot corpus (no names / ids). */
export interface DeidentifiedAssessmentSnippet {
  type: 'Literacy' | 'Numeracy';
  gapTags: string[];
  masteryTags: string[];
  diagnosisSnippet: string;
  remedialSnippet: string;
  score?: number;
}

function scrub(text: string, maxLen: number): string {
  const t = text.replace(/\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g, '[name]').replace(/\d{10,}/g, '[phone]').trim();
  return t.length > maxLen ? `${t.slice(0, maxLen)}…` : t;
}

/**
 * Only include students who opted in (school consent / research flag).
 */
export function buildPilotExportLines(
  students: Student[],
  assessments: Assessment[]
): DeidentifiedAssessmentSnippet[] {
  const optedIn = new Set(
    students.filter((s) => s.trainingDataOptIn === true && s.id).map((s) => s.id as string)
  );
  const lines: DeidentifiedAssessmentSnippet[] = [];
  for (const a of assessments) {
    if (!optedIn.has(a.studentId)) continue;
    lines.push({
      type: a.type,
      gapTags: a.gapTags ?? [],
      masteryTags: a.masteryTags ?? [],
      diagnosisSnippet: scrub(a.diagnosis ?? '', 400),
      remedialSnippet: scrub(a.remedialPlan ?? '', 300),
      score: typeof a.score === 'number' ? a.score : undefined,
    });
  }
  return lines;
}

export function pilotCorpusToJsonl(lines: DeidentifiedAssessmentSnippet[]): string {
  return lines.map((l) => JSON.stringify(l)).join('\n');
}
