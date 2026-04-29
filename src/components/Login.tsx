import React, { useEffect, useState } from 'react';
import { Loader2, Lock, KeyRound, BookOpen, GraduationCap, Building, HeartHandshake, ArrowLeft } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { AnimatePresence, m } from 'motion/react';
import { Link } from 'react-router-dom';
import { isDemoHostedBuild } from '../config/demoMode';

type Role = 'teacher' | 'headteacher' | 'org_admin' | 'sen_coordinator' | 'super_admin';

/** Placeholder only — not a guaranteed password. Super admin must exist in Firebase Auth for this project. */
const ADMIN_PASSWORD_PLACEHOLDER = 'Your Firebase Auth password';

/** Softer lavender primary for login submits only (does not change global Button defaults). */
const LOGIN_PRIMARY_BUTTON_CLASS =
  'bg-gradient-to-b from-violet-400 to-violet-500 text-white shadow-soft hover:from-violet-500 hover:to-violet-600 ' +
  'focus-visible:ring-violet-500 ring-offset-white border border-violet-500/50 ' +
  'dark:from-violet-500 dark:to-violet-600';

function staffPortalTitle(role: 'teacher' | 'headteacher'): string {
  return role === 'teacher' ? 'Teacher Access' : 'Headteacher Access';
}

function adminLoginTitle(role: Role): string {
  switch (role) {
    case 'org_admin':
      return 'Org Admin Login';
    case 'sen_coordinator':
      return 'SEN Coordinator Login';
    case 'super_admin':
      return 'Super Admin Login';
    default:
      return 'Login';
  }
}

function authErrorMessage(error: unknown): string {
  const code =
    error && typeof error === 'object' && 'code' in error
      ? String((error as { code: unknown }).code)
      : '';
  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/wrong-password' ||
    code === 'auth/user-not-found' ||
    code === 'auth/invalid-email'
  ) {
    return (
      'Wrong password or no email/password user in this Firebase project. ' +
      'In Firebase Console → Authentication → Users, create the user (e.g. superadmin@basecamp.com) or reset the password, ' +
      'then sign in with that same password here.'
    );
  }
  if (code === 'auth/too-many-requests') {
    return 'Too many attempts. Try again in a few minutes.';
  }
  return 'Login failed. Check email and password.';
}

function defaultEmailForAdminRole(role: Role): string {
  switch (role) {
    case 'org_admin':
      return 'orgadmin@basecamp.com';
    case 'sen_coordinator':
      return 'sen_coordinator@basecamp.com';
    case 'super_admin':
      return 'superadmin@basecamp.com';
    default:
      return '';
  }
}

