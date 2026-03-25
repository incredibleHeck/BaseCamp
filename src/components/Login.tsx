import React, { useState } from 'react';
import { User, Building2, School, Loader2, Lock, KeyRound, BookOpen, GraduationCap, Building, HeartHandshake, ArrowLeft, MapPin } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, signInAnonymously, signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { seedDemoEnvironment } from '../utils/demoSeeder';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { AnimatePresence, motion } from 'motion/react';

type Role = 'teacher' | 'headteacher' | 'district' | 'sen_coordinator' | 'circuit_supervisor' | 'super_admin';

export function Login() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<Role | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  
  // Access Code Login State
  const [accessCode, setAccessCode] = useState('');
  const [isCodeLoggingIn, setIsCodeLoggingIn] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);

  const handleAccessCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = accessCode.trim().toLowerCase();
    if (!code) return;

    setIsCodeLoggingIn(true);
    setCodeError(null);

    try {
      // For headteachers, we also allow logging in by email if they typed that instead of username
      // (Though our seeder sets them to be the same)
      const q = query(collection(db, 'users'), where('username', '==', code));
      let querySnapshot = await getDocs(q);

      if (querySnapshot.empty && selectedRole === 'headteacher') {
        const qEmail = query(collection(db, 'users'), where('email', '==', code));
        querySnapshot = await getDocs(qEmail);
      }

      if (querySnapshot.empty) {
        setCodeError(
          selectedRole === 'headteacher' 
            ? 'Invalid email. Please check with your district administrator.' 
            : 'Invalid Access Code. Please check with your Headteacher.'
        );
        setIsCodeLoggingIn(false);
        return;
      }

      // We found the user document
      const userDoc = querySnapshot.docs[0];
      
      // Store the resolved user ID in local storage for App.tsx to pick up
      localStorage.setItem('accessCodeUserId', userDoc.id);
      
      // Sign in anonymously to establish a Firebase Auth session
      await signInAnonymously(auth);
      
    } catch (error) {
      console.error('Access code login failed:', error);
      setCodeError('An error occurred during login. Please try again.');
      setIsCodeLoggingIn(false);
    }
  };

  const handleDemoLogin = async (role: Role) => {
    setIsLoggingIn(role);
    const email = `${role}@basecamp.com`;
    const password = 'HeckTeck@2026!';
    
    try {
      localStorage.setItem('mockUserRole', role);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error(`Authentication failed for ${role}:`, error);
      setIsLoggingIn(null);
      alert('Login failed. Please check the console for details.');
    }
  };

  const handleTriggerSeeder = async () => {
    if (isSeeding) return;
    setIsSeeding(true);
    try {
      // Ensure we are fully signed out so that request.auth == null rules apply
      await signOut(auth);
      await seedDemoEnvironment();
      alert('Demo environment successfully seeded.');
    } catch (error) {
      console.error('Seeding failed:', error);
      alert('Seeding failed. See console.');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
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
          
          <AnimatePresence mode="wait">
            {!selectedRole ? (
              <motion.div
                key="role-selection"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-lg font-semibold text-zinc-800 mb-6 text-center">Select your portal</h2>
                <div className="grid grid-cols-2 gap-4">
                  <PortalSelectCard
                    icon={<BookOpen />}
                    title="Teacher"
                    onClick={() => setSelectedRole('teacher')}
                  />
                  <PortalSelectCard
                    icon={<GraduationCap />}
                    title="Headteacher"
                    onClick={() => setSelectedRole('headteacher')}
                  />
                  <PortalSelectCard
                    icon={<Building />}
                    title="District Director"
                    onClick={() => setSelectedRole('district')}
                  />
                  <PortalSelectCard
                    icon={<HeartHandshake />}
                    title="SEN Coordinator"
                    onClick={() => setSelectedRole('sen_coordinator')}
                  />
                </div>
                
                {/* Keep Super Admin and Circuit Supervisor accessible via a subtle link or smaller buttons if needed, but for now we'll add them below the grid as secondary options */}
                <div className="mt-6 pt-6 border-t border-zinc-100 flex justify-center gap-4">
                  <button 
                    onClick={() => setSelectedRole('circuit_supervisor')}
                    className="text-xs text-zinc-500 hover:text-zinc-800 transition-colors"
                  >
                    Circuit Supervisor
                  </button>
                  <span className="text-zinc-300">•</span>
                  <button 
                    onClick={() => setSelectedRole('super_admin')}
                    className="text-xs text-zinc-500 hover:text-zinc-800 transition-colors"
                  >
                    Super Admin
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="flex items-center mb-6">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setSelectedRole(null);
                      setCodeError(null);
                      setAccessCode('');
                    }}
                    className="text-zinc-500 hover:text-zinc-900 -ml-2"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to roles
                  </Button>
                </div>

                {selectedRole === 'teacher' || selectedRole === 'headteacher' ? (
                  <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 shadow-soft">
                    <h2 className="text-base font-semibold text-zinc-800 mb-4 flex items-center gap-2">
                      {selectedRole === 'teacher' ? (
                        <KeyRound className="w-5 h-5 text-indigo-600" />
                      ) : (
                        <GraduationCap className="w-5 h-5 text-indigo-600" />
                      )}
                      {selectedRole === 'teacher' ? 'Teacher Access' : 'Headteacher Access'}
                    </h2>
                    <p className="text-sm text-zinc-500 mb-6">
                      {selectedRole === 'teacher' 
                        ? 'Enter the access code provided by your Headteacher.' 
                        : 'Enter your school-assigned email address.'}
                    </p>
                    <form onSubmit={handleAccessCodeLogin} className="space-y-4">
                      <div>
                        <Input
                          type="text"
                          placeholder={selectedRole === 'teacher' ? "e.g. adjoa.mensah.sch123" : "e.g. headteacher@school1.com"}
                          value={accessCode}
                          onChange={(e) => setAccessCode(e.target.value)}
                          disabled={isCodeLoggingIn}
                          className="bg-white"
                          autoComplete="username"
                          autoFocus
                        />
                      </div>
                      {codeError && (
                        <p className="text-sm text-red-600 font-medium">{codeError}</p>
                      )}
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={!accessCode.trim() || isCodeLoggingIn}
                      >
                        {isCodeLoggingIn ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Logging in...
                          </>
                        ) : (
                          'Log In'
                        )}
                      </Button>
                    </form>
                  </div>
                ) : (
                  <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 shadow-soft text-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-zinc-100 text-indigo-600">
                      {selectedRole === 'district' && <Building className="w-6 h-6" />}
                      {selectedRole === 'sen_coordinator' && <HeartHandshake className="w-6 h-6" />}
                      {selectedRole === 'circuit_supervisor' && <MapPin className="w-6 h-6" />}
                      {selectedRole === 'super_admin' && <Lock className="w-6 h-6" />}
                    </div>
                    <h2 className="text-lg font-semibold text-zinc-900 mb-2 capitalize">
                      {selectedRole.replace('_', ' ')} Login
                    </h2>
                    <p className="text-sm text-zinc-500 mb-6">
                      Secure access for administrative personnel.
                    </p>
                    <Button 
                      onClick={() => handleDemoLogin(selectedRole)}
                      disabled={isLoggingIn !== null}
                      className="w-full"
                    >
                      {isLoggingIn === selectedRole ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Authenticating...
                        </>
                      ) : (
                        'Continue to Dashboard'
                      )}
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
          <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400 font-medium mb-1">
            <Lock size={12} /> Secure Demo Access
          </p>
          <p className="text-[10px] text-gray-400">
            Protected by end-to-end encryption • Ghana Data Protection Compliant
          </p>
          <div className="mt-4">
            <button
              onClick={handleTriggerSeeder}
              disabled={isSeeding}
              className="text-[10px] text-gray-300 hover:text-gray-500 uppercase tracking-widest transition-colors disabled:opacity-50"
            >
              {isSeeding ? 'Seeding...' : 'Seed Demo Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PortalSelectCard({ 
  icon, 
  title, 
  onClick 
}: { 
  icon: React.ReactNode, 
  title: string, 
  onClick: () => void 
}) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center justify-center p-6 bg-white border border-zinc-200/80 rounded-2xl shadow-sm hover:shadow-soft hover:border-indigo-500/50 transition-all duration-300 text-center"
    >
      <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors mb-3">
        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-6 h-6" })}
      </div>
      <span className="text-sm font-semibold text-zinc-900 group-hover:text-indigo-900 transition-colors">
        {title}
      </span>
    </button>
  );
}
