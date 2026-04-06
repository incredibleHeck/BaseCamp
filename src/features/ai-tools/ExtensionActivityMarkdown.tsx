import React from 'react';
import { MarkdownRenderer } from '../../components/ui/MarkdownRenderer';

const CEDI_SIGN = /\u20b5/;

/**
 * KaTeX does not support U+20B5 (₵) inside math; models often wrap currency in `$...$`.
 * Strip delimiters so ₵ stays in normal markdown text (renders correctly).
 */
function demoteMathContainingCedi(markdown: string): string {
  let out = markdown;
  out = out.replace(/\$\$([\s\S]*?)\$\$/g, (full, inner: string) => {
    if (CEDI_SIGN.test(inner)) return `\n\n${inner.trim()}\n\n`;
    return full;
  });
  out = out.replace(/\$([^$\n]+)\$/g, (full, inner: string) => {
    if (CEDI_SIGN.test(inner)) return inner;
    return full;
  });
  return out;
}

/** Trim and turn literal `\n` sequences into real newlines (model output quirks). */
export function normalizeExtensionActivityMarkdown(source: string): string {
  const trimmed = source.trim().replace(/\\n/g, '\n');
  return demoteMathContainingCedi(trimmed);
}

type ExtensionActivityMarkdownProps = {
  markdown: string;
  /** Extra wrapper classes (e.g. KaTeX inheritance inside tinted cards). */
  className?: string;
};

export function ExtensionActivityMarkdown({ markdown, className }: ExtensionActivityMarkdownProps) {
  const content = normalizeExtensionActivityMarkdown(markdown);
  if (!content) return null;

  const rootClass = ['text-sm md:text-base text-gray-700 [&_.prose]:text-inherit', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      <MarkdownRenderer
        content={content}
        className="!max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 my-0"
      />
    </div>
  );
}
