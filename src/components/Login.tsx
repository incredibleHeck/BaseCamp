import React, { useState } from 'react';
import { User, Building2, School, Loader2, Lock } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

type Role = 'teacher' | 'headteacher' | 'district';

export function Login() {
  const [isLoggingIn, setIsLoggingIn] = useState<Role | null>(null);

  const handleDemoLogin = async (role: Role) => {
    setIsLoggingIn(role);
    const email = `${role}@basecamp.com`;
    const password = 'HeckTeck@2026!';
    
    try {
      // Mock role assignment by storing it in localStorage before signing in
      localStorage.setItem('mockUserRole', role);
      await signInWithEmailAndPassword(auth, email, password);
      // App.tsx's onAuthStateChanged listener handles the rest
    } catch (error) {
      console.error(`Authentication failed for ${role}:`, error);
      setIsLoggingIn(null);
      alert('Login failed. Please check the console for details.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Decorative background elements for a polished look */}
      <div className="absolute top-0 left-0 w-full h-96 bg-amber-500 transform -skew-y-6 -translate-y-32 z-0"></div>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden z-10">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-amber-500 rounded-xl flex items-center justify-center mb-6 shadow-lg transform -rotate-3 transition-transform hover:rotate-0">
              <span className="text-black font-bold text-2xl tracking-tighter">HT</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">BaseCamp Diagnostics</h1>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">by HeckTeck</p>
          </div>
          
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 text-center">Select your access level</h2>
            <div className="space-y-3">
              <RoleCard 
                role="teacher" 
                icon={<User />} 
                title="Teacher Portal" 
                desc="Manage classroom & assessments" 
                onClick={() => handleDemoLogin('teacher')}
                isLoading={isLoggingIn === 'teacher'}
                disabled={isLoggingIn !== null}
              />
              <RoleCard 
                role="headteacher" 
                icon={<School />} 
                title="Headteacher Portal" 
                desc="Monitor school performance" 
                onClick={() => handleDemoLogin('headteacher')}
                isLoading={isLoggingIn === 'headteacher'}
                disabled={isLoggingIn !== null}
              />
              <RoleCard 
                role="district" 
                icon={<Building2 />} 
                title="District Director Portal" 
                desc="View regional analytics" 
                onClick={() => handleDemoLogin('district')}
                isLoading={isLoggingIn === 'district'}
                disabled={isLoggingIn !== null}
              />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
          <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400 font-medium mb-1">
            <Lock size={12} /> Secure Demo Access
          </p>
          <p className="text-[10px] text-gray-400">
            Protected by end-to-end encryption • Ghana Data Protection Compliant
          </p>
        </div>
      </div>
    </div>
  );
}

// Sub-component for clean mapping
function RoleCard({ 
  role, 
  icon, 
  title, 
  desc, 
  onClick, 
  isLoading,
  disabled
}: { 
  role: string, 
  icon: React.ReactNode, 
  title: string, 
  desc: string, 
  onClick: () => void,
  isLoading: boolean,
  disabled: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full group relative flex items-center p-4 border rounded-xl transition-all duration-200 text-left bg-white ${
        disabled 
          ? 'opacity-60 cursor-not-allowed border-gray-200' 
          : 'border-gray-200 hover:border-blue-500 hover:shadow-md'
      }`}
    >
      <div className={`p-3 rounded-lg transition-colors ${
        isLoading 
          ? 'bg-blue-100 text-blue-600' 
          : disabled 
            ? 'bg-gray-100 text-gray-400' 
            : 'bg-gray-50 text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600'
      }`}>
        {isLoading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6" })
        )}
      </div>
      <div className="ml-4 flex-grow">
        <p className={`text-base font-bold ${disabled && !isLoading ? 'text-gray-500' : 'text-gray-900'}`}>
          {title}
        </p>
        <p className={`text-xs ${disabled && !isLoading ? 'text-gray-400' : 'text-gray-500'}`}>
          {isLoading ? 'Authenticating...' : desc}
        </p>
      </div>
    </button>
  );
}