export function Login() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<Role | null>(null);

  const [profileError, setProfileError] = useState<string | null>(() => {
    try {
      const m = localStorage.getItem('authProfileError');
      if (m) {
        localStorage.removeItem('authProfileError');
        return m;
      }
    } catch {
      /* ignore */
    }
    return null;
  });

  const [isStaffLoggingIn, setIsStaffLoggingIn] = useState(false);
  const [staffLoginError, setStaffLoginError] = useState<string | null>(null);

  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);

  useEffect(() => {
    if (
      selectedRole === 'org_admin' ||
      selectedRole === 'sen_coordinator' ||
      selectedRole === 'super_admin'
    ) {
      setAdminEmail(defaultEmailForAdminRole(selectedRole));
      setAdminPassword('');
      setAdminLoginError(null);
    }
  }, [selectedRole]);

  const handleStaffEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const em = staffEmail.trim();
    const pw = staffPassword;
    if (!em || !pw) {
      setStaffLoginError('Enter your email and password.');
      return;
    }
    setIsStaffLoggingIn(true);
    setStaffLoginError(null);
    try {
      localStorage.removeItem('accessCodeUserId');
      await signInWithEmailAndPassword(auth, em, pw);
    } catch (error) {
      console.error('Staff email login failed:', error);
      setStaffLoginError(
        'Login failed. Check your email and password, or ask your school administrator if your account is ready.'
      );
    } finally {
      setIsStaffLoggingIn(false);
    }
  };

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !selectedRole ||
      (selectedRole !== 'org_admin' &&
        selectedRole !== 'sen_coordinator' &&
        selectedRole !== 'super_admin')
    ) {
      return;
    }

    const email = adminEmail.trim();
    if (!email || !adminPassword) {
      setAdminLoginError('Enter email and password.');
      return;
    }

    setAdminLoginError(null);
    setIsLoggingIn(selectedRole);

    try {
      localStorage.removeItem('accessCodeUserId');
      await signInWithEmailAndPassword(auth, email, adminPassword);
    } catch (error) {
      console.error(`Authentication failed for ${selectedRole}:`, error);
      setIsLoggingIn(null);
      setAdminLoginError(authErrorMessage(error));
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
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {isDemoHostedBuild ? 'BaseCamp Diagnostics' : 'BaseCamp'}
            </h1>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">BY HECTECH</p>
          </div>

          {profileError && (
            <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{profileError}</p>
          )}

          <AnimatePresence mode="wait">
            {!selectedRole ? (
              <m.div
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
                    title="Organization admin"
                    onClick={() => setSelectedRole('org_admin')}
                  />
                  <PortalSelectCard
                    icon={<HeartHandshake />}
                    title="SEN Coordinator"
                    onClick={() => setSelectedRole('sen_coordinator')}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedRole('super_admin')}
                  className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl border border-zinc-200/90 bg-zinc-50/80 px-4 py-2.5 text-sm font-medium text-zinc-600 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-100/90 hover:text-zinc-900"
                >
                  <Lock className="w-4 h-4 shrink-0 opacity-70" aria-hidden />
                  Super Admin login
                </button>

              </m.div>
            ) : (
              <m.div
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
                      setStaffLoginError(null);
                      setStaffEmail('');
                      setStaffPassword('');
                      setAdminLoginError(null);
                    }}
                    className="text-zinc-500 hover:text-zinc-900 -ml-2"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to roles
                  </Button>
                </div>

                {selectedRole === 'teacher' || selectedRole === 'headteacher' ? (
                  <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 shadow-soft text-left">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-zinc-100 text-indigo-600">
                      {selectedRole === 'teacher' ? (
                        <KeyRound className="w-6 h-6" />
                      ) : (
                        <GraduationCap className="w-6 h-6" />
                      )}
                    </div>
                    <h2 className="text-lg font-semibold text-zinc-900 mb-2 text-center">
                      {staffPortalTitle(selectedRole)}
                    </h2>
                    <p className="text-sm text-zinc-500 mb-4 text-center">
                      Sign in with the email and password from Firebase Authentication.
                    </p>
                    <form onSubmit={(e) => void handleStaffEmailPasswordLogin(e)} className="space-y-3">
                      <div>
                        <label htmlFor="staff-login-email" className="text-xs font-medium text-zinc-600 block mb-1">
                          Email
                        </label>
                        <Input
                          id="staff-login-email"
                          type="email"
                          autoComplete="username"
                          value={staffEmail}
                          onChange={(e) => setStaffEmail(e.target.value)}
                          disabled={isStaffLoggingIn}
                          className="bg-white"
                          placeholder="you@yourschool.edu.gh"
                          autoFocus
                        />
                      </div>
                      <div>
                        <label htmlFor="staff-login-password" className="text-xs font-medium text-zinc-600 block mb-1">
                          Password
                        </label>
                        <Input
                          id="staff-login-password"
                          type="password"
                          autoComplete="current-password"
                          value={staffPassword}
                          onChange={(e) => setStaffPassword(e.target.value)}
                          disabled={isStaffLoggingIn}
                          className="bg-white"
                          placeholder={ADMIN_PASSWORD_PLACEHOLDER}
                        />
                      </div>
                      {staffLoginError && <p className="text-sm text-red-600 font-medium">{staffLoginError}</p>}
                      <Button
                        type="submit"
                        className={LOGIN_PRIMARY_BUTTON_CLASS + ' w-full mt-2'}
                        disabled={!staffEmail.trim() || !staffPassword || isStaffLoggingIn}
                      >
                        {isStaffLoggingIn ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Logging in...
                          </>
                        ) : (
                          'Log in'
                        )}
                      </Button>
                    </form>
                  </div>
                ) : (
                  <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 shadow-soft text-left">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-zinc-100 text-indigo-600">
                      {selectedRole === 'org_admin' && <Building className="w-6 h-6" />}
                      {selectedRole === 'sen_coordinator' && <HeartHandshake className="w-6 h-6" />}
                      {selectedRole === 'super_admin' && <Lock className="w-6 h-6" />}
                    </div>
                    <h2 className="text-lg font-semibold text-zinc-900 mb-2 text-center">{adminLoginTitle(selectedRole)}</h2>
                    <p className="text-sm text-zinc-500 mb-4 text-center">
                      Sign in with the email and password from Firebase Authentication.
                    </p>
                    <form onSubmit={handleEmailPasswordLogin} className="space-y-3">
                      <div>
                        <label htmlFor="admin-email" className="text-xs font-medium text-zinc-600 block mb-1">
                          Email
                        </label>
                        <Input
                          id="admin-email"
                          type="email"
                          autoComplete="username"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          disabled={isLoggingIn !== null}
                          className="bg-white"
                          placeholder={defaultEmailForAdminRole(selectedRole)}
                        />
                      </div>
                      <div>
                        <label htmlFor="admin-password" className="text-xs font-medium text-zinc-600 block mb-1">
                          Password
                        </label>
                        <Input
                          id="admin-password"
                          type="password"
                          autoComplete="current-password"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          disabled={isLoggingIn !== null}
                          className="bg-white"
                          placeholder={ADMIN_PASSWORD_PLACEHOLDER}
                        />
                      </div>
                      {adminLoginError && <p className="text-sm text-red-600 font-medium">{adminLoginError}</p>}
                      <Button
                        type="submit"
                        className={LOGIN_PRIMARY_BUTTON_CLASS + ' w-full mt-2'}
                        disabled={isLoggingIn !== null || !adminEmail.trim() || !adminPassword}
                      >
                        {isLoggingIn === selectedRole ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Authenticating...
                          </>
                        ) : (
                          'Log in'
                        )}
                      </Button>
                    </form>
                  </div>
                )}
              </m.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
          <p className="text-center text-xs text-zinc-500 mb-3">
            Are you a school network administrator?{' '}
            <Link
              to="/register-network"
              className="font-medium text-indigo-600 hover:text-indigo-700 underline-offset-2 hover:underline"
            >
              Register your organization here
            </Link>
          </p>
          <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400 font-medium mb-1 text-center">
            <Lock size={12} /> Secure Demo Access · HecTech
          </p>
          <p className="text-[10px] text-gray-400 text-center">
            Protected by end-to-end encryption • Ghana Data Protection Compliant
          </p>
        </div>
      </div>
    </div>
  );
}

function PortalSelectCard({
  icon,
  title,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center justify-center p-6 bg-white border border-zinc-200/80 rounded-2xl shadow-sm hover:shadow-soft hover:border-indigo-500/50 transition-all duration-300 text-center"
    >
      <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors mb-3">
        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'w-6 h-6' })}
      </div>
      <span className="text-sm font-semibold text-zinc-900 group-hover:text-indigo-900 transition-colors">{title}</span>
    </button>
  );
}
