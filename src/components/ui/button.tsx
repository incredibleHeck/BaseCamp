import * as React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

import { cn } from '../../utils/ui-helpers';

export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'ghost' | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg';

const baseStyles =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
  'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50';

const variantStyles: Record<ButtonVariant, string> = {
  default:
    'bg-gradient-to-b from-indigo-500 to-indigo-600 text-white shadow-soft hover:from-indigo-600 hover:to-indigo-700 ' +
    'focus-visible:ring-indigo-500 dark:from-indigo-600 dark:to-indigo-700 ' +
    'ring-offset-white dark:ring-offset-zinc-950 border border-indigo-600/50',
  destructive:
    'bg-gradient-to-b from-red-500 to-red-600 text-white shadow-soft hover:from-red-600 hover:to-red-700 ' +
    'focus-visible:ring-red-500 ring-offset-white dark:ring-offset-zinc-950 border border-red-600/50',
  outline:
    'border border-zinc-200/80 bg-white text-zinc-900 shadow-sm hover:bg-zinc-50 ' +
    'focus-visible:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 ' +
    'dark:hover:bg-zinc-900 ring-offset-white dark:ring-offset-zinc-950',
  ghost:
    'text-zinc-900 hover:bg-zinc-100 ' +
    'focus-visible:ring-indigo-500 dark:text-zinc-50 dark:hover:bg-zinc-800 ' +
    'ring-offset-white dark:ring-offset-zinc-950',
  link:
    'h-auto p-0 text-indigo-600 underline-offset-4 hover:underline ' +
    'focus-visible:ring-indigo-500 dark:text-indigo-400 ' +
    'ring-offset-white dark:ring-offset-zinc-950',
};

const sizeStyles: Record<ButtonSize, string> = {
  default: 'h-10 min-h-10 px-4 py-2',
  sm: 'h-9 min-h-9 rounded-lg px-3 text-xs',
  lg: 'h-11 min-h-11 rounded-xl px-6 text-base sm:text-sm',
};

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', type = 'button', ...props }, ref) => (
    <motion.button
      ref={ref}
      type={type}
      whileTap={{ scale: 0.97 }}
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    />
  )
);
Button.displayName = 'Button';

export { Button };
