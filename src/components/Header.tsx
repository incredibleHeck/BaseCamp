import React from 'react';
import { BookOpen } from 'lucide-react';

export function Header() {
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
        <button className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm border border-blue-200 hover:bg-blue-200 transition-colors">
          T
        </button>
      </div>
    </header>
  );
}
