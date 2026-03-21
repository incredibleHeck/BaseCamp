/**
 * Phase 4 fine-tuning pilot: when enabled, gap-tag suggestion uses a "compact local-style"
 * system prompt to simulate a smaller fine-tuned head (still same API endpoint — demo only).
 */
export type GapTagPilotMode = 'api_default' | 'mock_local_head';

export function getGapTagPilotMode(): GapTagPilotMode {
  return import.meta.env.VITE_FT_PILOT_GAP_TAGS === '1' ? 'mock_local_head' : 'api_default';
}
