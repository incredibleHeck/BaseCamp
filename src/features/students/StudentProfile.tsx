import React, { useState, useEffect, useMemo } from 'react';
import { Download, User, Users, LineChart, ClipboardList, Loader2, AlertTriangle } from 'lucide-react';
import { updateAssessment, type Assessment } from '../../services/assessmentService';
import {
  analyzeLongitudinalSEN,
  formatCurriculumAlignmentLabel,
  generateGamifiedQuiz,
  generatePracticeWorksheet,
  generateSubjectRoutedLessonPlan,
  resolveAiCurriculumPromptType,
  type DiagnosticReport,
  type SenRiskReport,
  type WorksheetResult,
} from '../../services/ai/aiPrompts';
import { getCurriculumContext, type CurriculumFramework } from '../../services/ai/curriculumRagService';
import { pushQuizToPortal } from '../../services/core/portalSessionService';
import { getStudent } from '../../services/studentService';
import type { UserData } from '../../components/layout/Header';
import { resolveLessonTranslanguagingDialect } from '../../constants/studentLanguages';
import { Phase4FamilyConnectCard } from '../../components/Phase4FamilyConnectCard';
import { StudentRecordCard } from './StudentRecordCard';
import { useStudentProfileData } from '../../hooks/useStudentProfileData';
import { exportStudentProfilePdf } from '../../utils/pdfExport';
import { parseGradeLevelFromStudentRecord } from '../../utils/longitudinalPromptHelpers';
import { printLessonPlanWindow, printWorksheetToWindow } from '../../utils/printUtils';
import { StudentProfileAnalyticalView } from './StudentProfileAnalyticalView';
import { StudentProfileActionPlanView } from './StudentProfileActionPlanView';
import { WorksheetModal } from '../assessments/WorksheetModal';
import { useAuth } from '../../context/AuthContext';
import { useSchoolConfig } from '../../hooks/useSchoolConfig';

interface StudentProfileProps {
  studentId?: string;
  userRole?: UserData['role'];
}

function inferCurriculumFrameworkFromAssessment(a: Assessment): CurriculumFramework {
  const id = a.gesObjectiveId?.trim() ?? '';
  if (id.startsWith('MATH-') || id.startsWith('ENG-')) return 'Cambridge';
  return 'GES';
}

