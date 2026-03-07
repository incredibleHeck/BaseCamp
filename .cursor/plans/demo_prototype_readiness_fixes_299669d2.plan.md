---
name: Demo prototype readiness fixes
overview: "Address all fixable issues from the audit so the app is stable and presentable for a demo: Teacher Directory, Manual Entry flow, roster stability, docs/config, naming, defensive UI, and Firestore index."
todos: []
isProject: false
---

# Demo Prototype Readiness Fixes

## 1. Teacher Directory (avoid "under construction" in demo)

**Options:**

- **A (recommended):** Add a minimal **Teacher Directory** view so the headteacher tab is not dead. Reuse the same pattern as [SchoolOverview](src/components/SchoolOverview.tsx): a new component that accepts optional props with default mock data (e.g. list of teachers: name, class, contact, status). Render it in [App.tsx](src/App.tsx) in the `renderContent()` switch for `case 'teacher-directory'` and keep the existing NavTab.
- **B:** Remove the Teacher Directory tab for the demo so it cannot be clicked (delete the `NavTab` for headteacher and the `'teacher-directory'` branch in the switch).

**Implementation for A:** Create `src/components/TeacherDirectory.tsx` with a simple table/card list (e.g. Teacher Name, Class, Email/Contact, Last Active) using static demo data. Import and render in App.tsx for `currentView === 'teacher-directory'`.

---

## 2. Manual Entry assessment path (no AI run today)

Today, when the user chooses "Manual Entry", fills rubrics/observations, and clicks "Run AI Diagnosis", [AnalysisResults](src/components/AnalysisResults.tsx) only runs the analysis in the `useEffect` when `status === 'analyzing' && imageBase64 && assessmentType`. So with no image, the effect never runs and the panel stays in "Analyzing..." or empty.

**Options:**

- **A (recommended for demo):** Add a **text-only analysis path**. In [aiPrompts.ts](src/services/aiPrompts.ts), add a new function (e.g. `analyzeManualEntry(assessmentType, dialectContext, manualRubrics: string[], observations: string)`) that calls Gemini with a text prompt (no image) and returns the same `DiagnosticReport` shape. In [AnalysisResults.tsx](src/components/AnalysisResults.tsx), extend the `useEffect` (or add a second effect): when `status === 'analyzing'` and we have `assessmentType` but no `imageBase64`, and we have `manualRubrics`/`observations` from a new prop (passed from App from `lastAssessmentData`), call `analyzeManualEntry` instead of `analyzeWorksheet`. Wire `lastAssessmentData.manualRubric` and `lastAssessmentData.observations` from [App.tsx](src/App.tsx) into `AnalysisResults` so the manual path receives them.
- **B:** For demo-only, **hide or disable** the "Manual Entry" mode in [AssessmentSetup.tsx](src/components/AssessmentSetup.tsx) (e.g. only show "Photo Upload" or disable the manual button and show a tooltip "Demo: use photo upload"). No backend change.

Choose A for a complete demo of both flows; choose B for the fastest fix.

---

## 3. Class roster: stable, non-random data

In [ClassRoster.tsx](src/components/ClassRoster.tsx), `readinessScore`, `lastAssessmentDate`, and `criticalGap` are set with `Math.random()` per student, so they change on every refresh.

**Approach:** Derive roster row data from real assessments where possible, and use deterministic fallbacks otherwise.

- In [assessmentService.ts](src/services/assessmentService.ts), add a function (e.g. `getAssessmentSummaryByStudent(): Promise<Map<string, { lastDate: number; count: number; lastDiagnosis: string | null }>>`) that:
  - Reads all documents from the `assessments` collection (e.g. `getDocs(collection(db, 'assessments'))`; for a demo-sized DB this is acceptable).
  - Groups by `studentId`, keeps the latest timestamp and last diagnosis, and counts assessments per student.
- In [ClassRoster.tsx](src/components/ClassRoster.tsx), in the same `useEffect` that fetches students:
  - Call `getStudents()` and `getAssessmentSummaryByStudent()` (in parallel or sequentially).
  - For each student, if the summary has that studentId: set `lastAssessmentDate` from the latest timestamp (e.g. "X days ago" or "Today"), set `readinessScore` to a deterministic value derived from count (e.g. `Math.min(100, 40 + assessmentCount * 12)`), set `criticalGap` from `lastDiagnosis` (or a short substring) or null.
  - For students with no assessments, use **deterministic** values: e.g. `readinessScore = 50`, `lastAssessmentDate = 'No assessment yet'`, `criticalGap = null`. Optionally use a hash of `student.id` to assign a stable fake score (e.g. 45–65) so new students are not all identical.
