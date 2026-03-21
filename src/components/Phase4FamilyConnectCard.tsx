import React, { useState, useEffect } from 'react';
import { MessageCircle, Smartphone, Copy, Loader2, KeyRound, ExternalLink } from 'lucide-react';
import type { Assessment } from '../services/assessmentService';
import type { Student } from '../services/studentService';
import {
  updateStudent,
  generatePortalAccessCode,
} from '../services/studentService';
import { buildWeeklyParentDigest } from '../services/parentDigestService';
import { queueWeeklyDigestWhatsApp } from '../services/whatsappConnectService';

const LANGUAGES = ['English', 'Twi', 'Ga', 'Ewe'] as const;

interface Phase4FamilyConnectCardProps {
  studentId: string;
  student: Student;
  history: Assessment[];
  canEdit: boolean;
  onUpdated: () => Promise<void>;
}

export function Phase4FamilyConnectCard({
  studentId,
  student,
  history,
  canEdit,
  onUpdated,
}: Phase4FamilyConnectCardProps) {
  const [phone, setPhone] = useState(student.guardianPhone ?? '');
  const [language, setLanguage] = useState(student.guardianLanguage ?? 'Twi');
  const [optIn, setOptIn] = useState(student.whatsappOptIn ?? false);
  const [trainingOptIn, setTrainingOptIn] = useState(student.trainingDataOptIn ?? false);
  const [portalCode, setPortalCode] = useState(student.portalAccessCode ?? '');
  const [saving, setSaving] = useState(false);
  const [digestLoading, setDigestLoading] = useState(false);
  const [digestEn, setDigestEn] = useState('');
  const [digestLocal, setDigestLocal] = useState('');
  const [queueBusy, setQueueBusy] = useState(false);

  useEffect(() => {
    setPhone(student.guardianPhone ?? '');
    setLanguage(student.guardianLanguage ?? 'Twi');
    setOptIn(student.whatsappOptIn ?? false);
    setTrainingOptIn(student.trainingDataOptIn ?? false);
    setPortalCode(student.portalAccessCode ?? '');
  }, [
    student.id,
    student.guardianPhone,
    student.guardianLanguage,
    student.whatsappOptIn,
    student.trainingDataOptIn,
    student.portalAccessCode,
  ]);

  const firstName = student.name.trim().split(/\s+/)[0] ?? 'Your child';

  const saveGuardianFields = async () => {
    if (!canEdit) return;
    setSaving(true);
    try {
      await updateStudent(studentId, {
        guardianPhone: phone.trim(),
        guardianLanguage: language,
        whatsappOptIn: optIn,
        trainingDataOptIn: trainingOptIn,
        ...(portalCode.trim()
          ? { portalAccessCode: portalCode.trim().toUpperCase() }
          : { portalAccessCode: '' }),
      });
      await onUpdated();
    } finally {
      setSaving(false);
    }
  };

  const recordConsent = async () => {
    if (!canEdit) return;
    setSaving(true);
    try {
      await updateStudent(studentId, {
        consentRecordedAt: Date.now(),
        whatsappOptIn: true,
      });
      setOptIn(true);
      await onUpdated();
    } finally {
      setSaving(false);
    }
  };

  const generateDigest = async () => {
    setDigestLoading(true);
    setDigestEn('');
    setDigestLocal('');
    try {
      const result = await buildWeeklyParentDigest(firstName, history, language);
      if (result) {
        setDigestEn(result.english);
        setDigestLocal(result.localized);
      }
    } finally {
      setDigestLoading(false);
    }
  };

  const copy = (text: string) => {
    void navigator.clipboard.writeText(text);
  };

  const queueWhatsApp = async () => {
    if (!digestLocal.trim() && !digestEn.trim()) {
      alert('Generate a digest first.');
      return;
    }
    if (!phone.trim()) {
      alert('Add a guardian phone number and save.');
      return;
    }
    if (!optIn) {
      alert('Guardian WhatsApp opt-in must be enabled.');
      return;
    }
    setQueueBusy(true);
    try {
      const id = await queueWeeklyDigestWhatsApp({
        studentId,
        guardianPhone: phone.trim(),
        guardianLanguage: language,
        bodyEn: digestEn || digestLocal,
        bodyLocal: digestLocal || digestEn,
      });
      if (id) {
        alert(`Queued for WhatsApp sandbox (demo). Outbox id: ${id}`);
      } else {
        alert('Could not write to outbox. Check console / Firestore rules.');
      }
    } finally {
      setQueueBusy(false);
    }
  };

  const mintPortalCode = async () => {
    if (!canEdit) return;
    const code = generatePortalAccessCode();
    setPortalCode(code);
    setSaving(true);
    try {
      await updateStudent(studentId, { portalAccessCode: code });
      await onUpdated();
    } finally {
      setSaving(false);
    }
  };

  const portalUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname.replace(/\/$/, '')}#/portal`
      : '#/portal';

  return (
    <div className="border border-indigo-200 rounded-xl p-5 bg-gradient-to-br from-indigo-50/80 to-white space-y-6">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-indigo-100 text-indigo-800">
          <MessageCircle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Phase 4 · Family & lab</h3>
          <p className="text-sm text-gray-600 mt-0.5">
            HeckTeck Connect (WhatsApp digest preview + outbox) and student portal access code. WhatsApp delivery is a{' '}
            <strong>demo stub</strong> until Meta Cloud API is wired.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Smartphone className="w-4 h-4" /> Guardian & consent
          </h4>
          <label className="block text-xs font-medium text-gray-600">Guardian phone (E.164-ish)</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={!canEdit}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 disabled:bg-gray-100"
            placeholder="+233 XX XXX XXXX"
          />
          <label className="block text-xs font-medium text-gray-600">Message language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={!canEdit}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 disabled:bg-gray-100"
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={optIn}
              onChange={(e) => setOptIn(e.target.checked)}
              disabled={!canEdit}
            />
            WhatsApp / SMS digest opt-in
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={trainingOptIn}
              onChange={(e) => setTrainingOptIn(e.target.checked)}
              disabled={!canEdit}
            />
            Include de-identified assessments in <strong>fine-tuning pilot</strong> export (optional)
          </label>
          {student.consentRecordedAt ? (
            <p className="text-xs text-emerald-700">
              Consent recorded: {new Date(student.consentRecordedAt).toLocaleString()}
            </p>
          ) : (
            <p className="text-xs text-amber-700">No consent timestamp on file.</p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!canEdit || saving}
              onClick={saveGuardianFields}
              className="px-3 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin inline" /> : null} Save
            </button>
            <button
              type="button"
              disabled={!canEdit || saving}
              onClick={recordConsent}
              className="px-3 py-2 text-sm rounded-lg border border-indigo-200 text-indigo-800 hover:bg-indigo-50 disabled:opacity-50"
            >
              Record consent now
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <KeyRound className="w-4 h-4" /> Student portal code
          </h4>
          <p className="text-xs text-gray-600">
            Learners open <span className="font-mono text-indigo-800">{portalUrl}</span> and enter this code (lab / shared
            device).
          </p>
          <div className="flex gap-2 flex-wrap items-center">
            <input
              type="text"
              value={portalCode}
              onChange={(e) => setPortalCode(e.target.value.toUpperCase())}
              disabled={!canEdit}
              className="flex-1 min-w-[8rem] border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono text-gray-900 tracking-widest disabled:bg-gray-100"
              placeholder="CODE"
              maxLength={8}
            />
            <button
              type="button"
              disabled={!canEdit || saving}
              onClick={mintPortalCode}
              className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              Generate
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
              onClick={() => copy(portalUrl)}
            >
              <Copy className="w-4 h-4" /> Copy URL
            </button>
            <a
              href="#/portal"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-3 py-2 text-sm rounded-lg text-indigo-700 hover:underline"
            >
              <ExternalLink className="w-4 h-4" /> Open portal
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-indigo-100 pt-4 space-y-3">
        <h4 className="text-sm font-semibold text-gray-800">Weekly digest (HeckTeck Connect)</h4>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={digestLoading || !history.length}
            onClick={generateDigest}
            className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {digestLoading ? <Loader2 className="w-4 h-4 animate-spin inline mr-1" /> : null}
            Generate preview
          </button>
          <button
            type="button"
            disabled={queueBusy || (!digestEn && !digestLocal)}
            onClick={queueWhatsApp}
            className="px-4 py-2 text-sm rounded-lg border border-emerald-600 text-emerald-800 hover:bg-emerald-50 disabled:opacity-50"
          >
            {queueBusy ? 'Queuing…' : 'Queue WhatsApp (demo outbox)'}
          </button>
        </div>
        {!history.length ? <p className="text-xs text-gray-500">Save at least one assessment to generate a digest.</p> : null}
        {digestEn ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="text-sm bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-gray-500">English bundle</span>
                <button type="button" className="text-xs text-indigo-600" onClick={() => copy(digestEn)}>
                  Copy
                </button>
              </div>
              <p className="text-gray-800 whitespace-pre-wrap">{digestEn}</p>
            </div>
            <div className="text-sm bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-gray-500">Guardian language ({language})</span>
                <button type="button" className="text-xs text-indigo-600" onClick={() => copy(digestLocal)}>
                  Copy
                </button>
              </div>
              <p className="text-gray-800 whitespace-pre-wrap">{digestLocal}</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
