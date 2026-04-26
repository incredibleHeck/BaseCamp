/** Layout class strings for the Premium (Obsidian & Gold) shell only. */
export const premiumClassNames = {
  pageRoot: 'min-h-screen bg-obsidian-950 text-zinc-100 font-sans flex flex-col',
  mainColumn: 'flex min-h-0 min-w-0 flex-1 flex-col bg-obsidian-950/70',
  main:
    'mx-auto w-full max-w-7xl flex-1 overflow-y-auto px-4 pb-24 pt-4 sm:px-6 sm:pt-6 md:pb-12 lg:px-8',
  aside:
    'hidden md:flex w-64 shrink-0 flex-col border-r border-obsidian-800 bg-obsidian-900/40 backdrop-blur-sm',
  asideDivider: 'my-2 border-t border-obsidian-800 pt-2',
  syncToast:
    'mb-4 rounded-xl border border-emerald-500/30 bg-emerald-950/50 px-4 py-3 text-sm font-medium text-emerald-200 shadow-premium',
  mobileNavWrap: 'fixed bottom-4 left-1/2 -translate-x-1/2 z-40 md:hidden',
  mobileNavPill:
    'flex gap-1 overflow-x-auto px-2 py-2 premium-glass shadow-premium rounded-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
} as const;