- Update `handleStudentAdded` to use the same deterministic fallback for the new student (e.g. readiness 50, "Just now", null gap).

This removes randomness and makes the roster stable and consistent with saved assessments.

---

## 4. README and .env.example alignment

- **README:** In [README.md](README.md), replace `GEMINI_API_KEY` with `VITE_GEMINI_API_KEY` and point to the same env file (e.g. `.env.local`). Add a short "Firebase" section: set `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID` so the app runs with Auth and Firestore.
- **.env.example:** In [.env.example](.env.example), add placeholder lines for all Firebase variables listed in [firebase.ts](src/lib/firebase.ts), with a comment that they are required for auth and data. Keep `VITE_GEMINI_API_KEY`.

---

## 5. package.json name

In [package.json](package.json), change `"name": "react-example"` to a project-specific name (e.g. `"basecamp-diagnostics"` or `"basecamp-demo"`).

---

## 6. AnalysisResults: defensive fallbacks for report data

In [AnalysisResults.tsx](src/components/AnalysisResults.tsx), the fallback `data` object (when `reportData` is null) does not include `lessonPlan`. The UI uses `data.lessonPlan?.title` and `data.lessonPlan?.instructions`; if the API sometimes omits `lessonPlan`, the type and runtime shape should still be safe.

- Extend the fallback object (the one used when `reportData` is null) to include `lessonPlan: { title: 'No lesson plan', instructions: [] }` so the UI always has a defined structure.
- Ensure the `DiagnosticReport` type used in that component (or the spread from the API result) explicitly allows `lessonPlan` to be optional and that the "Generate 5-Minute Remedial Activity" block uses fallbacks for `title` and `instructions` (you already have fallback instructions in the JSX; ensure the fallback `data` matches so there are no undefined accesses).

---

## 7. Firestore composite index (avoid runtime error)

[assessmentService.ts](src/services/assessmentService.ts) uses `where('studentId', '==', studentId)` with `orderBy('timestamp', 'desc')`. Firestore requires a composite index for this query.

- Add a `firestore.indexes.json` in the project root (or in a `firebase` folder) with the required index for collection `assessments`, fields `studentId` (Ascending) and `timestamp` (Descending), and document in README that "First run may require deploying Firestore indexes" or "If you see an index error, create the index via the link in the error message."
- Alternatively, skip the file and only add one short sentence in README: e.g. "For student assessment history, ensure a composite index exists on `assessments` (studentId, timestamp descending) — Firebase Console will prompt with a link if missing."

---

## 8. Optional / minor

- **FileUploadZone / AssessmentSetup:** AssessmentSetup does not use `onFileReadyChange`. Wiring it is optional; leaving as-is is fine for the demo.
- **"Generate 5-Minute Remedial Activity" button:** Currently a 2s delay then reveals the plan already in the API response. Acceptable for demo; no change required unless you want to add a small label like "Reveal plan" for clarity.

---

## Implementation order


| Step | Task                                                                                                                         | Deps |
| ---- | ---------------------------------------------------------------------------------------------------------------------------- | ---- |
| 1    | README + .env.example + package.json name + Firestore index note                                                             | None |
| 2    | AnalysisResults fallback `lessonPlan` and defensive handling                                                                 | None |
| 3    | Teacher Directory: new component + App.tsx case (or remove tab)                                                              | None |
| 4    | assessmentService: `getAssessmentSummaryByStudent`; ClassRoster: use it + deterministic fallbacks                            | None |
| 5    | Manual Entry: either wire text-only AI path (aiPrompts + AnalysisResults + App props) or hide manual mode in AssessmentSetup | None |


No strict dependency between 3, 4, and 5; they can be done in any order after 1–2.

---

## Summary

- **Must-fix for demo:** Teacher Directory (implement or hide), Manual Entry (fix or hide), roster stability (real + deterministic data), README/env/package name, Firestore index note, AnalysisResults fallbacks.
- **Choice:** Teacher Directory = minimal view vs hide tab; Manual Entry = text-only AI vs hide for demo.
- After these, the app will have no "under construction" click, no broken manual flow (or no manual option), stable roster numbers, and clear setup instructions with correct env var names.

