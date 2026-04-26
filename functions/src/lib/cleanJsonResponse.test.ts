import { describe, it, expect } from 'vitest';
import { cleanJsonResponse } from './cleanJsonResponse.js';

describe('cleanJsonResponse', () => {
  it('strips code fences and returns JSON object', () => {
    const input = '```json\n{"body":"hello","homeActivity":"draw"}\n```';
    expect(cleanJsonResponse(input)).toBe('{"body":"hello","homeActivity":"draw"}');
  });

  it('extracts object from surrounding text', () => {
    const input = 'Here is the result:\n{"key":"value"}\nDone.';
    expect(cleanJsonResponse(input)).toBe('{"key":"value"}');
  });

  it('extracts array from surrounding text', () => {
    const input = 'Result: [1,2,3] end';
    expect(cleanJsonResponse(input)).toBe('[1,2,3]');
  });

  it('prefers whichever delimiter comes first (object)', () => {
    const input = '{"a":1} [2]';
    expect(cleanJsonResponse(input)).toBe('{"a":1}');
  });

  it('prefers whichever delimiter comes first (array)', () => {
    const input = 'prefix [1,2] {"a":1}';
    expect(cleanJsonResponse(input)).toBe('[1,2]');
  });

  it('returns trimmed input when no JSON delimiters found', () => {
    expect(cleanJsonResponse('  just text  ')).toBe('just text');
  });

  it('handles nested objects', () => {
    const nested = '{"a":{"b":{"c":1}}}';
    expect(cleanJsonResponse(`text ${nested} more`)).toBe(nested);
  });

  it('handles unclosed brace by returning trimmed string', () => {
    expect(cleanJsonResponse('{no close')).toBe('{no close');
  });

  it('strips multiple code fence variants', () => {
    const input = '```JSON\n{"x":1}\n```';
    expect(cleanJsonResponse(input)).toBe('{"x":1}');
  });
});
