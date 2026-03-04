import React from 'react';
import { User, Building2, School } from 'lucide-react';

interface LoginProps {
  onLogin: (role: 'teacher' | 'headteacher' | 'district') => void;
}

export function Login({ onLogin }: LoginProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg transform -rotate-3">
            <span className="text-white font-bold text-2xl tracking-tighter">HT</span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">BaseCamp Diagnostics</h1>
          <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-8">by HeckTeck</p>
          
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Secure Portal Access</h2>
          
          <div className="space-y-4">
            <button
              onClick={() => onLogin('teacher')}
              className="w-full group relative flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left"
            >
              <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-base font-bold text-gray-900">Log in as Teacher</p>
                <p className="text-xs text-gray-500">Access classroom tools & assessments</p>
              </div>
            </button>

            <button
              onClick={() => onLogin('headteacher')}
              className="w-full group relative flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 text-left"
            >
              <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition-colors">
                <School className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-base font-bold text-gray-900">Log in as Headteacher</p>
                <p className="text-xs text-gray-500">Monitor school-wide performance</p>
              </div>
            </button>

            <button
              onClick={() => onLogin('district')}
              className="w-full group relative flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-200 text-left"
            >
              <div className="bg-emerald-100 p-3 rounded-lg group-hover:bg-emerald-200 transition-colors">
                <Building2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-base font-bold text-gray-900">Log in as District Director</p>
                <p className="text-xs text-gray-500">View analytics & school performance</p>
              </div>
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            Protected by end-to-end encryption
          </p>
        </div>
      </div>
      
      <p className="mt-8 text-xs text-gray-400 font-medium">
        Compliant with Ghana Data Protection Standards
      </p>
    </div>
  );
}
