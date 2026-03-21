# Pending analyses tab and queue refresh

## Overview

Fix **stale queue counts** (e.g. header showing `Queued: 0` right after enqueueing) and add a **Pending Analyses** teacher tab so teachers can see, remove, and manually retry queued work.

## Problem (root cause)

`queueLength` in `useSyncManager` was only updated:

- once on mount, and
- after `processQueue()` finished,

but **not** after `addToQueue(...)` in `App.tsx`. So the UI counter and modal could show `0` immediately after enqueueing two students.

## Implementation summary

### 1. Refreshable queue state (`useSyncManager`)

- Expose `refreshQueue(): Promise<void>` that reads `getQueue()` and updates both `queueLength` and `queuedItems`.
- Call `refreshQueue()` on mount, after `processQueue`, and whenever the app needs an up-to-date list.

### 2. Enqueue path (`App.tsx`)

- After successful `addToQueue(...)` in the offline branch of `handleDiagnose`, call `await refreshQueue()` before showing the offline modal.

### 3. Pending Analyses tab

- Add view key `pending-analyses` and a teacher nav tab **Pending Analyses**.
- New component lists queued items: student, assessment type, input mode, timestamp, badges for `Queued` / `Syncing`.
- Actions: **Remove** (per item), **Run now** (when online and not syncing).

### 4. Student names

- Load students via `getStudents()` and map `studentId` → name for display; fall back to ID if offline or not yet loaded.

### 5. Sync flicker

- Avoid toggling `isSyncing` when the queue is empty; use a ref guard to prevent re-entry thrash and unnecessary UI flicker.

## Key files

| File | Role |
| ---- | ---- |
| `src/hooks/useSyncManager.ts` | `refreshQueue`, `queuedItems`, stable `processQueue` |
| `src/App.tsx` | Refresh after enqueue, pending view, handlers |
| `src/components/PendingAnalyses.tsx` | List UI and actions |
| `src/components/Header.tsx` | Optional queued count badge |

## Status

Implemented (see todos in `.cursor/plans/pending_analyses_planning_*.plan.md`).
