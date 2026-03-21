import React, { useRef, useState, useEffect } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { addVoiceObservationToQueue } from '../services/voiceObservationQueueService';

interface VoiceObservationRecorderProps {
  studentId: string;
  disabled?: boolean;
  /** Called after a clip is queued (parent may run sync + refresh UI). */
  onQueued?: () => void | Promise<void>;
}

export function VoiceObservationRecorder({
  studentId,
  disabled = false,
  onQueued,
}: VoiceObservationRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [encoding, setEncoding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const secondsRef = useRef(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
      setRecording(false);
      stopTimer();
      return;
    }
    mediaRecorderRef.current.stop();
    setRecording(false);
    stopTimer();
  };

  const startRecording = async () => {
    if (disabled || encoding) return;
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : '';
      const mr = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' });
        const elapsedSec = secondsRef.current;
        secondsRef.current = 0;
        setSeconds(0);
        setEncoding(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const dataUrl = reader.result as string;
            const base64 = dataUrl.split(',')[1];
            if (!base64) {
              setError('Could not encode audio.');
              return;
            }
            const durationMs = Math.max(elapsedSec * 1000, 500);
            await addVoiceObservationToQueue({
              studentId,
              audioBase64: base64,
              mimeType: (mr.mimeType || 'audio/webm').split(';')[0],
              durationMs,
            });
            try {
              await onQueued?.();
            } catch (callbackErr) {
              console.error('Voice observation post-queue callback failed:', callbackErr);
            }
          } catch (e) {
            console.error(e);
            setError('Could not save recording to queue.');
          } finally {
            setEncoding(false);
          }
        };
        reader.readAsDataURL(blob);
      };
      mediaRecorderRef.current = mr;
      mr.start(200);
      setRecording(true);
      secondsRef.current = 0;
      setSeconds(0);
      timerRef.current = setInterval(() => {
        secondsRef.current += 1;
        setSeconds(secondsRef.current);
      }, 1000);
    } catch {
      setError('Microphone not available or permission denied.');
    }
  };

  return (
    <div className="rounded-lg border border-violet-200 bg-violet-50/80 p-4">
      <h4 className="text-sm font-semibold text-gray-900 mb-1">Voice observation (Phase 2)</h4>
      <p className="text-xs text-gray-600 mb-3">
        Record a short note about this learner. Audio stays on this device until you are online, then BaseCamp transcribes
        and analyses it for ESL / phonetic patterns (not a medical diagnosis).
      </p>
      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
      <div className="flex flex-wrap items-center gap-3">
        {!recording ? (
          <button
            type="button"
            disabled={disabled || encoding}
            onClick={startRecording}
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:bg-gray-300"
          >
            {encoding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
            {encoding ? 'Saving…' : 'Record note'}
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700"
          >
            <Square className="w-4 h-4 fill-current" />
            Stop ({seconds}s)
          </button>
        )}
      </div>
    </div>
  );
}
