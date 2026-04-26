# BaseCamp Diagnostics — project state

Snapshot of the **BaseCamp** (basecamp-diagnostics) web app: purpose, features, and **`src/`** layout.  
Generated as documentation; update this file when major structure or features change.

---

## Overview

**BaseCamp Diagnostics** is a React + Vite + TypeScript application for Ghana GES–aligned classroom diagnostics: AI-assisted worksheet analysis, learner profiles, offline queuing, voice observations, and role-based dashboards (teacher through school administrator / SEN / enterprise views).  

- **UI:** React 19, Tailwind (via Vite), Lucide icons  
- **Backend / data:** Firebase (Auth + Firestore per [`src/lib/firebase.ts`](src/lib/firebase.ts))  
- **AI:** Google Gemini via [`src/services/aiPrompts/`](src/services/aiPrompts/)  
- **Offline:** IndexedDB helpers (`idb-keyval`) for diagnosis and voice observation queues  
- **Math in UI:** KaTeX + `react-markdown` / `remark-math` / `rehype-katex` for worksheets and print paths  

Entry: [`src/main.tsx`](src/main.tsx) → [`src/App.tsx`](src/App.tsx).

---

## User roles and navigation (high level)

Roles are defined on user profile / header ([`src/components/layout/Header.tsx`](src/components/layout/Header.tsx)); nav visibility is gated by [`src/auth/enterpriseAccess.ts`](src/auth/enterpriseAccess.ts).

| Role | Typical focus |
|------|----------------|
| `teacher` | Class roster, new assessment (photo / manual / voice), pending analyses, student profiles |
| `headteacher` | School overview, teacher directory, playbook lift (if enabled) |
| `org_admin` | Organization / multi-branch admin: network dashboard, Campus Gap Analysis, playbooks |
| `school_admin` | Legacy role normalized to `org_admin` in app on read (Firestore may still store `school_admin`) |
| `circuit_supervisor` | MoE / regional pilot role; enterprise nav per [`enterpriseAccess.ts`](src/auth/enterpriseAccess.ts) when used |
| `sen_coordinator` | SEN inbox, regional context, Campus Gap Analysis (when `showCampusGapAnalysis` applies) |
| `super_admin` | Full enterprise tools + pilot export |

Enterprise flags control tabs such as **Campus Gap Analysis** (`showCampusGapAnalysis`), **Playbook lift**, and **SEN inbox**.

---

## Feature areas (current)

### Authentication and shell

- Login ([`Login.tsx`](src/components/Login.tsx)), header, role-aware dashboard title  
- [`ErrorBoundary.tsx`](src/components/layout/ErrorBoundary.tsx) wraps the main app layout  

### Teacher — assessment workflow

- **[`AssessmentSetup.tsx`](src/features/assessments/AssessmentSetup.tsx):** Student, assessment type (numeracy / literacy), dialect context; input modes:
  - **Photo upload** — multi-page images → AI worksheet analysis  
  - **Manual entry** — rubric + observations → AI analysis  
  - **Voice** — [`VoiceObservationRecorder.tsx`](src/features/ai-tools/VoiceObservationRecorder.tsx) queues audio; sync via [`useVoiceObservationSync`](src/hooks/useVoiceObservationSync.ts); post–voice flow continues to photo upload for worksheet AI when applicable  
- **[`AnalysisResults.tsx`](src/features/assessments/AnalysisResults.tsx)** + **[`useAnalysisFlow.ts`](src/hooks/useAnalysisFlow.ts):** Runs `analyzeWorksheet` / `analyzeWorksheetMultiple` / `analyzeManualEntry`, lesson regeneration, save to Firestore, SEN alert evaluation  
- **[`assessmentPipelineService.ts`](src/services/assessmentPipelineService.ts):** Core pipeline for processing and persisting assessments  
- **[`DiagnosticReportCard.tsx`](src/features/assessments/DiagnosticReportCard.tsx):** Report UI, lesson plan, SMS draft, save to profile  
- **[`FileUploadZone.tsx`](src/components/FileUploadZone.tsx):** File pick / camera path with [`imageCompression.ts`](src/utils/imageCompression.ts) where used  

### Offline diagnosis queue

