export type ClassValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ClassValue[];

function flattenClassValues(inputs: ClassValue[]): string[] {
  const out: string[] = [];
  for (const input of inputs) {
    if (input == null || input === false) continue;
    if (typeof input === 'string') {
      const t = input.trim();
      if (t) out.push(t);
    } else if (typeof input === 'number' && Number.isFinite(input)) {
      out.push(String(input));
    } else if (Array.isArray(input)) {
      out.push(...flattenClassValues(input));
    }
  }
  return out;
}

/**
 * Merges Tailwind / conditional class strings. Falsy values are dropped.
 * For conflicting utilities, list the winning segment last (no tailwind-merge).
 */
export function cn(...inputs: ClassValue[]): string {
  return flattenClassValues(inputs).join(' ');
}

/** Alias for `cn` — matches naming used in some UI files. */
export const cx = cn;

/** Matches `Input` borders, height, and focus rings for native `<select>`. */
export const selectTriggerClass = cn(
  'flex h-10 min-h-10 w-full cursor-pointer rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm',
  'transition-colors',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
  'disabled:cursor-not-allowed disabled:opacity-50',
  'dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50',
  'ring-offset-white dark:ring-offset-slate-950 dark:focus-visible:ring-indigo-400'
);
