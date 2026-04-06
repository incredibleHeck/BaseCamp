import {
  analyzeHybridTeacherDiagnostic,
  analyzeManualEntry,
  analyzeWorksheet,
  analyzeWorksheetMultiple,
  buildStudentContextForHybridPrompt,
  generateExtensionActivity,
  generateSubjectRoutedLessonPlan,
  MASTERY_EXTENSION_LESSON_PLACEHOLDER,
  resolveAiCurriculumPromptType,
  type AiCurriculumPromptType,
  type DiagnosticReport as AIDiagnosticReport,
  shouldUseExtensionActivity,
} from './ai/aiPrompts';
import { getStudentHistory, type Assessment } from './assessmentService';
import { getStudent } from './studentService';
import { getCurriculumContext, type CurriculumFramework } from './ai/curriculumRagService';
import {
  buildRecentHistorySummaryForLongitudinalPrompt,
  parseGradeLevelFromStudentRecord,
} from '../utils/longitudinalPromptHelpers';

/** When student + history are already loaded (e.g. hybrid), avoids duplicate fetches. */
export type LongitudinalPrefetchedStudentContext = {
  student: Awaited<ReturnType<typeof getStudent>>;
  history: Assessment[];
};

export type EnrichedPipelineReport = AIDiagnosticReport & {
  criticalGap?: string;
};

export async function loadLongitudinalPromptFields(
  studentId: string | undefined,
  assessmentType: string,
  fallbackGradeLevel: number | undefined,
  prefetched?: LongitudinalPrefetchedStudentContext
): Promise<{ studentGradeLevel?: number; recentHistorySummary?: string; officialSenStatus?: string }> {
  const out: { studentGradeLevel?: number; recentHistorySummary?: string; officialSenStatus?: string } = {};

  if (!studentId?.trim()) {
    if (typeof fallbackGradeLevel === 'number' && Number.isFinite(fallbackGradeLevel)) {
      out.studentGradeLevel = fallbackGradeLevel;
    }
    return out;
  }

  try {
    let student: Awaited<ReturnType<typeof getStudent>>;
    let history: Assessment[];
    if (prefetched) {
      student = prefetched.student;
      history = prefetched.history;
    } else {
      [student, history] = await Promise.all([getStudent(studentId), getStudentHistory(studentId)]);
    }
    const fromRecord = parseGradeLevelFromStudentRecord(student);
    out.studentGradeLevel =
      fromRecord ??
      (typeof fallbackGradeLevel === 'number' && Number.isFinite(fallbackGradeLevel)
        ? fallbackGradeLevel
        : undefined);

    if (student?.officialSenStatus) {
      out.officialSenStatus = student.officialSenStatus;
    }

    const summary = buildRecentHistorySummaryForLongitudinalPrompt(history ?? [], assessmentType);
    if (summary) out.recentHistorySummary = summary;
  } catch {
    if (typeof fallbackGradeLevel === 'number' && Number.isFinite(fallbackGradeLevel)) {
      out.studentGradeLevel = fallbackGradeLevel;
    }
  }

  return out;
}

function subjectKeyFromAssessmentType(assessmentType: string): 'literacy' | 'numeracy' {
  return assessmentType === 'literacy' || assessmentType.toLowerCase().includes('lit')
    ? 'literacy'
    : 'numeracy';
}

export function buildFullReport(result: AIDiagnosticReport): EnrichedPipelineReport {
  return {
    ...result,
    criticalGap: result.diagnosis,
    lessonPlan: result.lessonPlan ?? {
      title: 'No lesson plan',
      instructions: [],
    },
  };
}

async function enrichReportAfterPrimaryDiagnosis(
  report: AIDiagnosticReport,
  subjectKey: 'literacy' | 'numeracy',
  curriculumContext: string,
  opts: {
    studentGradeLevel?: number;
    dialectContext?: string | undefined;
    curriculumType?: AiCurriculumPromptType;
  }
): Promise<AIDiagnosticReport> {
  const gradeForLesson =
    typeof opts.studentGradeLevel === 'number' && Number.isFinite(opts.studentGradeLevel)
      ? opts.studentGradeLevel
      : 4;
  const dialect = opts.dialectContext;

  if (shouldUseExtensionActivity(report)) {
    const ext = await generateExtensionActivity({
      report,
      studentGradeLevel: opts.studentGradeLevel,
      dialectContext: dialect,
      curriculumContext,
      curriculumType: opts.curriculumType,
    });
    if (ext) {
      return {
        ...report,
        extensionActivity: ext,
        lessonPlan: MASTERY_EXTENSION_LESSON_PLACEHOLDER,
      };
    }
    const enrichedLesson = await generateSubjectRoutedLessonPlan(
      report,
      subjectKey,
      subjectKey,
      gradeForLesson,
      dialect,
      curriculumContext,
      opts.curriculumType
    );
    return {
      ...report,
      lessonPlan: enrichedLesson ?? report.lessonPlan,
    };
  }

  const enrichedLesson = await generateSubjectRoutedLessonPlan(
    report,
    subjectKey,
    subjectKey,
    gradeForLesson,
    dialect,
    curriculumContext,
    opts.curriculumType
  );
  return {
    ...report,
    lessonPlan: enrichedLesson ?? report.lessonPlan,
  };
}

