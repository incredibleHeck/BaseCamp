import type { Assessment, Student } from '../types/domain';

const STUDENT_PLACEHOLDER = '[STUDENT]';

/** Deterministic pseudo-id for the same Firestore `studentId` (no reversible secret; not a cryptographic guarantee). */
export function stableLearnerPseudoId(studentId: string): string {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < studentId.length; i++) {
    h ^= studentId.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return `learner_${h.toString(16)}_${studentId.length}`;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Replace known student name tokens (full name and individual parts) in free text.
 */
export function redactStudentNameInText(text: string, student?: Student): string {
  if (!student?.name?.trim()) return text;
  let out = text;
  const full = student.name.trim();
  const parts = full.split(/\s+/).filter((p) => p.length > 0);
  const ordered = [...parts].sort((a, b) => b.length - a.length);
  for (const part of ordered) {
    if (part.length < 2) continue;
    const re = new RegExp(`\\b${escapeRegExp(part)}\\b`, 'gi');
    out = out.replace(re, STUDENT_PLACEHOLDER);
  }
  if (full.length >= 2) {
    const reFull = new RegExp(escapeRegExp(full).replace(/\s+/g, '\\s+'), 'gi');
    out = out.replace(reFull, STUDENT_PLACEHOLDER);
  }
  return out;
}

/** Heuristic patterns for names / long digit sequences that may be phone or IDs. */
export function redactHeuristicPII(text: string): string {
  return text
    .replace(/\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g, '[name]')
    .replace(/\d{10,}/g, '[phone]');
}

function anonymizeTextField(text: string | undefined, student?: Student): string | undefined {
  if (text === undefined) return undefined;
  return redactHeuristicPII(redactStudentNameInText(text, student));
}

/**
 * Deep copy of an assessment suitable for external model-training pipelines:
 * replaces `studentId` with a stable pseudo-id, strips document/actor linkage fields,
 * and redacts learner-identifying strings in narrative and tag fields.
 */
export function anonymizeAssessmentPayload(assessment: Assessment, student?: Student): Assessment {
  const copy = JSON.parse(JSON.stringify(assessment)) as Assessment;
  copy.studentId = stableLearnerPseudoId(assessment.studentId);
  copy.id = undefined;
  copy.createdByUserId = undefined;
  copy.schoolId = undefined;
  copy.cohortId = undefined;

  copy.diagnosis = anonymizeTextField(copy.diagnosis, student) ?? '';
  copy.masteredConcepts = anonymizeTextField(copy.masteredConcepts, student);
  copy.remedialPlan = anonymizeTextField(copy.remedialPlan, student);
  copy.extensionActivity = anonymizeTextField(copy.extensionActivity, student);
  copy.classLabel = anonymizeTextField(copy.classLabel, student);
  copy.gesObjectiveTitle = anonymizeTextField(copy.gesObjectiveTitle, student);
  copy.gesCurriculumExcerpt = anonymizeTextField(copy.gesCurriculumExcerpt, student);
  copy.playbookTitle = anonymizeTextField(copy.playbookTitle, student);

  if (copy.lessonPlan) {
    copy.lessonPlan = {
      title: anonymizeTextField(copy.lessonPlan.title, student) ?? '',
      instructions: (copy.lessonPlan.instructions ?? []).map((x) => anonymizeTextField(x, student) ?? ''),
    };
  }
  if (copy.worksheet) {
    copy.worksheet = {
      title: anonymizeTextField(copy.worksheet.title, student) ?? '',
      questions: (copy.worksheet.questions ?? []).map((x) => anonymizeTextField(x, student) ?? ''),
    };
  }

  if (copy.gapTags?.length) {
    copy.gapTags = copy.gapTags.map((t) => anonymizeTextField(t, student) ?? t);
  }
  if (copy.masteryTags?.length) {
    copy.masteryTags = copy.masteryTags.map((t) => anonymizeTextField(t, student) ?? t);
  }

  if (copy.senWarningFlag && typeof copy.senWarningFlag === 'object') {
    copy.senWarningFlag = {
      ...copy.senWarningFlag,
      reason: anonymizeTextField(copy.senWarningFlag.reason, student) ?? copy.senWarningFlag.reason,
    };
  }

  return copy;
}
