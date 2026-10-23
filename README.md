# papershub

SCAI Research lab desk for the spatial program. The site is the lab (research, spatial, systems, studio, contact) plus the papershub workspace: catalog, concept map, read, brief, and a live research agent.

The agent searches the public web and writes a note with sources. A note is not a claim. A claim enters the map only when a person accepts a span in Read. Brief answers only from claims already accepted.

## Run

```bash
npm install
npm run dev
```

## Cloudflare

Wrangler deploys a Worker named `papershub`. The preview build stays separate.

```bash
npx wrangler login
npx wrangler secret put XAI_API_KEY
npm run cf:deploy
```

`XAI_API_KEY` is the live agent's key. Do not commit it. Without the secret, Search live reports that AI is unavailable.
