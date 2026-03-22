import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { FileText, Loader2, Printer, Sparkles, Trophy } from 'lucide-react';
import type { Components } from 'react-markdown';
import type { Assessment } from '../services/assessmentService';
import type { WorksheetResult } from '../services/aiPrompts';
import type { GapInterventionEntry } from '../hooks/useStudentProfileData';
import { formatAssessmentDateTime } from '../utils/studentProfileHelpers';

const extensionMarkdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-xl font-bold text-amber-950 mt-4 first:mt-0 mb-2">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg font-bold text-indigo-950 mt-4 first:mt-0 mb-2">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-gray-900 mt-3 mb-1.5">{children}</h3>
  ),
  p: ({ children }) => <p className="text-sm text-gray-800 leading-relaxed my-2.5">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-1 text-sm text-gray-800">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 my-2 space-y-1 text-sm text-gray-800">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-amber-950">{children}</strong>,
  code: ({ children }) => (
    <code className="rounded bg-indigo-100/80 text-indigo-900 px-1.5 py-0.5 text-xs font-mono">{children}</code>
  ),
};

interface StudentProfileActionPlanViewProps {
  gapInterventions: GapInterventionEntry[];
  lastWorksheetByCard: Record<string, { gap: string; data: WorksheetResult }>;
  regeneratingAssessmentId: string | null;
  generatingSheetFor: string | null;
  onRegenerateLessonPlan: (assessment: Assessment) => void | Promise<void>;
  onPrintLessonPlan: (assessment: Assessment) => void;
  onGeneratePracticeSheet: (gaps: string[], subject: string, assessment: Assessment) => void | Promise<void>;
  onPrintWorksheet: (cardKey: string) => void;
  onOpenWorksheet: (entry: { gap: string; data: WorksheetResult }) => void;
}

export function StudentProfileActionPlanView({
  gapInterventions,
  lastWorksheetByCard,
  regeneratingAssessmentId,
  generatingSheetFor,
  onRegenerateLessonPlan,
  onPrintLessonPlan,
  onGeneratePracticeSheet,
  onPrintWorksheet,
  onOpenWorksheet,
}: StudentProfileActionPlanViewProps) {
  if (gapInterventions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 p-8 text-center">
        <p className="text-gray-600 text-sm max-w-md mx-auto">
          No learning gaps are linked to saved assessments yet. Run an AI diagnosis from{' '}
          <strong>New Assessment</strong> and save to this profile to see remedial activities and worksheets here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {gapInterventions.map(({ assessment, gaps }) => {
        const subject = assessment.type;
        const cardKey = `${gaps.join('|')}-${subject}`;
        const extensionMarkdown = assessment.extensionActivity?.trim() ?? '';
        const hasExtensionChallenge = extensionMarkdown.length > 0;
        const hasLesson =
          !!assessment.lessonPlan?.title?.trim() ||
          (assessment.lessonPlan?.instructions?.length ?? 0) > 0;
        const storedSheet = lastWorksheetByCard[cardKey];
        const isRegenerating = regeneratingAssessmentId === assessment.id;
        const isGeneratingSheet = generatingSheetFor === cardKey;

        return (
          <div
            key={assessment.id ?? `${formatAssessmentDateTime(assessment.timestamp)}-${subject}`}
            className="border border-gray-200 rounded-xl p-5 shadow-sm bg-white"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {subject} · {formatAssessmentDateTime(assessment.timestamp)}
                </h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{assessment.diagnosis}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Target gaps</p>
              <div className="flex flex-wrap gap-2">
                {gaps.map((g) => (
                  <span
                    key={g}
                    className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-900 border border-orange-100"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>

            {assessment.remedialPlan ? (
              <div className="mb-4 text-sm text-gray-700 bg-slate-50 border border-slate-100 rounded-lg p-3">
                <span className="font-semibold text-slate-800">Remedial plan: </span>
                {assessment.remedialPlan}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {!hasExtensionChallenge ? (
                <>
                  <button
                    type="button"
                    disabled={isRegenerating || !assessment.id}
                    onClick={() => void onRegenerateLessonPlan(assessment)}
                    className="inline-flex items-center justify-center gap-2 bg-yellow-100 hover:bg-yellow-200 disabled:opacity-60 text-yellow-900 text-sm font-medium py-2.5 px-4 rounded-lg border border-yellow-200 min-h-[44px]"
                  >
                    {isRegenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    {hasLesson ? 'Regenerate 5-min activity' : 'Generate 5-min activity'}
                  </button>
                  {hasLesson ? (
                    <button
                      type="button"
                      onClick={() => onPrintLessonPlan(assessment)}
                      className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-800 text-sm font-medium py-2.5 px-4 rounded-lg hover:bg-gray-50 min-h-[44px]"
                    >
                      <Printer size={16} />
                      Print activity
                    </button>
                  ) : null}
                </>
              ) : null}
              <button
                type="button"
                disabled={isGeneratingSheet || !assessment.id}
                onClick={() => void onGeneratePracticeSheet(gaps, subject, assessment)}
                className="inline-flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 disabled:opacity-60 text-blue-900 text-sm font-medium py-2.5 px-4 rounded-lg border border-blue-200 min-h-[44px]"
              >
                {isGeneratingSheet ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                {storedSheet ? 'Regenerate worksheet' : 'Generate practice worksheet'}
              </button>
              {storedSheet ? (
                <>
                  <button
                    type="button"
                    onClick={() => onOpenWorksheet(storedSheet)}
                    className="inline-flex items-center justify-center gap-2 border border-blue-200 text-blue-800 text-sm font-medium py-2.5 px-4 rounded-lg bg-white hover:bg-blue-50 min-h-[44px]"
                  >
                    <FileText size={16} />
                    View worksheet
                  </button>
                  <button
                    type="button"
                    onClick={() => onPrintWorksheet(cardKey)}
                    className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-800 text-sm font-medium py-2.5 px-4 rounded-lg hover:bg-gray-50 min-h-[44px]"
                  >
                    <Printer size={16} />
                    Print worksheet
                  </button>
                </>
              ) : null}
            </div>

            {hasExtensionChallenge ? (
              <div className="mt-4 rounded-2xl border-2 border-indigo-400/60 bg-gradient-to-br from-indigo-50 via-white to-amber-50 p-5 sm:p-6 shadow-md ring-1 ring-indigo-200/50">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-lg ring-2 ring-indigo-300/50">
                    <Trophy className="h-7 w-7" strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-indigo-800/90 mb-1">
                      Gifted learner extension
                    </p>
                    <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                      <Sparkles className="h-5 w-5 text-amber-500 shrink-0" />
                      A* Extension Challenge
                    </h4>
                    <p className="text-sm text-indigo-900/80 mt-2 leading-relaxed">
                      This learner demonstrated exceptional mastery. Use this advanced prompt in place of a
                      remedial activity.
                    </p>
                  </div>
                </div>
                <div className="rounded-xl bg-white/95 border border-amber-200/60 p-4 sm:p-5 shadow-inner [&_.katex]:text-inherit">
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={extensionMarkdownComponents}
                  >
                    {extensionMarkdown}
                  </ReactMarkdown>
                </div>
              </div>
            ) : hasLesson && assessment.lessonPlan ? (
              <div className="mt-4 bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{assessment.lessonPlan.title || 'Activity'}</h4>
                <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
                  {(assessment.lessonPlan.instructions || []).map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
