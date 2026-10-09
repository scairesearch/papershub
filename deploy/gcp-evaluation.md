# GCP production evaluation

Decision for the first production cut: Cloud Run in `asia-south1` (Mumbai). Not GKE. Not Cloud SQL yet.

## Why this shape

papershub is a Phoenix release. It speaks HTTP, holds LiveView sockets, and writes two local files: `priv/desk.json` and `priv/arxiv_index.json`. Cloud Run runs that container, terminates TLS, and bills only while the instance is up. Mumbai is the nearest GCP region to Bengaluru and is on the Tier 1 price list.

GKE adds a cluster fee and node management this app does not use. Cloud SQL adds a database the schema does not need until the index outgrows a file.

## What breaks if we deploy the container as it is

The disk is ephemeral. A new revision or a scale-to-zero wipes the harvest and the working set. The arXiv harvest also runs inside the web process. With request-based billing, CPU is throttled when no request is in flight, so a background harvest stalls.

Those two facts decide the production cut. The web service serves search, graph, and briefs. A Cloud Run Job does the harvest and writes the index to Cloud Storage. The service loads that object on boot.

## Cost, order of magnitude

Mumbai request-based rates are about $0.000024 per vCPU-second and $0.0000025 per GiB-second, plus $0.40 per million requests. Free tier is 180,000 vCPU-seconds, 360,000 GiB-seconds, and 2 million requests a month.

One always-on instance at 1 vCPU and 1 GiB is on the order of $70 a month. Scale-to-zero with light evaluation traffic stays inside the free tier, at the cost of a BEAM cold start of several seconds. A harvest job of a few minutes a day is noise next to that.

Artifact Registry and Secret Manager are cents. Set a budget alert at $25 before the first deploy.

## Stages

1. Evaluation. Cloud Run service, 1 vCPU, 1 GiB, scale to zero, session affinity, Secret Manager for `SECRET_KEY_BASE`. Confirm LiveView sockets and `/health`. Accept that the index resets.
2. Production index. Cloud Run Job harvests one category page per run, writes `arxiv_index.json` to a bucket. Service reads it on boot. Desk file moves to the same bucket or to a later volume.
3. Hold open. `min-instances=1` only if cold start is unacceptable. Custom domain. Budget alert stays on.

Do not turn on always-on CPU until a harvest or a socket actually needs it. That switch roughly doubles the idle bill.

## Deploy

`PROJECT_ID=your-project ./deploy/cloud-run.sh`

The script creates the Artifact Registry repo, stores the secret, builds, and deploys in Mumbai. It does not create the bucket or the job. Those belong to stage 2.
