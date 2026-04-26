import { onObjectFinalized } from 'firebase-functions/v2/storage';
import type { SecretParam } from 'firebase-functions/params';
import * as logger from 'firebase-functions/logger';
import { parseShowYourWorkUpload } from './lib/showYourWorkObject.js';
import { processShowYourWorkVideo } from './lib/processShowYourWorkVideo.js';

/**
 * Aligned with MAX_INLINE_VIDEO_BYTES in showYourWorkGemini.ts (base64 inline limit).
 * Rejecting at the trigger level avoids wasted download + compute for oversized files.
 */
const MAX_OBJECT_BYTES = 12 * 1024 * 1024;

type RegionOption = string;

type CreateOptions = {
  /** When set, only this bucket triggers the function (must match client `storageBucket`). */
  bucket?: string;
  geminiApiKey: SecretParam;
};

/**
 * Fires when a portal "Show your work" MP4 is finalized. Validates path/size, then
 * downloads, runs Gemini multimodal analysis, and writes `showYourWorkInsights`.
 */
export function createOnShowYourWorkVideoFinalized(region: RegionOption, opts: CreateOptions) {
  return onObjectFinalized(
    {
      region,
      memory: '4GiB',
      timeoutSeconds: 540,
      cpu: 2,
      concurrency: 80,
      secrets: [opts.geminiApiKey],
      ...(opts.bucket ? { bucket: opts.bucket } : {}),
    },
    async (event) => {
      const data = event.data;
      const name = data.name;
      const parsed = parseShowYourWorkUpload(name);
      if (!parsed) {
        return;
      }

      const size = typeof data.size === 'string' ? Number(data.size) : Number(data.size ?? 0);
      if (!Number.isFinite(size) || size < 1) {
        logger.warn('onShowYourWorkVideoFinalized: missing or invalid size', { name, rawSize: data.size });
        return;
      }
      if (size > MAX_OBJECT_BYTES) {
        logger.warn('onShowYourWorkVideoFinalized: object over max bytes', {
          studentId: parsed.studentId,
          name,
          size,
          maxBytes: MAX_OBJECT_BYTES,
        });
        return;
      }

      const encoder =
        data.metadata && typeof data.metadata.encoder === 'string' ? data.metadata.encoder : undefined;

      logger.info('onShowYourWorkVideoFinalized: accepted', {
        studentId: parsed.studentId,
        bucket: event.bucket,
        name,
        size,
        contentType: data.contentType ?? null,
        encoder: encoder ?? null,
      });

      const apiKey = opts.geminiApiKey.value()?.trim();
      if (!apiKey) {
        logger.error('onShowYourWorkVideoFinalized: GEMINI_API_KEY secret is empty');
        return;
      }

      await processShowYourWorkVideo({
        apiKey,
        bucket: event.bucket,
        objectName: name,
        studentId: parsed.studentId,
        contentType: data.contentType,
        sizeBytes: size,
        storageGeneration: data.generation,
        encoder,
      });
    },
  );
}
