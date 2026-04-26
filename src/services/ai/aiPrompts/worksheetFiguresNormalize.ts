import type { WorksheetPremiumElementType, WorksheetPremiumFigure } from './types';

const PREMIUM_ELEMENT_TYPES = new Set<WorksheetPremiumElementType>([
  'path',
  'circle',
  'line',
  'polygon',
  'text',
]);

export function attrsFromRaw(raw: unknown): Record<string, string> {
  if (!raw) return {};
  if (Array.isArray(raw)) {
    const o: Record<string, string> = {};
    for (const p of raw) {
      if (
        p &&
        typeof p === 'object' &&
        typeof (p as { key?: unknown }).key === 'string' &&
        typeof (p as { value?: unknown }).value === 'string'
      ) {
        o[(p as { key: string }).key] = (p as { value: string }).value;
      }
    }
    return o;
  }
  if (typeof raw === 'object') {
    return Object.fromEntries(
      Object.entries(raw as object).filter(([, v]) => typeof v === 'string')
    ) as Record<string, string>;
  }
  return {};
}

export function normalizePremiumFigure(raw: unknown): WorksheetPremiumFigure | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw !== 'object') return null;
  const viewBox = typeof (raw as { viewBox?: unknown }).viewBox === 'string' ? (raw as { viewBox: string }).viewBox.trim() : '';
  const elementsRaw = (raw as { elements?: unknown }).elements;
  if (!viewBox || !Array.isArray(elementsRaw)) return null;
  const elements: WorksheetPremiumFigure['elements'] = [];
  for (const er of elementsRaw) {
    if (!er || typeof er !== 'object') continue;
    const type = String((er as { type?: unknown }).type || '');
    if (!PREMIUM_ELEMENT_TYPES.has(type as WorksheetPremiumElementType)) continue;
    const attrs = attrsFromRaw((er as { attrs?: unknown }).attrs);
    elements.push({ type: type as WorksheetPremiumElementType, attrs });
  }
  if (elements.length === 0) return null;
  return { viewBox, elements };
}

export function normalizeGesTikzEntry(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw !== 'string') return null;
  const s = raw.trim();
  if (!s) return null;
  const lower = s.toLowerCase();
  if (!lower.includes('tikzpicture')) return null;
  return s;
}

export function alignParallelArray<T>(arr: (T | null)[], length: number): (T | null)[] {
  return Array.from({ length }, (_, i) => {
    if (!arr || i >= arr.length) return null;
    const v = arr[i];
    if (v === undefined) return null;
    return v;
  });
}
