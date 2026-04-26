# Cambridge School Pilot: Deployment Runbook

## Pre-flight Checklist

Complete every item before going live with a pilot school.

### 1. Firebase Project Setup

- [ ] Confirm the pilot Firebase project is `basecamp-pilot`
- [ ] Realtime Database instance is created in the Firebase Console (Build > Realtime Database)
- [ ] Copy the RTDB URL (e.g. `https://basecamp-pilot-default-rtdb.europe-west1.firebasedatabase.app`)
- [ ] Cloud Storage is enabled and default bucket name noted
- [ ] Cloud Scheduler and Pub/Sub APIs are enabled in GCP Console

### 2. Secrets and Environment

- [ ] `GEMINI_API_KEY` set via `firebase functions:secrets:set GEMINI_API_KEY --project basecamp-pilot`
- [ ] Verify secret is accessible: `firebase functions:secrets:access GEMINI_API_KEY --project basecamp-pilot`
- [ ] **Staff invites (Resend):** `RESEND_API_KEY` via `firebase functions:secrets:set RESEND_API_KEY --project basecamp-pilot` (used by `inviteStaffMember`). In Firebase Console → Functions → `inviteStaffMember` → Environment, set `TRANSACTIONAL_FROM_EMAIL` to a verified sender (and optionally `TRANSACTIONAL_FROM_NAME`, e.g. `BaseCamp`). For a targeted deploy after code changes: `npx firebase deploy --only functions:inviteStaffMember --project basecamp-pilot`
- [ ] `functions/.env` created from `functions/.env.example` with:
  - `FUNCTIONS_REGION=europe-west1`
  - `STORAGE_BUCKET=<pilot bucket name>`
  - `MANAGED_EMAIL_DOMAIN=<school domain or basecamp.internal>`
  - For local emulator testing of invites, you may set `RESEND_API_KEY`, `TRANSACTIONAL_FROM_EMAIL`, and `TRANSACTIONAL_FROM_NAME` in `.env` (see `.env.example`)

### 3. Web App Environment

Create `.env.production` with pilot-specific values:

```
VITE_FIREBASE_API_KEY=<pilot key>
VITE_FIREBASE_AUTH_DOMAIN=basecamp-pilot.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=basecamp-pilot
VITE_FIREBASE_STORAGE_BUCKET=<pilot bucket>
VITE_FIREBASE_MESSAGING_SENDER_ID=<pilot sender id>
VITE_FIREBASE_APP_ID=<pilot app id>
VITE_FIREBASE_DATABASE_URL=<pilot RTDB URL>
VITE_GEMINI_API_KEY=<client Gemini key>
VITE_MANAGED_EMAIL_DOMAIN=<same as functions>
```

### 4. IAM Permissions

- [ ] GCS service account has `roles/pubsub.publisher` (see `functions/DEPLOY.md` section 1)

### 5. Firestore Data

- [ ] Pilot school document exists in `schools/{schoolId}` with `curriculumType: 'cambridge'`
- [ ] At least one cohort exists linked to the school
- [ ] At least one student exists with a `portalAccessCode`

### 6. Auth Users

- [ ] Headteacher account created with `role: 'headteacher'` and correct `schoolId`
- [ ] Teacher account(s) created (via `createSchoolTeacher` or manually)
- [ ] Super admin account exists with `role: 'super_admin'`
- [ ] Premium claims set on staff:
  ```bash
  # Via the admin callable (from a super_admin session) or a script:
  # adminSetPremiumClaim({ targetUid: '<teacher-uid>', premiumTier: true })
  ```

---

## Deployment Order

Execute in this exact sequence. Each step depends on the previous.

### Step 1: Deploy Firestore Indexes

```bash
npx firebase deploy --only firestore:indexes --project basecamp-pilot
```

Wait for indexes to finish building (check Firebase Console > Firestore > Indexes).

### Step 2: Deploy Firestore Rules

```bash
npm run deploy:firestore:pilot
```

