import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

export type MarkdownRendererProps = {
  content: string;
  /** Merged with default prose / KaTeX wrapper classes. */
  className?: string;
};

function normalizeContent(raw: string): string {
  return raw.trim().replace(/\\n/g, '\n');
}

/**
 * Renders AI / user markdown with GFM, LaTeX via KaTeX, and Tailwind Typography (`prose`).
 */
export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const normalized = normalizeContent(content);
  if (!normalized) return null;

  return (
    <div
      className={[
        'prose prose-sm md:prose-base dark:prose-invert max-w-none text-gray-800 [&_.katex]:text-inherit',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { strict: 'ignore' }]]}
      >
        {normalized}
      </ReactMarkdown>
    </div>
  );
}
