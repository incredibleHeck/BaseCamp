import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';

/** Low target bitrate for rural / low-bandwidth uploads (browser may ignore if unsupported). */
const AUDIO_BITS_PER_SECOND = 24000;

const DICTATION_PROMPTS = [
  'What specific task was the student doing?',
  'Did they struggle with a specific word or number?',
  'Did they seem confused or hesitant?',
  'What did they say or write that stood out?',
  'How did they respond when you gave help?',
];

export interface VoiceRecordingMeta {
  durationMs: number;
  mimeType: string;
}

interface VoiceObservationRecorderProps {
  /** Used for queue / analytics (not shown in UI unless `learnerLabel` is omitted). */
  studentId: string;
  /** Friendly name shown in the card (e.g. student name). */
  learnerLabel?: string;
  disabled?: boolean;
  /**
   * Raw audio for Gemini (or your pipeline). No browser Speech-to-Text.
   * Called after stop when the final Blob is ready.
   */
  onRecordingComplete?: (audioBlob: Blob, meta: VoiceRecordingMeta) => void | Promise<void>;
}

function pickRecorderMimeType(): string {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
  ];
  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported(c)) return c;
  }
  return '';
}

function buildMediaRecorderOptions(mimeType: string): MediaRecorderOptions {
  const opts: MediaRecorderOptions = {
    audioBitsPerSecond: AUDIO_BITS_PER_SECOND,
  };
  if (mimeType) opts.mimeType = mimeType;
  return opts;
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function VoiceObservationRecorder({
  studentId,
  learnerLabel,
  disabled = false,
  onRecordingComplete,
}: VoiceObservationRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [encoding, setEncoding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [promptIndex, setPromptIndex] = useState(0);
  const secondsRef = useRef(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chosenMimeRef = useRef<string>('');

  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const stopTick = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  /** Rotate dictation hints every 4s while recording */
  useEffect(() => {
    if (!recording) {
      setPromptIndex(0);
      return;
    }
    setPromptIndex(0);
    const id = window.setInterval(() => {
      setPromptIndex((i) => (i + 1) % DICTATION_PROMPTS.length);
    }, 4000);
    return () => clearInterval(id);
  }, [recording]);

  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
      setRecording(false);
      stopTick();
      return;
    }
    mediaRecorderRef.current.stop();
    setRecording(false);
    stopTick();
  }, [stopTick]);

  const startRecording = async () => {
    if (disabled || encoding) return;
    if (!onRecordingComplete) {
      setError('Voice upload is not configured.');
      return;
    }
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = pickRecorderMimeType();
      chosenMimeRef.current = mimeType;

      let mr: MediaRecorder;
      try {
        const opts = buildMediaRecorderOptions(mimeType);
        mr = new MediaRecorder(stream, opts);
      } catch {
        try {
          mr = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
        } catch {
          mr = new MediaRecorder(stream);
        }
      }

      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        const outType = mr.mimeType || chosenMimeRef.current || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: outType.split(';')[0].trim() || 'audio/webm' });
        const elapsedSec = secondsRef.current;
        secondsRef.current = 0;
        setSeconds(0);
        const durationMs = Math.max(elapsedSec * 1000, 500);
        const mimeForMeta = outType.split(';')[0].trim() || 'audio/webm';

        setEncoding(true);
        void (async () => {
          try {
            await onRecordingComplete(blob, { durationMs, mimeType: mimeForMeta });
          } catch (e) {
            console.error(e);
            setError('Could not finish saving the recording.');
          } finally {
            setEncoding(false);
          }
        })();
      };

      mediaRecorderRef.current = mr;
      const sliceMs = 250;
      mr.start(sliceMs);
      setRecording(true);
      secondsRef.current = 0;
      setSeconds(0);
      tickRef.current = setInterval(() => {
        secondsRef.current += 1;
        setSeconds(secondsRef.current);
      }, 1000);
    } catch {
      setError('Microphone not available or permission denied.');
    }
  };

  return (
    <div className="rounded-lg border border-violet-200 bg-violet-50/80 p-4 shadow-sm">
      <h4 className="text-sm font-semibold text-gray-900 mb-1">Voice observation</h4>
      <p className="text-xs text-gray-600 mb-3">
        Raw audio is captured for cloud analysis (Gemini). It stays on this device until synced — not transcribed in the
        browser.
        {learnerLabel ? (
          <>
            {' '}
            <span className="font-medium text-violet-900">Learner: {learnerLabel}</span>
          </>
        ) : null}
      </p>

      {recording && (
        <div className="mb-4 rounded-lg border border-red-200 bg-white/90 px-3 py-3 shadow-inner">
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wide text-red-700">Recording</span>
            <span className="ml-auto font-mono text-sm font-semibold tabular-nums text-gray-900">
              {formatTime(seconds)}
            </span>
          </div>
          <p
            key={promptIndex}
            className="text-sm text-gray-800 leading-snug min-h-[2.75rem] animate-in fade-in duration-300"
          >
            {DICTATION_PROMPTS[promptIndex]}
          </p>
          <p className="text-[10px] text-gray-400 mt-2">Prompts rotate every 4 seconds to guide your note.</p>
        </div>
      )}

      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        {!recording ? (
          <button
            type="button"
            disabled={disabled || encoding || !onRecordingComplete}
            onClick={() => void startRecording()}
            aria-label={`Start voice recording for ${learnerLabel ?? 'learner'} (${studentId})`}
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {encoding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
            {encoding ? 'Processing…' : 'Record note'}
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 shadow-sm"
          >
            <Square className="w-4 h-4 fill-current" />
            Stop
          </button>
        )}
      </div>
    </div>
  );
}
