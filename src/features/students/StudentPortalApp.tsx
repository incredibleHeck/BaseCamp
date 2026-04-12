import React, { useState, useCallback, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { Loader2, Sparkles, Trophy, ArrowRight, Smartphone } from 'lucide-react';
import { auth, db } from '../../lib/firebase';
import type { GamifiedQuiz } from '../../types/domain';
import { getStudentByPortalCode } from '../../services/studentService';
import { getStudentHistory } from '../../services/assessmentService';
import { generateStudentPortalPracticeRound, type PortalPracticeRound } from '../../services/ai/aiPrompts';
import { clearActiveQuiz, logPortalSessionSummary } from '../../services/core/portalSessionService';

function parseActiveQuiz(raw: unknown): GamifiedQuiz | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.title !== 'string' || !o.title.trim()) return null;
  if (!Array.isArray(o.questions) || o.questions.length === 0) return null;
  for (const q of o.questions) {
    if (!q || typeof q !== 'object') return null;
    const item = q as Record<string, unknown>;
    if (typeof item.question !== 'string') return null;
    if (!Array.isArray(item.options) || item.options.length !== 4) return null;
    if (!item.options.every((x) => typeof x === 'string')) return null;
    if (typeof item.correctIndex !== 'number' || item.correctIndex < 0 || item.correctIndex > 3) return null;
    if (typeof item.explanation !== 'string') return null;
  }
  return raw as GamifiedQuiz;
}

/**
 * Progressive Web App–friendly student shell (Phase 4).
 * Entry: same origin, hash route <code>#/portal</code>.
 */