- **[`offlineQueueService.ts`](src/services/offlineQueueService.ts)** + **[`useSyncManager.ts`](src/hooks/useSyncManager.ts):** Queue manual/upload assessments when offline; sync when online  
- **[`PendingAnalyses.tsx`](src/features/assessments/PendingAnalyses.tsx)**, **[`OfflineQueuedModal.tsx`](src/components/OfflineQueuedModal.tsx)**  

### Voice observations

- Queue: [`voiceObservationQueueService.ts`](src/services/voiceObservationQueueService.ts)  
- Persist / read: [`observationService.ts`](src/services/observationService.ts)  
- Transcription + analysis prompt: [`voiceObservation.ts`](src/services/ai/aiPrompts/voiceObservation.ts)  

### Class roster and students

- **[`ClassRoster.tsx`](src/features/students/ClassRoster.tsx)**, **[`AddStudentForm.tsx`](src/features/students/AddStudentForm.tsx)**, **[`CohortManager.tsx`](src/features/schools/CohortManager.tsx)**  
- **[`studentService.ts`](src/services/studentService.ts)**, **[`cohortService.ts`](src/services/cohortService.ts)**  

### Student profile

- **[`StudentProfile.tsx`](src/features/students/StudentProfile.tsx):** Data vs **Action plan** toggle; analytical view + action plan (lesson / worksheet regeneration); PDF export; Phase 4 family card for teachers  
- **[`StudentProfileAnalyticalView.tsx`](src/features/students/StudentProfileAnalyticalView.tsx):** Longitudinal history, JHS readiness, neurodevelopment / SEN screening, mastery / gaps  
- **[`StudentProfileActionPlanView.tsx`](src/features/students/StudentProfileActionPlanView.tsx):** Gap-based interventions, worksheets  
- **[`StudentRecordCard.tsx`](src/features/students/StudentRecordCard.tsx):** Editable student record (cohort, language, SEN, consent)  
- **[`WorksheetModal.tsx`](src/features/assessments/WorksheetModal.tsx):** Practice worksheet preview / print with markdown + math  
- **[`useStudentProfileData.ts`](src/hooks/useStudentProfileData.ts):** Aggregates history, gaps, worksheet cache keys, etc.  
- **[`Phase4FamilyConnectCard.tsx`](src/components/Phase4FamilyConnectCard.tsx):** Family / WhatsApp–style engagement (Phase 4)  

- **[`pdfExport.ts`](src/utils/pdfExport.ts)**, **[`printUtils.tsx`](src/utils/printUtils.tsx)**  

### Enterprise / analytics

- **[`OrganizationDashboard.tsx`](src/features/dashboards/OrganizationDashboard.tsx)** (school network overview), **[`NetworkBranchKPIs.tsx`](src/features/dashboards/NetworkBranchKPIs.tsx)**, **[`HeadmasterDashboard.tsx`](src/features/dashboards/HeadmasterDashboard.tsx)**  
- **[`CampusGapAnalysisPanel.tsx`](src/features/assessments/CampusGapAnalysisPanel.tsx):** Campus / branch **gap analysis** (Recharts + table; rollups from [`buildBranchGapRollups`](src/services/analytics/organizationAnalyticsService.ts)); shell view `org-admin-campus-gaps`  
- **[`PlaybookLiftLeaderboard.tsx`](src/features/dashboards/PlaybookLiftLeaderboard.tsx)**, **[`SenAlertsInbox.tsx`](src/features/sen-coordinator/SenAlertsInbox.tsx)**  
- **[`organizationAnalyticsService.ts`](src/services/analytics/organizationAnalyticsService.ts)** (`getNetworkMetrics`, `buildBranchGapRollups` / `BranchGapRollup` by `schoolId`, CSV export), **[`schoolAnalyticsService.ts`](src/services/schoolAnalyticsService.ts)**, **[`playbookAnalyticsService.ts`](src/services/playbookAnalyticsService.ts)**, **[`senAlertService.ts`](src/services/senAlertService.ts)**  
- **[`StaffDirectory.tsx`](src/features/schools/StaffDirectory.tsx)** (headteacher)  
- **[`FineTunePilotPanel.tsx`](src/features/ai-tools/FineTunePilotPanel.tsx)** + **[`fineTunePilotService.ts`](src/services/fineTunePilotService.ts)** (super_admin)  

