import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

/** Shared markdown + KaTeX styling for AI extension activity copy. */
export const extensionActivityMarkdownComponents: Components = {
  h1: ({ node: _n, ...props }) => (
    <h1 {...props} className="text-xl font-bold text-gray-900 mt-6 mb-2 first:mt-0" />
  ),
  h2: ({ node: _n, ...props }) => (
    <h2 {...props} className="text-lg font-bold text-gray-900 mt-5 mb-2 first:mt-0" />
  ),
  h3: ({ node: _n, ...props }) => (
    <h3 {...props} className="text-base font-semibold text-gray-800 mt-4 mb-2 first:mt-0" />
  ),
  p: ({ node: _n, ...props }) => <p {...props} className="mb-3 leading-relaxed" />,
  ul: ({ node: _n, ...props }) => <ul {...props} className="list-disc pl-5 mb-4 space-y-1" />,
  ol: ({ node: _n, ...props }) => <ol {...props} className="list-decimal pl-5 mb-4 space-y-1" />,
  li: ({ node: _n, ...props }) => <li {...props} className="pl-1" />,
  strong: ({ node: _n, ...props }) => <strong {...props} className="font-semibold text-gray-900" />,
  pre: ({ node: _n, ...props }) => (
    <pre
      {...props}
      className="block bg-gray-800 text-gray-100 p-3 rounded-lg text-sm overflow-x-auto my-3 [&>code]:!bg-transparent [&>code]:p-0 [&>code]:text-inherit"
    />
  ),
  code: ({ node: _n, className, children, ...props }) => {
    const isFence = typeof className === 'string' && /^language-/.test(className);
    if (isFence) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        {...props}
        className="bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded text-sm font-mono"
      >
        {children}
      </code>
    );
  },
};

/** Trim and turn literal `\n` sequences into real newlines (model output quirks). */
export function normalizeExtensionActivityMarkdown(source: string): string {
  return source.trim().replace(/\\n/g, '\n');
}

type ExtensionActivityMarkdownProps = {
  markdown: string;
  /** Extra wrapper classes (e.g. KaTeX inheritance inside tinted cards). */
  className?: string;
};

export function ExtensionActivityMarkdown({ markdown, className }: ExtensionActivityMarkdownProps) {
  const content = normalizeExtensionActivityMarkdown(markdown);
  if (!content) return null;

  const rootClass = [
    'text-sm md:text-base text-gray-700 space-y-4 whitespace-pre-wrap [&_.katex]:text-inherit',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // react-markdown v10+ does not support a root `className` prop; wrap for typography scope.
  return (
    <div className={rootClass}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={extensionActivityMarkdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