export function StudentProfile({ studentId: initialStudentId, userRole }: StudentProfileProps) {
  const {
    students,
    selectedStudentId,
    setSelectedStudentId,
    studentInfo,
    setStudentInfo,
    history,
    setHistory,
    isLoading,
    studentsLoading,
    lastWorksheetByCard,
    setLastWorksheetByCard,
    hasRealData,
    realReadinessScore,
    fallbackHistoricalData,
    numeracyScores,
    literacyScores,
    numeracyTrajectory,
    literacyTrajectory,
    numeracyReadiness,
    literacyReadiness,
    isHighRisk,
    recentGaps,
    recentMastery,
    gapInterventions,
    predictiveReadinessSummary,
  } = useStudentProfileData(initialStudentId);

  const [viewMode, setViewMode] = useState<'analytical' | 'action-plan' | 'family-record'>('analytical');

  const canEditStudentProfile = userRole === 'teacher';
  const [isExporting, setIsExporting] = useState(false);
  const [regeneratingAssessmentId, setRegeneratingAssessmentId] = useState<string | null>(null);
  const [generatingSheetFor, setGeneratingSheetFor] = useState<string | null>(null);
  const [pushingQuizFor, setPushingQuizFor] = useState<string | null>(null);
  const [portalToast, setPortalToast] = useState<string | null>(null);
  const [activeWorksheet, setActiveWorksheet] = useState<{ gap: string; data: WorksheetResult } | null>(null);
  const [senReport, setSenReport] = useState<SenRiskReport | null>(null);
  const [isAnalyzingSEN, setIsAnalyzingSEN] = useState(false);

  // SEN Coordinator actions
  const { user: currentUser } = useAuth();
  const { school } = useSchoolConfig(currentUser.schoolId);
  const curriculumAlignmentLabel = useMemo(
    () => formatCurriculumAlignmentLabel(school?.curriculumType, 'GES'),
    [school?.curriculumType]
  );
  const isSenCoordinator = currentUser.role === 'sen_coordinator';

  useEffect(() => {
    setSenReport(null);
    setIsAnalyzingSEN(false);
  }, [selectedStudentId]);

  useEffect(() => {
    if (!portalToast) return;
    const t = window.setTimeout(() => setPortalToast(null), 4000);
    return () => window.clearTimeout(t);
  }, [portalToast]);

  const runDeepPatternAnalysis = async () => {
    if (isAnalyzingSEN) return;
    setIsAnalyzingSEN(true);
    try {
      const result = await analyzeLongitudinalSEN(
        history,
        resolveAiCurriculumPromptType(school?.curriculumType, 'GES')
      );
      setSenReport(result);
    } finally {
      setIsAnalyzingSEN(false);
    }
  };

  const handleExportPdf = () => {
    if (!studentInfo) return;
    setIsExporting(true);
    try {
      exportStudentProfilePdf({
        studentName: studentInfo.name,
        studentGrade: studentInfo.grade,
        hasRealData,
        history,
        realReadinessScore,
        fallbackHistoricalData,
        predictiveReadinessSummary,
      });
    } catch (err) {
      console.error('PDF export failed', err);
    }
    setIsExporting(false);
  };

  const handleRegenerateLessonPlan = async (assessment: Assessment) => {
    if (!assessment.id) return;
    setRegeneratingAssessmentId(assessment.id);
    try {
      const atKey = assessment.type === 'Literacy' ? 'literacy' : 'numeracy';
      const gesAlign =
        assessment.gesObjectiveId != null && assessment.gesObjectiveId !== ''
          ? {
              objectiveId: assessment.gesObjectiveId,
              objectiveTitle: assessment.gesObjectiveTitle || '',
              excerpt: assessment.gesCurriculumExcerpt || '',
              verified: assessment.gesVerified ?? false,
            }
          : null;
      const grade =
        parseGradeLevelFromStudentRecord(studentInfo ?? undefined) ??
        4;
      const fw = inferCurriculumFrameworkFromAssessment(assessment);
      const rag = getCurriculumContext(atKey, (assessment.diagnosis || '').slice(0, 800), fw, grade);

      const report: DiagnosticReport = {
        diagnosis: assessment.diagnosis,
        masteredConcepts: assessment.masteredConcepts ?? '',
        gapTags: assessment.gapTags ?? [],
        masteryTags: assessment.masteryTags ?? [],
        recommendations: [],
        remedialPlan: assessment.remedialPlan || '',
        lessonPlan: assessment.lessonPlan ?? { title: '', instructions: [] },
        smsDraft: '',
        score: assessment.score ?? 0,
        gesAlignment: gesAlign ?? undefined,
      };

      const dialect = resolveLessonTranslanguagingDialect(studentInfo ?? undefined);
      const result = await generateSubjectRoutedLessonPlan(
        report,
        atKey,
        atKey,
        grade,
        dialect,
        rag.formattedContext,
        resolveAiCurriculumPromptType(school?.curriculumType, fw)
      );
      if (result) {
        await updateAssessment(assessment.id, { lessonPlan: result });
        setHistory((prev) => prev.map((a) => (a.id === assessment.id ? { ...a, lessonPlan: result } : a)));
      }
    } catch (error) {
      console.error('Regenerate lesson plan failed', error);
    } finally {
      setRegeneratingAssessmentId(null);
    }
  };

  const handleGeneratePracticeSheet = async (
    gapsForCard: string[],
    subject: string,
    assessment: Assessment
  ) => {
    const key = `${gapsForCard.join('|')}-${subject}`;
    setGeneratingSheetFor(key);
    try {
      const grade = studentInfo?.grade ?? 'Primary 6';
      const context = {
        diagnosis: assessment.diagnosis || '',
        remedialPlan: assessment.remedialPlan || '',
        lessonPlan: assessment.lessonPlan ?? { title: '', instructions: [] },
      };
      const result = await generatePracticeWorksheet(
        gapsForCard,
        subject,
        grade,
        context,
        resolveAiCurriculumPromptType(school?.curriculumType, inferCurriculumFrameworkFromAssessment(assessment))
      );
      if (result && assessment.id) {
        await updateAssessment(assessment.id, { worksheet: result });
        setHistory((prev) => prev.map((a) => (a.id === assessment.id ? { ...a, worksheet: result } : a)));
        const entry = { gap: gapsForCard.join(', '), data: result };
        setActiveWorksheet(entry);
        setLastWorksheetByCard((prev) => ({ ...prev, [key]: entry }));
      }
    } catch (error) {
      console.error('Generate practice sheet failed', error);
    } finally {
      setGeneratingSheetFor(null);
    }
  };

  const handlePrintWorksheet = (cardKey: string) => {
    const stored = lastWorksheetByCard[cardKey];
    if (!stored) return;
    printWorksheetToWindow(stored);
  };

  const handlePushInteractiveQuiz = async (
    gapsForCard: string[],
    subject: string,
    assessment: Assessment
  ) => {
    if (!selectedStudentId || !assessment.id || !studentInfo) return;
    const key = `${gapsForCard.join('|')}-${subject}`;
    setPushingQuizFor(key);
    try {
      const quiz = await generateGamifiedQuiz(
        studentInfo.name,
        assessment.diagnosis || '',
        resolveAiCurriculumPromptType(
          school?.curriculumType,
          inferCurriculumFrameworkFromAssessment(assessment)
        )
      );
      if (quiz) {
        await pushQuizToPortal(selectedStudentId, quiz);
        setPortalToast('Quiz pushed to portal successfully!');
      }
    } catch (error) {
      console.error('Push interactive quiz failed', error);
    } finally {
      setPushingQuizFor(null);
    }
  };

  if (studentsLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 mt-8 w-full flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading students...</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 mt-8 w-full flex flex-col items-center justify-center">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">No Students Yet</h3>
        <p className="text-gray-500 text-center max-w-md">Add students from the Class Roster to view their profiles here.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 mt-8 w-full flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading Learner Profile...</p>
      </div>
    );
  }

  if (!selectedStudentId || !studentInfo) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 w-full">
        <label htmlFor="student-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select student
        </label>
        <select
          id="student-select"
          value={selectedStudentId ?? ''}
          onChange={(e) => setSelectedStudentId(e.target.value || undefined)}
          className="w-full max-w-xs border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
        >
          <option value="">Choose a student...</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.grade})
            </option>
          ))}
        </select>
        <p className="mt-4 text-gray-500 text-sm">Select a student above to view their profile and assessment history.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8 w-full animate-in fade-in duration-500">
      <div className="mb-6">
        <label htmlFor="profile-student-select" className="block text-sm font-medium text-gray-700 mb-1">
          View profile for
        </label>
        <select
          id="profile-student-select"
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          className="w-full max-w-md border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white flex items-center gap-2"
        >
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.grade})
            </option>
          ))}
        </select>
      </div>

      {isSenCoordinator && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            <div>
              <h3 className="font-semibold text-amber-900">SEN Coordinator Actions</h3>
              <p className="text-sm text-amber-700">Review educational screening signals for this student.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => { console.log('Dismiss Alert clicked'); alert('Alert Dismissed'); }}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Dismiss Alert
            </button>
            <button 
              onClick={() => { console.log('Snooze clicked'); alert('Alert Snoozed for 2 Weeks'); }}
              className="px-4 py-2 bg-amber-100 border border-amber-300 text-amber-900 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors"
            >
              Snooze for 2 Weeks
            </button>
            <button 
              onClick={() => { console.log('Escalate clicked'); alert('Alert Escalated / IEP Created'); }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Escalate / Create IEP
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 border-2 border-blue-200 shrink-0 shadow-inner">
            <User size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{studentInfo.name}</h2>
            <p className="text-gray-600 font-medium">{studentInfo.grade}</p>
          </div>
        </div>

        <div className="flex flex-col w-full gap-3 sm:flex-row sm:items-center sm:justify-end sm:w-auto">
          <div className="bg-gray-100 p-1 rounded-lg flex flex-wrap items-center flex-1 sm:flex-initial min-w-0 gap-0.5">
            <button
              type="button"
              onClick={() => setViewMode('analytical')}
              className={`flex flex-1 sm:flex-initial items-center justify-center gap-2 px-2 sm:px-3 py-2.5 sm:py-1.5 min-h-[44px] sm:min-h-0 rounded-md text-sm font-medium transition-all ${
                viewMode === 'analytical' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LineChart size={16} /> Data View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('action-plan')}
              className={`flex flex-1 sm:flex-initial items-center justify-center gap-2 px-2 sm:px-3 py-2.5 sm:py-1.5 min-h-[44px] sm:min-h-0 rounded-md text-sm font-medium transition-all ${
                viewMode === 'action-plan' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ClipboardList size={16} /> Action Plan
            </button>
            <button
              type="button"
              onClick={() => setViewMode('family-record')}
              className={`flex flex-1 sm:flex-initial items-center justify-center gap-2 px-2 sm:px-3 py-2.5 sm:py-1.5 min-h-[44px] sm:min-h-0 rounded-md text-sm font-medium transition-all ${
                viewMode === 'family-record' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users size={16} /> Family &amp; record
            </button>
          </div>
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExporting}
            className="inline-flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 min-h-[44px] w-full sm:w-auto rounded-lg transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {isExporting ? 'Exporting…' : 'Export'}
          </button>
        </div>
      </div>

      {viewMode === 'analytical' ? (
        <StudentProfileAnalyticalView
          hasRealData={hasRealData}
          history={history}
          fallbackHistoricalData={fallbackHistoricalData}
          realReadinessScore={realReadinessScore}
          numeracyScores={numeracyScores}
          literacyScores={literacyScores}
          numeracyTrajectory={numeracyTrajectory}
          literacyTrajectory={literacyTrajectory}
          numeracyReadiness={numeracyReadiness}
          literacyReadiness={literacyReadiness}
          isHighRisk={isHighRisk}
          recentGaps={recentGaps}
          recentMastery={recentMastery}
          senReport={senReport}
          isAnalyzingSEN={isAnalyzingSEN}
          onRunDeepPatternAnalysis={runDeepPatternAnalysis}
        />
      ) : viewMode === 'action-plan' ? (
        <StudentProfileActionPlanView
          curriculumAlignmentLabel={curriculumAlignmentLabel}
          gapInterventions={gapInterventions}
          lastWorksheetByCard={lastWorksheetByCard}
          regeneratingAssessmentId={regeneratingAssessmentId}
          generatingSheetFor={generatingSheetFor}
          pushingQuizFor={pushingQuizFor}
          onRegenerateLessonPlan={handleRegenerateLessonPlan}
          onPrintLessonPlan={printLessonPlanWindow}
          onGeneratePracticeSheet={handleGeneratePracticeSheet}
          onPushInteractiveQuiz={handlePushInteractiveQuiz}
          onPrintWorksheet={handlePrintWorksheet}
          onOpenWorksheet={setActiveWorksheet}
        />
      ) : selectedStudentId && studentInfo ? (
        <div className="space-y-8">
          {canEditStudentProfile ? (
            <StudentRecordCard
              studentId={selectedStudentId}
              student={studentInfo}
              canEdit
              onUpdated={async () => {
                const s = await getStudent(selectedStudentId);
                setStudentInfo(s);
              }}
            />
          ) : (
            <p className="text-sm text-gray-600">
              You do not have permission to edit this learner&apos;s roster record. Contact the assigned teacher.
            </p>
          )}
          <Phase4FamilyConnectCard
            studentId={selectedStudentId}
            student={studentInfo}
            history={history}
            canEdit={canEditStudentProfile}
            onUpdated={async () => {
              const s = await getStudent(selectedStudentId);
              setStudentInfo(s);
            }}
          />
        </div>
      ) : null}

      <WorksheetModal
        activeWorksheet={activeWorksheet}
        onClose={() => setActiveWorksheet(null)}
        curriculumAlignmentLabel={curriculumAlignmentLabel}
      />

      {portalToast ? (
        <div
          className="fixed bottom-6 left-1/2 z-50 max-w-[min(90vw,24rem)] -translate-x-1/2 rounded-xl border border-emerald-200/80 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-900 shadow-lg shadow-emerald-900/10"
          role="status"
        >
          {portalToast}
        </div>
      ) : null}
    </div>
  );
}