export type AssessmentPipelineInput =
  | {
      variant: 'hybrid';
      studentId: string;
      audioBase64: string;
      audioMimeType: string;
      worksheetImage?: { base64: string; mimeType: string };
      assessmentType: string;
      dialectContext: string;
      curriculumFramework: CurriculumFramework;
      gradeLevel?: number;
      /** School-level override; falls back to mapping from `curriculumFramework`. */
      aiCurriculumPromptType?: AiCurriculumPromptType;
    }
  | {
      variant: 'worksheet';
      studentId?: string | null;
      assessmentType: string;
      dialectContext: string;
      curriculumFramework: CurriculumFramework;
      gradeLevel?: number;
      images: string[];
      aiCurriculumPromptType?: AiCurriculumPromptType;
    }
  | {
      variant: 'manual';
      studentId?: string | null;
      assessmentType: string;
      dialectContext: string;
      curriculumFramework: CurriculumFramework;
      gradeLevel?: number;
      manualRubric: string[];
      observations: string;
      aiCurriculumPromptType?: AiCurriculumPromptType;
    }
  | {
      variant: 'batch_detect';
      assessmentType: string;
      dialectContext: string;
      curriculumFramework: CurriculumFramework;
      gradeLevel?: number;
      imageBase64: string;
      classRoster: { studentId: string; name: string }[];
      aiCurriculumPromptType?: AiCurriculumPromptType;
    };

export type AssessmentPipelineResult =
  | { ok: true; report: EnrichedPipelineReport }
  | { ok: false; reason: 'missing_student' | 'missing_assessment_type' | 'no_images' | 'null_report' | 'exception'; error?: unknown };

/**
 * Single orchestration path: longitudinal context → Cambridge/GES RAG → primary diagnosis →
 * gifted extension routing → subject-routed lesson plan enrichment.
 */
