/**
 * Mirrors `src/services/ai/aiPrompts/utils.ts` — strip code fences, extract JSON object.
 */
export function cleanJsonResponse(jsonString: string): string {
  let s = jsonString.replace(/```json\s*/gi, '').replace(/```/g, '').trim();

  const iBrace = s.indexOf('{');
  const iBracket = s.indexOf('[');

  let start = -1;
  let open: '{' | '[' | null = null;

  if (iBrace >= 0 && iBracket >= 0) {
    start = Math.min(iBrace, iBracket);
    open = start === iBrace ? '{' : '[';
  } else if (iBrace >= 0) {
    start = iBrace;
    open = '{';
  } else if (iBracket >= 0) {
    start = iBracket;
    open = '[';
  }

  if (start < 0 || !open) {
    return s;
  }

  const close = open === '{' ? '}' : ']';
  const end = s.lastIndexOf(close);
  if (end < start) {
    return s;
  }

  return s.slice(start, end + 1);
}
