---
name: BaseCamp Pilot Audit
overview: A comprehensive audit of the BaseCamp project against the PREMIUM_ARCHITECTURE_PLAN.md, covering sprint completion status, technical debts, architectural gaps, and pilot readiness for a Cambridge school deployment.
todos:
  - id: debt-pwa
    content: "DEBT-1: Implement Sprint 4.3 -- add vite-plugin-pwa, Workbox, globIgnores for motion/ffmpeg chunks (CRITICAL for GES, not blocking Cambridge pilot)"
    status: completed
  - id: debt-tests
    content: "DEBT-2: Add test framework (vitest) + critical path tests for Cloud Functions grading, aggregation, and Gemini parsing"
    status: completed
  - id: debt-cicd
    content: "DEBT-3: Set up CI/CD pipeline (GitHub Actions) for lint, typecheck, build, and deploy"
    status: completed
  - id: debt-video-cap
    content: "DEBT-4: Align video trigger cap (50MB) with Gemini inline limit (12MB) -- either lower cap or implement Files API"
    status: completed
  - id: debt-dashboard-o1
    content: "DEBT-5: Wire HeadmasterDashboard to read from aggregations/{schoolId} instead of fan-out client queries"
    status: completed
  - id: debt-parent-portal
    content: "DEBT-6: Build parent authentication flow and digest reading UI"
    status: completed
  - id: debt-error-handling
    content: "DEBT-7: Add try/catch to onLiveSessionConcluded trigger handler"
    status: completed
  - id: debt-env-docs
    content: "DEBT-9: Complete functions/.env.example with all env vars and secrets"
    status: completed
  - id: pilot-runbook
    content: Create deployment runbook + pre-flight checklist for Cambridge pilot
    status: completed
  - id: pilot-load-test
    content: Run 30-student RTDB load test to validate Live Classroom at scale
    status: completed
isProject: false
---

# BaseCamp Premium Tier: Full Project Audit

---

## 1. Sprint Completion Status (Architecture Plan vs Codebase)

All 12 sprint plans have every todo marked **completed**. Here is what actually landed in code:

| Sprint | Scope | Code Status |
|--------|-------|-------------|
| 1.1 Premium Context | `isPremiumTier` context, token claim, `resolveEffectivePremiumTier` | Delivered |
| 1.2 Executive Warehouse | `aggregateCambridgeExecutiveSummary` scheduled function, `aggregations/{schoolId}` | Delivered |
| 1.3 Parent Digest | `weeklyParentDigestJob` scheduled function, `parent_digests/{studentId}` | Delivered |
| 2.1 Queue Bypass | `offlineQueueRouting.ts`, `liveClassroomQueueBypass.ts`, `LiveClassroomSessionContext` | Delivered |
| 2.2 RTDB Live Session | `liveSessionRtdbService`, `database.rules.json`, `registerLiveClassroomRtdbBypass` | Delivered |
| 2.3 Follow Me UI | `TeacherLiveClassroomPanel`, `StudentFollowMeSession`, leaderboard utils, hooks | Delivered |
| 2.4 Live Session Persist | `onLiveSessionConcluded` RTDB trigger, `persistLiveSessionToFirestore`, `student_links` | Delivered |
| 3.1 Video Capture (no plan file) | `ShowYourWorkRecorder`, `recordWebCodecsToMp4`, `webCodecsCapability`, `ffmpegWasmEncode` | Delivered (no sprint plan file exists -- built organically) |
| 3.2 Storage Trigger | `onShowYourWorkVideoFinalized` with 4GiB/2vCPU/540s/concurrency 80 | Delivered |
| 3.3 Gemini Video | `showYourWorkGemini`, `processShowYourWorkVideo`, `ShowYourWorkInsightsPanel` | Delivered |
| 3.4 Geometry AI | Premium SVG figures + GES TikZ in worksheet generation | Delivered |
| 4.1 Obsidian Gold | `@theme` tokens in `index.css`, `premiumClassNames.ts`, `PremiumHeaderChrome` | Delivered |
| 4.2 LazyMotion | `LazyMotion` in `main.tsx` with `m` components, `strict` mode | Delivered |

**Missing from the roadmap -- never planned or built:**

- **Sprint 4.3 (PWA Workbox `globIgnores`)** -- The architecture plan's final sprint (lines 188-205, 269) was never executed. There is no sprint plan file for 4.3 and zero implementation.

---

## 2. Critical Technical Debts

### DEBT-1: No PWA / Service Worker (CRITICAL)

The architecture plan dedicates an entire section (Pillar 4, lines 164-205) to PWA safety: `vite-plugin-pwa`, Workbox precaching, `globIgnores` for premium chunks, and `maximumFileSizeToCacheInBytes`. **None of this exists.**

- `vite-plugin-pwa` is **not in `package.json`**
- `vite.config.ts` has **no** Workbox configuration
- No `registerSW` call in any source file
- No service worker is registered anywhere in the app
- `public/manifest.webmanifest` exists but is **never used by a SW**

