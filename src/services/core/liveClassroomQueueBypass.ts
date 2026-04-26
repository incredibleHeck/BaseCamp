export type LiveClassroomQueueBypassPayload = Omit<
  import('./offlineQueueService').QueuedAssessment,
  'id' | 'timestamp'
>;

export type LiveClassroomQueueBypassHandler = (payload: LiveClassroomQueueBypassPayload) => void;

let bypassHandler: LiveClassroomQueueBypassHandler | null = null;

/** Register RTDB (or other) dispatch for Sprint 2.2+; `null` clears. */
export function setLiveClassroomQueueBypassHandler(fn: LiveClassroomQueueBypassHandler | null): void {
  bypassHandler = fn;
}

/**
 * Invoked when routing bypasses IndexedDB. No-op until a handler is registered
 * (optional dev log when unset).
 */
export function dispatchLiveClassroomQueueBypass(payload: LiveClassroomQueueBypassPayload): void {
  if (bypassHandler) {
    bypassHandler(payload);
    return;
  }
  if (import.meta.env.DEV) {
    console.debug(
      '[liveClassroomQueueBypass] bypass (IndexedDB skipped); handler not set — register in Sprint 2.2 (RTDB)',
      { inputMode: payload.inputMode, assessmentType: payload.assessmentType }
    );
  }
}