export function StudentPortalApp() {
  const [codeInput, setCodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<GamifiedQuiz | null>(null);

  const [round, setRound] = useState<PortalPracticeRound | null>(null);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [points, setPoints] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  const [teacherPhase, setTeacherPhase] = useState<'playing' | 'complete'>('playing');
  const [tqIndex, setTqIndex] = useState(0);
  const [tqScore, setTqScore] = useState(0);
  const [tqPicked, setTqPicked] = useState<number | null>(null);
  const [tqReveal, setTqReveal] = useState(false);

  useEffect(() => {
    if (!studentId) {
      setActiveQuiz(null);
      return;
    }
    const unsub = onSnapshot(doc(db, 'students', studentId), (snap) => {
      const q = parseActiveQuiz(snap.data()?.activeQuiz);
      setActiveQuiz(q);
    });
    return () => unsub();
  }, [studentId]);

  useEffect(() => {
    if (!activeQuiz) {
      setTeacherPhase('playing');
      setTqIndex(0);
      setTqScore(0);
      setTqPicked(null);
      setTqReveal(false);
      return;
    }
    setTeacherPhase('playing');
    setTqIndex(0);
    setTqScore(0);
    setTqPicked(null);
    setTqReveal(false);
  }, [activeQuiz]);

  const resetAiQuiz = useCallback(() => {
    setIdx(0);
    setSelected(null);
    setShowHint(false);
    setPoints(0);
    setCorrectCount(0);
    setDone(false);
  }, []);

  const startWithCode = async () => {
    setError(null);
    setLoading(true);
    setRound(null);
    resetAiQuiz();
    try {
      const code = codeInput.trim().toUpperCase();
      if (code.length < 4) {
        setError('Enter the code from your teacher.');
        return;
      }
      const st = await getStudentByPortalCode(code);
      if (!st?.id) {
        setError('Code not found. Ask your teacher for a new code.');
        return;
      }
      setStudentId(st.id);
      setStudentName(st.name.trim().split(/\s+/)[0] ?? 'Friend');
    } finally {
      setLoading(false);
    }
  };

  const startAiPractice = async () => {
    if (!studentId) return;
    setError(null);
    setLoading(true);
    try {
      const history = await getStudentHistory(studentId);
      const latest = history[0];
      const tags = latest?.gapTags?.length ? latest.gapTags : ['Practice', 'Number sense'];
      const subject = latest?.type === 'Literacy' ? 'literacy' : 'numeracy';
      const practice = await generateStudentPortalPracticeRound(tags, subject);
      if (!practice) {
        setError('Could not load practice. Check your internet and API key.');
        return;
      }
      setRound(practice);
      resetAiQuiz();
    } finally {
      setLoading(false);
    }
  };

  const currentItem = round?.items[idx];
  const tq = activeQuiz?.questions[tqIndex];

  const submitAnswer = () => {
    if (!round || selected === null || !currentItem) return;
    const ok = selected === currentItem.correctIndex;
    const newPoints = points + (ok ? currentItem.points : 0);
    const newCorrect = correctCount + (ok ? 1 : 0);

    if (idx + 1 >= round.items.length) {
      setPoints(newPoints);
      setCorrectCount(newCorrect);
      setDone(true);
      if (studentId) {
        void logPortalSessionSummary({
          studentId,
          subject: round.subject,
          pointsEarned: newPoints,
          itemsCorrect: newCorrect,
          itemsTotal: round.items.length,
        });
      }
      return;
    }

    setPoints(newPoints);
    setCorrectCount(newCorrect);
    setIdx((i) => i + 1);
    setSelected(null);
    setShowHint(false);
  };

  const handleTeacherOptionTap = (optionIndex: number) => {
    if (!activeQuiz || !tq || tqReveal) return;
    setTqPicked(optionIndex);
    setTqReveal(true);
    if (optionIndex === tq.correctIndex) {
      setTqScore((s) => s + 1);
    }
  };

  const handleTeacherNext = () => {
    if (!activeQuiz || !tqReveal || !tq) return;
    const last = tqIndex + 1 >= activeQuiz.questions.length;
    if (last) {
      setTeacherPhase('complete');
      return;
    }
    setTqIndex((i) => i + 1);
    setTqPicked(null);
    setTqReveal(false);
  };

  const handleReturnToTeacherDashboard = async () => {
    if (!studentId) return;
    try {
      await clearActiveQuiz(studentId);
    } catch (e) {
      console.error('clearActiveQuiz', e);
    }
  };

  const logoutToCode = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('signOut', e);
    }
    setStudentId(null);
    setStudentName(null);
    setRound(null);
    setActiveQuiz(null);
    setCodeInput('');
    resetAiQuiz();
    setTeacherPhase('playing');
    setTqIndex(0);
    setTqScore(0);
    setTqPicked(null);
    setTqReveal(false);
  };

  const item = currentItem;

  const showCodeGate = !studentId;
  const showTeacherPlaying = Boolean(activeQuiz && teacherPhase === 'playing' && tq);
  const showTeacherComplete = Boolean(activeQuiz && teacherPhase === 'complete');
  const showAiDone = Boolean(!activeQuiz && round && done);
  const showAiPlaying = Boolean(!activeQuiz && round && !done);
  const showDashboard = Boolean(studentId && !activeQuiz && !round);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white text-gray-900 font-sans p-4 sm:p-8">
      <div className="max-w-lg mx-auto">
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-500 text-white shadow-lg mb-3">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">BaseCamp Practice</h1>
          <p className="text-sm text-gray-600 mt-1">Student portal · Phase 4 demo</p>
        </header>

        {showCodeGate ? (
          <div className="bg-white rounded-2xl shadow border border-gray-200 p-6 space-y-4">
            <label className="block text-sm font-medium text-gray-700">Class code</label>
            <input
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              className="w-full text-center text-2xl font-mono tracking-[0.3em] border border-gray-300 rounded-xl px-4 py-3 uppercase"
              placeholder="XXXXXX"
              maxLength={8}
              autoComplete="off"
            />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button
              type="button"
              onClick={startWithCode}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 min-h-[48px] rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-700 disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              Start
            </button>
            <p className="text-xs text-gray-500 text-center">
              Teachers set this code on the learner profile. For school / lab use only.
            </p>
          </div>
        ) : showTeacherComplete ? (
          <div className="bg-white rounded-2xl shadow border border-gray-200 p-8 text-center space-y-6 animate-in zoom-in-95 max-w-xl mx-auto">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-lg">
              <Trophy className="w-9 h-9" />
            </div>
            <h2 className="text-xl font-bold">Quiz complete{studentName ? `, ${studentName}` : ''}!</h2>
            <p className="text-gray-600 text-lg">
              You scored <strong className="text-indigo-700">{tqScore}</strong> out of{' '}
              <strong>{activeQuiz?.questions.length ?? 0}</strong>.
            </p>
            <button
              type="button"
              onClick={() => void handleReturnToTeacherDashboard()}
              className="w-full min-h-[52px] rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold shadow-md hover:from-indigo-500 hover:to-violet-500"
            >
              Return to Dashboard
            </button>
          </div>
        ) : showTeacherPlaying ? (
          <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 p-5 sm:p-8 space-y-6 max-w-xl mx-auto">
            <div className="flex items-start gap-3 border-b border-indigo-100 pb-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-md">
                <Smartphone className="w-6 h-6" />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">From your teacher</p>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">{activeQuiz?.title}</h2>
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                Question {tqIndex + 1} / {activeQuiz?.questions.length}
              </span>
              <span className="font-semibold text-indigo-700">{tqScore} correct</span>
            </div>
            <p className="text-xl sm:text-2xl font-semibold text-gray-900 leading-snug">{tq.question}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {tq.options.map((label, i) => {
                let ring = 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50';
                if (tqReveal) {
                  if (i === tq.correctIndex) {
                    ring = 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-400';
                  } else if (tqPicked === i) {
                    ring = 'border-red-400 bg-red-50 text-red-950 ring-2 ring-red-300';
                  } else {
                    ring = 'border-gray-200 opacity-70';
                  }
                } else if (tqPicked === i) {
                  ring = 'border-indigo-400 bg-indigo-50';
                }
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={tqReveal}
                    onClick={() => handleTeacherOptionTap(i)}
                    className={`min-h-[56px] rounded-2xl border-2 px-4 py-4 text-left text-base sm:text-lg font-medium transition-colors ${ring}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            {tqReveal ? (
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/80 p-4 text-left">
                <p className="text-xs font-semibold uppercase text-indigo-800 mb-1">Why</p>
                <p className="text-sm sm:text-base text-gray-800 leading-relaxed">{tq.explanation}</p>
              </div>
            ) : null}
            {tqReveal ? (
              <button
                type="button"
                onClick={handleTeacherNext}
                className="w-full min-h-[52px] rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-base font-semibold shadow-md hover:from-indigo-500 hover:to-violet-500"
              >
                {tqIndex + 1 >= (activeQuiz?.questions.length ?? 0) ? 'See results' : 'Next Question'}
              </button>
            ) : null}
          </div>
        ) : showAiDone ? (
          <div className="bg-white rounded-2xl shadow border border-gray-200 p-8 text-center space-y-4 animate-in zoom-in-95">
            <Trophy className="w-16 h-16 text-amber-500 mx-auto" />
            <h2 className="text-xl font-bold">Great work{studentName ? `, ${studentName}` : ''}!</h2>
            <p className="text-gray-600">
              You scored <strong>{points}</strong> points and got <strong>{correctCount}</strong> of{' '}
              <strong>{round?.items.length}</strong> correct.
            </p>
            <button
              type="button"
              onClick={() => {
                setRound(null);
                resetAiQuiz();
              }}
              className="px-6 py-3 rounded-xl border border-gray-300 font-medium hover:bg-gray-50"
            >
              Back to dashboard
            </button>
          </div>
        ) : showAiPlaying ? (
          <div className="bg-white rounded-2xl shadow border border-gray-200 p-6 space-y-5">
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                Question {idx + 1} / {round?.items.length}
              </span>
              <span className="font-semibold text-sky-700">{points} pts</span>
            </div>
            <p className="text-lg font-medium text-gray-900">{item?.question}</p>
            <div className="space-y-2">
              {item?.choices.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelected(i)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                    selected === i ? 'border-sky-500 bg-sky-50 text-sky-900' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            {showHint ? (
              <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg p-3">Hint: {item?.hint}</p>
            ) : null}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowHint(true)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Hint
              </button>
              <button
                type="button"
                disabled={selected === null}
                onClick={submitAnswer}
                className="flex-1 py-3 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 disabled:opacity-50"
              >
                {round && idx >= round.items.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        ) : showDashboard ? (
          <div className="bg-white rounded-2xl shadow border border-gray-200 p-8 space-y-6 text-center">
            <p className="text-lg text-gray-800">
              Hello{studentName ? <strong className="text-gray-900"> {studentName}</strong> : null}! Ready to practice?
            </p>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button
              type="button"
              onClick={() => void startAiPractice()}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 min-h-[52px] rounded-xl bg-sky-600 text-white text-lg font-semibold hover:bg-sky-700 disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              Start practice
            </button>
            <p className="text-xs text-gray-500">
              Your teacher may also send a quiz to this device — it will appear here automatically.
            </p>
            <button
              type="button"
              onClick={() => void logoutToCode()}
              className="text-sm text-gray-500 underline hover:text-gray-700"
            >
              Sign out
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
