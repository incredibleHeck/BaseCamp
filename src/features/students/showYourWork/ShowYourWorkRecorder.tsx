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

export function ShowYourWorkRecorder({
  studentId,
  learnerLabel,
  disabled = false,
  onRecordingStart,
  onRecordingComplete,
}: ShowYourWorkRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const previewRef = useRef<HTMLVideoElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  /** Browser timer handles (`number`); avoid `NodeJS.Timeout` from Node typings. */
  const tickRef = useRef<number | null>(null);
  const hardCapRef = useRef<number | null>(null);
  const recordingStartedAtRef = useRef<number>(0);

  const clearHardCap = useCallback(() => {
    const id = hardCapRef.current;
    if (id !== null) {
      window.clearTimeout(id);
      hardCapRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      const tickId = tickRef.current;
      if (tickId !== null) window.clearInterval(tickId);
      clearHardCap();
      abortRef.current?.abort();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (previewRef.current) previewRef.current.srcObject = null;
    };
  }, [clearHardCap]);

  const stopTicks = useCallback(() => {
    const id = tickRef.current;
    if (id !== null) {
      window.clearInterval(id);
      tickRef.current = null;
    }
  }, []);

  const cleanupStream = useCallback(() => {
    stopTicks();
    clearHardCap();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (previewRef.current) previewRef.current.srcObject = null;
    abortRef.current = null;
    setRecording(false);
    setRemainingSeconds(0);
  }, [stopTicks, clearHardCap]);

  const startRecording = useCallback(async () => {
    if (recording || preparing || disabled) return;
    onRecordingStart?.();
    setError(null);
    setPreparing(true);

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

      recordingStartedAtRef.current = performance.now();
      setPreparing(false);
      setRecording(true);
      setRemainingSeconds(Math.ceil(SHOW_YOUR_WORK_MAX_MS / 1000));

      stopTicks();
      tickRef.current = window.setInterval(() => {
        const elapsed = performance.now() - recordingStartedAtRef.current;
        const rem = Math.max(0, SHOW_YOUR_WORK_MAX_MS - elapsed);
        setRemainingSeconds(Math.max(0, Math.ceil(rem / 1000)));
      }, 100);

      hardCapRef.current = window.setTimeout(() => {
        hardCapRef.current = null;
        abortRef.current?.abort();
      }, SHOW_YOUR_WORK_MAX_MS);

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
      clearHardCap();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (previewRef.current) previewRef.current.srcObject = null;
      setPreparing(false);
      setRecording(false);
      setRemainingSeconds(0);
      setError(e instanceof Error ? e.message : 'Camera or microphone unavailable');
    }
  }, [
    recording,
    preparing,
    disabled,
    onRecordingStart,
    onRecordingComplete,
    cleanupStream,
    stopTicks,
    clearHardCap,
  ]);

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
        {!recording && !preparing ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => void startRecording()}
            className="inline-flex flex-1 min-w-[140px] items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-violet-700 disabled:opacity-50"
          >
            <Clapperboard className="h-4 w-4" />
            Record
          </button>
        ) : preparing ? (
          <button
            type="button"
            disabled
            className="inline-flex flex-1 min-w-[140px] items-center justify-center gap-2 rounded-xl bg-violet-400 px-4 py-3 text-sm font-semibold text-white shadow opacity-90"
          >
            Starting camera…
          </button>
        ) : (
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <button
              type="button"
              onClick={stopRecording}
              className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-rose-700"
            >
              <Square className="h-4 w-4 fill-current" />
              Stop
            </button>
            <p className="text-center text-xs font-medium text-violet-800" aria-live="polite">
              {remainingSeconds}s remaining
            </p>
          </div>
        )}
      </div>
      <p className="mt-2 text-[11px] text-gray-500">
        Finishing may take a moment on older devices (fallback encoder downloads in the background).
      </p>
    </div>
  );
}
