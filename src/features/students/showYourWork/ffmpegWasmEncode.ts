import { SHOW_YOUR_WORK_MAX_MS } from './types';
import type { ShowYourWorkMeta } from './types';

/** Pin to a published core build compatible with `@ffmpeg/ffmpeg` 0.12.x (single-thread; no COOP/COEP). */
const FFMPEG_CORE_VERSION = '0.12.6';
const CORE_BASE = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${FFMPEG_CORE_VERSION}/dist/esm`;

function pickMediaRecorderMime(): string {
  const types = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp9',
    'video/webm',
  ];
  for (const t of types) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return '';
}

/** Records from an active `MediaStream` until timeout, `MediaRecorder` stop, or `signal` abort. */
export function recordMediaStreamToBlob(
  stream: MediaStream,
  maxMs: number,
  signal: AbortSignal | undefined,
): Promise<{ blob: Blob; mimeType: string }> {
  const mimeType = pickMediaRecorderMime();
  const recorder = mimeType
    ? new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 2_500_000, audioBitsPerSecond: 64_000 })
    : new MediaRecorder(stream);

  const chunks: BlobPart[] = [];

  return new Promise((resolve, reject) => {
    recorder.ondataavailable = (e) => {
      if (e.data.size) chunks.push(e.data);
    };
    recorder.onerror = () => reject(new Error('MediaRecorder failed'));
    recorder.onstop = () => {
      resolve({
        blob: new Blob(chunks, { type: recorder.mimeType || mimeType || 'video/webm' }),
        mimeType: recorder.mimeType || mimeType || 'video/webm',
      });
    };

    try {
      recorder.start(200);
    } catch (e) {
      reject(e instanceof Error ? e : new Error(String(e)));
      return;
    }

    const stopSoon = () => {
      try {
        if (recorder.state === 'recording') recorder.stop();
      } catch {
        /* ignore */
      }
    };

    const tid = window.setTimeout(stopSoon, maxMs);
    const onAbort = () => {
      window.clearTimeout(tid);
      stopSoon();
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

async function transcodeBlobToMp4WithFfmpeg(
  rawBlob: Blob,
  inputName: string,
  signal: AbortSignal | undefined,
): Promise<Uint8Array> {
  const [{ FFmpeg }, { fetchFile, toBlobURL }] = await Promise.all([
    import('@ffmpeg/ffmpeg'),
    import('@ffmpeg/util'),
  ]);

  const ffmpeg = new FFmpeg();
  await ffmpeg.load({
    coreURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  try {
    await ffmpeg.writeFile(inputName, await fetchFile(rawBlob));

    const tryExec = async (args: string[]) => ffmpeg.exec(args, undefined, { signal });

    let code = await tryExec([
      '-i',
      inputName,
      '-c:v',
      'libx264',
      '-crf',
      '28',
      '-preset',
      'ultrafast',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
      '-c:a',
      'aac',
      '-b:a',
      '64k',
      'out.mp4',
    ]);

    if (code !== 0) {
      code = await tryExec([
        '-i',
        inputName,
        '-c:v',
        'libx264',
        '-crf',
        '28',
        '-preset',
        'ultrafast',
        '-pix_fmt',
        'yuv420p',
        '-movflags',
        '+faststart',
        '-an',
        'out.mp4',
      ]);
    }

    if (code !== 0) {
      throw new Error('ffmpeg could not produce MP4 output');
    }

    const out = await ffmpeg.readFile('out.mp4');
    if (out instanceof Uint8Array) return out;
    throw new Error('Unexpected ffmpeg readFile result for out.mp4');
  } finally {
    try {
      ffmpeg.terminate();
    } catch {
      /* ignore */
    }
  }
}

/**
 * Fallback pipeline: capture with MediaRecorder in real time, then transcode to MP4 in ffmpeg.wasm.
 * Call `recordMediaStreamToBlob` while the user is recording; when it resolves, pass the blob here.
 */
export async function transcodeRecordingToMp4(
  rawBlob: Blob,
  options?: { signal?: AbortSignal },
): Promise<Blob> {
  const inputName = rawBlob.type.includes('mp4') ? 'input.mp4' : 'input.webm';
  const u8 = await transcodeBlobToMp4WithFfmpeg(rawBlob, inputName, options?.signal);
  return new Blob([u8], { type: 'video/mp4' });
}

/**
 * One-shot helper: record for up to `maxDurationMs` then transcode (used if you do not split capture / encode).
 */
export async function encodeWithFfmpegFallback(
  stream: MediaStream,
  options?: { signal?: AbortSignal; maxDurationMs?: number },
): Promise<{ blob: Blob; meta: ShowYourWorkMeta }> {
  const maxMs = options?.maxDurationMs ?? SHOW_YOUR_WORK_MAX_MS;
  const signal = options?.signal;
  const wallStart = performance.now();

  const { blob: rawBlob } = await recordMediaStreamToBlob(stream, maxMs, signal);
  const mp4Blob = await transcodeRecordingToMp4(rawBlob, { signal });

  const durationMs = Math.min(Math.round(performance.now() - wallStart), maxMs);
  const hadAudio = stream.getAudioTracks().length > 0;

  return {
    blob: mp4Blob,
    meta: {
      durationMs,
      mimeType: 'video/mp4',
      encoder: 'ffmpeg',
      hadAudio,
    },
  };
}
