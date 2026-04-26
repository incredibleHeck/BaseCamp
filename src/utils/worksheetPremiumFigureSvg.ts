import type { WorksheetPremiumFigure } from '../services/ai/aiPrompts/types';

const SVG_NS = 'http://www.w3.org/2000/svg';

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/** Serialize a structured premium figure to an SVG string for print HTML. */
export function premiumFigureToSvgMarkup(figure: WorksheetPremiumFigure): string {
  const { viewBox, elements } = figure;
  const parts = elements.map((el) => {
    const attrStr = Object.entries(el.attrs)
      .map(([k, v]) => `${k}="${escapeAttr(String(v))}"`)
      .join(' ');
    switch (el.type) {
      case 'path':
        return `<path ${attrStr} />`;
      case 'circle':
        return `<circle ${attrStr} />`;
      case 'line':
        return `<line ${attrStr} />`;
      case 'polygon':
        return `<polygon ${attrStr} />`;
      case 'text':
        return `<text ${attrStr}></text>`;
      default:
        return '';
    }
  });
  return `<svg xmlns="${SVG_NS}" viewBox="${escapeAttr(viewBox)}" role="img" aria-hidden="true">${parts.join('')}</svg>`;
}
