# SCAI Research — architecture, restated

The platform is a research program, not a paper search engine. The catalog exists so a problem can grow a concept graph, a claim can cite a span, and a thin region can become a brief. Indexing 450 million works is a means. It is not the product.

## Goal

One researcher, then a collaborator, working the geospatial program: a federated geo-local index that stays consistent across satellite embeddings, census, and paper claims, at a cost India can run.

Done means a brief a mentor can read. Not a video of a paper. Not a second Semantic Scholar.

Three constraints from the program, not from the tooling:

- Provenance. A claim without a span is a note.
- Coverage. A method evaluated on US and EU tiles is not an India result.
- Cost. Metadata on disk beats a render per paper, and bare metal beats a managed cluster for the catalog.

B, the efficient-systems bench, and C, the own-papers desk, stay separate products. They may cite a paper id. They do not get a nav item.

## Loops

Three loops. Mixing them is what made the first pipeline look like a crawler.

Program loop, on the edge. The researcher pins a paper, accepts a claim, promotes a gap, exports a brief. This is Phoenix on Cloud Run. The state is the desk: problem, pins, notes, accepted claims, gaps.

Catalog loop, on bare metal. Land the OpenAlex snapshot, normalize, enrich only the hot field, write a shard. This is the Elixir pipeline. The state is a cursor and a manifest.

Edge loop. Cloud Run boots, pulls the current shard manifest from GCS, serves search and the graph from that shard, and falls through to live OpenAlex on a miss. A miss can be pinned. A pin does not trigger a snapshot parse.

```
program loop          catalog loop                 edge loop
pin, claim, gap       land → normalize → enrich    boot from manifest
brief export          shard the hot field          miss → OpenAlex → pin
        \                    |                         /
         \---- desk ---- GCS manifest ---- shard ----/
```

## Objects, enhanced

The locked objects stay. Two are promoted, because the gaps already ask about them and the schema did not.

| Object | Why it is now first-class |
|---|---|
| Place | India coverage is a gap, not a sentence in a claim. A paper has an evaluation footprint: where the tiles or cohorts are. Unknown is allowed. Invented is not. |
| Method | The thing the brief says is missing. A paper uses a method. A method is not a concept. Foundation model is a concept. Scale-MAE is a method. |

A concept edge is still depends-on, extends, contradicts, uses-dataset, measures, or similar. Place and method hang off the paper, and the gap reason can be `missing-place` as well as `missing-method`.

## Planes

| Plane | Where | Holds | Fails closed by |
|---|---|---|---|
| Edge | Cloud Run, `asia-south1` | LiveView, hot shard, desk cache | Serving the last good manifest |
| Production | One bare-metal server, Mumbai or Bengaluru | Snapshot, cursors, shard build | Restarting at the cursor |
| Handoff | GCS `scai-catalog` | Raw parts, shard, manifest, desk export | Not serving a shard whose manifest did not upload |

Bare metal means a rented dedicated server, not GKE and not GCP Bare Metal Solution. One 64 GB NVMe box builds the geospatial shard. A second box is a standby, not a cluster.

GCP is the edge because it terminates TLS and holds secrets. It is the wrong place for the snapshot. Request-priced CPU stops when the request ends. The harvest would stall.

## Pipeline, narrowed

Same stages. Narrower rule: a stage only emits papers that can attach to the active problem, plus the ids needed to dedupe.

| Stage | Emits | Drops |
|---|---|---|
| Land | OpenAlex snapshot part, or one arXiv category page | Nothing yet. Landing is raw. |
| Normalize | One paper, keyed by OpenAlex id, else DOI, else arXiv id | Duplicate ids. Semantic Scholar is not a second row. |
| Select | Papers in the geospatial field, or cited by one | The other ~450 million, left in the snapshot |
| Enrich | TLDR, influential count, arXiv id, evaluation place if the abstract names one | 429s, recorded and skipped |
| Shard | `shard-geo.jsonl` and a manifest | A shard that failed to upload |

Select is the enhancement. The earlier design enriched a category and hoped. The platform only needs the papers that can touch the federated geo-local problem. The rest stay addressable in OpenAlex.

arXiv waits three seconds between calls. Enrichment is by id, against the selected set, not against the snapshot.

## Hot set

The edge loads the shard, not the catalog. The desk is smaller still: pins, accepted claims, gaps. Search hits the shard, then OpenAlex. A pin copies the paper into the desk. The graph is built from the desk plus the shard neighborhood, which is the Connected Papers pattern already in `Scai.Graph`.

Place and method show on the paper record and in the brief. A gap whose reason is `missing-place` lists papers whose footprint is unknown or outside India.

## Cost

The 100x cut is this split. Cloud Run at scale-to-zero is the evaluation bill. One bare-metal server is the catalog bill. A video render per paper, an embedding of all 450 million, and a GKE cluster are the expensive paths, and they are out.

## Done

A collaborator opens a brief and sees the problem, the claims for and against with spans, the place footprint, and the next experiment. The shard that fed it is named in the manifest. The other half-billion works were not loaded to produce that page.
