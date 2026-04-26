import React, { useEffect, useState } from 'react';
import { Loader2, Lock, KeyRound, BookOpen, GraduationCap, Building, HeartHandshake, ArrowLeft } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, signInAnonymously, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { normalizeAccessLookupKey } from '../utils/accessLookupKeys';
import { seedDemoEnvironment } from '../utils/demoSeeder';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { AnimatePresence, m } from 'motion/react';
import { isDemoHostedBuild } from '../config/demoMode';

type Role = 'teacher' | 'headteacher' | 'org_admin' | 'sen_coordinator' | 'super_admin';

/** Placeholder only — not a guaranteed password. Super admin must exist in Firebase Auth for this project. */
const ADMIN_PASSWORD_PLACEHOLDER = 'Your Firebase Auth password';

const demoSeedEnabled = isDemoHostedBuild;

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
  const [isSeeding, setIsSeeding] = useState(false);

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

  // Demo: access code (lookup) login. Pilot & non-demo: email + password (Firebase).
  const [accessCode, setAccessCode] = useState('');
  const [isCodeLoggingIn, setIsCodeLoggingIn] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);

  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);

  const [seedEmail, setSeedEmail] = useState('superadmin@basecamp.com');
  const [seedPassword, setSeedPassword] = useState('');

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

  const handleDemoAccessCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = accessCode.trim().toLowerCase();
    if (!code) return;

    setIsCodeLoggingIn(true);
    setCodeError(null);

    try {
      const lookupKey = normalizeAccessLookupKey(code);
      const lookupSnap = await getDoc(doc(db, 'accessLookups', lookupKey));

      if (!lookupSnap.exists()) {
        setCodeError(
          selectedRole === 'headteacher'
            ? 'No account found for that email. If you are on the demo site, run Seed Demo Data once (footer), then try headteacher@school1.com (or school2 / school3).'
            : 'Invalid access code. If you are on the demo site, run Seed Demo Data once (footer), then try teacher1@school1.com (Teacher tile — use the matching school number).'
        );
        return;
      }

      const profile = lookupSnap.data() as Record<string, unknown>;
      const role = typeof profile.role === 'string' ? profile.role : '';
      const profileUserId = typeof profile.profileUserId === 'string' ? profile.profileUserId : '';

      if (!profileUserId || (selectedRole === 'teacher' && role !== 'teacher') || (selectedRole === 'headteacher' && role !== 'headteacher')) {
        setCodeError(
          selectedRole === 'headteacher'
            ? 'That login is not a headteacher account. Use the Headteacher tile with headteacher@school1.com (after Seed Demo Data), or the Teacher tile for teacher emails.'
            : 'That login is not a teacher access code. Use the Teacher tile with e.g. teacher1@school1.com, or the Headteacher tile for headteacher@school1.com.'
        );
        return;
      }

      localStorage.setItem('accessCodeUserId', profileUserId);

      const cred = await signInAnonymously(auth);
      const authUid = cred.user.uid;

      const mirror: Record<string, unknown> = {
        role,
        name: typeof profile.name === 'string' ? profile.name : '',
        schoolId: typeof profile.schoolId === 'string' ? profile.schoolId : '',
        districtId: typeof profile.districtId === 'string' ? profile.districtId : '',
        organizationId:
          typeof profile.organizationId === 'string'
            ? profile.organizationId
            : typeof profile.districtId === 'string'
              ? profile.districtId
              : '',
        email: typeof profile.email === 'string' ? profile.email : '',
        username: typeof profile.username === 'string' ? profile.username : '',
        linkedProfileId: profileUserId,
      };
      if (role === 'teacher') {
        mirror.linkedTeacherId = profileUserId;
      }
      await setDoc(doc(db, 'users', authUid), mirror, { merge: true });
    } catch (error) {
      console.error('Access code login failed:', error);
      setCodeError('An error occurred during login. Please try again.');
    } finally {
      setIsCodeLoggingIn(false);
    }
  };

  const handleStaffEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const em = staffEmail.trim();
    const pw = staffPassword;
    if (!em || !pw) {
      setCodeError('Enter your email and password.');
      return;
    }
    setIsCodeLoggingIn(true);
    setCodeError(null);
    try {
      localStorage.removeItem('accessCodeUserId');
      await signInWithEmailAndPassword(auth, em, pw);
    } catch (error) {
      console.error('Staff email login failed:', error);
      setCodeError('Login failed. Check your email and password, or ask your school administrator if your account is ready.');
    } finally {
      setIsCodeLoggingIn(false);
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

  const handleTriggerSeeder = async () => {
    if (isSeeding) return;
    const email = seedEmail.trim();
    const password = seedPassword;
    if (!email || !password) {
      alert(`Enter the super admin email and password (e.g. ${seedEmail.trim() || 'superadmin@basecamp.com'} and your account password).`);
      return;
    }

    setIsSeeding(true);
    try {
      localStorage.removeItem('accessCodeUserId');
      await signInWithEmailAndPassword(auth, email, password);
      await seedDemoEnvironment();
      alert('Demo environment successfully seeded.');
    } catch (error) {
      console.error('Seeding failed:', error);
      alert(`Seeding failed.\n\n${authErrorMessage(error)}\n\nAllowed seed emails: superadmin@basecamp.com or super_admin@basecamp.com (must exist in Firebase Authentication for this project).`);
    } finally {
      try {
        await signOut(auth);
      } catch {
        /* ignore */
      }
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
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {isDemoHostedBuild ? 'BaseCamp Diagnostics' : 'BaseCamp'}
            </h1>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">by HecTech</p>
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
                      setCodeError(null);
                      setAccessCode('');
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
                  <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 shadow-soft">
                    <h2 className="text-base font-semibold text-zinc-800 mb-4 flex items-center gap-2">
                      {selectedRole === 'teacher' ? (
                        <KeyRound className="w-5 h-5 text-indigo-600" />
                      ) : (
                        <GraduationCap className="w-5 h-5 text-indigo-600" />
                      )}
                      {selectedRole === 'teacher' ? 'Teacher Access' : 'Headteacher Access'}
                    </h2>

                    {demoSeedEnabled && (selectedRole === 'teacher' || selectedRole === 'headteacher') ? (
                      <>
                        <p className="text-sm text-zinc-500 mb-2">
                          {selectedRole === 'teacher'
                            ? 'Enter the access code provided by your headteacher.'
                            : 'Enter your school-assigned email (as access code) for this demo.'}
                        </p>
                        <p className="text-xs text-amber-800/90 bg-amber-50 border border-amber-200/80 rounded-lg px-3 py-2 mb-6 leading-relaxed">
                          <span className="font-semibold text-amber-900">Hosted demo:</span> Run <strong>Seed Demo Data</strong> once
                          (footer). School&nbsp;1: teacher{' '}
                          <code className="text-[11px] bg-white/80 px-1 rounded border border-amber-200/60">teacher1@school1.com</code>
                          , headteacher{' '}
                          <code className="text-[11px] bg-white/80 px-1 rounded border border-amber-200/60">headteacher@school1.com</code>
                          .
                        </p>
                        <form onSubmit={handleDemoAccessCodeLogin} className="space-y-4">
                          <div>
                            <Input
                              type="text"
                              placeholder={
                                selectedRole === 'teacher' ? 'e.g. teacher1@school1.com' : 'e.g. headteacher@school1.com'
                              }
                              value={accessCode}
                              onChange={(e) => setAccessCode(e.target.value)}
                              disabled={isCodeLoggingIn}
                              className="bg-white"
                              autoComplete="username"
                              autoFocus
                            />
                          </div>
                          {codeError && <p className="text-sm text-red-600 font-medium">{codeError}</p>}
                          <Button type="submit" className="w-full" disabled={!accessCode.trim() || isCodeLoggingIn}>
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
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-zinc-500 mb-4">
                          {selectedRole === 'teacher'
                            ? 'Sign in with the work email and password your school gave you (Firebase account).'
                            : 'Sign in with the work email and password for your headteacher account.'}
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
                              disabled={isCodeLoggingIn}
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
                              disabled={isCodeLoggingIn}
                              className="bg-white"
                              placeholder={ADMIN_PASSWORD_PLACEHOLDER}
                            />
                          </div>
                          {codeError && <p className="text-sm text-red-600 font-medium">{codeError}</p>}
                          <Button
                            type="submit"
                            className="w-full"
                            disabled={!staffEmail.trim() || !staffPassword || isCodeLoggingIn}
                          >
                            {isCodeLoggingIn ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Logging in...
                              </>
                            ) : (
                              'Log in'
                            )}
                          </Button>
                        </form>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 shadow-soft text-left">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-zinc-100 text-indigo-600">
                      {selectedRole === 'org_admin' && <Building className="w-6 h-6" />}
                      {selectedRole === 'sen_coordinator' && <HeartHandshake className="w-6 h-6" />}
                      {selectedRole === 'super_admin' && <Lock className="w-6 h-6" />}
                    </div>
                    <h2 className="text-lg font-semibold text-zinc-900 mb-2 text-center capitalize">
                      {selectedRole.replace('_', ' ')} Login
                    </h2>
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
                      <Button type="submit" className="w-full mt-2" disabled={isLoggingIn !== null || !adminEmail.trim() || !adminPassword}>
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
          <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400 font-medium mb-1 text-center">
            <Lock size={12} /> Secure Demo Access · HecTech
          </p>
          <p className="text-[10px] text-gray-400 text-center">
            Protected by end-to-end encryption • Ghana Data Protection Compliant
          </p>
          {demoSeedEnabled && (
            <div className="mt-4 space-y-2 max-w-xs mx-auto">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider text-center">Seed demo data</p>
              <p className="text-[10px] text-amber-900/80 bg-amber-50/90 border border-amber-200/80 rounded-lg px-2 py-1.5 leading-snug">
                Uses email/password sign-in. The account must exist in Firebase Console → Authentication for{' '}
                <span className="font-mono">{import.meta.env.VITE_FIREBASE_PROJECT_ID || 'this project'}</span>{' '}
                (create user + password if missing).
              </p>
              <label htmlFor="seed-email" className="sr-only">
                Super admin email for seeding
              </label>
              <Input
                id="seed-email"
                type="email"
                autoComplete="username"
                value={seedEmail}
                onChange={(e) => setSeedEmail(e.target.value)}
                disabled={isSeeding}
                className="bg-white text-xs h-9"
                placeholder="superadmin@basecamp.com"
              />
              <label htmlFor="seed-password" className="sr-only">
                Super admin password for seeding
              </label>
              <Input
                id="seed-password"
                type="password"
                autoComplete="current-password"
                value={seedPassword}
                onChange={(e) => setSeedPassword(e.target.value)}
                disabled={isSeeding}
                className="bg-white text-xs h-9"
                placeholder={ADMIN_PASSWORD_PLACEHOLDER}
              />
              <button
                type="button"
                onClick={() => void handleTriggerSeeder()}
                disabled={isSeeding}
                className="w-full text-[10px] text-gray-500 hover:text-gray-700 uppercase tracking-widest transition-colors disabled:opacity-50 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50"
              >
                {isSeeding ? 'Seeding...' : 'Seed Demo Data'}
              </button>
            </div>
          )}
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
