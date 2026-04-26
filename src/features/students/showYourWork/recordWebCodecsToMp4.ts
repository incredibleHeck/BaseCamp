import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
import { pickAvcCodec } from './webCodecsCapability';
import { SHOW_YOUR_WORK_MAX_MS } from './types';
import type { ShowYourWorkMeta } from './types';

type MsTrackProcessorCtor = new (init: { track: MediaStreamTrack }) => {
  readable: ReadableStream<AudioData>;
};

function getMediaStreamTrackProcessor(): MsTrackProcessorCtor | null {
  const g = globalThis as unknown as { MediaStreamTrackProcessor?: MsTrackProcessorCtor };
  return g.MediaStreamTrackProcessor ?? null;
}

async function waitEncodeQueue(videoEncoder: VideoEncoder, maxQueue = 8): Promise<void> {
  while (videoEncoder.encodeQueueSize > maxQueue) {
    await new Promise<void>((r) => queueMicrotask(r));
  }
}

export async function recordWebCodecsToMp4(
  stream: MediaStream,
  options?: { signal?: AbortSignal; maxDurationMs?: number },
): Promise<{ blob: Blob; meta: ShowYourWorkMeta }> {
  const maxMs = options?.maxDurationMs ?? SHOW_YOUR_WORK_MAX_MS;
  const signal = options?.signal;
  const videoTrack = stream.getVideoTracks()[0];
  if (!videoTrack) throw new Error('No video track');

  const settings = videoTrack.getSettings();
  const width = Math.max(2, Math.min(settings.width ?? 1280, 1920));
  const height = Math.max(2, Math.min(settings.height ?? 720, 1080));
  const fps = 30;
  const frameDurUs = Math.round(1_000_000 / fps);

  const codec = await pickAvcCodec(width, height);
  const audioTrack = stream.getAudioTracks()[0];
  const Processor = audioTrack ? getMediaStreamTrackProcessor() : null;

  let peekedFirstAudio: AudioData | null = null;
  let audioReader: ReadableStreamDefaultReader<AudioData> | null = null;

  if (audioTrack && Processor) {
    try {
      const processor = new Processor({ track: audioTrack });
      audioReader = processor.readable.getReader();
      const { value, done } = await audioReader.read();
      if (!done && value) peekedFirstAudio = value;
    } catch {
      if (audioReader) {
        try {
          audioReader.releaseLock();
        } catch {
          /* ignore */
        }
        audioReader = null;
      }
      peekedFirstAudio = null;
    }
  }

  if (audioReader && !peekedFirstAudio) {
    try {
      audioReader.releaseLock();
    } catch {
      /* ignore */
    }
    audioReader = null;
  }

  const hadAudioInFile = peekedFirstAudio !== null;

  const target = new ArrayBufferTarget();
  const muxerOpts: ConstructorParameters<typeof Muxer<ArrayBufferTarget>>[0] = {
    target,
    video: {
      codec: 'avc',
      width,
      height,
      frameRate: fps,
    },
    fastStart: 'in-memory',
    firstTimestampBehavior: peekedFirstAudio ? 'cross-track-offset' : 'offset',
  };

  if (peekedFirstAudio) {
    muxerOpts.audio = {
      codec: 'aac',
      numberOfChannels: peekedFirstAudio.numberOfChannels,
      sampleRate: peekedFirstAudio.sampleRate,
    };
  }

  const muxer = new Muxer(muxerOpts);

  const videoEncoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => {
      console.error('VideoEncoder error', e);
    },
  });

  videoEncoder.configure({
    codec,
    width,
    height,
    bitrate: 2_000_000,
    framerate: fps,
    latencyMode: 'realtime',
    bitrateMode: 'variable',
  });

  let audioEncoder: AudioEncoder | null = null;
  if (peekedFirstAudio) {
    audioEncoder = new AudioEncoder({
      output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
      error: (e) => console.error('AudioEncoder error', e),
    });
    audioEncoder.configure({
      codec: 'mp4a.40.2',
      numberOfChannels: peekedFirstAudio.numberOfChannels,
      sampleRate: peekedFirstAudio.sampleRate,
      bitrate: 96_000,
    });
  }

  const wallStart = performance.now();
  const video = document.createElement('video');
  video.srcObject = stream;
  video.muted = true;
  video.playsInline = true;
  video.setAttribute('playsinline', 'true');
  await video.play();

  let frameIndex = 0;
  let pendingVfc = 0;

  const runVideo = (): Promise<void> =>
    new Promise((resolve, reject) => {
      const finish = () => {
        signal?.removeEventListener('abort', onAbort);
        try {
          video.cancelVideoFrameCallback(pendingVfc);
        } catch {
          /* ignore */
        }
        resolve();
      };

      const onAbort = () => finish();
      signal?.addEventListener('abort', onAbort, { once: true });

      const onFrame = async () => {
        if (signal?.aborted) {
          finish();
          return;
        }
        if (performance.now() - wallStart >= maxMs) {
          finish();
          return;
        }
        try {
          await waitEncodeQueue(videoEncoder);
          const bitmap = await createImageBitmap(video);
          const ts = frameIndex * frameDurUs;
          const frame = new VideoFrame(bitmap, {
            timestamp: ts,
            duration: frameDurUs,
          });
          bitmap.close();
          const keyFrame = frameIndex % (fps * 2) === 0;
          videoEncoder.encode(frame, { keyFrame });
          frame.close();
          frameIndex += 1;
        } catch (e) {
          signal?.removeEventListener('abort', onAbort);
          try {
            video.cancelVideoFrameCallback(pendingVfc);
          } catch {
            /* ignore */
          }
          reject(e);
          return;
        }
        pendingVfc = video.requestVideoFrameCallback(onFrame);
      };
      pendingVfc = video.requestVideoFrameCallback(onFrame);
    });

  const runAudio = async (): Promise<void> => {
    if (!audioEncoder || !audioReader) return;
    let data: AudioData | null = peekedFirstAudio;
    try {
      while (data) {
        if (signal?.aborted || performance.now() - wallStart >= maxMs) break;
        audioEncoder.encode(data);
        const prev = data;
        data = null;
        prev.close();
        const next = await audioReader.read();
        if (next.done) break;
        data = next.value ?? null;
      }
      await audioEncoder.flush();
    } finally {
      try {
        audioReader.releaseLock();
      } catch {
        /* ignore */
      }
    }
  };

  try {
    await Promise.all([runVideo(), runAudio()]);
    await videoEncoder.flush();
    muxer.finalize();
  } finally {
    video.srcObject = null;
    video.remove();
    try {
      videoEncoder.close();
    } catch {
      /* ignore */
    }
    try {
      audioEncoder?.close();
    } catch {
      /* ignore */
    }
  }

  const durationMs = Math.min(Math.round(performance.now() - wallStart), maxMs);
  const buffer = target.buffer;
  const blob = new Blob([buffer], { type: 'video/mp4' });
  return {
    blob,
    meta: {
      durationMs,
      mimeType: 'video/mp4',
      encoder: 'webcodecs',
      hadAudio: hadAudioInFile,
    },
  };
}
