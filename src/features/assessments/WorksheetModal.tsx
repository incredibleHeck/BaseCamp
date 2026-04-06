import React from 'react';
import { Printer } from 'lucide-react';
import { MarkdownRenderer } from '../../components/ui/MarkdownRenderer';
import type { WorksheetResult } from '../../services/ai/aiPrompts';
import { printWorksheetToWindow } from '../../utils/printUtils';

interface WorksheetModalProps {
  activeWorksheet: { gap: string; data: WorksheetResult } | null;
  onClose: () => void;
  /** Optional curriculum context for the generated sheet. */
  curriculumAlignmentLabel?: string;
}

export function WorksheetModal({ activeWorksheet, onClose, curriculumAlignmentLabel }: WorksheetModalProps) {
  if (!activeWorksheet) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between gap-4 p-4 border-b border-gray-200 print:hidden">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Practice Worksheet</h3>
            {curriculumAlignmentLabel ? (
              <p className="text-xs text-slate-500 mt-1">
                Aligned to: <span className="font-medium text-slate-700">{curriculumAlignmentLabel}</span>
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
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
          <p className="text-sm text-gray-500 mb-6 print:text-black">Target: {activeWorksheet.gap}</p>
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
                <div className="mb-6 print:text-black [&_.prose]:text-lg [&_.prose]:font-medium [&_.prose]:text-gray-900 print:[&_.prose]:text-black">
                  <MarkdownRenderer
                    content={`${idx + 1}. ${q}`}
                    className="!my-0 max-w-none"
                  />
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
  );
}

