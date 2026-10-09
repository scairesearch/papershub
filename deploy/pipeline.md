# Elixir pipeline for papershub

Two planes. GCP is the public edge. Bare metal is production.

The 450 million works are one merged catalog, mostly OpenAlex, with Semantic Scholar, Crossref, and arXiv overlapping it. That catalog does not fit Cloud Run. A request-priced instance with an ephemeral disk cannot hold the snapshot, and it cannot finish a harvest after the request ends. Bare metal holds the index. Cloud Run serves the working set.

## Planes

| Plane | Where | Runs | Does not run |
|---|---|---|---|
| Edge | Cloud Run, `asia-south1` | Phoenix LiveView, search of the hot shard, graph of a pinned problem, briefs, `/health` | Snapshot parse, category harvest, embedding |
| Production | Bare-metal cloud, Mumbai or Bengaluru if the vendor has it | Ingest, normalize, enrich, shard, resume | TLS termination, public sockets |
| Handoff | GCS bucket `scai-catalog` | Snapshot files, shard manifests, desk export | Queries |

Bare metal here means a rented dedicated server, not GKE and not GCP Bare Metal Solution. One 64 GB machine with a NVMe disk is enough for a field shard. A second machine is the standby, not a cluster, until the hot shard exceeds RAM.

GCP stays because the edge needs TLS, Secret Manager, and a URL. The bill for that edge is the Cloud Run number from `gcp-evaluation.md`. The index bill is the bare-metal rental, which is the 100x cut: metadata on disk, not a video render and not a managed cluster.

## Mechanism

One Elixir release, two entry points. `bin/scai start` is the edge. `bin/scai eval 'Scai.Pipeline.run()'` is the production job. No Postgres. The queue is a manifest file on GCS plus a cursor on the metal.

```
OpenAlex snapshot  ->  land  ->  normalize  ->  enrich  ->  shard  ->  GCS
arXiv category API -+
Semantic Scholar   -+ enrich only, by id, never as a second corpus
                                      |
                                      v
                               Cloud Run loads the hot shard on boot
```

Stages are GenServers under `Scai.Pipeline`. Each stage owns a cursor. A crash restarts at the cursor. A stage never calls the next stage in-process with the whole file. It writes a chunk and enqueues the chunk name.

| Stage | Module | Input | Output | Rule |
|---|---|---|---|---|
| Land | `Scai.Pipeline.Land` | OpenAlex snapshot URI, or `cat:cs.CV` page | `gs://scai-catalog/raw/DATE/` | One page or one snapshot part. arXiv waits 3 seconds between calls. |
| Normalize | `Scai.Pipeline.Normalize` | Raw JSONL or Atom | Canonical paper, keyed by OpenAlex id, else DOI, else arXiv id | Dedup here. Semantic Scholar is not added on top. |
| Enrich | `Scai.Pipeline.Enrich` | Canonical id | TLDR, influential count, arXiv id | Only for the hot field. Not all 450 million. |
| Shard | `Scai.Pipeline.Shard` | Enriched papers | `shard-eess-iv.jsonl`, manifest | First shard is geospatial: `eess.IV`, remote sensing, population. |
| Serve | `Scai.Index` on the edge | Manifest | ETS hot set | Boot downloads the manifest. Search misses fall through to live OpenAlex. |

The canonical paper is the map already used by `Scai.Sources`: `id`, `source`, `title`, `authors`, `year`, `abstract`, `doi`, `arxiv`, `citations`. `source` becomes `openalex` for catalog records. arXiv harvest records merge in when the DOI or arXiv id matches.

## What is hot

The edge does not load 450 million rows. The hot shard is the geospatial problem plus whatever the researcher has pinned. That is the set `Scai.Desk` already persists. Production writes it. The edge reads it.

Everything else stays in the snapshot. A search that misses the shard calls OpenAlex, caches the hit in the desk, and does not pull the snapshot apart.

## GCP wiring

- Artifact Registry and Cloud Run, as `deploy/cloud-run.sh`.
- Secret Manager for `SECRET_KEY_BASE` and the OpenAlex key.
- One bucket. The metal writes. The Cloud Run service account reads.
- No Cloud SQL, no Pub/Sub, no GKE in this cut. A manifest object is the queue. Pub/Sub is the replacement when more than one metal machine consumes the same stage.
- Cloud Run Job is only a standby for the arXiv cursor if the metal is down. It is not the production ingest.

## Bare metal

One production box.

- Debian, Elixir 1.18, OTP 27, same as the image.
- NVMe for `raw/` and `shards/`.
- Egress to GCS and to arXiv. No public inbound except SSH.
- Cron runs `Scai.Pipeline.run("eess.IV")` nightly. The cursor is on disk, so a reboot continues.
- Sync to GCS at the end of a shard, not after every paper.

Vendor is interchangeable: a dedicated server in Mumbai or Bengaluru. The pipeline does not call a vendor API. If the box is replaced, it pulls `raw/` and the cursor from the bucket and continues.

## Failure

A stage writes the cursor after a chunk is on disk. Enrichment that gets a 429 records the id and moves on. The edge serves the last manifest if the new shard fails to upload. The desk file on the edge is an export of pins and accepted claims. It is not the catalog.

## Not in this cut

Embeddings over 450 million. A video render per paper. Loading the snapshot into Cloud Run memory. Treating Semantic Scholar and OpenAlex as two piles to add.
