# BaseCamp Diagnostics — project state

Snapshot of the **BaseCamp** (basecamp-diagnostics) web app: purpose, features, and **`src/`** layout.  
Generated as documentation; update this file when major structure or features change.

---

## Overview

**BaseCamp Diagnostics** is a React + Vite + TypeScript application for Ghana GES–aligned classroom diagnostics: AI-assisted worksheet analysis, learner profiles, offline queuing, voice observations, and role-based dashboards (teacher through district / SEN / enterprise views).  

- **UI:** React 19, Tailwind (via Vite), Lucide icons  
- **Backend / data:** Firebase (Auth + Firestore per [`src/lib/firebase.ts`](src/lib/firebase.ts))  
- **AI:** Google Gemini via [`src/services/aiPrompts/`](src/services/aiPrompts/)  
- **Offline:** IndexedDB helpers (`idb-keyval`) for diagnosis and voice observation queues  
- **Math in UI:** KaTeX + `react-markdown` / `remark-math` / `rehype-katex` for worksheets and print paths  

Entry: [`src/main.tsx`](src/main.tsx) → [`src/App.tsx`](src/App.tsx).

---

## User roles and navigation (high level)

Roles are defined on user profile / header ([`src/components/Header.tsx`](src/components/Header.tsx)); nav visibility is gated by [`src/auth/enterpriseAccess.ts`](src/auth/enterpriseAccess.ts).

| Role | Typical focus |
|------|----------------|
| `teacher` | Class roster, new assessment (photo / manual / voice), pending analyses, student profiles |
| `headteacher` | School overview, teacher directory, playbook lift (if enabled) |
| `district` | District overview, risk map, playbooks |
| `circuit_supervisor` | Risk map–centric default view |
| `sen_coordinator` | SEN inbox, district context, risk map |
| `super_admin` | Full enterprise tools + pilot export |

Enterprise flags control tabs such as **Risk map**, **Playbook lift**, and **SEN inbox**.

---

## Feature areas (current)

### Authentication and shell

- Login ([`Login.tsx`](src/components/Login.tsx)), header, role-aware dashboard title  
- [`ErrorBoundary.tsx`](src/components/ErrorBoundary.tsx) wraps the main app layout  

### Teacher — assessment workflow

- **[`AssessmentSetup.tsx`](src/components/AssessmentSetup.tsx):** Student, assessment type (numeracy / literacy), dialect context; input modes:
  - **Photo upload** — multi-page images → AI worksheet analysis  
  - **Manual entry** — rubric + observations → AI analysis  
  - **Voice** — [`VoiceObservationRecorder.tsx`](src/components/VoiceObservationRecorder.tsx) queues audio; sync via [`useVoiceObservationSync`](src/hooks/useVoiceObservationSync.ts); post–voice flow continues to photo upload for worksheet AI when applicable  
- **[`AnalysisResults.tsx`](src/components/AnalysisResults.tsx)** + **[`useAnalysisFlow.ts`](src/hooks/useAnalysisFlow.ts):** Runs `analyzeWorksheet` / `analyzeWorksheetMultiple` / `analyzeManualEntry`, lesson regeneration, save to Firestore, SEN alert evaluation  
- **[`DiagnosticReportCard.tsx`](src/components/DiagnosticReportCard.tsx):** Report UI, lesson plan, SMS draft, save to profile  
- **[`FileUploadZone.tsx`](src/components/FileUploadZone.tsx):** File pick / camera path with [`imageCompression.ts`](src/utils/imageCompression.ts) where used  

### Offline diagnosis queue

- **[`offlineQueueService.ts`](src/services/offlineQueueService.ts)** + **[`useSyncManager.ts`](src/hooks/useSyncManager.ts):** Queue manual/upload assessments when offline; sync when online  
- **[`PendingAnalyses.tsx`](src/components/PendingAnalyses.tsx)**, **[`OfflineQueuedModal.tsx`](src/components/OfflineQueuedModal.tsx)**  

### Voice observations

- Queue: [`voiceObservationQueueService.ts`](src/services/voiceObservationQueueService.ts)  
- Persist / read: [`observationService.ts`](src/services/observationService.ts)  
- Transcription + analysis prompt: [`aiPrompts/voiceObservation.ts`](src/services/aiPrompts/voiceObservation.ts)  

