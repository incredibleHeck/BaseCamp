import React, { useState } from 'react';
import { BookOpen, LogOut, Wifi, WifiOff } from 'lucide-react';

// 1. Define a scalable user object instead of loose strings
export interface UserData {
  id: string;
  role: 'teacher' | 'headteacher' | 'org_admin' | 'sen_coordinator' | 'super_admin';
  name: string;
  location: string;
  /**
   * B2B network / organization; umbrella scope for `org_admin` (multi-campus).
   * Backed by `organizationId` in Firestore.
   */
  organizationId?: string;
  circuitId?: string;
  schoolId?: string;
}

interface HeaderProps {
  onLogout?: () => void;
  user?: UserData | null;
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  queueLength?: number;
  isSyncing?: boolean;
}

export function Header({ onLogout, user, isOffline, setIsOffline, queueLength = 0, isSyncing = false }: HeaderProps) {
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
      {/* Offline Banner Toast - shorter on mobile */}
      {showBanner && isOffline && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs sm:text-sm font-medium py-3 px-4 sm:px-6 rounded-full shadow-lg z-[60] flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 max-w-[calc(100vw-2rem)]">
           <WifiOff size={16} className="text-orange-400 shrink-0" />
           <span><span className="sm:hidden">Offline. Will sync when back online.</span><span className="hidden sm:inline">Working offline. BaseCamp will sync your assessments when the connection is restored.</span></span>
        </div>
      )}

      <header className="fixed top-0 left-0 right-0 h-14 sm:h-16 glass z-50 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-1.5 sm:p-2 rounded-xl text-white shadow-soft shrink-0">
            <BookOpen size={18} className="sm:w-5 sm:h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="text-base sm:text-lg font-semibold text-zinc-900 leading-tight truncate tracking-tight">
              BaseCamp Diagnostics
            </h1>
            <span className="text-[9px] sm:text-[10px] font-medium text-indigo-600 uppercase tracking-wider truncate">
              Powered by HecTech AI
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Network: icon + dot on mobile; add label from sm */}
          <button
            onClick={() => {
              const next = !isOffline;
              setIsOffline(next);
              setShowBanner(next);
            }}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 h-11 sm:h-8 rounded-full text-xs font-medium transition-all duration-300 border shrink-0 ${
              isOffline
                ? 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
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
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isOffline ? 'bg-orange-400' : 'bg-emerald-500 animate-pulse'}`} />
          </button>

          {queueLength > 0 && (
            <>
              {/* Compact on very small screens */}
              <div
                className="sm:hidden inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full border border-zinc-200 bg-white px-2 text-xs font-semibold text-zinc-800 tabular-nums shadow-sm"
                title={`Queued analyses: ${queueLength}. Will run when online.`}
                aria-label={`Queued analyses: ${queueLength}`}
              >
                {queueLength}
                {isSyncing && <span className="sr-only">Syncing</span>}
              </div>
              <div
                className="hidden sm:inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 h-8 text-xs font-medium text-zinc-700 shadow-sm"
                title="Queued analyses will run when online"
                aria-label="Queued analyses"
              >
                <span>Queued: {queueLength}</span>
                {isSyncing && <span className="text-zinc-500">Syncing…</span>}
              </div>
            </>
          )}

          {user && (
            <div className="flex flex-col items-end text-right min-w-0 max-w-[5.5rem] sm:max-w-[10rem] md:max-w-none">
              <span className="text-[10px] sm:text-xs font-medium text-zinc-900 leading-tight truncate w-full">
                {getRoleTitle(user.role)}
              </span>
              <span className="hidden sm:block text-[10px] text-zinc-500 leading-tight truncate sm:max-w-[12rem] lg:max-w-none">
                {user.location}
              </span>
            </div>
          )}

          <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-semibold text-sm border border-indigo-100 shrink-0 shadow-sm">
            {user ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="text-zinc-400 hover:text-red-600 transition-colors p-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 inline-flex items-center justify-center rounded-full hover:bg-red-50 shrink-0"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={18} className="sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      </header>
    </>
  );
}