import React from 'react';

export type PageHeroProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Right-aligned toolbar (filters, CTAs); stacks below title on small screens if children are wide */
  actions?: React.ReactNode;
  className?: string;
};

/**
 * Shared top-of-view header: title line, optional description, optional actions.
 * Styled for default (zinc) and sits inside main max-width columns.
 */
export function PageHero({ title, description, actions, className = '' }: PageHeroProps) {
  const hasActions = Boolean(actions);

  return (
    <header
      className={`flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6 ${hasActions ? 'mb-6' : 'mb-8'} ${className}`.trim()}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{title}</h1>
        {description != null && description !== '' && (
          <p className="max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
        )}
      </div>
      {actions ? <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:items-end">{actions}</div> : null}
    </header>
  );
}
