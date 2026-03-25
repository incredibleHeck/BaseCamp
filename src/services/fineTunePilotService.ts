import type { Assessment, Student } from '../types/domain';
import { anonymizeAssessmentPayload } from '../utils/piiAnonymizer';

/** One JSONL line for a pilot corpus (no names / ids). */
export interface DeidentifiedAssessmentSnippet {
  type: 'Literacy' | 'Numeracy';
  gapTags: string[];
  masteryTags: string[];
  diagnosisSnippet: string;
  remedialSnippet: string;
  score?: number;
}

export class TrainingExportConsentDeniedError extends Error {
  constructor(message = 'Student has declined data processing consent; record cannot be exported for training.') {
    super(message);
    this.name = 'TrainingExportConsentDeniedError';
  }
}

/** Throws if the student has explicitly opted out of data processing for training exports. */
export function assertTrainingDataProcessingConsent(student: Student | null | undefined): void {
  if (student?.dataProcessingConsent === false) {
    throw new TrainingExportConsentDeniedError();
  }
}

function scrub(text: string, maxLen: number): string {
  const t = text.replace(/\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g, '[name]').replace(/\d{10,}/g, '[phone]').trim();
  return t.length > maxLen ? `${t.slice(0, maxLen)}…` : t;
}

function snippetFromAnonymizedAssessment(a: Assessment): DeidentifiedAssessmentSnippet {
  return {
    type: a.type,
    gapTags: a.gapTags ?? [],
    masteryTags: a.masteryTags ?? [],
    diagnosisSnippet: scrub(a.diagnosis ?? '', 400),
    remedialSnippet: scrub(a.remedialPlan ?? '', 300),
    score: typeof a.score === 'number' ? a.score : undefined,
  };
}

/**
 * Only include students who opted in (school consent / research flag).
 * Skips any assessment whose student has {@link Student.dataProcessingConsent} === false.
 * Payloads are passed through {@link anonymizeAssessmentPayload} before snippet extraction.
 */
export function buildPilotExportLines(
  students: Student[],
  assessments: Assessment[]
): DeidentifiedAssessmentSnippet[] {
  const byId = new Map<string, Student>();
  for (const s of students) {
    if (s.id?.trim()) byId.set(s.id.trim(), s);
  }

  const optedIn = new Set(
    students.filter((s) => s.trainingDataOptIn === true && s.id?.trim()).map((s) => s.id!.trim())
  );
  const lines: DeidentifiedAssessmentSnippet[] = [];

  for (const a of assessments) {
    const sid = a.studentId?.trim();
    if (!sid || !optedIn.has(sid)) continue;
    const student = byId.get(sid);
    if (student?.dataProcessingConsent === false) continue;

    const safe = anonymizeAssessmentPayload(a, student);
    lines.push(snippetFromAnonymizedAssessment(safe));
  }
  return lines;
}

export function pilotCorpusToJsonl(lines: DeidentifiedAssessmentSnippet[]): string {
  return lines.map((l) => JSON.stringify(l)).join('\n');
}
