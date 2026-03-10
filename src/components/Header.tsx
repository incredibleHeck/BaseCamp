import React, { useState, useEffect } from 'react';
import { BookOpen, LogOut, Wifi, WifiOff } from 'lucide-react';

// 1. Define a scalable user object instead of loose strings
export interface UserData {
  id: string;
  role: 'teacher' | 'headteacher' | 'district';
  name: string;
  location: string;
}

interface HeaderProps {
  onLogout?: () => void;
  user?: UserData | null;
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
}

export function Header({ onLogout, user, isOffline, setIsOffline }: HeaderProps) {
  const [showBanner, setShowBanner] = useState(false);

  // 3. Listen to real browser network events
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowBanner(false);
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      setShowBanner(true);
      // Auto-hide the banner after 5 seconds to not obstruct the UI
      setTimeout(() => setShowBanner(false), 5000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setIsOffline]);

  const getRoleTitle = (role: string) => {
    const titles = {
      teacher: 'Teacher Portal',
      headteacher: 'Headteacher Portal',
      district: 'District Admin'
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

      <header className="fixed top-0 left-0 right-0 h-14 sm:h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="bg-blue-600 p-1.5 sm:p-2 rounded-lg text-white shadow-sm shrink-0">
            <BookOpen size={18} className="sm:w-5 sm:h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight truncate">
              BaseCamp Diagnostics
            </h1>
            <span className="text-[10px] font-medium text-emerald-600 uppercase tracking-wider hidden sm:block">
              Powered by HeckTeck AI
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Network: icon + dot on mobile; add label from sm */}
          <button
            onClick={() => {
              setIsOffline(!isOffline);
              if (!isOffline) setShowBanner(true);
            }}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 h-9 sm:h-8 rounded-full text-xs font-medium transition-colors border shrink-0 ${
              isOffline
                ? 'bg-gray-100 text-gray-600 border-gray-200'
                : 'bg-green-50 text-green-700 border-green-200'
            }`}
            title={isOffline ? 'Offline' : 'Online'}
            aria-label={isOffline ? 'Offline' : 'Online'}
          >
            {isOffline ? <WifiOff size={16} /> : <Wifi size={16} />}
            <span className="hidden sm:inline">{isOffline ? 'Offline' : 'Online'}</span>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isOffline ? 'bg-orange-400' : 'bg-green-500 animate-pulse'}`} />
          </button>

          {user && (
            <div className="hidden md:flex flex-col items-end text-right">
              <span className="text-xs font-medium text-gray-900 leading-tight">
                {getRoleTitle(user.role)}
              </span>
              <span className="text-[10px] text-gray-500 leading-tight">
                {user.location}
              </span>
            </div>
          )}

          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm border border-blue-200 shrink-0">
            {user ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="text-gray-500 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50 shrink-0"
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