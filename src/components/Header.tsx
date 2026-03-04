import React from 'react';
import { BookOpen, LogOut } from 'lucide-react';

interface HeaderProps {
  onLogout?: () => void;
  userRole?: 'teacher' | 'headteacher' | 'district' | null;
}

export function Header({ onLogout, userRole }: HeaderProps) {
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
  );
}
