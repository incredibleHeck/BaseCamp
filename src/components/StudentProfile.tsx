import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { jsPDF } from 'jspdf';
import { Download, User, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, LineChart, ClipboardList, Loader2, Printer, RefreshCw, Info } from 'lucide-react';
import { getStudentHistory, updateAssessment, Assessment } from '../services/assessmentService';
import { analyzeLongitudinalSEN, generateRemedialLessonPlan, generatePracticeWorksheet, SenRiskReport, WorksheetResult } from '../services/aiPrompts';
import { getStudent, getStudents, Student as StudentModel } from '../services/studentService';

// 1. Data Models
export interface HistoricalScore {
  grade: string;
  literacy: number;
  numeracy: number;
  notes: string;
}

interface StudentProfileProps {
  studentId?: string;
}

type ReadinessLevel = 'High' | 'Medium' | 'Low';

interface Readiness {
  level: ReadinessLevel;
  color: string;
  icon: React.ReactNode;
}

// 2. Helper Functions (Safeguarded)
const calculateTrajectory = (scores: number[]) => {
  if (!scores || scores.length < 2) return 0;
  return (scores[scores.length - 1] - scores[0]) / (scores.length - 1);
};

const getReadinessDetails = (finalScore: number, trajectory: number): Readiness => {
  if (finalScore >= 70 && trajectory >= -5) {
    return { level: 'High', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" /> };
  }
  if (finalScore < 50 || trajectory < -10) {
    return { level: 'Low', color: 'text-red-700 bg-red-50 border-red-200', icon: <AlertTriangle className="w-5 h-5 text-red-600" /> };
  }
  return { level: 'Medium', color: 'text-yellow-700 bg-yellow-50 border-yellow-200', icon: <AlertTriangle className="w-5 h-5 text-yellow-600" /> };
};

/** Normalize Firestore timestamp to milliseconds for Date display */
function timestampToMs(ts: Date | { toMillis?: () => number; seconds?: number } | number): number {
  if (typeof ts === 'number') return ts;
  if (ts && typeof (ts as { toMillis: () => number }).toMillis === 'function') return (ts as { toMillis: () => number }).toMillis();
  if (ts && typeof (ts as { seconds: number }).seconds === 'number') return (ts as { seconds: number }).seconds * 1000;
  return 0;
}

function formatAssessmentDateTime(ts: Date | { toMillis?: () => number; seconds?: number } | number): string {
  const ms = timestampToMs(ts);
  return new Date(ms).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export function StudentProfile({ studentId: initialStudentId }: StudentProfileProps) {
  const [students, setStudents] = useState<StudentModel[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>(initialStudentId);
  const [viewMode, setViewMode] = useState<'analytical' | 'action-plan'>('analytical');
  const [history, setHistory] = useState<Assessment[]>([]);
  const [studentInfo, setStudentInfo] = useState<StudentModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [regeneratingAssessmentId, setRegeneratingAssessmentId] = useState<string | null>(null);
  const [generatingSheetFor, setGeneratingSheetFor] = useState<string | null>(null);
  const [activeWorksheet, setActiveWorksheet] = useState<{ gap: string; data: WorksheetResult } | null>(null);
  const [lastWorksheetByCard, setLastWorksheetByCard] = useState<Record<string, { gap: string; data: WorksheetResult }>>({});
  const [senReport, setSenReport] = useState<SenRiskReport | null>(null);
  const [isAnalyzingSEN, setIsAnalyzingSEN] = useState(false);

  // Sync from parent when e.g. user clicked "View Profile" from roster
  useEffect(() => {
    if (initialStudentId) setSelectedStudentId(initialStudentId);
  }, [initialStudentId]);

  // Reset longitudinal SEN report when changing students
  useEffect(() => {
    setSenReport(null);
    setIsAnalyzingSEN(false);
  }, [selectedStudentId]);

  // Fetch students list for dropdown
  useEffect(() => {
    const load = async () => {
      setStudentsLoading(true);
      const list = await getStudents();
      setStudents(list);
      setStudentsLoading(false);
      if (list.length > 0 && !selectedStudentId) setSelectedStudentId(list[0].id);
    };
    load();
  }, []);

  // Fetch profile and history for selected student
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedStudentId) {
        setStudentInfo(null);
        setHistory([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const [studentData, historyData] = await Promise.all([
          getStudent(selectedStudentId),
          getStudentHistory(selectedStudentId),
        ]);
        setStudentInfo(studentData);
        setHistory(historyData);
      } catch (error) {
        console.error("Failed to fetch student data", error);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [selectedStudentId]);

  const runDeepPatternAnalysis = async () => {
    if (isAnalyzingSEN) return;
    setIsAnalyzingSEN(true);
    try {
      const result = await analyzeLongitudinalSEN(history);
      setSenReport(result);
    } finally {
      setIsAnalyzingSEN(false);
    }
  };

  // Seed lastWorksheetByCard from assessments that have a saved worksheet (Firebase)
  useEffect(() => {
    const next: Record<string, { gap: string; data: WorksheetResult }> = {};
    history.forEach((a) => {
      if (!a.worksheet || !a.gapTags?.length) return;
      const key = `${a.gapTags.join('|')}-${a.type}`;
      next[key] = { gap: a.gapTags.join(', '), data: a.worksheet };
    });
    setLastWorksheetByCard(next);
  }, [history]);

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
        <label htmlFor="student-select" className="block text-sm font-medium text-gray-700 mb-2">Select student</label>
        <select
          id="student-select"
          value={selectedStudentId ?? ''}
          onChange={(e) => setSelectedStudentId(e.target.value || undefined)}
          className="w-full max-w-xs border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
        >
          <option value="">Choose a student...</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
          ))}
        </select>
        <p className="mt-4 text-gray-500 text-sm">Select a student above to view their profile and assessment history.</p>
      </div>
    );
  }

  // Real data calculations
  const hasRealData = history.length > 0;
  
  // Calculate a "JHS Readiness Score" based on real history
  // For demo: starts at 50, +5 for each completed assessment, max 100
  const realReadinessScore = Math.min(100, 50 + (history.length * 5));

  // Mock baseline data just to show the charts if history is empty
  const fallbackHistoricalData = [
    { grade: 'Primary 4', literacy: 60, numeracy: 50, notes: 'Baseline: Needs Intervention' },
    { grade: 'Primary 5', literacy: 70, numeracy: 45, notes: 'Mid-Year: Approaching Target' },
    { grade: 'Primary 6', literacy: 75, numeracy: 40, notes: 'Recent Assessment: Target Not Met' },
  ];

  const numeracyScores = fallbackHistoricalData.map(d => d.numeracy);
  const numeracyTrajectory = calculateTrajectory(numeracyScores);
  const numeracyReadiness = getReadinessDetails(numeracyScores[numeracyScores.length - 1], numeracyTrajectory);

  const literacyScores = fallbackHistoricalData.map(d => d.literacy);
  const literacyTrajectory = calculateTrajectory(literacyScores);
  const literacyReadiness = getReadinessDetails(literacyScores[literacyScores.length - 1], literacyTrajectory);
  
  const isHighRisk = numeracyReadiness.level === 'Low' || literacyReadiness.level === 'Low';

  // Deduplicated short tags from AI; strict tag-only for scannable dashboard
  const recentGaps = Array.from(new Set(history.flatMap((a) => a.gapTags || [])));
  const recentMastery = Array.from(new Set(history.flatMap((a) => a.masteryTags || [])));

  // Clamp readiness for student view so the flag would stay on the mountain (legacy), reused conceptually if needed
  const clampedReadiness = hasRealData ? Math.min(90, Math.max(10, realReadinessScore)) : 10;

  // Group gaps by assessment so multiple targets from the same assessment
  // show as a single intervention card.
  const gapInterventions = history.reduce<
    { assessment: Assessment; gaps: string[] }[]
  >((acc, assessment) => {
    const tags = (assessment.gapTags || []).filter((t) => t && t.trim());
    if (!tags.length) return acc;

    const key = assessment.id || `${timestampToMs(assessment.timestamp)}-${assessment.type}`;
    const existing = acc.find((entry) => entry.assessment.id === assessment.id || `${timestampToMs(entry.assessment.timestamp)}-${entry.assessment.type}` === key);

    if (existing) {
      const existingSet = new Set(existing.gaps.map((g) => g.toLowerCase()));
      tags.forEach((tag) => {
        if (!existingSet.has(tag.toLowerCase())) {
          existing.gaps.push(tag);
        }
      });
      return acc;
    }

    acc.push({ assessment, gaps: Array.from(new Set(tags)) });
    return acc;
  }, []).sort(
    (a, b) =>
      timestampToMs(b.assessment.timestamp) - timestampToMs(a.assessment.timestamp)
  );

  const handleExportPdf = () => {
    if (!studentInfo) return;
    setIsExporting(true);
    try {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const margin = 14;
      const maxWidth = 180;
      let y = 20;
      const lineHeight = 6;
      const smallLineHeight = 5;

      const addText = (text: string, fontSize?: number, isBold?: boolean) => {
        if (y > 277) {
          doc.addPage();
          y = 20;
        }
        if (fontSize) doc.setFontSize(fontSize);
        if (isBold) doc.setFont('helvetica', 'bold');
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, margin, y);
        y += lines.length * (fontSize && fontSize <= 10 ? smallLineHeight : lineHeight);
        if (isBold) doc.setFont('helvetica', 'normal');
      };

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Student Profile Report', margin, y);
      y += 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      addText(`${studentInfo.name} — ${studentInfo.grade}`);
      y += 4;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Longitudinal History', margin, y);
      y += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      if (hasRealData) {
        history.forEach((assessment, index) => {
          const dateStr = formatAssessmentDateTime(assessment.timestamp);
          addText(`${assessment.type} Assessment — ${dateStr}`, 10, true);
          addText('Diagnosis:', 10, true);
          addText(assessment.diagnosis, 10);
          addText('Recommended Remedial Plan:', 10, true);
          addText(assessment.remedialPlan, 10);
          y += 4;
        });
        doc.setFont('helvetica', 'bold');
        addText(`JHS Readiness Score: ${realReadinessScore}% (based on ${history.length} assessment(s))`, 11);
        doc.setFont('helvetica', 'normal');
        addText(
          realReadinessScore >= 70
            ? 'Student is on track for Junior High School.'
            : 'Student requires targeted intervention using the recommended lesson plans to reach JHS readiness.',
          10
        );
      } else {
        addText('No AI assessments on record. Baseline / placeholder summary below.', 10);
        y += 2;
        fallbackHistoricalData.forEach((record) => {
          addText(`${record.grade}: ${record.notes}`, 10);
          addText(`Literacy ${record.literacy}% — Numeracy ${record.numeracy}%`, 10);
          y += 2;
        });
        addText(`Predictive JHS Readiness — Numeracy: ${numeracyReadiness.level}, Literacy: ${literacyReadiness.level}`, 10, true);
      }

      const safeName = studentInfo.name.replace(/[^a-zA-Z0-9\s-]/g, '').trim() || 'Student';
      doc.save(`BaseCamp-Report-${safeName}.pdf`);
    } catch (err) {
      console.error('PDF export failed', err);
    }
    setIsExporting(false);
  };

  const handlePrintLessonPlan = (assessment: Assessment) => {
    const lessonPlan = assessment.lessonPlan;
    const title = lessonPlan?.title?.trim() || '5-Minute Remedial Activity';
    const steps = lessonPlan?.instructions?.length ? lessonPlan.instructions : [];
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 2rem auto; padding: 1rem; }
    h1 { font-size: 1.25rem; margin-bottom: 1rem; }
    ol { margin: 0; padding-left: 1.5rem; }
    li { margin-bottom: 0.5rem; }
  </style>