**Impact:** The architecture's core promise -- that GES public school users on 3G will never accidentally download premium animation/video chunks -- is **completely unimplemented**. The `motion` package, `@ffmpeg` WASM, and `mp4-muxer` will ship to every user in the same bundle, regardless of tier.

### DEBT-2: Zero Test Coverage (HIGH)

- No `.test.ts`, `.test.tsx`, `.spec.ts`, or `.spec.tsx` files anywhere in the repo
- No `vitest`, `jest`, or any test framework in dependencies
- No `test` script in `package.json` (only `tsc --noEmit` lint)
- Cloud Functions have no unit tests for grading logic, aggregation, or Gemini prompt parsing

### DEBT-3: No CI/CD Pipeline (HIGH)

- No `.github/workflows/` directory
- No automated lint, typecheck, build, or deploy pipeline
- All deployments are manual via `npx firebase deploy`

### DEBT-4: Video Size Policy Gap (MEDIUM)

In [functions/src/onShowYourWorkVideoFinalized.ts](functions/src/onShowYourWorkVideoFinalized.ts), the trigger accepts files up to **50MB**. But [functions/src/lib/showYourWorkGemini.ts](functions/src/lib/showYourWorkGemini.ts) has `MAX_INLINE_VIDEO_BYTES = 12MB` for base64 inline Gemini requests. Files between 12-50MB will:
1. Download from Storage (costing egress)
2. Attempt Gemini inference
3. **Fail** because they exceed the inline limit
4. Write a `status: 'failed'` doc

This wastes compute, money, and gives users no upfront feedback.

### DEBT-5: HeadmasterDashboard Not Using Aggregations (MEDIUM)

The nightly aggregation function writes precomputed data to `aggregations/{schoolId}` (Sprint 1.2), but the [HeadmasterDashboard](src/features/dashboards/HeadmasterDashboard.tsx) still uses `generateSchoolAnalytics` from [schoolAnalyticsService.ts](src/services/analytics/schoolAnalyticsService.ts), which queries individual assessment documents client-side. The architecture's O(1) read promise (line 152) is **not realized** on the frontend. Every headmaster login still fans out to many Firestore reads.

### DEBT-6: No Parent Login / Portal UI (MEDIUM)

The architecture (lines 157-161) describes a "Parent Login" where parents authenticate and subscribe to `parent_digests/{studentId}`. The Cloud Function writes the data, Firestore rules exist for the collection, but:
- No parent authentication flow exists
- No parent-facing UI/route to read digests
- `parent_digests` rules only allow admin/headteacher/jurisdiction-oversight reads -- no parent-scoped read path
- The `Phase4FamilyConnectCard` generates digests client-side (separate from the server pipeline) and queues them to WhatsApp -- this is a workaround, not the architecture's intended flow

### DEBT-7: `onLiveSessionConcluded` Missing Error Handling (MEDIUM)

