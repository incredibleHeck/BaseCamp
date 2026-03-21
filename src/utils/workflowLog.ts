/**
 * Browser-console workflow traces for diagnosis / assessment flows.
 * Look for prefix [BaseCamp:workflow] in DevTools Console.
 *
 * Optional: set localStorage basecampWorkflowDebug=1 then reload for extra detail.
 */
const TAG = '[BaseCamp:workflow]';

function isDebugVerbose(): boolean {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem('basecampWorkflowDebug') === '1';
  } catch {
    return false;
  }
}

export function logWorkflow(event: string, details?: Record<string, unknown>): void {
  if (typeof console === 'undefined' || typeof console.info !== 'function') return;
  if (details && Object.keys(details).length > 0) {
    console.info(TAG, event, details);
  } else {
    console.info(TAG, event);
  }
}

/** Only logs when localStorage key basecampWorkflowDebug is "1". */
export function logWorkflowDebug(event: string, details?: Record<string, unknown>): void {
  if (!isDebugVerbose() || typeof console === 'undefined' || typeof console.debug !== 'function') return;
  console.debug(`${TAG}:debug`, event, details ?? {});
}