</head>
<body>
  <h1>${title.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h1>
  <p><strong>Instructions:</strong></p>
  <ol>${steps.map((step: string) => `<li>${step.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</li>`).join('')}</ol>
  <p style="margin-top: 2rem; font-size: 0.875rem; color: #666;">BaseCamp Diagnostics</p>
</body>
</html>`;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      win.onload = () => {
        win.print();
        win.onafterprint = () => win.close();
      };
    } else {
      alert('Please allow pop-ups to print the activity.');
    }
  };

  const handleRegenerateLessonPlan = async (assessment: Assessment) => {
    if (!assessment.id) return;
    setRegeneratingAssessmentId(assessment.id);
    try {
      const subject = assessment.type === 'Literacy' ? 'Literacy' : 'Numeracy';
      const result = await generateRemedialLessonPlan(
        assessment.diagnosis,
        assessment.remedialPlan || '',
        subject
      );
      if (result) {
        await updateAssessment(assessment.id, { lessonPlan: result });
        setHistory((prev) =>
          prev.map((a) => (a.id === assessment.id ? { ...a, lessonPlan: result } : a))
        );
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
      const result = await generatePracticeWorksheet(gapsForCard, subject, grade, context);
      if (result && assessment.id) {
        await updateAssessment(assessment.id, { worksheet: result });
        setHistory((prev) =>
          prev.map((a) => (a.id === assessment.id ? { ...a, worksheet: result } : a))
        );
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

  const printWorksheetToWindow = (worksheet: { gap: string; data: WorksheetResult }) => {
    const { data, gap } = worksheet;
    const title = data.title.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const gapEscaped = gap.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const questionsBlocks = data.questions
      .map(
        (q, idx) => {
          const qEscaped = q.replace(/</g, '&lt;').replace(/>/g, '&gt;');
          const lines = [1, 2, 3, 4]
            .map(
              () =>
                '<div style="border-bottom: 2px dotted #000; height: 2.5rem; width: 100%; margin-bottom: 0.5rem;"></div>'
            )
            .join('');
          return `
        <div style="margin-bottom: 4rem;">
          <p style="font-size: 1.125rem; font-weight: 500; color: #111; margin-bottom: 1.5rem;">${idx + 1}. ${qEscaped}</p>
          <div style="margin-top: 0.5rem;">${lines}</div>
        </div>`;
        }
      )
      .join('');
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 42rem; margin: 0 auto; padding: 2rem; background: #fff; color: #000; min-height: 100vh; }
    h1 { font-size: 1.25rem; margin-bottom: 0.5rem; color: #000; }
    .target { font-size: 0.875rem; color: #374151; margin-bottom: 2rem; }
    .header-line { margin-bottom: 2rem; }
    .header-line span { font-weight: 500; }
    .header-line .line { display: inline-block; border-bottom: 2px dotted #000; width: 12rem; vertical-align: bottom; margin-left: 0.25rem; }
    .footer { margin-top: 3rem; font-size: 0.875rem; color: #666; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p class="target"><strong>Target:</strong> ${gapEscaped}</p>
  <div class="header-line"><span>Name:</span> <span class="line"></span></div>
  <div class="header-line"><span>Date:</span> <span class="line"></span></div>
  ${questionsBlocks}
  <p class="footer">BaseCamp Diagnostics</p>
</body>
</html>`;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      win.onload = () => {
        win.print();
        win.onafterprint = () => win.close();
      };
    } else {
      alert('Please allow pop-ups to print the worksheet.');
    }
  };

  const handlePrintWorksheet = (cardKey: string) => {
    const stored = lastWorksheetByCard[cardKey];
    if (!stored) return;
    printWorksheetToWindow(stored);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8 w-full animate-in fade-in duration-500">
      {/* Student selector dropdown */}
      <div className="mb-6">
        <label htmlFor="profile-student-select" className="block text-sm font-medium text-gray-700 mb-1">View profile for</label>
        <select
          id="profile-student-select"
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          className="w-full max-w-md border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white flex items-center gap-2"
        >
          {students.map((s) => (
            <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
          ))}
        </select>
      </div>

      {/* Header Area */}
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
        
        <div className="flex items-center gap-3">
          {/* View Toggle for Data vs Action Plan */}
          <div className="bg-gray-100 p-1 rounded-lg flex items-center">
            <button 
              onClick={() => setViewMode('analytical')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'analytical' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <LineChart size={16} /> Data View
            </button>
            <button 
              onClick={() => setViewMode('action-plan')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'action-plan' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <ClipboardList size={16} /> Action Plan
            </button>
          </div>
          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="inline-flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 min-h-[44px] rounded-lg transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {isExporting ? 'Exporting…' : 'Export'}
          </button>
        </div>
      </div>

      {viewMode === 'analytical' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in slide-in-from-bottom-4 duration-500">
          {/* Analytical View (Left: History, Right: Skills & Risk) */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Longitudinal History</h3>
            
            {hasRealData ? (
              <div className="relative border-l-2 border-gray-200 ml-3 space-y-8">
                {history.map((assessment, index) => {
                  const isRecent = index === 0;
                  const dateTimeStr = formatAssessmentDateTime(assessment.timestamp);
                  return (
                    <div key={assessment.id || index} className="relative pl-6">
                      <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm ${
                        isRecent ? 'bg-blue-600' : 'bg-gray-400'
                      }`}></div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900">{assessment.type} Assessment</h4>
                        <span className="text-xs font-medium text-gray-500">{dateTimeStr}</span>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mt-2">
                        <p className="text-sm text-gray-800 font-semibold mb-1">Diagnosis:</p>
                        <p className="text-sm text-gray-600 mb-3">{assessment.diagnosis}</p>
                        
                        <p className="text-sm text-emerald-800 font-semibold mb-1">Recommended Remedial Plan:</p>
                        <p className="text-sm text-gray-600">{assessment.remedialPlan}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 italic mb-6">No real AI assessments found for this student. Showing baseline placeholder data.</p>
                <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 opacity-70">
                  {[...fallbackHistoricalData].reverse().map((record, index) => (
                    <div key={record.grade} className="relative pl-6">
                      <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm ${
                        index === 0 ? 'bg-red-500' : index === 1 ? 'bg-yellow-500' : 'bg-orange-500'
                      }`}></div>
                      <h4 className="font-semibold text-gray-900">{record.grade}</h4>
                      <p className="text-sm text-gray-600 mt-1">{record.notes}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="space-y-8">
            {hasRealData ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-6">JHS Readiness Score</h3>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 shadow-sm">
                  <div className="flex justify-between items-end mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-600 text-white rounded-lg shadow-sm">
                        <TrendingUp size={24} />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-blue-900 block">Overall Readiness</span>
                        <span className="text-xs text-blue-700 mt-0.5 block">Based on {history.length} recent AI assessments</span>
                      </div>
                    </div>
                    <span className="text-3xl font-black text-blue-700">{realReadinessScore}%</span>
                  </div>
                  <div className="w-full bg-blue-200/50 rounded-full h-4 overflow-hidden shadow-inner">
                    <div className="bg-blue-600 h-4 rounded-full transition-all duration-1000" style={{ width: `${realReadinessScore}%` }}></div>
                  </div>
                  <p className="text-sm text-blue-800 mt-4 font-medium">
                    {realReadinessScore >= 70 ? "Student is on track for Junior High School." : "Student requires targeted intervention using the recommended lesson plans to reach JHS readiness."}
                  </p>
                </div>

                {/* Deep Pattern Analysis: Neurodevelopmental & SEN Risk Screening */}
                <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">Neurodevelopmental & SEN Risk Screening</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Deep pattern analysis across longitudinal assessment history (e.g., Dyslexia, Dyscalculia).
                      </p>
                    </div>
                  </div>

                  {history.length < 3 ? (
                    <div className="mt-4 flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <Info className="w-5 h-5 text-gray-500 mt-0.5" />
                      <p className="text-sm text-gray-600">
                        Insufficient data. At least 3 assessments over time are required to analyze learning disability patterns.
                      </p>
                    </div>
                  ) : !senReport ? (
                    <div className="mt-4 space-y-3">
                      <p className="text-sm text-gray-700">
                        This scans all historical AI assessments to flag repeated traits consistent with learning differences (e.g., reading/number processing patterns).
                      </p>
                      <button
                        type="button"
                        onClick={runDeepPatternAnalysis}
                        disabled={isAnalyzingSEN}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold shadow-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isAnalyzingSEN ? <Loader2 size={16} className="animate-spin" /> : null}
                        🔍 Run Deep Pattern Analysis
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold text-gray-600">Risk Level</span>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                            senReport.riskLevel === 'Low'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : senReport.riskLevel === 'Moderate'
                                ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
                                : 'bg-red-50 text-red-800 border-red-200'
                          }`}
                        >
                          {senReport.riskLevel}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Identified Patterns</h4>
                          {senReport.identifiedPatterns.length > 0 ? (
                            <ul className="space-y-2 text-sm text-gray-700">
                              {senReport.identifiedPatterns.map((p, idx) => (
                                <li key={idx} className="flex gap-2">
                                  <span className="text-gray-400 shrink-0">•</span>
                                  <span>{p}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500 italic">No clear longitudinal patterns detected.</p>
                          )}
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Potential Indicators</h4>
                          {senReport.potentialIndicators.length > 0 ? (
                            <ul className="space-y-2 text-sm text-gray-700">
                              {senReport.potentialIndicators.map((p, idx) => (
                                <li key={idx} className="flex gap-2">
                                  <span className="text-gray-400 shrink-0">•</span>
                                  <span>{p}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500 italic">No specific indicators flagged.</p>
                          )}
                        </div>
                      </div>

                      <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
                        <p className="text-xs font-semibold text-indigo-900 mb-1">Specialist Recommendation</p>
                        <p className="text-sm text-indigo-900">{senReport.specialistRecommendation}</p>
                      </div>

                      <p className="text-xs text-gray-500">
                        Note: This is a pedagogical pattern analysis, not a medical diagnosis. Consult a GES Special Education Coordinator for formal evaluation.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Skill Progression (Baseline)</h3>
                <div className="space-y-6">
                  {/* Literacy Bar */}
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Literacy</span>
                        {literacyTrajectory >= 0 ? <TrendingUp size={14} className="text-emerald-500" /> : <TrendingDown size={14} className="text-red-500" />}
                      </div>
                      <span className="text-sm font-bold text-emerald-600">{literacyScores[literacyScores.length - 1]}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div className="bg-emerald-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${literacyScores[literacyScores.length - 1]}%` }}></div>
                    </div>
                  </div>

                  {/* Numeracy Bar */}
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Numeracy</span>
                        {numeracyTrajectory >= 0 ? <TrendingUp size={14} className="text-emerald-500" /> : <TrendingDown size={14} className="text-red-500" />}
                      </div>
                      <span className="text-sm font-bold text-orange-600">{numeracyScores[numeracyScores.length - 1]}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div className="bg-orange-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${numeracyScores[numeracyScores.length - 1]}%` }}></div>
                    </div>
                  </div>
                </div>
                
                {/* Predictive Risk Analysis Card */}
                <div className={`mt-8 rounded-xl p-5 border ${isHighRisk ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className={`text-base font-bold ${isHighRisk ? 'text-red-900' : 'text-gray-900'}`}>Predictive JHS 1 Readiness</h3>
                      <p className={`text-xs mt-1 ${isHighRisk ? 'text-red-700' : 'text-gray-500'}`}>Based on trajectory analysis</p>
                    </div>
                    {isHighRisk && <AlertTriangle className="text-red-600" size={20} />}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/60 rounded-lg p-3 border border-gray-100">
                      <span className="text-xs text-gray-500 font-medium block mb-1">Numeracy Risk</span>
                      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold ${numeracyReadiness.color}`}>
                        {numeracyReadiness.icon} {numeracyReadiness.level} Readiness
                      </div>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3 border border-gray-100">
                      <span className="text-xs text-gray-500 font-medium block mb-1">Literacy Risk</span>
                      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold ${literacyReadiness.color}`}>
                        {literacyReadiness.icon} {literacyReadiness.level} Readiness
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Gaps & Mastered Concepts — longitudinal profile */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 shadow-sm">
                <h3 className="text-base font-semibold text-emerald-900 mb-3">🏔️ Mastered Concepts</h3>
                {recentMastery.length > 0 ? (
                  <ul className="space-y-2 text-sm text-emerald-800">
                    {recentMastery.map((item, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-emerald-500 shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-emerald-700/80 italic">No mastered concepts recorded yet.</p>
                )}
              </div>
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-5 shadow-sm">
                <h3 className="text-base font-semibold text-orange-900 mb-3">🚧 Current Learning Gaps</h3>
                {recentGaps.length > 0 ? (
                  <ul className="space-y-2 text-sm text-orange-800">
                    {recentGaps.map((item, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-orange-500 shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-orange-700/80 italic">No learning gaps identified.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Teacher Action Plan View */
        <div className="py-6 animate-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Targeted Interventions
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Each card turns a diagnosed gap into a 5-minute classroom playbook.
          </p>

          {gapInterventions.length === 0 ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 flex flex-col items-center text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-3" />
              <h4 className="text-lg font-semibold text-emerald-900 mb-1">
                No active learning gaps!
              </h4>
              <p className="text-sm text-emerald-800 max-w-md">
                This student is currently on track based on recent AI assessments.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {gapInterventions.map(({ assessment, gaps }) => {
                const dateTimeStr = formatAssessmentDateTime(assessment.timestamp);
                const lessonTitle = assessment.lessonPlan?.title?.trim();
                const lessonSteps = assessment.lessonPlan?.instructions ?? [];

                return (
                  <div
                    key={assessment.id || `${timestampToMs(assessment.timestamp)}-${assessment.type}`}
                    className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4"
                  >
                    {/* Header + meta */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          🚧 TARGET: {gaps.join(', ')}
                        </span>
                        <p className="text-xs text-gray-500">
                          From {assessment.type} • {dateTimeStr}
                        </p>
                      </div>
                    </div>

                    {/* Objective / summary (remedialPlan) */}
                    {assessment.remedialPlan && (
                      <div className="border-l-4 border-amber-300 pl-3">
                        <p className="text-xs font-semibold text-amber-800 mb-1">
                          Objective / Summary
                        </p>
                        <p className="text-sm text-gray-700 italic">
                          {assessment.remedialPlan}
                        </p>
                      </div>
                    )}

                    {/* Detailed execution (lessonPlan) */}
                    {(lessonTitle || lessonSteps.length > 0) && (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        {lessonTitle && (
                          <h4 className="text-sm font-semibold text-blue-900 mb-2">
                            {lessonTitle}
                          </h4>
                        )}
                        {lessonSteps.length > 0 && (
                          <>
                            <p className="text-xs text-blue-800 mb-1 font-medium">
                              Step-by-step guide:
                            </p>
                            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-900">
                              {lessonSteps.map((step, idx) => (
                                <li key={idx}>{step}</li>
                              ))}
                            </ol>
                          </>
                        )}
                      </div>
                    )}

                    {/* Actions: Regenerate lesson plan, Print lesson plan, Generate worksheet, Print worksheet */}
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleRegenerateLessonPlan(assessment)}
                        disabled={regeneratingAssessmentId === assessment.id}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-amber-200 text-amber-800 text-xs font-medium bg-amber-50 hover:bg-amber-100 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {regeneratingAssessmentId === assessment.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <RefreshCw size={14} />
                        )}
                        {regeneratingAssessmentId === assessment.id ? 'Regenerating…' : 'Regenerate lesson plan'}
                      </button>
                      {(lessonTitle || lessonSteps.length > 0) && (
                        <button
                          type="button"
                          onClick={() => handlePrintLessonPlan(assessment)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 text-xs font-medium bg-white hover:bg-gray-50"
                        >
                          <Printer size={14} />
                          Print lesson plan
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleGeneratePracticeSheet(gaps, assessment.type, assessment)}
                        disabled={generatingSheetFor === `${gaps.join('|')}-${assessment.type}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-blue-200 text-blue-800 text-xs font-medium bg-blue-50 hover:bg-blue-100 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {generatingSheetFor === `${gaps.join('|')}-${assessment.type}` ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : lastWorksheetByCard[`${gaps.join('|')}-${assessment.type}`] ? (
                          <RefreshCw size={14} />
                        ) : null}
                        {generatingSheetFor === `${gaps.join('|')}-${assessment.type}` ? 'Generating…' : lastWorksheetByCard[`${gaps.join('|')}-${assessment.type}`] ? 'Regenerate worksheet' : '📝 Generate worksheet'}
                      </button>
                      {(() => {
                        const cardKey = `${gaps.join('|')}-${assessment.type}`;
                        const hasWorksheet = !!lastWorksheetByCard[cardKey];
                        return (
                          <button
                            type="button"
                            onClick={() => handlePrintWorksheet(cardKey)}
                            disabled={!hasWorksheet}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 text-xs font-medium bg-white hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            <Printer size={14} />
                            Print worksheet
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Worksheet modal */}
      {activeWorksheet && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between gap-4 p-4 border-b border-gray-200 print:hidden">
                <h3 className="text-lg font-semibold text-gray-900">Practice Worksheet</h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveWorksheet(null)}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => printWorksheetToWindow(activeWorksheet)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-blue-200 text-blue-800 text-sm font-medium bg-blue-50 hover:bg-blue-100"
                  >
                    <Printer size={16} />
                    Print
                  </button>
                </div>
              </div>
              <div
                id="printable-worksheet"
                className="bg-white text-black min-h-screen p-8 overflow-y-auto flex-1 print:block print:min-h-screen print:p-8 print:bg-white print:text-black"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-2 print:text-black print:font-bold">
                  {activeWorksheet.data.title}
                </h2>
                <p className="text-sm text-gray-500 mb-6 print:text-black">
                  Target: {activeWorksheet.gap}
                </p>
                <div className="mb-8 print:mb-8">
                  <span className="text-base font-medium text-gray-900 print:text-black">Name: </span>
                  <span className="inline-block border-b-2 border-dotted border-gray-400 w-48 align-bottom print:border-black" />
                </div>
                <div className="mb-8 print:mb-8">
                  <span className="text-base font-medium text-gray-900 print:text-black">Date: </span>
                  <span className="inline-block border-b-2 border-dotted border-gray-400 w-48 align-bottom print:border-black" />
                </div>
                <div className="space-y-16 print:space-y-16">
                  {activeWorksheet.data.questions.map((q, idx) => (
                    <div key={idx} className="mb-16 print:mb-16">
                      <div className="text-lg font-medium text-gray-900 mb-6 print:text-black [&_.katex]:text-inherit">
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                          {`${idx + 1}. ${q}`}
                        </ReactMarkdown>
                      </div>
                      <div className="space-y-2">
                        {[1, 2, 3, 4].map((line) => (
                          <div
                            key={line}
                            className="border-b-2 border-dotted border-gray-400 h-10 w-full print:border-black print:h-10"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
      )}
    </div>
  );
}
