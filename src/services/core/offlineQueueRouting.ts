/**
 * Pure routing for Premium live classroom vs legacy IndexedDB offline queue.
 * @see PREMIUM_ARCHITECTURE_PLAN.md (queue bypass / dependency inversion)
 */

export type OfflineQueuePayloadChannel = 'standard_assessment' | 'live_classroom_ephemeral';

export type OfflineQueueRoutingInput = {
  isPremiumTier: boolean;
  isLiveSessionActive: boolean;
  channel: OfflineQueuePayloadChannel;
};

/**
 * When true, the payload should be written to IndexedDB. When false, use the
 * live-classroom direct path (RTDB in Sprint 2.2) and do not touch IndexedDB.
 */
export function shouldEnqueueToIndexedDb(args: OfflineQueueRoutingInput): boolean {
  if (!args.isPremiumTier) return true;
  if (args.channel === 'standard_assessment') return true;
  if (!args.isLiveSessionActive) return true;
  return false;
}

export function describeOfflineQueueRoute(args: OfflineQueueRoutingInput): 'indexeddb' | 'bypass' {
  return shouldEnqueueToIndexedDb(args) ? 'indexeddb' : 'bypass';
}