### Step 3: Deploy RTDB Rules

```bash
npx firebase deploy --only database --project basecamp-pilot
```

### Step 4: Deploy Storage Rules

```bash
npx firebase deploy --only storage --project basecamp-pilot
```

### Step 5: Deploy Cloud Functions

```bash
npx firebase deploy --only functions --project basecamp-pilot
```

Verify in GCP Console:
- [ ] `onLiveSessionConcluded` is deployed
- [ ] `onShowYourWorkVideoFinalized` is deployed with GEMINI_API_KEY secret
- [ ] `weeklyParentDigestJob` is deployed with schedule (Fri 16:00 Africa/Accra)
- [ ] `aggregateCambridgeExecutiveSummary` is deployed with schedule (02:00 daily)
- [ ] `createSchoolTeacher`, `adminSetPremiumClaim`, `deleteSchoolTeacher`, `inviteStaffMember` are deployed (`inviteStaffMember` requires `RESEND_API_KEY` secret and transactional `from` env vars)

### Step 6: Build and Deploy Hosting

```bash
npm run build
npx firebase deploy --only hosting --project basecamp-pilot
```

---

## Post-Deploy Verification

### Core Features

- [ ] Staff login works (headteacher + teacher accounts)
- [ ] Premium shell (Obsidian & Gold) appears for Cambridge school staff
- [ ] GES users (if any) see standard light theme

### Live Classroom

- [ ] Teacher can start a live session from the Live Classroom nav item
- [ ] Student can join via portal link (`#/portal?liveSession=<id>`)
- [ ] Presence tracking works (student appears/disappears on teacher dashboard)
- [ ] Answer submission shows on leaderboard in real-time
- [ ] Session conclusion triggers Cloud Function (check logs)
- [ ] Assessment documents appear in Firestore after conclusion

### Show Your Work

- [ ] Student portal shows "Show your work" for Cambridge school
- [ ] Video recording works (30s max)
- [ ] Upload succeeds (check Storage bucket)
- [ ] Cloud Function processes video (check logs for `onShowYourWorkVideoFinalized: accepted`)
- [ ] `showYourWorkInsights` document created in Firestore
- [ ] Teacher sees insights on student profile

### Analytics

- [ ] Headmaster dashboard loads (should show aggregated data after nightly run)
- [ ] Manually trigger aggregation if needed:
  ```bash
  npx firebase functions:shell --project basecamp-pilot
  > aggregateCambridgeExecutiveSummary()
  ```

### Parent Digest

- [ ] Navigate to `#/parent` and enter a student code
- [ ] After Friday 16:00 run, digest appears
- [ ] Manually trigger if needed:
  ```bash
  npx firebase functions:shell --project basecamp-pilot
  > weeklyParentDigestJob()
  ```

---

## Rollback Procedure

If critical issues arise during pilot:

1. **Hosting only**: Redeploy previous build or revert to last known good commit
2. **Functions**: `npx firebase deploy --only functions --project basecamp-pilot` from the last good commit
3. **Rules**: Same — deploy from last good commit using the safe deploy commands

---

## Monitoring

- **Cloud Logging**: Filter by function name in [Logs Explorer](https://console.cloud.google.com/logs/query)
- **Error budget**: Watch for `onLiveSessionConcluded: unhandled error` log entries
- **Firestore reads**: Monitor in Firebase Console > Usage to ensure headmaster dashboard is using O(1) reads
- **RTDB connections**: Monitor in Firebase Console > Realtime Database > Usage (100 concurrent on Spark plan)

---

## Known Limitations (Pilot Scope)

- No automated test suite yet (manual QA only)
- PWA offline caching is implemented but not battle-tested on GES networks
- Parent portal (`#/parent`) uses the same student access code — consider separate parent codes post-pilot
- TikZ geometry diagrams for GES print show raw LaTeX (no server-side compilation)
- RTDB free tier limited to 100 concurrent connections (sufficient for single classroom)