### Class roster and students

- **[`ClassRoster.tsx`](src/components/ClassRoster.tsx)**, **[`AddStudentForm.tsx`](src/components/AddStudentForm.tsx)**  
- **[`studentService.ts`](src/services/studentService.ts)**  

### Student profile

- **[`StudentProfile.tsx`](src/components/StudentProfile.tsx):** Data vs **Action plan** toggle; analytical view + action plan (lesson / worksheet regeneration); PDF export; Phase 4 family card for teachers  
- **[`StudentProfileAnalyticalView.tsx`](src/components/StudentProfileAnalyticalView.tsx):** Longitudinal history, JHS readiness, neurodevelopment / SEN screening, mastery / gaps  
- **[`StudentProfileActionPlanView.tsx`](src/components/StudentProfileActionPlanView.tsx):** Gap-based interventions, worksheets  
- **[`WorksheetModal.tsx`](src/components/WorksheetModal.tsx):** Practice worksheet preview / print with markdown + math  
- **[`useStudentProfileData.ts`](src/hooks/useStudentProfileData.ts):** Aggregates history, gaps, worksheet cache keys, etc.  
- **[`Phase4FamilyConnectCard.tsx`](src/components/Phase4FamilyConnectCard.tsx):** Family / WhatsApp–style engagement (Phase 4)  
- **[`pdfExport.ts`](src/utils/pdfExport.ts)**, **[`printUtils.tsx`](src/utils/printUtils.tsx)**  

### Enterprise / analytics

- **[`DistrictOverview.tsx`](src/components/DistrictOverview.tsx)**, **[`SchoolOverview.tsx`](src/components/SchoolOverview.tsx)**  
- **[`CircuitHeatmapPanel.tsx`](src/components/CircuitHeatmapPanel.tsx):** Geographic / circuit risk visualization  
- **[`PlaybookLiftLeaderboard.tsx`](src/components/PlaybookLiftLeaderboard.tsx)**, **[`SenAlertsInbox.tsx`](src/components/SenAlertsInbox.tsx)**  
- **[`enterpriseAnalyticsService.ts`](src/services/enterpriseAnalyticsService.ts)**, **[`playbookAnalyticsService.ts`](src/services/playbookAnalyticsService.ts)**, **[`senAlertService.ts`](src/services/senAlertService.ts)**  
- **[`TeacherDirectory.tsx`](src/components/TeacherDirectory.tsx)** (headteacher)  
- **[`FineTunePilotPanel.tsx`](src/components/FineTunePilotPanel.tsx)** + **[`fineTunePilotService.ts`](src/services/fineTunePilotService.ts)** (super_admin)  

### Student portal / parent ecosystem (supporting services)

- **[`StudentPortalApp.tsx`](src/components/StudentPortalApp.tsx)** (entry for portal UX when routed)  
- **[`portalSessionService.ts`](src/services/portalSessionService.ts)**, **[`parentDigestService.ts`](src/services/parentDigestService.ts)**, **[`whatsappConnectService.ts`](src/services/whatsappConnectService.ts)**  
- AI helpers in **[`aiPrompts/phase4Ecosystem.ts`](src/services/aiPrompts/phase4Ecosystem.ts)**  

### Curriculum / RAG

- **[`gesRagService.ts`](src/services/gesRagService.ts):** GES context retrieval for analysis prompts  
- Pilot / demo data: **[`data/gesCurriculumPilot.ts`](src/data/gesCurriculumPilot.ts)**, **[`data/demoCircuitMap.ts`](src/data/demoCircuitMap.ts)**  

### Config and utilities

- **[`config/academicContext.ts`](src/config/academicContext.ts)**, **[`config/organizationDefaults.ts`](src/config/organizationDefaults.ts)**, **[`config/featureFlags.ts`](src/config/featureFlags.ts)**  
- **[`workflowLog.ts`](src/utils/workflowLog.ts):** Console workflow traces (`[BaseCamp:workflow]`; optional `localStorage.basecampWorkflowDebug=1`)  
- **[`gradebookExport.ts`](src/services/gradebookExport.ts)**, **[`playbookKey.ts`](src/utils/playbookKey.ts)**  

