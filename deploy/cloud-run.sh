#!/bin/sh
# Deploy SCAI Research to Cloud Run in asia-south1.
# Usage: PROJECT_ID=your-project ./deploy/cloud-run.sh
set -eu

PROJECT_ID=${PROJECT_ID:?set PROJECT_ID}
REGION=${REGION:-asia-south1}
REPO=${REPO:-scai}
SERVICE=${SERVICE:-scairesearch}
IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/$SERVICE:latest"

gcloud config set project "$PROJECT_ID"
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com

gcloud artifacts repositories describe "$REPO" --location="$REGION" >/dev/null 2>&1 || \
  gcloud artifacts repositories create "$REPO" --repository-format=docker --location="$REGION"

if ! gcloud secrets describe scai-secret-key-base >/dev/null 2>&1; then
  gcloud secrets create scai-secret-key-base --replication-policy=automatic
  mix phx.gen.secret | gcloud secrets versions add scai-secret-key-base --data-file=-
fi

gcloud builds submit --tag "$IMAGE"
gcloud run deploy "$SERVICE" \
  --image "$IMAGE" \
  --region "$REGION" \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --set-env-vars "PHX_SERVER=true" \
  --update-secrets "SECRET_KEY_BASE=scai-secret-key-base:latest"

URL=$(gcloud run services describe "$SERVICE" --region "$REGION" --format='value(status.url)')
HOST=${URL#https://}
gcloud run services update "$SERVICE" --region "$REGION" --update-env-vars "PHX_HOST=$HOST"
echo "$URL"
