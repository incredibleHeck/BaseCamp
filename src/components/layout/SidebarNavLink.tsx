import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface SidebarNavLinkProps {
  icon: LucideIcon;
  label: string;
  /** Full label for mobile tooltips (optional). */
  title?: string;
  active: boolean;
  layout: 'sidebar' | 'mobile';
  onClick: () => void;
}

export function SidebarNavLink({
  icon: Icon,
  label,
  title: titleAttr,
  active,
  layout,
  onClick,
}: SidebarNavLinkProps) {
  const state = active
    ? 'bg-indigo-50/80 text-indigo-700 shadow-sm ring-1 ring-indigo-100'
    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900';

  if (layout === 'sidebar') {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 ${state}`}
      >
        <Icon className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
        <span className="truncate">{label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={titleAttr ?? label}
      className={`flex min-w-[4.25rem] shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-2 text-center text-[11px] font-medium leading-tight transition-all duration-200 ${state}`}
    >
      <Icon className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
      <span className="max-w-[4.5rem] break-words">{label}</span>
    </button>
  );
}