import React, { useState } from 'react';
import { createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { ArrowLeft, Building2, Loader2, Plus, Trash2 } from 'lucide-react';

import { auth, functions } from '../../lib/firebase';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';

const MAX_BRANCHES = 50;

type CurriculumType = 'cambridge' | 'ges' | 'both';

type BranchRow = { id: string; name: string; curriculumType: CurriculumType };

type WizardStatus =
  | 'idle'
  | 'creating_account'
  | 'provisioning'
  | 'refreshing_token'
  | 'redirecting';

const registerOrganizationCallable = httpsCallable<
  { organizationName: string; branches: Array<{ name: string; curriculumType: string }> },
  { ok: boolean; organizationId: string }
>(functions, 'registerOrganization');

function newBranchRow(): BranchRow {
  return {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `b-${Date.now()}-${Math.random()}`,
    name: '',
    curriculumType: 'cambridge',
  };
}

function statusMessage(status: WizardStatus): string | null {
  switch (status) {
    case 'creating_account':
      return 'Creating your account…';
    case 'provisioning':
      return 'Provisioning your workspace…';
    case 'refreshing_token':
      return 'Refreshing your session…';
    case 'redirecting':
      return 'Redirecting…';
    default:
      return null;
  }
}

function parseCallableError(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) {
    const m = (err as { message?: string }).message;
    if (typeof m === 'string' && m.trim()) return m.trim();
  }
  return 'Something went wrong. Please try again.';
}

export type OrganizationSignupWizardProps = {
  onBack?: () => void;
  className?: string;
};

