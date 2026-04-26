import React, { useState } from 'react';
import { BookOpen, LogOut, Wifi, WifiOff } from 'lucide-react';
import type { UserData } from '../layout/Header';

export type PremiumHeaderChromeProps = {
  onLogout?: () => void;
  user?: UserData | null;
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  queueLength?: number;
  isSyncing?: boolean;
};

export function PremiumHeaderChrome({
  onLogout,
  user,
  isOffline,
  setIsOffline,
  queueLength = 0,
  isSyncing = false,
}: PremiumHeaderChromeProps) {
  const [showBanner, setShowBanner] = useState(false);

  const getRoleTitle = (role: string) => {
    const titles = {
      teacher: 'Teacher Portal',
      headteacher: 'Headteacher Portal',
      org_admin: 'Organization admin',
      sen_coordinator: 'SEN Coordinator',
      super_admin: 'MoE / Super Admin',
    };
    return titles[role as keyof typeof titles] || '';
  };

  return (
    <>
      {showBanner && isOffline && (
        <div className="fixed top-20 left-1/2 z-[60] flex max-w-[calc(100vw-2rem)] -translate-x-1/2 transform items-center gap-3 rounded-full border border-gold-500/30 bg-obsidian-900 px-4 py-3 text-xs font-medium text-zinc-100 shadow-premium animate-in slide-in-from-top-4 duration-300 sm:px-6 sm:text-sm">
          <WifiOff size={16} className="shrink-0 text-gold-400" />
          <span>
            <span className="sm:hidden">Offline. Will sync when back online.</span>
            <span className="hidden sm:inline">
              Working offline. BaseCamp will sync your assessments when the connection is restored.
            </span>
          </span>
        </div>
      )}

      <header className="premium-glass fixed top-0 right-0 left-0 z-50 flex h-14 items-center justify-between px-4 shadow-premium sm:h-16 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="shrink-0 rounded-xl border border-gold-500/40 bg-gradient-to-br from-gold-500 to-gold-600 p-1.5 text-obsidian-950 shadow-sm sm:p-2">
            <BookOpen size={18} className="sm:h-5 sm:w-5" />
          </div>
          <div className="flex min-w-0 flex-col">
            <h1 className="truncate text-base font-semibold leading-tight tracking-tight text-zinc-50 sm:text-lg">
              BaseCamp Diagnostics
            </h1>
            <span className="truncate text-[9px] font-medium tracking-wider text-gold-400 uppercase sm:text-[10px]">
              Powered by HecTech AI
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => {
              const next = !isOffline;
              setIsOffline(next);
              setShowBanner(next);
            }}
            className={`flex h-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center gap-1.5 rounded-full border px-2.5 text-xs font-medium transition-all duration-300 sm:h-8 sm:min-h-0 sm:min-w-0 sm:px-3 ${
              isOffline
                ? 'border-obsidian-600 bg-obsidian-800 text-zinc-300 hover:bg-obsidian-700'
                : 'border-emerald-500/40 bg-emerald-950/50 text-emerald-300 hover:bg-emerald-900/50'
            }`}
            title={
              isOffline
                ? 'Demo: Offline — app queues work and will not sync until you switch to Online'
                : 'Demo: Online — app will run diagnoses and sync the queue'
            }
            aria-label={isOffline ? 'Demo offline mode' : 'Demo online mode'}
          >
            {isOffline ? <WifiOff size={16} /> : <Wifi size={16} />}
            <span className="hidden sm:inline">{isOffline ? 'Offline' : 'Online'}</span>
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${isOffline ? 'bg-orange-400' : 'animate-pulse bg-emerald-400'}`}
            />
          </button>

          {queueLength > 0 && (
            <>
              <div
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-obsidian-600 bg-obsidian-800 px-2 text-xs font-semibold text-zinc-100 tabular-nums shadow-sm sm:hidden"
                title={`Queued analyses: ${queueLength}. Will run when online.`}
                aria-label={`Queued analyses: ${queueLength}`}
              >
                {queueLength}
                {isSyncing && <span className="sr-only">Syncing</span>}
              </div>
              <div
                className="hidden h-8 items-center gap-2 rounded-full border border-obsidian-600 bg-obsidian-800 px-3 text-xs font-medium text-zinc-200 shadow-sm sm:inline-flex"
                title="Queued analyses will run when online"
                aria-label="Queued analyses"
              >
                <span>Queued: {queueLength}</span>
                {isSyncing && <span className="text-zinc-500">Syncing…</span>}
              </div>
            </>
          )}

          {user && (
            <div className="flex min-w-0 max-w-[5.5rem] flex-col items-end text-right sm:max-w-[10rem] md:max-w-none">
              <span className="w-full truncate text-[10px] leading-tight font-medium text-zinc-100 sm:text-xs">
                {getRoleTitle(user.role)}
              </span>
              <span className="hidden max-w-[12rem] truncate text-[10px] leading-tight text-zinc-500 sm:block lg:max-w-none">
                {user.location}
              </span>
            </div>
          )}

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold-500/35 bg-obsidian-800 text-sm font-semibold text-gold-300 shadow-sm">
            {user ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full p-2 text-zinc-500 transition-colors hover:bg-red-950/50 hover:text-red-400 sm:min-h-0 sm:min-w-0"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={18} className="sm:h-5 sm:w-5" />
            </button>
          )}
        </div>
      </header>
    </>
  );
}
