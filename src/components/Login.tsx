import React, { useState } from 'react';
import { User, Building2, School, Loader2, ArrowLeft, Lock } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signInAnonymously } from 'firebase/auth';

type Role = 'teacher' | 'headteacher' | 'district' | null;

interface LoginProps {
  onLogin: (role: 'teacher' | 'headteacher' | 'district') => void;
}

export function Login({ onLogin }: LoginProps) {
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSimulatedLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    
    setIsLoading(true);
    try {
      // Mock role assignment by storing it in localStorage before signing in
      localStorage.setItem('mockUserRole', selectedRole);
      await signInAnonymously(auth);
      onLogin(selectedRole);
    } catch (error) {
      console.error("Authentication failed:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Decorative background elements for a polished look */}
      <div className="absolute top-0 left-0 w-full h-96 bg-blue-600 transform -skew-y-6 -translate-y-32 z-0"></div>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden z-10">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg transform -rotate-3 transition-transform hover:rotate-0">
              <span className="text-white font-bold text-2xl tracking-tighter">HT</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">BaseCamp Diagnostics</h1>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">by HeckTeck</p>
          </div>
          
          {!selectedRole ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h2 className="text-lg font-semibold text-gray-800 mb-6 text-center">Select your access level</h2>
              <div className="space-y-3">
                <RoleCard role="teacher" icon={<User />} title="Teacher Portal" desc="Manage classroom & assessments" onClick={() => setSelectedRole('teacher')} />
                <RoleCard role="headteacher" icon={<School />} title="Headteacher Portal" desc="Monitor school performance" onClick={() => setSelectedRole('headteacher')} />
                <RoleCard role="district" icon={<Building2 />} title="District Director Portal" desc="View regional analytics" onClick={() => setSelectedRole('district')} />
              </div>
            </div>
          ) : (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <button 
                onClick={() => setSelectedRole(null)}
                className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1 mb-6 transition-colors"
              >
                <ArrowLeft size={16} /> Back to roles
              </button>
              
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Sign in as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
              </h2>

              <form onSubmit={handleSimulatedLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email or ID</label>
                  <input 
                    type="text" 
                    required
                    defaultValue={`demo@${selectedRole}.heckteck.edu`}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input 
                    type="password" 
                    required
                    defaultValue="password123"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all shadow-md flex justify-center items-center gap-2 mt-6 disabled:bg-blue-400"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                  {isLoading ? 'Authenticating...' : 'Access Portal'}
                </button>
              </form>
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 font-medium">
            Protected by end-to-end encryption • Ghana Data Protection Compliant
          </p>
        </div>
      </div>
    </div>
  );
}

// Sub-component for clean mapping
function RoleCard({ role, icon, title, desc, onClick }: { role: string, icon: React.ReactNode, title: string, desc: string, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full group relative flex items-center p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all duration-200 text-left bg-white"
    >
      <div className="bg-gray-50 p-3 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 text-gray-600 transition-colors">
        {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6" })}
      </div>
      <div className="ml-4">
        <p className="text-base font-bold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
    </button>
  );
}