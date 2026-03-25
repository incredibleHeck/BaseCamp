# Demo prototype readiness fixes

**Goal:** Stabilize and polish the app for a demo: Teacher Directory, manual entry, roster data, docs, naming, defensive UI, Firestore index.

## 1. Staff Directory

Avoid “under construction” on the headteacher tab.

- **A (recommended):** Add `StaffDirectory.tsx` with mock/demo teacher data; wire `App.tsx` `case 'staff-directory'`.
- **B:** Remove the tab for the demo.

## 2. Manual entry assessment

Manual path had no image → analysis effect did not run.

- **A:** Add `analyzeManualEntry` in `aiPrompts.ts` and wire `AnalysisResults` + `App` props for rubric/observations.
- **B:** Hide or disable Manual Entry for demo only.

## 3. Class roster: stable data

Replace `Math.random()` with data from Firestore assessments where possible, plus deterministic fallbacks (e.g. `getAssessmentSummaryByStudent`).

## 4. README and `.env.example`

- Document `VITE_GEMINI_API_KEY` and Firebase `VITE_*` variables consistently.

## 5. `package.json` name

Use a project-specific name (e.g. `basecamp-diagnostics`).

## 6. AnalysisResults fallbacks

Ensure fallback `data` includes `lessonPlan` shape so UI never reads undefined.

## 7. Firestore composite index

`assessments` queries with `studentId` + `orderBy('timestamp')` need a composite index; document in README or add `firestore.indexes.json`.

## 8. Optional

- File upload wiring in AssessmentSetup.
- “Generate 5-Minute Remedial Activity” UX clarity.

## Implementation order

| Step | Task |
| ---- | ---- |
| 1 | README + env + package name + index note |
| 2 | AnalysisResults `lessonPlan` fallback |
| 3 | Staff Directory component or remove tab |
| 4 | Assessment summary + ClassRoster |
| 5 | Manual entry AI path or hide manual |

## Summary

Must-fix: Teacher Directory (or hide), Manual Entry (or hide), roster stability, env/docs, index note, AnalysisResults fallbacks.

## Source

Derived from `.cursor/plans/demo_prototype_readiness_fixes_*.plan.md`.