Canonical org identifiers: **`organizationId`** on users, students, and schools (see [`types/domain.ts`](src/types/domain.ts), [`AuthContext.tsx`](src/context/AuthContext.tsx) for JWT `organizationId` with legacy `districtId` claim fallback).  

### Student portal / parent ecosystem (supporting services)

- **[`StudentPortalApp.tsx`](src/features/students/StudentPortalApp.tsx)** (entry for portal UX when routed)  
- **[`portalSessionService.ts`](src/services/portalSessionService.ts)**, **[`parentDigestService.ts`](src/services/parentDigestService.ts)**, **[`whatsappConnectService.ts`](src/services/whatsappConnectService.ts)**  
- AI helpers under **[`services/ai/aiPrompts/`](src/services/ai/aiPrompts/)** (e.g. phase 4 ecosystem prompts)  

### Curriculum / RAG

- **[`curriculumRagService.ts`](src/services/ai/curriculumRagService.ts):** GES + Cambridge curriculum context retrieval for analysis prompts  
- Pilot / demo data: **[`data/gesCurriculumPilot.ts`](src/data/gesCurriculumPilot.ts)**; demo school/circuit identifiers in **[`config/organizationDefaults.ts`](src/config/organizationDefaults.ts)** (`DEMO_SCHOOLS`, `DEMO_CIRCUITS`) for seeds and rollups only  

### Config and utilities

- **[`config/academicContext.ts`](src/config/academicContext.ts)**, **[`config/organizationDefaults.ts`](src/config/organizationDefaults.ts)**, **[`config/featureFlags.ts`](src/config/featureFlags.ts)**  
- **[`workflowLog.ts`](src/utils/workflowLog.ts):** Console workflow traces (`[BaseCamp:workflow]`; optional `localStorage.basecampWorkflowDebug=1`)  
- **[`gradebookExport.ts`](src/services/gradebookExport.ts)**, **[`playbookKey.ts`](src/utils/playbookKey.ts)**  

---

## `src/` directory structure

High-level layout (see repo for full file lists):

```
src/
├── main.tsx, App.tsx, index.css, vite-env.d.ts
├── auth/                    # enterpriseAccess.ts — RBAC / nav flags
├── components/              # Shared layout, UI primitives, Login, modals used across features
│   ├── layout/              # Header, LoggedInAppChrome, ErrorBoundary, …
│   ├── ui/                  # shadcn-style primitives
│   └── …
├── context/                 # e.g. AuthContext (token claims include organizationId)
├── features/                # Domain screens (primary location for dashboards & workflows)
│   ├── assessments/         # AssessmentSetup, AnalysisResults, CampusGapAnalysisPanel, …  
│   ├── dashboards/          # OrganizationDashboard, NetworkBranchKPIs, HeadmasterDashboard, PlaybookLiftLeaderboard, …
│   ├── schools/             # StaffDirectory, cohort/school directory, invites
│   ├── students/            # Class roster, StudentProfile, portal app, …
│   ├── sen-coordinator/     # SenAlertsInbox, SenDashboard
│   ├── ai-tools/            # FineTunePilotPanel, VoiceObservationRecorder
│   ├── liveClassroom/       # Premium live session UI
│   └── parent/              # Parent digest portal
├── config/                  # academicContext, organizationDefaults, featureFlags
├── data/                    # curriculum pilot fragments, Cambridge NDJSON, etc.
├── hooks/
├── lib/                     # firebase.ts
├── services/
│   ├── analytics/
│   │   ├── organizationAnalyticsService.ts  # Network metrics (org-scoped; getNetworkMetrics)
│   │   ├── schoolAnalyticsService.ts
│   │   └── playbookAnalyticsService.ts
│   ├── ai/ / aiPrompts/     # Gemini clients & prompts (paths vary by module)
│   ├── assessmentService.ts, studentService.ts, schoolService.ts, …
│   └── …
├── types/                   # domain.ts — School, Student, AuthCustomClaims, …
└── utils/                   # organizationScope, pdfExport, …
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

*Last updated: Campus Gap Analysis (branch rollups, `CampusGapAnalysisPanel`, `org-admin-campus-gaps`); `organizationAnalyticsService` branch gap CSV; `enterpriseAccess` `showCampusGapAnalysis`.*
