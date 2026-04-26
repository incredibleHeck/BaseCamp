#!/usr/bin/env bash
# Grants roles/pubsub.publisher to the Google Cloud Storage service account.
# Usage: ./scripts/grantGcsPubsubPublisher.sh YOUR_PROJECT_ID
set -euo pipefail

PROJECT_ID="${1:-}"
if [[ -z "$PROJECT_ID" ]]; then
  echo "Usage: $0 YOUR_PROJECT_ID" >&2
  exit 1
fi

echo "Resolving project number for ${PROJECT_ID} ..."
NUM="$(gcloud projects describe "${PROJECT_ID}" --format='value(projectNumber)')"
MEMBER="serviceAccount:service-${NUM}@gs-project-accounts.iam.gserviceaccount.com"

echo "Granting roles/pubsub.publisher to ${MEMBER}"
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="${MEMBER}" \
  --role="roles/pubsub.publisher"

echo "Done. You can run: npm run deploy:functions:showYourWork"
