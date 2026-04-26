import React, { type ReactNode } from 'react';
import { m } from 'motion/react';
import type { WorksheetPremiumFigure as WorksheetPremiumFigureModel } from '../../services/ai/aiPrompts/types';

function toReactSvgCase(key: string): string {
  if (!key.includes('-')) return key;
  return key.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

/** Drop helper keys used only for visible text on `<text>` nodes. */
function svgAttrsForReact(attrs: Record<string, string>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'text' || k === 'content' || k === 'children') continue;
    out[toReactSvgCase(k)] = v;
  }
  return out;
}

function textBody(attrs: Record<string, string>): string {
  return attrs.text ?? attrs.content ?? attrs.children ?? '';
}

function renderElement(
  el: WorksheetPremiumFigureModel['elements'][number],
  index: number
): ReactNode {
  const props = svgAttrsForReact(el.attrs) as Record<string, unknown>;
  switch (el.type) {
    case 'path':
      return <path key={index} {...props} />;
    case 'circle':
      return <circle key={index} {...props} />;
    case 'line':
      return <line key={index} {...props} />;
    case 'polygon':
      return <polygon key={index} {...props} />;
    case 'text':
      return (
        <text key={index} {...props}>
          {textBody(el.attrs)}
        </text>
      );
    default:
      return null;
  }
}

export function WorksheetPremiumFigure({ figure }: { figure: WorksheetPremiumFigureModel }) {
  return (
    <m.div
      className="my-4 flex justify-center print:my-3"
      initial={{ opacity: 0.85, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
    >
      <svg
        className="max-h-48 w-full max-w-md text-slate-900 print:max-h-40"
        viewBox={figure.viewBox}
        role="img"
        aria-hidden
      >
        {figure.elements.map((el, i) => renderElement(el, i))}
      </svg>
    </m.div>
  );
}
