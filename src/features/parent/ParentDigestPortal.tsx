import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { Loader2, BookOpen, Home, Sparkles } from 'lucide-react';
import { db } from '../../lib/firebase';
import { getStudentByPortalCode } from '../../services/studentService';

interface DigestData {
  body?: string;
  homeActivity?: string;
  localizedBody?: string;
  generatedAt?: unknown;
  windowStartMs?: number;
  windowEndMs?: number;
}

function formatDigestDate(ms: number | undefined): string {
  if (!ms) return '';
  return new Date(ms).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function ParentDigestPortal() {
  const [codeInput, setCodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [studentName, setStudentName] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [digest, setDigest] = useState<DigestData | null>(null);
  const [digestLoading, setDigestLoading] = useState(false);

  const handleSubmitCode = async () => {
    const code = codeInput.trim();
    if (!code) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getStudentByPortalCode(code);
      if (!result) {
        setError('Invalid code. Please check and try again.');
        return;
      }
      setStudentId(result.id);
      setStudentName(result.name ?? 'Student');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!studentId) return;
    setDigestLoading(true);

    const unsub = onSnapshot(
      doc(db, 'parent_digests', studentId),
      (snap) => {
        if (snap.exists()) {
          setDigest(snap.data() as DigestData);
        } else {
          setDigest(null);
        }
        setDigestLoading(false);
      },
      () => {
        setDigestLoading(false);
      },
    );

    return unsub;
  }, [studentId]);

  if (!studentId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 to-white p-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100">
            <BookOpen className="h-8 w-8 text-sky-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Parent Weekly Digest</h1>
            <p className="mt-2 text-sm text-zinc-500">
              Enter your child&apos;s portal access code to view their weekly learning summary.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSubmitCode();
            }}
            className="space-y-3"
          >
            <input
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              placeholder="Access code"
              className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-center text-lg font-mono tracking-widest placeholder:text-zinc-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
              autoFocus
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={loading || !codeInput.trim()}
              className="w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : 'View digest'}
            </button>
          </form>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white p-4">
      <div className="mx-auto max-w-lg space-y-6 py-8">
        <header className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sky-100">
            <Sparkles className="h-6 w-6 text-sky-600" />
          </div>
          <h1 className="text-xl font-bold text-zinc-900">
            {studentName}&apos;s Weekly Update
          </h1>
          {digest?.windowEndMs && (
            <p className="mt-1 text-xs text-zinc-500">
              Week ending {formatDigestDate(digest.windowEndMs)}
            </p>
          )}
        </header>

        {digestLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
          </div>
        )}

        {!digestLoading && !digest && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center">
            <p className="text-sm text-zinc-500">
              No weekly digest is available yet. Check back after Friday.
            </p>
          </div>
        )}

        {!digestLoading && digest && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-700">
                <BookOpen className="h-4 w-4 text-sky-500" />
                Learning Summary
              </h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-700">
                {digest.localizedBody || digest.body || 'No content available.'}
              </p>
            </div>

            {digest.homeActivity && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-800">
                  <Home className="h-4 w-4 text-emerald-600" />
                  Home Activity
                </h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-emerald-900">
                  {digest.homeActivity}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="text-center">
          <button
            onClick={() => {
              setStudentId(null);
              setStudentName(null);
              setDigest(null);
              setCodeInput('');
            }}
            className="text-xs text-zinc-400 hover:text-zinc-600"
          >
            Use a different code
          </button>
        </div>
      </div>
    </div>
  );
}
