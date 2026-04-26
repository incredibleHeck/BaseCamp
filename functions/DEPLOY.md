# Deploying Cloud Functions (BaseCamp)

## `onShowYourWorkVideoFinalized` (Storage trigger)

Gen2 functions that listen to **Cloud Storage** use **Eventarc**, which requires the **Google Cloud Storage service account** to have **`roles/pubsub.publisher`** on the project.

If `firebase deploy` fails with a message about **IAM bindings** and **`pubsub.publisher`**, fix permissions first (see below), then deploy again.

### 1. One-time IAM fix (project Owner or IAM Admin)

**Service account to grant** (replace `PROJECT_NUMBER` with your number from Firebase / GCP):

`service-PROJECT_NUMBER@gs-project-accounts.iam.gserviceaccount.com`

**Role:** `Pub/Sub Publisher` (`roles/pubsub.publisher`)

**Option A — Google Cloud Console**

1. Open [IAM & Admin → IAM](https://console.cloud.google.com/iam-admin/iam) for your project.
2. **Grant access** → New principal: paste the service account email above.
3. Role: **Pub/Sub Publisher** → Save.

**Option B — gcloud** (from repo root, after [Cloud SDK](https://cloud.google.com/sdk/docs/install) is installed):

```bash
# Windows PowerShell — uses project number automatically
powershell -ExecutionPolicy Bypass -File ./scripts/grantGcsPubsubPublisher.ps1 -ProjectId YOUR_PROJECT_ID

# Bash (Git Bash / WSL / macOS / Linux)
chmod +x ./scripts/grantGcsPubsubPublisher.sh
./scripts/grantGcsPubsubPublisher.sh YOUR_PROJECT_ID
```

**Option C — manual gcloud** (if you already know `PROJECT_NUMBER`):

```bash
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:service-PROJECT_NUMBER@gs-project-accounts.iam.gserviceaccount.com" \
  --role="roles/pubsub.publisher"
```

### 2. Gemini secret (Sprint 3.3)

`onShowYourWorkVideoFinalized` needs the same **`GEMINI_API_KEY`** Secret Manager binding as `weeklyParentDigestJob`. In Firebase Console: **Functions** → your function → ensure the secret is attached, or redeploy after running `firebase functions:secrets:set GEMINI_API_KEY`. Optional: set **`GEMINI_MODEL`** on the function (e.g. `gemini-3-flash-preview`) to override the default in code.

### 3. Deploy this function

From the **repository root** (not `functions/`):

```bash
npx firebase deploy --only functions:onShowYourWorkVideoFinalized
```

Or use the npm script:

```bash
npm run deploy:functions:showYourWork
```

### 4. Smoke test

1. Ensure the web app has **`VITE_FIREBASE_STORAGE_BUCKET`** set (same project).
2. Student portal: **`#/portal`** → class code → **Show your work** (Cambridge / both school) → record and stop.
3. Confirm success message in the UI, then open [Logs Explorer](https://console.cloud.google.com/logs/query) and search for **`onShowYourWorkVideoFinalized: accepted`**.

### 5. Optional: pin Storage bucket (`STORAGE_BUCKET`)

By default the trigger listens on the **default** bucket for the Firebase project. To scope to a specific bucket name (must match `VITE_FIREBASE_STORAGE_BUCKET`):

1. Set environment variable **`STORAGE_BUCKET`** for the deployed function (same string as the client bucket, e.g. `your-project.firebasestorage.app`).
2. **Gen2:** In Google Cloud Console → **Cloud Run** → select the service for `onshowyourworkvideofinalized` → **Edit & deploy new revision** → **Variables & secrets** → add `STORAGE_BUCKET`, redeploy; **or** set it via your CI/CD before `firebase deploy` if you inject env into the build.

For **local emulation** only, you can copy `functions/.env.example` to `functions/.env` and set `STORAGE_BUCKET` (see Firebase docs for loading `.env` in the emulator).

**Note:** Changing `STORAGE_BUCKET` after deploy may require redeploying the function so the trigger is registered against the correct bucket.
