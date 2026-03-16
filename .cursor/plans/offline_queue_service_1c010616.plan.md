---
name: Offline Queue Service
overview: Create a new offline queue service using idb-keyval to persist assessment payloads (including base64 images) when the user is offline, with robust error handling to prevent app crashes if IndexedDB is restricted.
todos: []
isProject: false
---

# Offline Queue Service Implementation

## Summary

Add `idb-keyval` as a dependency and create `[src/services/offlineQueueService.ts](src/services/offlineQueueService.ts)` with a `QueuedAssessment` interface and four exported functions for queue management. All operations will be wrapped in try/catch with `console.error` to gracefully handle IndexedDB restrictions (e.g., private browsing, storage quota exceeded).

## 1. Add Dependency

Add `idb-keyval` to `package.json`:

```json
"idb-keyval": "^6.2.2"
```

Then run `npm install`.

## 2. Create `src/services/offlineQueueService.ts`

**Interface:**

```ts
export interface QueuedAssessment {
  id: string;
  studentId: string;
  subject: string;
  imageBase64: string;
  dialectContext: string;
  timestamp: number;
}
```

**Store key:** `'basecamp-offline-queue'`

**Implementation approach:**

- `**addToQueue(item)`**: Use `update()` to atomically append a new item. Generate `id` via `crypto.randomUUID()` (or `Date.now().toString()` fallback) and `timestamp` via `Date.now()`.
- `**getQueue()`**: Use `get()` to retrieve the array; return `[]` if undefined.
- `**removeFromQueue(id)**`: Use `update()` to filter out the item with matching `id`.
- `**clearQueue()**`: Use `set()` with an empty array.

**Error handling:** Wrap each function body in `try/catch`, log with `console.error`, and either rethrow (for `addToQueue`, `removeFromQueue`, `clearQueue`) or return `[]` (for `getQueue`) on failure so the app does not crash.

**idb-keyval usage:**

```ts
import { get, set, update } from 'idb-keyval';
```

The `update` callback receives the current value (or `undefined` if the key does not exist) and returns the new value. This avoids race conditions when multiple operations run concurrently.

## 3. Data Flow (Reference)

```mermaid
flowchart LR
    subgraph App [App Layer]
        Add[addToQueue]
        Get[getQueue]
        Remove[removeFromQueue]
        Clear[clearQueue]
    end
    subgraph IDB [IndexedDB via idb-keyval]
        Store["basecamp-offline-queue"]
    end
    Add -->|update| Store
    Get -->|get| Store
    Remove -->|update| Store
    Clear -->|set []| Store
```



## 4. Integration Note

This service is standalone. Future integration points (not in scope for this task):

- Call `addToQueue` when the user submits an assessment while offline (e.g., in `[App.tsx](src/App.tsx)` or assessment flow).
- Use `getQueue` to display pending items and retry when back online.
- Call `removeFromQueue` after a successful sync.

## Files to Create/Modify


| File                                                                         | Action                      |
| ---------------------------------------------------------------------------- | --------------------------- |
| `[package.json](package.json)`                                               | Add `idb-keyval` dependency |
| `[src/services/offlineQueueService.ts](src/services/offlineQueueService.ts)` | Create (new file)           |


