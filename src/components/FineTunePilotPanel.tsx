import React, { useEffect, useState } from 'react';
import { Download, Loader2, FlaskConical } from 'lucide-react';
import { getStudents } from '../services/studentService';
import { fetchAllAssessments } from '../services/enterpriseAnalyticsService';
import { buildPilotExportLines, pilotCorpusToJsonl } from '../services/fineTunePilotService';
import { suggestGapTagsFromObservations } from '../services/aiPrompts';
import { getGapTagPilotMode } from '../config/featureFlags';

/**
 * Phase 4 fine-tuning pilot: export opted-in de-identified snippets + optional A/B gap-tag prompt.
 */
export function FineTunePilotPanel() {
  const [loading, setLoading] = useState(true);
  const [lineCount, setLineCount] = useState(0);
  const [optInStudents, setOptInStudents] = useState(0);
  const [observations, setObservations] = useState('');
  const [tags, setTags] = useState<string[] | null>(null);
  const [tagLoading, setTagLoading] = useState(false);
  const pilotMode = getGapTagPilotMode();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [students, assessments] = await Promise.all([getStudents(), fetchAllAssessments()]);
        if (cancelled) return;
        const lines = buildPilotExportLines(students, assessments);
        setLineCount(lines.length);
        setOptInStudents(students.filter((s) => s.trainingDataOptIn).length);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const downloadJsonl = async () => {
    const [students, assessments] = await Promise.all([getStudents(), fetchAllAssessments()]);
    const lines = buildPilotExportLines(students, assessments);
    const blob = new Blob([pilotCorpusToJsonl(lines)], { type: 'application/x-ndjson;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `basecamp-pilot-corpus-${new Date().toISOString().slice(0, 10)}.jsonl`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const runTagPilot = async () => {
    setTagLoading(true);
    setTags(null);
    try {
      const result = await suggestGapTagsFromObservations(observations);
      setTags(result);
    } finally {
      setTagLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 w-full animate-in fade-in duration-500">
      <div className="flex items-start gap-3 mb-6">
        <div className="p-2 rounded-lg bg-violet-100 text-violet-800">
          <FlaskConical className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Fine-tuning pilot (Phase 4)</h2>
          <p className="text-gray-600 mt-1 text-sm max-w-3xl">
            Export <strong>de-identified</strong> assessment snippets for learners with{' '}
            <strong>trainingDataOptIn</strong> on their student record (set on the family card in learner profile).
            Gap-tag A/B: set <code className="text-xs bg-gray-100 px-1 rounded">VITE_FT_PILOT_GAP_TAGS=1</code> in{' '}
            <code className="text-xs bg-gray-100 px-1">.env.local</code> to use the &quot;mock local head&quot; system
            prompt (still Gemini — simulates routing to a smaller tuned model).
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading corpus stats…
        </p>
      ) : (
        <ul className="text-sm text-gray-700 space-y-1 mb-6">
          <li>
            Learners opted in: <strong>{optInStudents}</strong>
          </li>
          <li>
            Export rows (assessments): <strong>{lineCount}</strong>
          </li>
          <li>
            Gap-tag pilot mode: <strong>{pilotMode}</strong>
          </li>
        </ul>
      )}

      <button
        type="button"
        onClick={downloadJsonl}
        className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 mb-8"
      >
        <Download className="w-4 h-4" />
        Download JSONL corpus
      </button>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Gap tags from observations (A/B demo)</h3>
        <textarea
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 mb-3"
          placeholder="Paste teacher observation notes from a classroom visit…"
        />
        <button
          type="button"
          disabled={tagLoading || !observations.trim()}
          onClick={runTagPilot}
          className="px-4 py-2 rounded-lg border border-violet-300 text-violet-900 text-sm font-medium hover:bg-violet-50 disabled:opacity-50"
        >
          {tagLoading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : null} Suggest gap tags
        </button>
        {tags ? (
          <p className="mt-3 text-sm text-gray-800">
            <strong>Tags:</strong> {tags.length ? tags.join(', ') : '(none)'}
          </p>
        ) : null}
      </div>
    </div>
  );
}
