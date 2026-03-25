import * as React from 'react';

import { cn } from '../../utils/ui-helpers';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-10 min-h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm',
        'placeholder:text-slate-500',
        'transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-slate-950',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:placeholder:text-slate-400 dark:file:text-slate-50',
        'ring-offset-white dark:ring-offset-slate-950 dark:focus-visible:ring-indigo-400',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export { Input };
