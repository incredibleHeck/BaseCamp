export type ShowYourWorkMeta = {
  durationMs: number;
  mimeType: string;
  encoder: 'webcodecs' | 'ffmpeg';
  hadAudio: boolean;
};

export const SHOW_YOUR_WORK_MAX_MS = 15_000;
