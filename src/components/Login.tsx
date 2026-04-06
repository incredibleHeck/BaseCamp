import React, { useEffect, useState } from 'react';
import { Loader2, Lock, KeyRound, BookOpen, GraduationCap, Building, HeartHandshake, ArrowLeft, MapPin } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, signInAnonymously, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { normalizeAccessLookupKey } from '../utils/accessLookupKeys';
import { seedDemoEnvironment } from '../utils/demoSeeder';
import { buildManagedStaffEmail } from '../utils/managedCredentials';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { AnimatePresence, motion } from 'motion/react';

type Role = 'teacher' | 'headteacher' | 'district' | 'sen_coordinator' | 'circuit_supervisor' | 'super_admin';

const DEMO_PASSWORD_PLACEHOLDER = 'HecTech@2026!';

const demoSeedEnabled = import.meta.env.VITE_ENABLE_DEMO_SEED === 'true';

function defaultEmailForAdminRole(role: Role): string {
  switch (role) {
    case 'district':
      return 'district@basecamp.com';
    case 'sen_coordinator':
      return 'sen_coordinator@basecamp.com';
    case 'circuit_supervisor':
      return 'circuit_supervisor@basecamp.com';
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

  // Demo: access code (lookup) login. Pilot: school + username + PIN (managed pseudo-email).
  const [accessCode, setAccessCode] = useState('');
  const [schoolIdField, setSchoolIdField] = useState('');
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPin, setStaffPin] = useState('');
  const [isCodeLoggingIn, setIsCodeLoggingIn] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);

  /** Pilot headteacher: PIN (managed account) vs email/password (registered headteacher). */
  const [headteacherLoginMode, setHeadteacherLoginMode] = useState<'pin' | 'admin'>('pin');
  const [headteacherAdminEmail, setHeadteacherAdminEmail] = useState('');
  const [headteacherAdminPassword, setHeadteacherAdminPassword] = useState('');

  const [seedEmail, setSeedEmail] = useState('superadmin@basecamp.com');
  const [seedPassword, setSeedPassword] = useState('');

  useEffect(() => {
    if (
      selectedRole === 'district' ||
      selectedRole === 'sen_coordinator' ||
      selectedRole === 'circuit_supervisor' ||
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

  const handleHeadteacherAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const em = headteacherAdminEmail.trim();
    const pw = headteacherAdminPassword;
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
      console.error('Headteacher admin login failed:', error);
      setCodeError('Login failed. Check your email and password.');
    } finally {
      setIsCodeLoggingIn(false);
    }
  };

  const handlePilotStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const sid = schoolIdField.trim();
    const uname = staffUsername.trim();
    const pin = staffPin;
    if (!sid || !uname || !pin) {
      setCodeError('Enter school ID, username, and PIN.');
      return;
    }

    setIsCodeLoggingIn(true);
    setCodeError(null);

    try {
      const email = buildManagedStaffEmail(uname, sid);
      await signInWithEmailAndPassword(auth, email, pin);
    } catch (error) {
      console.error('Staff login failed:', error);
      setCodeError('Login failed. Check school ID, username, and PIN, or contact your headteacher.');
    } finally {
      setIsCodeLoggingIn(false);
    }
  };

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !selectedRole ||
      (selectedRole !== 'district' &&
        selectedRole !== 'sen_coordinator' &&
        selectedRole !== 'circuit_supervisor' &&
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
      setAdminLoginError('Login failed. Check email and password, or create the user in Firebase Authentication.');
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
      const msg = error instanceof Error ? error.message : String(error);
      alert(
        `Seeding failed: ${msg}\n\n` +
          'Use a Firebase Auth user with a super admin role and Firestore rules deployed. Email must be superadmin@basecamp.com or super_admin@basecamp.com for demo seed privileges.'
      );
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
            <h1 className="text-2xl font-bold text-gray-900 mb-1">BaseCamp Diagnostics</h1>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">by HecTech</p>
          </div>

          {profileError && (
            <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{profileError}</p>
          )}

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

                <button
                  type="button"
                  onClick={() => setSelectedRole('super_admin')}
                  className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl border border-zinc-200/90 bg-zinc-50/80 px-4 py-2.5 text-sm font-medium text-zinc-600 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-100/90 hover:text-zinc-900"
                >
                  <Lock className="w-4 h-4 shrink-0 opacity-70" aria-hidden />
                  Super Admin login
                </button>

                {!demoSeedEnabled && (
                  <div className="mt-3 rounded-xl border border-indigo-200/70 bg-indigo-50/60 px-4 py-3 text-center shadow-sm">
                    <p className="text-sm text-zinc-800">
                      Are you a School Administrator?{' '}
                      <a
                        href="#/headteacher-signup"
                        className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                      >
                        Register your school here
                      </a>
                    </p>
                    <p className="text-xs text-zinc-500 mt-1.5">
                      For headteachers setting up a new school — not for classroom teachers.
                    </p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-zinc-100 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('circuit_supervisor')}
                    className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
                  >
                    Circuit Supervisor
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
                      setSchoolIdField('');
                      setStaffUsername('');
                      setStaffPin('');
                      setAdminLoginError(null);
                      setHeadteacherLoginMode('pin');
                      setHeadteacherAdminEmail('');
                      setHeadteacherAdminPassword('');
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

                    {demoSeedEnabled ? (
                      <>
                        <p className="text-sm text-zinc-500 mb-2">
                          {selectedRole === 'teacher'
                            ? 'Enter the access code provided by your Headteacher.'
                            : 'Enter your school-assigned email address.'}
                        </p>
                        <p className="text-xs text-amber-800/90 bg-amber-50 border border-amber-200/80 rounded-lg px-3 py-2 mb-6 leading-relaxed">
                          <span className="font-semibold text-amber-900">Hosted demo:</span> Logins below only work after a one-time{' '}
                          <strong>Seed Demo Data</strong> (footer). Then use School&nbsp;1:{' '}
                          <code className="text-[11px] bg-white/80 px-1 rounded border border-amber-200/60">teacher1@school1.com</code>{' '}
                          (Teacher tile) or{' '}
                          <code className="text-[11px] bg-white/80 px-1 rounded border border-amber-200/60">headteacher@school1.com</code>{' '}
                          (Headteacher tile). Same pattern for school&nbsp;2 and&nbsp;3.
                        </p>
                        <form onSubmit={handleDemoAccessCodeLogin} className="space-y-4">
                          <div>
                            <Input
                              type="text"
                              placeholder={selectedRole === 'teacher' ? 'e.g. teacher1@school1.com' : 'e.g. headteacher@school1.com'}
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
                        {selectedRole === 'headteacher' ? (
                          <div className="mb-4 flex rounded-lg border border-zinc-200 bg-white p-0.5 shadow-sm">
                            <button
                              type="button"
                              onClick={() => {
                                setHeadteacherLoginMode('pin');
                                setCodeError(null);
                              }}
                              className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                                headteacherLoginMode === 'pin'
                                  ? 'bg-indigo-600 text-white shadow-sm'
                                  : 'text-zinc-600 hover:text-zinc-900'
                              }`}
                            >
                              PIN login
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setHeadteacherLoginMode('admin');
                                setCodeError(null);
                              }}
                              className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                                headteacherLoginMode === 'admin'
                                  ? 'bg-indigo-600 text-white shadow-sm'
                                  : 'text-zinc-600 hover:text-zinc-900'
                              }`}
                            >
                              Admin login
                            </button>
                          </div>
                        ) : null}

                        {selectedRole === 'headteacher' && headteacherLoginMode === 'admin' ? (
                          <>
                            <p className="text-sm text-zinc-500 mb-4">
                              Sign in with the email and password you used when you registered your school.
                            </p>
                            <form onSubmit={(e) => void handleHeadteacherAdminLogin(e)} className="space-y-3">
                              <div>
                                <label htmlFor="ht-admin-email" className="text-xs font-medium text-zinc-600 block mb-1">
                                  Email
                                </label>
                                <Input
                                  id="ht-admin-email"
                                  type="email"
                                  autoComplete="username"
                                  value={headteacherAdminEmail}
                                  onChange={(e) => setHeadteacherAdminEmail(e.target.value)}
                                  disabled={isCodeLoggingIn}
                                  className="bg-white"
                                  placeholder="you@example.com"
                                  autoFocus
                                />
                              </div>
                              <div>
                                <label htmlFor="ht-admin-password" className="text-xs font-medium text-zinc-600 block mb-1">
                                  Password
                                </label>
                                <Input
                                  id="ht-admin-password"
                                  type="password"
                                  autoComplete="current-password"
                                  value={headteacherAdminPassword}
                                  onChange={(e) => setHeadteacherAdminPassword(e.target.value)}
                                  disabled={isCodeLoggingIn}
                                  className="bg-white"
                                  placeholder={DEMO_PASSWORD_PLACEHOLDER}
                                />
                              </div>
                              {codeError && <p className="text-sm text-red-600 font-medium">{codeError}</p>}
                              <Button
                                type="submit"
                                className="w-full"
                                disabled={
                                  !headteacherAdminEmail.trim() || !headteacherAdminPassword || isCodeLoggingIn
                                }
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
                        ) : (
                          <>
                            <p className="text-sm text-zinc-500 mb-4">
                              {selectedRole === 'teacher'
                                ? 'Enter your school ID, username, and PIN from your headteacher. This signs you in securely (managed account).'
                                : 'Enter your school ID, username, and PIN (managed account), or use Admin login if you registered with email and password.'}
                            </p>
                            <form onSubmit={handlePilotStaffLogin} className="space-y-3">
                              <div>
                                <label htmlFor="school-id" className="text-xs font-medium text-zinc-600 block mb-1">
                                  School ID
                                </label>
                                <Input
                                  id="school-id"
                                  type="text"
                                  placeholder="e.g. school1"
                                  value={schoolIdField}
                                  onChange={(e) => setSchoolIdField(e.target.value)}
                                  disabled={isCodeLoggingIn}
                                  className="bg-white"
                                  autoComplete="off"
                                  autoFocus
                                />
                              </div>
                              <div>
                                <label htmlFor="staff-username" className="text-xs font-medium text-zinc-600 block mb-1">
                                  Username
                                </label>
                                <Input
                                  id="staff-username"
                                  type="text"
                                  placeholder="Your assigned username"
                                  value={staffUsername}
                                  onChange={(e) => setStaffUsername(e.target.value)}
                                  disabled={isCodeLoggingIn}
                                  className="bg-white"
                                  autoComplete="username"
                                />
                              </div>
                              <div>
                                <label htmlFor="staff-pin" className="text-xs font-medium text-zinc-600 block mb-1">
                                  PIN / password
                                </label>
                                <Input
                                  id="staff-pin"
                                  type="password"
                                  autoComplete="current-password"
                                  placeholder="PIN or password"
                                  value={staffPin}
                                  onChange={(e) => setStaffPin(e.target.value)}
                                  disabled={isCodeLoggingIn}
                                  className="bg-white"
                                />
                              </div>
                              {codeError && <p className="text-sm text-red-600 font-medium">{codeError}</p>}
                              <Button
                                type="submit"
                                className="w-full"
                                disabled={!schoolIdField.trim() || !staffUsername.trim() || !staffPin || isCodeLoggingIn}
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
                          </>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 shadow-soft text-left">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-zinc-100 text-indigo-600">
                      {selectedRole === 'district' && <Building className="w-6 h-6" />}
                      {selectedRole === 'sen_coordinator' && <HeartHandshake className="w-6 h-6" />}
                      {selectedRole === 'circuit_supervisor' && <MapPin className="w-6 h-6" />}
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
                          placeholder={DEMO_PASSWORD_PLACEHOLDER}
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
              </motion.div>
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
                placeholder="Password"
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
