# SCAI Research

Phoenix LiveView is the lab stack. The site (research, spatial, systems, studio, contact) and the papershub desk are this app. Search hits the seed plus Semantic Scholar, OpenAlex, arXiv, and Crossref. The neighborhood graph is built here. Connected Papers has no public API.

Efficient-systems bench and the own-papers desk stay separate products and are not in this nav.

## Run locally

Elixir 1.18 and Erlang/OTP 27.

```bash
mix setup
mix phx.server
```

Open http://localhost:4000

Health: `GET /health`
Search API: `GET /api/search?q=geospatial+foundation+model`

Seed citation counts are labeled illustrative. Live index counts are labeled with the source. Set `SEMANTIC_SCHOLAR_API_KEY` if the anonymous Semantic Scholar quota starts returning errors. OpenAlex, arXiv, and Crossref do not need a key.

## Deploy

LiveView does not run inside a Worker script. The host is a Worker that forwards the site, including the `/live` socket, to one container running this release. That replaces Cloud Run. Config is in `cloudflare/`. The Worker name is `papershub-live`, so it does not replace the TypeScript site already on `papershub`.

From `cloudflare/`, with Docker running and Wrangler logged into the lab account:

```bash
npm install
npx wrangler secret put SECRET_KEY_BASE
npx wrangler deploy
```

`Dockerfile` already listens on port 8080. Do not pass `--temporary`.