---

## `src/` directory structure

```
src/
├── main.tsx                 # React root
├── App.tsx                  # Routes/views, auth, teacher tabs, assessment layout
├── index.css                # Global styles (Tailwind)
├── vite-env.d.ts
│
├── auth/
│   └── enterpriseAccess.ts  # Role-based nav flags and default views
│
├── components/              # UI components (screens, cards, modals)
│   ├── AddStudentForm.tsx
│   ├── AnalysisResults.tsx
│   ├── AssessmentSetup.tsx
│   ├── ClassRoster.tsx
│   ├── CircuitHeatmapPanel.tsx
│   ├── DiagnosticReportCard.tsx
│   ├── DistrictOverview.tsx
│   ├── ErrorBoundary.tsx
│   ├── FileUploadZone.tsx
│   ├── FineTunePilotPanel.tsx
│   ├── Header.tsx
│   ├── Login.tsx
│   ├── OfflineQueuedModal.tsx
│   ├── PendingAnalyses.tsx
│   ├── Phase4FamilyConnectCard.tsx
│   ├── PlaybookLiftLeaderboard.tsx
│   ├── SchoolOverview.tsx
│   ├── SenAlertsInbox.tsx
│   ├── StudentPortalApp.tsx
│   ├── StudentProfile.tsx
│   ├── StudentProfileActionPlanView.tsx
│   ├── StudentProfileAnalyticalView.tsx
│   ├── TeacherDirectory.tsx
│   ├── VoiceObservationRecorder.tsx
│   ├── WorksheetModal.tsx
│   └── …
│
├── config/
│   ├── academicContext.ts
│   ├── featureFlags.ts
│   └── organizationDefaults.ts
│
├── data/
│   ├── demoCircuitMap.ts
│   └── gesCurriculumPilot.ts
│
├── hooks/
│   ├── useAnalysisFlow.ts
│   ├── useStudentProfileData.ts
│   ├── useSyncManager.ts
│   └── useVoiceObservationSync.ts
│
├── lib/
│   └── firebase.ts          # Firebase app + exports
│
├── services/                # API, Firestore, AI, queues
│   ├── assessmentService.ts
│   ├── aiPrompts/           # Gemini prompts & analysis (modular)
│   │   ├── index.ts
│   │   ├── geminiClient.ts
│   │   ├── types.ts
│   │   ├── utils.ts
│   │   ├── worksheetAnalysis.ts
│   │   ├── worksheetGeneration.ts
│   │   ├── lessonPlan.ts
│   │   ├── voiceObservation.ts
│   │   ├── senAnalysis.ts
│   │   └── phase4Ecosystem.ts
│   ├── enterpriseAnalyticsService.ts
│   ├── fineTunePilotService.ts
│   ├── gesRagService.ts
│   ├── gradebookExport.ts
│   ├── observationService.ts
│   ├── offlineQueueService.ts
│   ├── parentDigestService.ts
│   ├── playbookAnalyticsService.ts
│   ├── portalSessionService.ts
│   ├── senAlertService.ts
│   ├── studentService.ts
│   ├── voiceObservationQueueService.ts
│   └── whatsappConnectService.ts
│
└── utils/
    ├── imageCompression.ts
    ├── pdfExport.ts
    ├── playbookKey.ts
    ├── printUtils.tsx
    ├── studentProfileHelpers.tsx
    └── workflowLog.ts
```

### Note on generated / optional paths

- `package.json` may reference `@dataconnect/generated` via `file:src/dataconnect-generated`; that folder may be present only in some clones or after codegen. It is not listed in the glob snapshot used for this doc.

---

## Scripts (from `package.json`)

| Script | Purpose |
|--------|---------|
| `npm run dev` | Vite dev server (port 3000, host 0.0.0.0) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | `tsc --noEmit` |

---

## Related docs in repo

- [`docs/`](docs/) — implementation trackers, phase plans  
- [`POST_PITCH_REFACTOR.md`](POST_PITCH_REFACTOR.md) — refactor notes (if present)  

---

*Last documented from repository layout and source scan; adjust manually after large refactors.*