[functions/src/liveSessionConcluded.ts](functions/src/liveSessionConcluded.ts) has no `try/catch` in the top-level trigger handler. If `persistConcludedLiveSession` throws (Firestore timeout, RTDB read failure), the function fails unhandled. Cloud Functions will retry the event, potentially causing:
- Duplicate assessment writes (if idempotency marker wasn't set before failure)
- Noisy error logs with no structured recovery

### DEBT-8: `enqueueWorksheetBatch` Hardcodes `isPremiumTier: false` (LOW)

In [offlineQueueService.ts](src/services/core/offlineQueueService.ts), the `WORKSHEET_BATCH_ROUTING` object always passes `isPremiumTier: false`. This is likely intentional (batch worksheets are "permanent academic records" per the architecture), but it means the batch path can never benefit from any premium-specific routing in the future without refactoring.

### DEBT-9: Incomplete Environment Documentation (LOW)

- [functions/.env.example](functions/.env.example) only documents `STORAGE_BUCKET`
- Missing documentation for: `GEMINI_MODEL`, `FUNCTIONS_REGION`, `MANAGED_EMAIL_DOMAIN`, and the `GEMINI_API_KEY` secret
- Root `.env.example` is more complete but some vars only appear in code comments

### DEBT-10: `dataconnect-generated` Reference (LOW)

[package.json](package.json) references `file:src/dataconnect-generated` but this directory does not exist in the workspace. Likely a stale reference or a generated directory that is `.gitignore`d.

---

## 3. Architecture Plan Features Not Implemented

| Architecture Section | Plan Description | Current State |
|---------------------|-----------------|---------------|
| PWA `globIgnores` (lines 188-205) | Workbox firewall excluding `ffmpeg-core.*`, `premium-*.js`, `motion-*.js` from precache | **Not implemented** -- no PWA plugin at all |
| Sprint 4.3 (line 269) | Audit `vite.config.ts`, inject `globIgnores` regex | **No sprint plan exists, no code** |
| Parent Login (line 161) | Parents authenticate and subscribe to `parent_digests` | **No parent auth, no parent UI** |
| O(1) Dashboard Read (line 152) | Headmaster reads single `aggregations` doc | **Frontend still uses fan-out client queries** |
| TikZ to PDF compilation (line 214) | Node.js compiles AI-generated TikZ into printable PDFs | **Not implemented** -- GES print shows raw TikZ in `<pre>` blocks |
| Firestore rules `request.auth.token.premiumTier` (referenced in Sprint 1.1 plan) | Security rules should enforce premium operations using token claims | **Not implemented** -- rules don't check premium claims; gating is client-only |

---

## 4. Pilot Readiness Assessment for a Cambridge School

### What IS ready (GREEN)

- **Premium tier gating**: Secure token-based `isPremiumTier` with `resolveEffectivePremiumTier` combining Auth claims + school curriculum type -- properly prevents client-side tampering
- **Live Classroom**: Full RTDB pipeline (teacher creates session, students join via portal link, real-time presence, answers, leaderboard computed in-memory, `onDisconnect` tracking)
- **Live Session persistence**: When teacher concludes, Cloud Function grades answers, writes `assessments` to Firestore, cleans up RTDB -- with idempotency markers
- **Show Your Work video**: WebCodecs hardware-accelerated recording with ffmpeg.wasm fallback, upload to Storage, Gemini multimodal analysis, `showYourWorkInsights` collection, teacher-facing insights panel on student profile
- **Executive Warehouse**: Nightly aggregation (2 AM Africa/Accra) writes per-school summaries for Cambridge-aligned schools
- **Parent Digest**: Weekly Gemini-powered digest (Friday 4 PM), concurrency-limited, retry logic
- **Obsidian and Gold UI**: Full premium dark theme with conditional rendering -- GES users see the standard light UI
- **LazyMotion**: Properly implemented with `strict` mode, async `domAnimation` import, all components using `m` not `motion`
- **Security Rules**: Comprehensive Firestore rules with role-based access, teacher-cohort scoping, organization / branch scoping (`organizationId`, `getUserOrgId`, `isOrgAdminForSchoolId`), student portal token validation; RTDB rules enforce teacher-owns-state and student-writes-own-uid
- **Cloud Functions**: All Gen2 with appropriate resource profiles (4GiB/2vCPU for video, 512MiB-1GiB for aggregation/digest, 540s timeouts)

### What needs work before pilot (AMBER)

- **HeadmasterDashboard O(1) reads**: The dashboard still fans out reads -- a headmaster at a 500-student school will trigger thousands of Firestore reads daily. Wire the dashboard to read from `aggregations/{schoolId}` instead. **Effort: ~1 sprint**
- **Video size alignment**: Either lower the Storage trigger cap to 12MB to match the Gemini inline limit, or implement the Files API for larger videos. **Effort: hours**
- **Error handling in `onLiveSessionConcluded`**: Add try/catch + structured error logging. **Effort: hours**
- **Manual deployment runbook**: Document exact deploy sequence (rules, indexes, then functions, then hosting) for the pilot project. **Effort: hours**
- **Load testing RTDB**: The architecture assumes 30 students x 10 minutes of sub-second updates. This has likely not been tested at scale. The free/Spark tier of RTDB has a 100 concurrent connection limit. **Risk: moderate**

### What is NOT ready but may be acceptable for pilot (RED -- evaluate)

- **No automated tests**: Any regression during the pilot would be caught only by manual QA. For a single-school pilot this may be tolerable; for multi-school rollout it is not.
- **No CI/CD**: Deploying hotfixes during a pilot requires manual steps. Risk of deploying to the wrong project (diagnostics vs pilot) is real -- mitigated somewhat by the [firestore-deploy-targets.mdc](c:\Users\me\BaseCamp\.cursor\rules\firestore-deploy-targets.mdc) rule.
- **No PWA / offline protection**: For a Cambridge school with fiber internet, this is **not a blocker** -- their devices are always online. However, the architecture's entire Pillar 4 rationale (protecting GES users from premium bundle bloat) remains unimplemented. This becomes critical before any GES deployment.
- **No parent portal**: Parents will not be able to self-serve their weekly digests via the app. The WhatsApp outbox workaround (`Phase4FamilyConnectCard`) may suffice for the pilot if the school uses WhatsApp.
- **No TikZ compilation**: GES geometry worksheets show raw LaTeX code instead of rendered diagrams. Not relevant for Cambridge pilot (they get SVG), but blocks GES parity.

### Recommended Pre-Pilot Checklist

1. Wire `HeadmasterDashboard` to read from `aggregations/{schoolId}` (prevents billing shock)
2. Align video trigger cap with Gemini inline limit (12MB) or add early rejection with user feedback
3. Add try/catch to `onLiveSessionConcluded`
4. Create a deployment runbook with pre-flight checks
5. Run a realistic 30-student RTDB load test
6. Verify all Firebase secrets (`GEMINI_API_KEY`) are set on the pilot project
7. Verify RTDB instance is created and URL is in `.env`
8. Set `premiumTier` custom claim on the pilot school's staff accounts via `adminSetPremiumClaim`
9. Set school `curriculumType` to `'cambridge'` in Firestore
10. Verify composite indexes are deployed (`firestore.indexes.json`)
