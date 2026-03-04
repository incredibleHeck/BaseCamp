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
}

export function Header({ onLogout, user }: HeaderProps) {
  // 2. State driven by the actual browser environment
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
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
  }, []);

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
      {/* Offline Banner Toast */}
      {showBanner && isOffline && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-sm font-medium py-3 px-6 rounded-full shadow-lg z-[60] flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
           <WifiOff size={16} className="text-orange-400" />
           <span>Working offline. BaseCamp will sync your assessments when the connection is restored.</span>
        </div>
      )}

      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white shadow-sm">
            <BookOpen size={20} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-gray-900 leading-tight">
              BaseCamp Diagnostics
            </h1>
            <span className="text-[10px] font-medium text-emerald-600 uppercase tracking-wider">
              Powered by HeckTeck AI
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Network Indicator (Now real, but keeping click-to-simulate for testing purposes) */}
          <button 
            onClick={() => {
              setIsOffline(!isOffline);
              if (!isOffline) setShowBanner(true);
            }}
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
              isOffline 
                ? 'bg-gray-100 text-gray-600 border-gray-200' 
                : 'bg-green-50 text-green-700 border-green-200'
            }`}
            title="Current Network Status (Click to simulate)"
          >
            {isOffline ? <WifiOff size={14} /> : <Wifi size={14} />}
            {isOffline ? 'Offline Mode' : 'Online & Synced'}
            <span className={`w-2 h-2 rounded-full ${isOffline ? 'bg-orange-400' : 'bg-green-500 animate-pulse'}`} />
          </button>

          {user && (
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-xs font-semibold text-gray-900">
                {getRoleTitle(user.role)}
              </span>
              <span className="text-[10px] text-gray-500">
                {user.location}
              </span>
            </div>
          )}
          
          <button className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-200 hover:bg-blue-200 transition-colors">
            {user ? user.name.charAt(0).toUpperCase() : 'U'}
          </button>
          
          {onLogout && (
            <button 
              onClick={onLogout}
              className="text-gray-500 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
              aria-label="Log Out"
              title="Log Out"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </header>
    </>
  );
}