export async function executeFullAssessmentPipeline(
  payload: AssessmentPipelineInput
): Promise<AssessmentPipelineResult> {
  try {
    if (payload.variant === 'hybrid') {
      const {
        studentId,
        audioBase64,
        audioMimeType,
        worksheetImage,
        assessmentType,
        dialectContext,
        curriculumFramework,
        gradeLevel,
        aiCurriculumPromptType: aiPromptOverride,
      } = payload;
      if (!studentId?.trim()) return { ok: false, reason: 'missing_student' };
      if (!assessmentType) return { ok: false, reason: 'missing_assessment_type' };

      const subjectKey = subjectKeyFromAssessmentType(assessmentType);

      const [student, history] = await Promise.all([getStudent(studentId), getStudentHistory(studentId)]);
      const studentContext = buildStudentContextForHybridPrompt(student, history);
      const displayName = student?.name ?? 'the learner';
      const hybridRagHint = [studentContext, displayName].join(' ').slice(0, 800);
      const hybridRag = getCurriculumContext(subjectKey, hybridRagHint, curriculumFramework, gradeLevel);
      const curriculumPromptType = resolveAiCurriculumPromptType(aiPromptOverride ?? null, curriculumFramework);

      const longitudinal = await loadLongitudinalPromptFields(studentId, assessmentType, gradeLevel, {
        student,
        history,
      });

      const raw = await analyzeHybridTeacherDiagnostic({
        audioBase64,
        audioMimeType,
        studentDisplayName: displayName,
        studentContext,
        worksheetImage,
        subject: subjectKey,
        dialectContext,
        curriculumFramework,
        gradeLevel,
        curriculumContext: hybridRag.formattedContext,
        allowedObjectiveIds: hybridRag.allowedObjectiveIds,
        studentGradeLevel: longitudinal.studentGradeLevel,
        recentHistorySummary: longitudinal.recentHistorySummary,
        curriculumType: curriculumPromptType,
      });

      if (!raw) return { ok: false, reason: 'null_report' };

      const dialectForLesson = dialectContext.trim() ? dialectContext : undefined;
      const merged = await enrichReportAfterPrimaryDiagnosis(raw, subjectKey, hybridRag.formattedContext, {
        studentGradeLevel: longitudinal.studentGradeLevel,
        dialectContext: dialectForLesson,
        curriculumType: curriculumPromptType,
      });

      return { ok: true, report: buildFullReport(merged) };
    }

    if (payload.variant === 'batch_detect') {
      const {
        assessmentType,
        dialectContext,
        curriculumFramework,
        gradeLevel,
        imageBase64,
        classRoster,
        aiCurriculumPromptType: aiPromptOverride,
      } = payload;
      if (!assessmentType) return { ok: false, reason: 'missing_assessment_type' };

      const subjectKey = subjectKeyFromAssessmentType(assessmentType);
      const rag = getCurriculumContext(subjectKey, '', curriculumFramework, gradeLevel);
      const curriculumPromptType = resolveAiCurriculumPromptType(aiPromptOverride ?? null, curriculumFramework);

      const raw = await analyzeWorksheet(imageBase64, assessmentType, dialectContext, {
        autoDetectStudent: true,
        classRoster,
        curriculumFramework,
        gradeLevel,
        curriculumContext: rag.formattedContext,
        allowedObjectiveIds: rag.allowedObjectiveIds,
        curriculumType: curriculumPromptType,
      });

      if (!raw) return { ok: false, reason: 'null_report' };

      const resolvedId = raw.detectedStudentId?.trim() ?? null;
      const longitudinal = resolvedId
        ? await loadLongitudinalPromptFields(resolvedId, assessmentType, gradeLevel)
        : { studentGradeLevel: gradeLevel, recentHistorySummary: undefined };

      const dialectForLesson = dialectContext.trim() ? dialectContext : undefined;
      const merged = await enrichReportAfterPrimaryDiagnosis(raw, subjectKey, rag.formattedContext, {
        studentGradeLevel: longitudinal.studentGradeLevel,
        dialectContext: dialectForLesson,
        curriculumType: curriculumPromptType,
      });

      return { ok: true, report: buildFullReport(merged) };
    }

    if (payload.variant === 'manual') {
      const {
        studentId,
        assessmentType,
        dialectContext,
        curriculumFramework,
        gradeLevel,
        manualRubric,
        observations,
        aiCurriculumPromptType: aiPromptOverride,
      } = payload;
      if (!assessmentType) return { ok: false, reason: 'missing_assessment_type' };

      const subjectKey = subjectKeyFromAssessmentType(assessmentType);
      const manualHint = [observations.trim(), ...manualRubric].join(' ');
      const longitudinal = await loadLongitudinalPromptFields(
        studentId ?? undefined,
        assessmentType,
        gradeLevel
      );
      const rag = getCurriculumContext(assessmentType, manualHint, curriculumFramework, gradeLevel);
      const curriculumPromptType = resolveAiCurriculumPromptType(aiPromptOverride ?? null, curriculumFramework);

      const raw = await analyzeManualEntry(
        assessmentType,
        dialectContext,
        manualRubric,
        observations.trim(),
        {
          curriculumFramework,
          gradeLevel,
          curriculumContext: rag.formattedContext,
          allowedObjectiveIds: rag.allowedObjectiveIds,
          curriculumType: curriculumPromptType,
          ...longitudinal,
        }
      );

      if (!raw) return { ok: false, reason: 'null_report' };

      const dialectForLesson = dialectContext.trim() ? dialectContext : undefined;
      const merged = await enrichReportAfterPrimaryDiagnosis(raw, subjectKey, rag.formattedContext, {
        studentGradeLevel: longitudinal.studentGradeLevel,
        dialectContext: dialectForLesson,
        curriculumType: curriculumPromptType,
      });

      return { ok: true, report: buildFullReport(merged) };
    }

    // worksheet (single or multi page)
    const {
      studentId,
      assessmentType,
      dialectContext,
      curriculumFramework,
      gradeLevel,
      images,
      aiCurriculumPromptType: aiPromptOverride,
    } = payload;
    if (!assessmentType) return { ok: false, reason: 'missing_assessment_type' };
    const nonEmpty = images.filter((s) => s && String(s).trim().length > 0);
    if (nonEmpty.length === 0) return { ok: false, reason: 'no_images' };

    const subjectKey = subjectKeyFromAssessmentType(assessmentType);
    const longitudinal = await loadLongitudinalPromptFields(studentId ?? undefined, assessmentType, gradeLevel);
    const rag = getCurriculumContext(assessmentType, '', curriculumFramework, gradeLevel);
    const curriculumPromptType = resolveAiCurriculumPromptType(aiPromptOverride ?? null, curriculumFramework);
    const baseOpts = {
      curriculumFramework,
      gradeLevel,
      curriculumContext: rag.formattedContext,
      allowedObjectiveIds: rag.allowedObjectiveIds,
      curriculumType: curriculumPromptType,
      ...longitudinal,
    };

    const raw =
      nonEmpty.length > 1
        ? await analyzeWorksheetMultiple(nonEmpty, assessmentType, dialectContext, baseOpts)
        : await analyzeWorksheet(nonEmpty[0], assessmentType, dialectContext, baseOpts);

    if (!raw) return { ok: false, reason: 'null_report' };

    const dialectForLesson = dialectContext.trim() ? dialectContext : undefined;
    const merged = await enrichReportAfterPrimaryDiagnosis(raw, subjectKey, rag.formattedContext, {
      studentGradeLevel: longitudinal.studentGradeLevel,
      dialectContext: dialectForLesson,
      curriculumType: curriculumPromptType,
    });

    return { ok: true, report: buildFullReport(merged) };
  } catch (error) {
    return { ok: false, reason: 'exception', error };
  }
}
