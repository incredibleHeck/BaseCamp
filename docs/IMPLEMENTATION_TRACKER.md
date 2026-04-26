# Docs → implementation tracker

We implement [plans/plans](plans/README.md) **in order**, one slice at a time, and check items off here.

## Status

| Doc | Status | Notes |
| --- | ------ | ----- |
| [plans/offline-diagnosis-queue.md](plans/offline-diagnosis-queue.md) | Done | Wired in app + sync manager |
| [plans/pending-analyses.md](plans/pending-analyses.md) | Done | Tab, refresh, names |
| [plans/offline-queue-service.md](plans/offline-queue-service.md) | Done | `offlineQueueService` + extensions |
| [plans/demo-prototype-readiness.md](plans/demo-prototype-readiness.md) | Done | Roster summary, README, indexes, etc. |
| [plans/mobile-frontend-optimization.md](plans/mobile-frontend-optimization.md) | Done | Header, roster, profile, tabs; AnalysisResults/TeacherDirectory already aligned |
| [plans/phase-2-pro-teacher-tools-v2.md](plans/phase-2-pro-teacher-tools-v2.md) | Done (MVP) | Gradebook CSV, GES RAG pilot, voice queue + sync, assessment fields |
| [plans/phase-3-premium-enterprise-dashboard-v3.md](plans/phase-3-premium-enterprise-dashboard-v3.md) | Done (MVP) | Org IDs, RBAC, SEN inbox, Campus Gap Analysis (branch rollups), playbook lift |
| [plans/phase-4-master-ecosystem-v4.md](plans/phase-4-master-ecosystem-v4.md) | Done (MVP) | Connect stub, portal #/portal, pilot export, PWA manifest |

### Mobile optimization checklist

- [x] **§1 Header** – role visible on small screens; compact queue count on mobile; touch-friendly network + logout
- [x] **§2 Class Roster** – Add Student + actions already mobile-friendly; added mobile “Gap” line under name
- [x] **§3 Student Profile** – stacked controls + full-width Export on small screens; touch-friendly toggles
- [x] **§4 Teacher Directory** – already had `overflow-x-auto`
- [x] **§5 Analysis Results** – already had `min-h-[44px]` and `w-full sm:w-auto` on primary actions
- [x] **§6 App layout** – nav tab padding `px-2 sm:px-3` for small screens
- [x] **§7 Offline banner** – short/long copy by breakpoint (existing)

---

### Phase 2 checklist (MVP in repo)

- [x] **Pillar 3 – Gradebook** – `score` + term/year/class on assessments; **Export gradebook (CSV)** on class roster (UTF-8 BOM).
- [x] **Pillar 2 – RAG** – Pilot corpus [`src/data/gesCurriculumPilot.ts`](../../src/data/gesCurriculumPilot.ts); keyword retrieval [`curriculumRagService.ts`](../../src/services/curriculumRagService.ts); prompts cite GES IDs; UI in AnalysisResults + profile history.
- [x] **Pillar 1 – Voice** – IndexedDB queue, Gemini audio transcribe + structured analysis, Firestore `voiceObservations`, recorder on Student Profile.

### Phase 3 checklist (MVP in repo)

- [x] **Foundations** – `organizationId` / `circuitId` / `schoolId` on students (defaults in `addStudent`; legacy Firestore may still carry `districtId` for reads); demo schools/circuits in [`organizationDefaults.ts`](../../src/config/organizationDefaults.ts); network rollups in [`organizationAnalyticsService.ts`](../../src/services/analytics/organizationAnalyticsService.ts) (`getNetworkMetrics`) and [`schoolAnalyticsService.ts`](../../src/services/schoolAnalyticsService.ts); roles `org_admin`, `sen_coordinator`, `circuit_supervisor`, `super_admin` + nav in [`App.tsx`](../../src/App.tsx).
- [x] **SEN alert MVP** – Rule v1 + `senAlerts` + audit via `arrayUnion`; inbox [`SenAlertsInbox.tsx`](../../src/features/sen-coordinator/SenAlertsInbox.tsx); runs after save ([`senAlertService.ts`](../../src/services/senAlertService.ts)).
- [x] **Campus Gap Analysis MVP** – Branch / `schoolId` rollups (`buildBranchGapRollups`); minimum-*n* suppression (`AGGREGATION_MIN_N`); Recharts + table; CSV export; shell view `org-admin-campus-gaps`; [`CampusGapAnalysisPanel.tsx`](../../src/features/assessments/CampusGapAnalysisPanel.tsx).
- [x] **Playbook analytics MVP** – `playbookKey` / `playbookTitle` on assessments; observational lift leaderboard [`PlaybookLiftLeaderboard.tsx`](../../src/features/dashboards/PlaybookLiftLeaderboard.tsx).

### Phase 4 checklist (MVP in repo)

- [x] **Foundations** – Guardian fields + consent timestamp + `portalAccessCode` + `trainingDataOptIn` on students; [`updateStudent`](../../src/services/studentService.ts); WhatsApp **outbox stub** [`whatsappConnectService.ts`](../../src/services/whatsappConnectService.ts); Firestore `whatsappOutbox`.
- [x] **HecTech Connect MVP** – Weekly digest + **Twi/Ga/Ewe** (via Gemini translate) on [`Phase4FamilyConnectCard.tsx`](../../src/components/Phase4FamilyConnectCard.tsx) (teacher profile); queues row in `whatsappOutbox`.
- [x] **Student portal MVP** – Hash route **`#/portal`** [`StudentPortalApp.tsx`](../../src/components/StudentPortalApp.tsx); gamified MCQ from gap tags; [`portalSessions`](../../src/services/portalSessionService.ts); [`public/manifest.webmanifest`](../../public/manifest.webmanifest).
- [x] **Fine-tuning pilot** – JSONL export + gap-tag A/B flag [`FineTunePilotPanel.tsx`](../../src/components/FineTunePilotPanel.tsx); [`VITE_FT_PILOT_GAP_TAGS`](../../.env.example) + [`suggestGapTagsFromObservations`](../../src/services/aiPrompts.ts).

*Last updated: Phase 3 doc aligned with Campus Gap Analysis (replaces circuit heatmap MVP).*
