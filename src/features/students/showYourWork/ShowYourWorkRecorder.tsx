import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Clapperboard, Square, Video } from 'lucide-react';
import { canUseWebCodecsRecording } from './webCodecsCapability';
import { recordWebCodecsToMp4 } from './recordWebCodecsToMp4';
import { recordMediaStreamToBlob, transcodeRecordingToMp4 } from './ffmpegWasmEncode';
import { SHOW_YOUR_WORK_MAX_MS, type ShowYourWorkMeta } from './types';

export interface ShowYourWorkRecorderProps {
  studentId: string;
  learnerLabel?: string;
  disabled?: boolean;
  /** Called as soon as the user starts a new recording (e.g. clear parent status messages). */
  onRecordingStart?: () => void;
  onRecordingComplete?: (blob: Blob, meta: ShowYourWorkMeta) => void | Promise<void>;
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function ShowYourWorkRecorder({
  studentId,
  learnerLabel,
  disabled = false,
  onRecordingStart,
  onRecordingComplete,
}: ShowYourWorkRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const previewRef = useRef<HTMLVideoElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      abortRef.current?.abort();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (previewRef.current) previewRef.current.srcObject = null;
    };
  }, []);

  const stopTicks = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const cleanupStream = useCallback(() => {
    stopTicks();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (previewRef.current) previewRef.current.srcObject = null;
    abortRef.current = null;
    setRecording(false);
    setSeconds(0);
  }, [stopTicks]);

  const startRecording = useCallback(async () => {
    if (recording || disabled) return;
    onRecordingStart?.();
    setError(null);
    setRecording(true);
    setSeconds(0);
    stopTicks();
    tickRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      });
      streamRef.current = stream;

      const v = previewRef.current;
      if (v) {
        v.srcObject = stream;
        v.muted = true;
        await v.play().catch(() => undefined);
      }

      const ac = new AbortController();
      abortRef.current = ac;

      const run = async (): Promise<{ blob: Blob; meta: ShowYourWorkMeta }> => {
        const useWeb = await canUseWebCodecsRecording();
        if (useWeb) {
          try {
            return await recordWebCodecsToMp4(stream, {
              signal: ac.signal,
              maxDurationMs: SHOW_YOUR_WORK_MAX_MS,
            });
          } catch (e) {
            console.warn('WebCodecs capture failed, using ffmpeg fallback', e);
          }
        }
        const wallStart = performance.now();
        const { blob: raw } = await recordMediaStreamToBlob(stream, SHOW_YOUR_WORK_MAX_MS, ac.signal);
        const mp4Blob = await transcodeRecordingToMp4(raw, { signal: ac.signal });
        const durationMs = Math.min(Math.round(performance.now() - wallStart), SHOW_YOUR_WORK_MAX_MS);
        return {
          blob: mp4Blob,
          meta: {
            durationMs,
            mimeType: 'video/mp4',
            encoder: 'ffmpeg',
            hadAudio: stream.getAudioTracks().length > 0,
          },
        };
      };

      void run()
        .then(async (result) => {
          await onRecordingComplete?.(result.blob, result.meta);
        })
        .catch((e) => {
          if (ac.signal.aborted) return;
          setError(e instanceof Error ? e.message : 'Recording failed');
        })
        .finally(() => {
          cleanupStream();
        });
    } catch (e) {
      stopTicks();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (previewRef.current) previewRef.current.srcObject = null;
      setRecording(false);
      setSeconds(0);
      setError(e instanceof Error ? e.message : 'Camera or microphone unavailable');
    }
  }, [recording, disabled, onRecordingStart, onRecordingComplete, cleanupStream, stopTicks]);

  const stopRecording = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const label = learnerLabel?.trim() || 'Student';

  return (
    <div className="rounded-2xl border border-violet-200 bg-gradient-to-b from-violet-50/80 to-white p-5 text-left shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow">
          <Video className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Show your work</p>
          <p className="text-sm font-medium text-gray-900">Short video for {label}</p>
          <p className="mt-1 text-xs text-gray-600">
            Up to {SHOW_YOUR_WORK_MAX_MS / 1000}s · Compressed on this device · ID {studentId.slice(0, 8)}…
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl bg-black/90 aspect-video max-h-[220px] mx-auto">
        <video ref={previewRef} className="h-full w-full object-cover" playsInline muted />
      </div>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {!recording ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => void startRecording()}
            className="inline-flex flex-1 min-w-[140px] items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-violet-700 disabled:opacity-50"
          >
            <Clapperboard className="h-4 w-4" />
            Record
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="inline-flex flex-1 min-w-[140px] items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-rose-700"
          >
            <Square className="h-4 w-4 fill-current" />
            Stop ({formatTime(seconds)})
          </button>
        )}
      </div>
      <p className="mt-2 text-[11px] text-gray-500">
        Finishing may take a moment on older devices (fallback encoder downloads in the background).
      </p>
    </div>
  );
}
