# Grants roles/pubsub.publisher to the Google Cloud Storage service account for a project.
# Required for Firebase Gen2 Storage triggers (e.g. onShowYourWorkVideoFinalized) when
# firebase deploy cannot auto-fix IAM.
#
# Prerequisites: gcloud CLI installed, logged in as a user who can edit IAM (e.g. Owner).
# Usage: powershell -ExecutionPolicy Bypass -File ./scripts/grantGcsPubsubPublisher.ps1 -ProjectId basecamp-diagnostics

param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectId
)

$ErrorActionPreference = "Stop"

Write-Host "Resolving project number for $ProjectId ..."
$num = gcloud projects describe $ProjectId --format="value(projectNumber)" 2>$null
if (-not $num) {
  Write-Error "gcloud failed. Install Google Cloud SDK, run 'gcloud auth login', and ensure the project exists."
  exit 1
}

$member = "serviceAccount:service-${num}@gs-project-accounts.iam.gserviceaccount.com"
Write-Host "Granting roles/pubsub.publisher to $member"

gcloud projects add-iam-policy-binding $ProjectId `
  --member=$member `
  --role="roles/pubsub.publisher"

if ($LASTEXITCODE -ne 0) {
  Write-Error "add-iam-policy-binding failed (exit $LASTEXITCODE)."
  exit $LASTEXITCODE
}

Write-Host "Done. You can run: npm run deploy:functions:showYourWork"
