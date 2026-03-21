# Fix offline diagnosis queue

## Overview

Prevent AI diagnosis from running while the teacher is offline. Instead, **enqueue** assessment payloads locally, show a modal explaining that analysis will run when internet is available, and **automatically process** the queue when connectivity returns (save completed assessments to profiles, with optional completion feedback).

Supports **multiple students**, **multi-page photo uploads**, and **manual entry** paths.

## Problem (root cause)

1. **Diagnosis always started online-style**: `handleDiagnose` in `App.tsx` set `analysisStatus` to `'analyzing'` whenever the user clicked “Run AI Diagnosis”, even when offline.
2. **`AnalysisResults` ignored offline state**: The effect that calls `analyzeWorksheet` / `analyzeWorksheetMultiple` / `analyzeManualEntry` ran whenever `status === 'analyzing'`, without checking offline mode or connectivity.
3. **Queue infrastructure existed but was not wired** to the diagnose flow: `offlineQueueService` and `useSyncManager` were not invoked from the same path as “Run AI Diagnosis”.

## Design decisions

- **Offline** when: manual **Offline** toggle is ON **or** the browser reports `navigator.onLine === false`.
- **Post-sync UX**: Prefer silent save to student profiles; optionally show a short banner/toast when queued work finishes.

## Implementation summary

### 1. Queue schema (`offlineQueueService`)

Extend `QueuedAssessment` to include:

- `inputMode`: `'upload' | 'manual'`
- **Upload**: `imageBase64s: string[]` (single-page = length 1)
- **Manual**: `manualRubric`, `observations` as needed
- `assessmentType`: `'numeracy' | 'literacy'`
- `dialectContext` optional

### 2. Gate diagnosis in `App.tsx`

- If offline: `addToQueue(...)`, **do not** set `analysisStatus` to `'analyzing'`; show modal; keep form usable.
- If online: keep existing behavior (`'analyzing'` → AI runs in `AnalysisResults`).

### 3. `useSyncManager`

- On connect / when processing: read queue, run the correct AI function per item (single image, multi-page, manual), then `saveAssessment` and `removeFromQueue` on success.
- Avoid duplicate queue mechanisms (remove or align legacy `localStorage` fallback paths).

### 4. Modal

- Component (e.g. `OfflineQueuedModal`) confirms queuing and sets expectations for multi-student queuing.

## Key files

| File | Role |
| ---- | ---- |
| `src/App.tsx` | Offline gate, enqueue, modal, sync hook usage |
| `src/services/offlineQueueService.ts` | IndexedDB queue CRUD |
| `src/hooks/useSyncManager.ts` | Process queue when online |
| `src/components/AnalysisResults.tsx` | Online AI calls; avoid conflicting offline save paths |
| `src/components/OfflineQueuedModal.tsx` | User messaging |

## Status

Implemented (see todos in `.cursor/plans/fix_offline_diagnosis_queue_*.plan.md`).
