import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { Loader2, GraduationCap, ArrowLeft } from 'lucide-react';
import { auth, db } from '../../lib/firebase';
import { DEFAULT_DISTRICT_ID } from '../../config/organizationDefaults';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../../utils/ui-helpers';

const selectClassName = cn(
  'flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
  'disabled:cursor-not-allowed disabled:opacity-50',
  'dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:focus-visible:ring-indigo-400'
);

export function HeadteacherSignUp() {
  const [adminName, setAdminName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [schoolType, setSchoolType] = useState<'public' | 'private'>('public');
  const [curriculum, setCurriculum] = useState<'cambridge' | 'ges'>('ges');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const goBackToLogin = () => {
    window.location.hash = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const name = adminName.trim();
    const em = email.trim();
    const pw = password;
    const school = schoolName.trim();

    if (!name || !em || !pw || !school) {
      setError('Please fill in all fields.');
      return;
    }
    if (pw.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, em, pw);
      const uid = cred.user.uid;

      const schoolRef = doc(collection(db, 'schools'));
      const userRef = doc(db, 'users', uid);
      const now = Date.now();

      const batch = writeBatch(db);
      batch.set(schoolRef, {
        districtId: DEFAULT_DISTRICT_ID,
        name: school,
        schoolType,
        curriculumType: curriculum,
        updatedAt: now,
      });
      batch.set(userRef, {
        name,
        email: em,
        role: 'headteacher',
        schoolId: schoolRef.id,
        districtId: DEFAULT_DISTRICT_ID,
        location: 'School Campus',
      });

      await batch.commit();

      window.location.hash = '';
    } catch (err: unknown) {
      const code = err && typeof err === 'object' && 'code' in err ? String((err as { code: string }).code) : '';
      if (code === 'auth/email-already-in-use') {
        setError('That email is already registered. Sign in instead.');
      } else if (code === 'auth/weak-password') {
        setError('Password is too weak. Use at least 6 characters.');
      } else {
        setError('Could not complete registration. Try again or contact support.');
      }
      console.error('HeadteacherSignUp', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        <button
          type="button"
          onClick={goBackToLogin}
          className="mb-4 flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </button>

        <Card className="border-zinc-200 shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <GraduationCap className="w-6 h-6" />
              <span className="text-xs font-semibold uppercase tracking-wide">Headteacher</span>
            </div>
            <CardTitle className="text-xl text-zinc-900">Create your school</CardTitle>
            <CardDescription>
              Register as a headteacher and set up your school profile. You will use this email and password to sign in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
              <div>
                <label htmlFor="ht-name" className="text-xs font-medium text-zinc-600 block mb-1">
                  Admin name
                </label>
                <Input
                  id="ht-name"
                  autoComplete="name"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  disabled={submitting}
                  placeholder="Your full name"
                  className="bg-white"
                />
              </div>
              <div>
                <label htmlFor="ht-email" className="text-xs font-medium text-zinc-600 block mb-1">
                  Admin email
                </label>
                <Input
                  id="ht-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  placeholder="you@school.edu.gh"
                  className="bg-white"
                />
              </div>
              <div>
                <label htmlFor="ht-password" className="text-xs font-medium text-zinc-600 block mb-1">
                  Password
                </label>
                <Input
                  id="ht-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  placeholder="At least 6 characters"
                  className="bg-white"
                />
              </div>
              <div>
                <label htmlFor="ht-school" className="text-xs font-medium text-zinc-600 block mb-1">
                  School name
                </label>
                <Input
                  id="ht-school"
                  autoComplete="organization"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  disabled={submitting}
                  placeholder="Official school name"
                  className="bg-white"
                />
              </div>
              <div>
                <label htmlFor="ht-school-type" className="text-xs font-medium text-zinc-600 block mb-1">
                  School type
                </label>
                <select
                  id="ht-school-type"
                  value={schoolType}
                  onChange={(e) => setSchoolType(e.target.value as 'public' | 'private')}
                  disabled={submitting}
                  className={selectClassName}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div>
                <label htmlFor="ht-curriculum" className="text-xs font-medium text-zinc-600 block mb-1">
                  Curriculum
                </label>
                <select
                  id="ht-curriculum"
                  value={curriculum}
                  onChange={(e) => setCurriculum(e.target.value as 'cambridge' | 'ges')}
                  disabled={submitting}
                  className={selectClassName}
                >
                  <option value="cambridge">Cambridge</option>
                  <option value="ges">GES</option>
                </select>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account…
                  </>
                ) : (
                  'Register & continue'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
