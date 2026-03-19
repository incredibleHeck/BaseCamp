---
name: Fix offline diagnosis queue
overview: Prevent AI diagnosis from running while offline; queue requests locally (multi-student, multi-page, manual entry), show an offline-queued modal, and auto-run queued analyses when internet returns (silent save + completion toast/banner).
todos:
  - id: queue-schema
    content: Extend `QueuedAssessment` to include upload multi-page and manual-entry payloads.
    status: completed
  - id: gate-diagnose
    content: Update `App.tsx` so offline diagnose enqueues + shows modal instead of setting `analysisStatus='analyzing'`.
    status: completed
  - id: sync-manager
    content: Wire `useSyncManager()` into app shell and add a small queued/syncing indicator plus completion toast/banner.
    status: completed
  - id: process-queue
    content: Update `useSyncManager.processQueue()` to run the right AI function per queued item type (single/multi/manual).
    status: completed
  - id: modal-ui
    content: Add modal UI copy/behavior for offline queuing and make it reusable/non-blocking.
    status: completed
  - id: unify-queues
    content: Unify or remove the legacy localStorage offline save path in `AnalysisResults.tsx` to avoid split queues.
    status: completed
isProject: false
---

