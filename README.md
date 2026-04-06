<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# BaseCamp Diagnostics

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/ec58a563-8013-4579-90d6-536bfb732606

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy [.env.example](.env.example) to `.env.local` and fill in your keys.
3. **Gemini:** Set `VITE_GEMINI_API_KEY` in `.env.local` to your Gemini API key.
4. **Firebase (Auth & Firestore):** Set these in `.env.local` so the app can sign in and read/write data:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
5. **Firestore index:** For student assessment history, Firestore needs a composite index on the `assessments` collection: `studentId` (Ascending) and `timestamp` (Descending). If you see an index error at runtime, create the index via the link in the error message (Firebase Console).
6. **Voice observations (Phase 2):** Synced clips are stored in the `voiceObservations` collection. Ensure your security rules allow authenticated writes (see `firestore.rules`).
7. **Phase 3 (enterprise demo):** Screening alerts use the `senAlerts` collection. Create matching Auth users if you use the administrative login forms (email + password). Demo defaults include `district@basecamp.com`, `sen_coordinator@basecamp.com`, `circuit_supervisor@basecamp.com`, and `superadmin@basecamp.com` (or `super_admin@basecamp.com`) for super admin — use the same demo password (e.g. `HecTech@2026!`) and set `role` on Firestore `users/{uid}` (`teacher`, `headteacher`, `district`, `sen_coordinator`, `circuit_supervisor`, `super_admin`) plus optional `districtId` / `circuitId` / `schoolId`.
8. **Phase 4 (ecosystem demo):** `whatsappOutbox` (stub queue for HecTech Connect), `portalSessions` (student practice summaries). Student portal URL: same app origin with hash **`#/portal`** (teachers set a **portal access code** on the learner profile). MoE **Pilot export** tab (super admin) downloads opted-in JSONL.
9. **Cohort & Student Management:** Teachers can now create cohorts (classes) directly from the roster or add student flow. Student records (name, cohort, language, SEN status, consent) can be edited from the "Family & record" tab on the student profile.
10. Run the app:
   ```bash
   npm run dev
   ```

**Note on Firebase CLI:** This project uses a local installation of `firebase-tools` to ensure consistent and reliable deployments. Use `npx firebase <command>` for all Firebase operations.