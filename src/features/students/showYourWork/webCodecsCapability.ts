/**
 * Capability checks for the WebCodecs + mp4-muxer recording path (e.g. hardware AVC on iPad Safari).
 */

export function hasRequestVideoFrameCallback(): boolean {
  return typeof HTMLVideoElement !== 'undefined' && 'requestVideoFrameCallback' in HTMLVideoElement.prototype;
}

export async function canUseWebCodecsRecording(): Promise<boolean> {
  if (typeof VideoEncoder === 'undefined' || typeof VideoFrame === 'undefined') return false;
  if (!hasRequestVideoFrameCallback()) return false;
  try {
    for (const codec of ['avc1.42E01E', 'avc1.4d001e'] as const) {
      const { supported } = await VideoEncoder.isConfigSupported({
        codec,
        width: 1280,
        height: 720,
        bitrate: 1_500_000,
        framerate: 30,
      });
      if (supported) return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function pickAvcCodec(width: number, height: number): Promise<string> {
  for (const codec of ['avc1.42E01E', 'avc1.4d001e', 'avc1.640028'] as const) {
    const { supported } = await VideoEncoder.isConfigSupported({
      codec,
      width,
      height,
      bitrate: 2_000_000,
      framerate: 30,
    });
    if (supported) return codec;
  }
  throw new Error('No supported AVC codec for this device');
}
