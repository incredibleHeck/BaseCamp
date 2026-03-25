import * as React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

import { cn } from '../../utils/ui-helpers';

type DialogContextValue = {
  onClose: () => void;
};

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialogContext(component: string): DialogContextValue {
  const ctx = React.useContext(DialogContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <Dialog>`);
  }
  return ctx;
}

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function Dialog({ isOpen, onClose, children }: DialogProps) {
  React.useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const tree = (
    <DialogContext.Provider value={{ onClose }}>
      <div className="fixed inset-0 z-50" role="presentation">
        <button
          type="button"
          aria-label="Close dialog"
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        {children}
      </div>
    </DialogContext.Provider>
  );

  if (typeof document === 'undefined') return tree;
  return createPortal(tree, document.body);
}

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, ...props }, ref) => {
    const { onClose } = useDialogContext('DialogContent');

    return (
      <div
        className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
        role="presentation"
      >
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          className={cn(
            'pointer-events-auto relative flex max-h-[min(85dvh,calc(100dvh-env(safe-area-inset-bottom)-1rem))] w-full flex-col',
            'border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950',
            'rounded-t-2xl rounded-b-none sm:max-h-[min(90dvh,calc(100dvh-2rem))] sm:max-w-lg sm:rounded-lg',
            'pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[max(1.5rem,env(safe-area-inset-left))] pr-[max(1.5rem,env(safe-area-inset-right))] pt-6',
            'sm:pb-6 sm:pl-6 sm:pr-6 sm:pt-6',
            'overflow-y-auto',
            className
          )}
          onClick={(e) => e.stopPropagation()}
          {...props}
        >
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'absolute right-3 top-3 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md',
              'text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
              'dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50 dark:focus-visible:ring-indigo-400',
              'ring-offset-white dark:ring-offset-slate-950'
            )}
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
          {children}
        </div>
      </div>
    );
  }
);
DialogContent.displayName = 'DialogContent';

const DialogHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col gap-1.5 pr-10 text-left sm:pr-12', className)} {...props} />
  )
);
DialogHeader.displayName = 'DialogHeader';

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn('text-lg font-semibold leading-none tracking-tight text-slate-950 dark:text-slate-50', className)}
      {...props}
    />
  )
);
DialogTitle.displayName = 'DialogTitle';

const DialogFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  )
);
DialogFooter.displayName = 'DialogFooter';

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter };
