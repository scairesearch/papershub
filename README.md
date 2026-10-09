# SCAI Research

Phoenix LiveView workspace for working research papers. Search hits the seed plus Semantic Scholar, OpenAlex, arXiv, and Crossref. The neighborhood graph follows the Connected Papers pattern (origin, citation-scaled nodes, year color, prior and derivative lists) and is built in this app. Connected Papers has no public API.

Efficient-systems bench and the own-papers desk are separate products and are not in this nav.

## Run locally

Elixir 1.18 and Erlang/OTP 27.

```bash
mix setup
mix phx.server
```

Open http://localhost:4000

Health: `GET /health`
Search API: `GET /api/search?q=geospatial+foundation+model`

Seed citation counts are labeled illustrative. Live index counts are labeled with the source. Set `SEMANTIC_SCHOLAR_API_KEY` on Cloud Run if the anonymous Semantic Scholar quota starts returning errors. OpenAlex, arXiv, and Crossref do not need a key.

## Deploy on Cloud Run (asia-south1)

```bash
export PROJECT_ID=your-gcp-project
export REGION=asia-south1
gcloud config set project "$PROJECT_ID"
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com

# one-time
gcloud artifacts repositories create scai --repository-format=docker --location="$REGION"

gcloud builds submit --tag "$REGION-docker.pkg.dev/$PROJECT_ID/scai/scairesearch:latest"
SECRET=$(mix phx.gen.secret)
gcloud run deploy scairesearch \
  --image "$REGION-docker.pkg.dev/$PROJECT_ID/scai/scairesearch:latest" \
  --region "$REGION" \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --set-env-vars "PHX_SERVER=true,PHX_HOST=scairesearch-$PROJECT_ID.$REGION.run.app,SECRET_KEY_BASE=$SECRET"
```

Or run `PROJECT_ID=your-gcp-project ./deploy/cloud-run.sh`. That script creates the Artifact Registry repo, stores `SECRET_KEY_BASE` in Secret Manager, builds the image, deploys, then sets `PHX_HOST` from the Cloud Run URL.

`cloudbuild.yaml` is the same path for a trigger. Put `SECRET_KEY_BASE` in Secret Manager rather than the trigger file. The sample deploy step expects the secret `scai-secret-key-base` to exist.
