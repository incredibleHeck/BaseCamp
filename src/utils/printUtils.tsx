import React from 'react';
import ReactDOMServer from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import katexCss from 'katex/dist/katex.min.css?inline';
import type { Assessment } from '../services/assessmentService';
import type { WorksheetResult } from '../services/ai/aiPrompts';
import { escapeHtml } from './studentProfileHelpers';
import { premiumFigureToSvgMarkup } from './worksheetPremiumFigureSvg';

export function renderMarkdownMathToHtml(markdown: string): string {
  return ReactDOMServer.renderToStaticMarkup(
    <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
      {markdown}
    </ReactMarkdown>
  );
}

export function printLessonPlanWindow(assessment: Assessment): void {
  const lessonPlan = assessment.lessonPlan;
  const title = lessonPlan?.title?.trim() || '10-Minute Remedial Activity';
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
}

export function printWorksheetToWindow(
  worksheet: { gap: string; data: WorksheetResult },
  options?: { isPremiumTier?: boolean }
): void {
  const { data, gap } = worksheet;
  const isPremiumTier = options?.isPremiumTier ?? false;
  const title = escapeHtml(data.title);
  const gapEscaped = escapeHtml(gap);
  const questionsBlocks = data.questions
    .map((q, idx) => {
      const qHtml = renderMarkdownMathToHtml(q);
      const lines = [1, 2, 3, 4]
        .map(
          () =>
            '<div style="border-bottom: 2px dotted #000; height: 2.5rem; width: 100%; margin-bottom: 0.5rem;"></div>'
        )
        .join('');
      const premium = data.premiumFigures?.[idx];
      const tikz = !isPremiumTier ? data.gesTikzFigures?.[idx] : null;
      let figureBlock = '';
      if (premium) {
        figureBlock = `<div class="worksheet-figure" style="margin: 1rem 0; text-align: center;">${premiumFigureToSvgMarkup(premium)}</div>`;
      } else if (tikz) {
        figureBlock = `<div style="margin: 1rem 0;"><div style="font-size: 0.75rem; font-weight: 600; margin-bottom: 0.25rem;">Diagram (LaTeX / TikZ)</div><pre style="white-space: pre-wrap; font-size: 0.7rem; background: #f5f5f5; padding: 0.5rem; border: 1px solid #ddd;">${escapeHtml(tikz)}</pre></div>`;
      }
      return `
        <div style="margin-bottom: 4rem;">
          <div style="font-size: 1.125rem; font-weight: 500; color: #111; margin-bottom: 1.5rem;">${idx + 1}. ${qHtml}</div>
          ${figureBlock}
          <div style="margin-top: 0.5rem;">${lines}</div>
        </div>`;
    })
    .join('');
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    ${katexCss}
    body { font-family: system-ui, sans-serif; max-width: 42rem; margin: 0 auto; padding: 2rem; background: #fff; color: #000; min-height: 100vh; }
    h1 { font-size: 1.25rem; margin-bottom: 0.5rem; color: #000; }
    .target { font-size: 0.875rem; color: #374151; margin-bottom: 2rem; }
    .header-line { margin-bottom: 2rem; }
    .header-line span { font-weight: 500; }
    .header-line .line { display: inline-block; border-bottom: 2px dotted #000; width: 12rem; vertical-align: bottom; margin-left: 0.25rem; }
    .footer { margin-top: 3rem; font-size: 0.875rem; color: #666; }
    .katex { font-size: 1.05em; }
    .katex-display { margin: 0.75em 0; }
    p { margin: 0; }
    .worksheet-figure svg { max-height: 12rem; width: 100%; max-width: 28rem; }
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
}

