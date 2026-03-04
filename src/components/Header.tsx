import React, { useState } from 'react';
import { BookOpen, LogOut, Wifi, WifiOff } from 'lucide-react';

interface HeaderProps {
  onLogout?: () => void;
  userRole?: 'teacher' | 'headteacher' | 'district' | null;
}

export function Header({ onLogout, userRole }: HeaderProps) {
  const [isOffline, setIsOffline] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  const toggleOffline = () => {
    const newState = !isOffline;
    setIsOffline(newState);
    if (newState) {
      setShowBanner(true);
      // Auto-hide after 5 seconds
      setTimeout(() => setShowBanner(false), 5000);
    } else {
      setShowBanner(false);
    }
  };

  const getRoleDisplay = () => {
    switch (userRole) {
      case 'teacher': return 'Teacher Portal';
      case 'headteacher': return 'Headteacher Portal';
      case 'district': return 'District Admin';
      default: return '';
    }
  };

  const getLocationDisplay = () => {
    switch (userRole) {
      case 'teacher': return 'Kwame Nkrumah Memorial';
      case 'headteacher': return 'Mando Basic School';
      case 'district': return 'Accra Metro District';
      default: return '';
    }
  };

  const getInitial = () => {
    switch (userRole) {
      case 'teacher': return 'T';
      case 'headteacher': return 'H';
      case 'district': return 'D';
      default: return 'U';
    }
  };

  return (
    <>
      {/* Offline Banner Toast */}
      {showBanner && isOffline && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-sm font-medium py-3 px-6 rounded-full shadow-lg z-[60] flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
           <WifiOff size={16} className="text-orange-400" />
           <span>Working offline. BaseCamp will automatically sync your assessments when the connection is restored.</span>
        </div>
      )}

      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
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
          {/* Offline Toggle */}
          <button 
            onClick={toggleOffline}
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
              isOffline 
                ? 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200' 
                : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
            }`}
            title="Toggle Offline Mode Simulation"
          >
            {isOffline ? <WifiOff size={14} /> : <Wifi size={14} />}
            {isOffline ? 'Offline Mode' : 'Online & Synced'}
            <span className={`w-2 h-2 rounded-full ${isOffline ? 'bg-orange-400' : 'bg-green-500'}`} />
          </button>

          {userRole && (
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-xs font-semibold text-gray-900">
                {getRoleDisplay()}
              </span>
              <span className="text-[10px] text-gray-500">
                {getLocationDisplay()}
              </span>
            </div>
          )}
          <button className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm border border-blue-200 hover:bg-blue-200 transition-colors">
            {getInitial()}
          </button>
          {onLogout && (
            <button 
              onClick={onLogout}
              className="text-gray-500 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
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
