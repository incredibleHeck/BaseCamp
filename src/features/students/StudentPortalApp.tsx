import React, { useState, useCallback } from 'react';
import { Loader2, Sparkles, Trophy, ArrowRight } from 'lucide-react';
import { getStudentByPortalCode } from '../../services/studentService';
import { getStudentHistory } from '../../services/assessmentService';
import { generateStudentPortalPracticeRound, type PortalPracticeRound } from '../../services/ai/aiPrompts';
import { logPortalSessionSummary } from '../../services/core/portalSessionService';

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
  const [round, setRound] = useState<PortalPracticeRound | null>(null);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [points, setPoints] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  const resetQuiz = useCallback(() => {
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
    resetQuiz();
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
      const history = await getStudentHistory(st.id);
      const latest = history[0];
      const tags = latest?.gapTags?.length ? latest.gapTags : ['Practice', 'Number sense'];
      const subject = latest?.type === 'Literacy' ? 'literacy' : 'numeracy';
      const practice = await generateStudentPortalPracticeRound(tags, subject);
      if (!practice) {
        setError('Could not load practice. Check your internet and API key.');
        return;
      }
      setStudentId(st.id);
      setStudentName(st.name.trim().split(/\s+/)[0] ?? 'Friend');
      setRound(practice);
    } finally {
      setLoading(false);
    }
  };

  const currentItem = round?.items[idx];

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

  const item = currentItem;

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

        {!round ? (
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
        ) : done ? (
          <div className="bg-white rounded-2xl shadow border border-gray-200 p-8 text-center space-y-4 animate-in zoom-in-95">
            <Trophy className="w-16 h-16 text-amber-500 mx-auto" />
            <h2 className="text-xl font-bold">Great work{studentName ? `, ${studentName}` : ''}!</h2>
            <p className="text-gray-600">
              You scored <strong>{points}</strong> points and got <strong>{correctCount}</strong> of{' '}
              <strong>{round.items.length}</strong> correct.
            </p>
            <button
              type="button"
              onClick={() => {
                setRound(null);
                setCodeInput('');
                resetQuiz();
              }}
              className="px-6 py-3 rounded-xl border border-gray-300 font-medium hover:bg-gray-50"
            >
              Exit
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow border border-gray-200 p-6 space-y-5">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Question {idx + 1} / {round.items.length}</span>
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
            {showHint ? <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg p-3">Hint: {item?.hint}</p> : null}
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
                {idx >= round.items.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


