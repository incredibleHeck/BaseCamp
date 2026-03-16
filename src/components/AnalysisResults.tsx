import React, { useState, useEffect } from 'react';
import { FileSearch, Loader2, CheckCircle2, MessageSquare, Send, Sparkles, Printer, Volume2, Check } from 'lucide-react';
import { saveAssessment, Assessment } from '../services/assessmentService';
import { analyzeWorksheet, analyzeWorksheetMultiple, analyzeManualEntry, generateRemedialLessonPlan, DiagnosticReport as AIDiagnosticReport } from '../services/aiPrompts';

export type AnalysisStatus = 'empty' | 'analyzing' | 'results';

export interface DiagnosticReport extends AIDiagnosticReport {
  criticalGap?: string;
}

interface AnalysisResultsProps {
  status: AnalysisStatus;
  onSaveProfile: () => void;
  isOffline?: boolean;
  studentId?: string;
  assessmentType?: string;
  imageBase64?: string | null;
  imageBase64s?: string[] | null;
  dialectContext?: string | null;
  manualRubric?: string[] | null;
  observations?: string | null;
  onAnalysisComplete?: () => void;
}

export function AnalysisResults({ status, onSaveProfile, isOffline = false, studentId, assessmentType, imageBase64, imageBase64s, dialectContext, manualRubric, observations, onAnalysisComplete }: AnalysisResultsProps) {
  const [showSmsDraft, setShowSmsDraft] = useState(false);
  const [showLessonPlan, setShowLessonPlan] = useState(false);
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [reportData, setReportData] = useState<DiagnosticReport | null>(null);
  const [regeneratedLessonPlan, setRegeneratedLessonPlan] = useState<{ title: string; instructions: string[] } | null>(null);

  // When report data changes (e.g. new assessment), clear any regenerated lesson so the report's plan shows
  useEffect(() => {
    setRegeneratedLessonPlan(null);
  }, [reportData]);

  // Run analysis only when user has clicked "Run AI Diagnosis" (status is set to 'analyzing' from that action only).
  useEffect(() => {
    if (status !== 'analyzing') return;

    if (imageBase64s && imageBase64s.length > 0 && assessmentType) {
      const getAnalysis = async () => {
        const result = await analyzeWorksheetMultiple(imageBase64s, assessmentType, dialectContext || "");
        if (result) {
          const fullReport: DiagnosticReport = {
            ...result,
            criticalGap: result.diagnosis,
            lessonPlan: result.lessonPlan ?? { title: "No lesson plan", instructions: [] },
          };
          setReportData(fullReport);
          onAnalysisComplete?.();
        }
      };
      getAnalysis();
      return;
    }

    if (imageBase64 && assessmentType) {
      const getAnalysis = async () => {
        const result = await analyzeWorksheet(imageBase64, assessmentType, dialectContext || "");
        if (result) {
          const fullReport: DiagnosticReport = {
            ...result,
            criticalGap: result.diagnosis,
            lessonPlan: result.lessonPlan ?? { title: "No lesson plan", instructions: [] },
          };
          setReportData(fullReport);
          onAnalysisComplete?.();
        }
      };
      getAnalysis();
      return;
    }

    if (assessmentType && (manualRubric?.length || (observations?.trim() ?? '').length > 0)) {
      const getAnalysis = async () => {
        const result = await analyzeManualEntry(
          assessmentType,
          dialectContext || "",
          manualRubric ?? [],
          observations?.trim() ?? ""
        );
        if (result) {
          const fullReport: DiagnosticReport = {
            ...result,
            criticalGap: result.diagnosis,
            lessonPlan: result.lessonPlan ?? { title: "No lesson plan", instructions: [] },
          };
          setReportData(fullReport);
          onAnalysisComplete?.();
        }
      };
      getAnalysis();
    }
  }, [status, imageBase64, imageBase64s, assessmentType, studentId, dialectContext, manualRubric, observations, onAnalysisComplete]);

  // Fallback data in case of rendering errors (includes lessonPlan for safe UI access)
  const data: DiagnosticReport = reportData || {
    diagnosis: "No data available.",
    criticalGap: "No data available.",
    masteredConcepts: "No data available.",
    gapTags: [],
    masteryTags: [],
    recommendations: [],
    remedialPlan: "",
    score: 0,
    smsDraft: "",
    lessonPlan: { title: "No lesson plan", instructions: [] },
  };

  const handleGenerateLesson = async () => {
    setIsGeneratingLesson(true);
    setRegeneratedLessonPlan(null);
    const subject = assessmentType === 'literacy' ? 'literacy' : 'numeracy';
    const result = await generateRemedialLessonPlan(data.diagnosis, data.remedialPlan, subject);
    setIsGeneratingLesson(false);
    if (result) {
      setRegeneratedLessonPlan(result);
      setShowLessonPlan(true);
    }
  };

  const displayLessonPlan = regeneratedLessonPlan ?? data.lessonPlan;
  const displayInstructions = displayLessonPlan?.instructions?.length
    ? displayLessonPlan.instructions
    : ["Gather 10 small stones or pebbles.", "Ask the student to divide the stones into two equal groups.", "Physically demonstrate the concept."];

  const handlePrintActivity = () => {
    const title = displayLessonPlan?.title ?? "5-Minute Remedial Activity";
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
  <h1>${title}</h1>
  <p><strong>Instructions:</strong></p>
  <ol>${displayInstructions.map((step: string) => `<li>${step.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</li>`).join('')}</ol>
  <p style="margin-top: 2rem; font-size: 0.875rem; color: #666;">BaseCamp Diagnostics · HeckTeck AI</p>
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
      alert("Please allow pop-ups to print the activity.");
    }
  };

  const handleGenerateAudio = () => {
    setIsGeneratingAudio(true);
    setTimeout(() => setIsGeneratingAudio(false), 2000);
  };

  const handleSave = async () => {
    if (!studentId || !assessmentType) return;
    
    const assessment: Assessment = {
      studentId,
      type: assessmentType.toLowerCase().includes('lit') ? 'Literacy' : 'Numeracy',
      diagnosis: data.diagnosis,
      masteredConcepts: data.masteredConcepts,
      gapTags: data.gapTags ?? [],
      masteryTags: data.masteryTags ?? [],
      remedialPlan: data.remedialPlan || '',
      lessonPlan: data.lessonPlan || { title: '', instructions: [] },
      timestamp: Date.now(),
      status: 'Completed'
    };

    if (isOffline) {
      console.warn("Device is offline. Saving assessment to local storage fallback.");
      const offlineQueue = JSON.parse(localStorage.getItem('offlineAssessments') || '[]');
      offlineQueue.push(assessment);
      localStorage.setItem('offlineAssessments', JSON.stringify(offlineQueue));
      setIsSaved(true);
      return;
    }

    setIsSaving(true);
    const resultId = await saveAssessment(assessment);
    setIsSaving(false);

    if (resultId) {
      setIsSaved(true);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full min-h-[400px] flex flex-col relative">
      
      {status === 'empty' && (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
          <div className="bg-gray-50 p-5 rounded-full mb-4">
            <FileSearch className="w-12 h-12 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessment Uploaded</h3>
          <p className="text-gray-500 max-w-sm">
            Upload a student assessment or enter data manually to view the AI diagnosis.
          </p>
        </div>
      )}

      {(status === 'analyzing' || (status === 'results' && !reportData)) && (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-6" />
          <h3 className="text-lg font-medium text-gray-900 mb-2 animate-pulse">
            Analyzing via HeckTeck AI Engine...
          </h3>
          <p className="text-gray-500 max-w-sm">
            Processing context and identifying learning gaps. This usually takes a few seconds.
          </p>
        </div>
      )}

      {status === 'results' && reportData && (
        <div className="flex-grow flex flex-col animate-in fade-in duration-500">
          <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4 mt-8 sm:mt-0">
            <h3 className="text-xl font-bold text-gray-900">AI Diagnostic Report</h3>
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
              Analysis Complete
            </span>
          </div>
          
          <div className="flex-grow flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-red-800 mb-2">Critical Learning Gap Detected</h4>
                <p className="text-sm text-red-700">{data.diagnosis}</p>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">Mastered Concepts</h4>
                <p className="text-sm text-blue-700">{data.masteredConcepts}</p>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-lg p-5">
              <h4 className="text-base font-semibold text-gray-900 mb-3">Recommended Intervention</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-2 mb-4">
                {data.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
              
              {!isGeneratingLesson && (
                <button 
                  onClick={handleGenerateLesson}
                  className="inline-flex items-center justify-center gap-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-sm font-medium py-2.5 px-4 min-h-[44px] rounded-lg transition-colors border border-yellow-200 w-full sm:w-auto"
                >
                  <Sparkles size={16} />
                  {(showLessonPlan || data.lessonPlan?.instructions?.length) ? 'Regenerate 5-Minute Remedial Activity' : '✨ Generate 5-Minute Remedial Activity'}
                </button>
              )}

              {isGeneratingLesson && (
                <div className="flex items-center gap-2 text-sm text-gray-600 py-2 px-4 bg-gray-50 rounded-lg border border-gray-200 w-fit">
                  <Loader2 size={16} className="animate-spin text-blue-600" />
                  AI generating localized lesson...
                </div>
              )}

              {/* Lesson plan: from API report or regenerated via Generate/Regenerate */}
              {(showLessonPlan || data.lessonPlan) && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-5 animate-in fade-in slide-in-from-top-2">
                  <div className="flex justify-between items-start mb-3">
                    <h5 className="text-base font-bold text-gray-900">
                      {displayLessonPlan?.title ?? "Visualizing Concepts with Local Materials"}
                    </h5>
                    <Sparkles size={16} className="text-yellow-600" />
                  </div>
                  <div className="space-y-3 mb-4">
                    <p className="text-sm text-gray-800 font-medium">Instructions:</p>
                    <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2 pl-2">
                      {displayInstructions.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                  <button
                    type="button"
                    onClick={handlePrintActivity}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1.5 min-h-[44px] hover:underline py-2"
                  >
                    <Printer size={14} /> Print Activity
                  </button>
                </div>
              )}
            </div>

            <div className="mt-auto pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-4">
              <button 
                onClick={() => setShowSmsDraft(!showSmsDraft)}
                className="text-sm font-medium text-emerald-600 hover:text-emerald-800 transition-colors border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 px-4 py-2.5 min-h-[44px] rounded-lg flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <MessageSquare size={16} />
                Guardian Communication
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving || isSaved}
                className={`text-sm font-medium transition-all flex items-center justify-center gap-1.5 min-h-[44px] py-2.5 w-full sm:w-auto rounded-lg ${
                  isSaved ? 'text-emerald-600' : 'text-blue-600 hover:text-blue-800'
                }`}
              >
                {isSaving ? (
                  <><Loader2 size={16} className="animate-spin" /> Saving...</>
                ) : isSaved ? (
                  <><Check size={16} /> Saved to Profile</>
                ) : (
                  '+ Save to Longitudinal Learner Profile'
                )}
              </button>
            </div>

            {showSmsDraft && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-start gap-3">
                  <div className="bg-emerald-100 p-2 rounded-full shrink-0">
                    <MessageSquare size={20} className="text-emerald-600" />
                  </div>
                  <div className="flex-grow">
                    <h5 className="text-sm font-semibold text-gray-900 mb-1">Draft Message to Parent</h5>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 rounded-tl-none shadow-sm mb-3">
                      <p className="text-sm text-gray-700">
                        {data.smsDraft || "BaseCamp Alert: Student requires additional support. - Teacher"}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors shadow-sm">
                        <Send size={14} /> Send SMS
                      </button>
                      <button 
                        onClick={handleGenerateAudio}
                        className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg transition-colors shadow-sm"
                      >
                        {isGeneratingAudio ? <Loader2 size={14} className="animate-spin" /> : <Volume2 size={14} />}
                        {isGeneratingAudio ? "Translating..." : "Generate Local Audio"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