export function OrganizationSignupWizard({ onBack, className }: OrganizationSignupWizardProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [branches, setBranches] = useState<BranchRow[]>(() => [newBranchRow()]);
  const [status, setStatus] = useState<WizardStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const busy = status !== 'idle';

  const addBranch = () => {
    if (branches.length >= MAX_BRANCHES) return;
    setBranches((prev) => [...prev, newBranchRow()]);
  };

  const removeBranch = (id: string) => {
    setBranches((prev) => (prev.length <= 1 ? prev : prev.filter((b) => b.id !== id)));
  };

  const updateBranch = (id: string, patch: Partial<Pick<BranchRow, 'name' | 'curriculumType'>>) => {
    setBranches((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const em = email.trim();
    const pw = password;
    const org = organizationName.trim();
    if (!em || !pw || pw.length < 6) {
      setError('Enter a valid email and a password of at least 6 characters.');
      return;
    }
    if (!org) {
      setError('Enter your organization or network name.');
      return;
    }
    for (let i = 0; i < branches.length; i++) {
      if (!branches[i].name.trim()) {
        setError(`Enter a name for branch ${i + 1}.`);
        return;
      }
    }

    try {
      setStatus('creating_account');
      await createUserWithEmailAndPassword(auth, em, pw);

      setStatus('provisioning');
      let result: { data: { ok?: boolean; organizationId?: string } };
      try {
        result = await registerOrganizationCallable({
          organizationName: org,
          branches: branches.map((b) => ({
            name: b.name.trim(),
            curriculumType: b.curriculumType,
          })),
        });
      } catch (callErr) {
        const u = auth.currentUser;
        if (u) {
          try {
            await deleteUser(u);
          } catch (delErr) {
            console.error('OrganizationSignupWizard: rollback deleteUser failed', delErr);
          }
        }
        setStatus('idle');
        setError(parseCallableError(callErr));
        return;
      }

      const data = result.data;
      if (!data?.ok || typeof data.organizationId !== 'string') {
        const u = auth.currentUser;
        if (u) {
          try {
            await deleteUser(u);
          } catch (delErr) {
            console.error('OrganizationSignupWizard: rollback deleteUser failed', delErr);
          }
        }
        setStatus('idle');
        setError('Provisioning failed. Please try again.');
        return;
      }

      setStatus('refreshing_token');
      await auth.currentUser?.getIdToken(true);

      setStatus('redirecting');
      window.location.assign('/');
    } catch (err: unknown) {
      setStatus('idle');
      const code =
        err && typeof err === 'object' && 'code' in err ? String((err as { code: unknown }).code) : '';
      if (code === 'auth/email-already-in-use') {
        setError('That email is already registered. Sign in instead, or use a different email.');
      } else if (code === 'auth/weak-password') {
        setError('Password is too weak. Use at least 6 characters.');
      } else if (code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else {
        setError(parseCallableError(err));
      }
    }
  };

  const msg = statusMessage(status);

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-zinc-100 to-zinc-200/80 dark:from-zinc-950 dark:to-zinc-900 flex flex-col items-center justify-center p-4 sm:p-6 ${className ?? ''}`}
    >
      <Card className="w-full max-w-lg shadow-xl border-zinc-200/80 dark:border-zinc-800">
        <CardHeader className="space-y-1">
          {onBack && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-fit -ml-2 text-zinc-600 mb-2"
              onClick={() => !busy && onBack()}
              disabled={busy}
            >
              <ArrowLeft className="w-4 h-4 mr-1" aria-hidden />
              Back to sign in
            </Button>
          )}
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
              <Building2 className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <CardTitle className="text-xl tracking-tight">Create your school network</CardTitle>
              <CardDescription className="text-zinc-500 dark:text-zinc-400">
                Set up your organization and campuses in one step.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            {msg && (
              <div className="flex items-center gap-2 text-sm font-medium text-indigo-700 dark:text-indigo-300">
                <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                {msg}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="org-signup-email" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Admin email
              </label>
              <Input
                id="org-signup-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={busy}
                placeholder="you@yourschool.com"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="org-signup-password" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Password
              </label>
              <Input
                id="org-signup-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy}
                placeholder="At least 6 characters"
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="org-signup-network" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Organization / network name
              </label>
              <Input
                id="org-signup-network"
                type="text"
                autoComplete="organization"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                disabled={busy}
                placeholder="e.g. Acme Schools Trust"
                required
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Branches / campuses</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addBranch}
                  disabled={busy || branches.length >= MAX_BRANCHES}
                  className="shrink-0"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" aria-hidden />
                  Add another branch
                </Button>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Each branch becomes a school record under your organization (up to {MAX_BRANCHES}).
              </p>
              <ul className="space-y-3">
                {branches.map((b, index) => (
                  <li
                    key={b.id}
                    className="flex flex-col sm:flex-row sm:items-end gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/40 p-3"
                  >
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400" htmlFor={`branch-name-${b.id}`}>
                        Branch {index + 1} name
                      </label>
                      <Input
                        id={`branch-name-${b.id}`}
                        type="text"
                        value={b.name}
                        onChange={(e) => updateBranch(b.id, { name: e.target.value })}
                        disabled={busy}
                        placeholder="e.g. Main campus"
                        required
                      />
                    </div>
                    <div className="flex gap-2 sm:w-44 shrink-0">
                      <div className="flex-1 space-y-1.5">
                        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400" htmlFor={`branch-curriculum-${b.id}`}>
                          Curriculum
                        </label>
                        <select
                          id={`branch-curriculum-${b.id}`}
                          value={b.curriculumType}
                          onChange={(e) =>
                            updateBranch(b.id, { curriculumType: e.target.value as CurriculumType })
                          }
                          disabled={busy}
                          className="h-9 w-full rounded-md border border-zinc-200 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                        >
                          <option value="cambridge">Cambridge</option>
                          <option value="ges">GES</option>
                          <option value="both">Both</option>
                        </select>
                      </div>
                      {branches.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 shrink-0 px-0 text-zinc-500 self-end"
                          onClick={() => removeBranch(b.id)}
                          disabled={busy}
                          aria-label={`Remove branch ${index + 1}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <Button type="submit" className="w-full" disabled={busy} size="lg">
              {busy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait…
                </>
              ) : (
                'Create workspace'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
