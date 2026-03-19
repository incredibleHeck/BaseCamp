---
name: Pending analyses planning
overview: Fix stale queue count updates and add a teacher-facing Pending Analyses tab backed by IndexedDB queue data, including remove/retry actions and clearer queue status handling.
todos:
  - id: sync-refresh-api
    content: Extend useSyncManager state with refreshQueue and queuedItems, and centralize queue refresh logic.
    status: completed
  - id: refresh-after-enqueue
    content: Call refreshQueue after each successful addToQueue in offline diagnose flow.
    status: completed
  - id: pending-view-routing
    content: Add pending-analyses view to App navigation and render switch.
    status: completed
  - id: pending-component
    content: Create PendingAnalyses component with list, status badges, and remove/retry UI.
    status: completed
  - id: queue-actions
    content: Implement remove/retry handlers in App and wire to PendingAnalyses.
    status: completed
  - id: verify-queue-ux
    content: Validate queue count/list updates for enqueue, remove, retry, and auto-sync paths.
    status: completed
isProject: false
---

