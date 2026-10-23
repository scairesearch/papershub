import { createFileRoute } from "@tanstack/react-router";

type Source = { url: string; title: string };
type OutEvent =
  | { type: "status"; text: string }
  | { type: "delta"; text: string }
  | { type: "source"; url: string; title: string }
  | { type: "error"; error: string }
  | { type: "done" };

const SSE = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  "X-Accel-Buffering": "no",
};

let lastCall = 0;

export const Route = createFileRoute("/api/research")({
  server: {
    handlers: {
      GET: async () => new Response("research-route", { headers: { "content-type": "text/plain" } }),
      POST: async ({ request }) => {
        const apiKey = process.env.XAI_API_KEY;
        if (!apiKey) return Response.json({ error: "AI is not available in this environment" }, { status: 503 });

        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return Response.json({ error: "Send a question." }, { status: 400 });
        }
        const body = raw as { question?: unknown; problem?: unknown; scope?: unknown; claims?: unknown };
        const question = String(body.question ?? "").trim().slice(0, 400);
        const problem = String(body.problem ?? "").trim().slice(0, 200);
        const scope = String(body.scope ?? "").trim().slice(0, 300);
        const claims = Array.isArray(body.claims) ? body.claims.slice(0, 8).map((claim) => String(claim).slice(0, 240)) : [];
        if (question.length < 8) return Response.json({ error: "Ask a longer question." }, { status: 400 });

        const now = Date.now();
        if (now - lastCall < 8000) return Response.json({ error: "Wait a moment before the next search." }, { status: 429 });
        lastCall = now;

        const prompt = [
          `Problem: ${problem || "unspecified"}`,
          scope ? `Scope: ${scope}` : "",
          claims.length ? `Already accepted on the graph:\n${claims.map((claim) => `- ${claim}`).join("\n")}` : "Nothing is accepted on the graph yet.",
          `Question: ${question}`,
        ]
          .filter(Boolean)
          .join("\n\n");

        const payload = {
          instructions:
            "You are the SCAI Research live agent. Search the public web for this question. Prefer papers, preprints, and primary sources. Do not invent titles, authors, years, DOIs, or quotations. If a source does not say it, do not say it. Write at most six sentences of what the sources say, then one sentence naming the gap that remains. Do not include markdown links, citation markers, or a bibliography. Your text is a note, not a claim on the concept graph.",
          input: prompt,
          tools: [{ type: "web_search" }],
          max_output_tokens: 500,
        };

        const encoder = new TextEncoder();
        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            const send = (events: OutEvent[]) => {
              controller.enqueue(encoder.encode(frame(events)));
            };
            const abort = new AbortController();
            const timer = setTimeout(() => abort.abort(), 35000);
            const stop = () => abort.abort();
            request.signal.addEventListener("abort", stop);
            send([{ type: "status", text: "Searching" }]);
            try {
              let upstream = await callModel(apiKey, { ...payload, model: "grok-4.7", stream: false }, abort.signal);
              if (!upstream.ok && (upstream.status === 400 || upstream.status === 404 || upstream.status === 422)) {
                upstream = await callModel(apiKey, { ...payload, model: "grok-4.5", stream: false }, abort.signal);
              }
              if (!upstream.ok) {
                send([{ type: "error", error: `The search failed (${upstream.status}).` }]);
                return;
              }
              const json = (await upstream.json()) as Record<string, unknown>;
              const events = eventsFromFinal(json);
              if (!events.some((event) => event.type === "delta")) send([{ type: "error", error: "The search returned no note." }]);
              else send(events);
            } catch {
              send([{ type: "error", error: "The search timed out." }]);
            } finally {
              clearTimeout(timer);
              request.signal.removeEventListener("abort", stop);
              send([{ type: "done" }]);
              controller.close();
            }
          },
        });
        return new Response(stream, { headers: SSE });
      },
    },
  },
});

async function callModel(apiKey: string, body: unknown, signal: AbortSignal) {
  return fetch("https://api.x.ai/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
    signal,
  });
}

function frame(events: OutEvent[]) {
  return events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join("");
}

function eventsFromFinal(body: Record<string, unknown>, streamed = false, seen = new Set<string>()): OutEvent[] {
  const events: OutEvent[] = [];
  const { text, sources } = readFinal(body);
  if (!streamed && text) events.push({ type: "delta", text: cleanNote(text) });
  let shown = 0;
  for (const source of sources) {
    if (seen.has(source.url) || shown >= 6) continue;
    seen.add(source.url);
    shown += 1;
    events.push({ type: "source", url: source.url, title: source.title });
  }
  return events;
}

function readFinal(body: Record<string, unknown>): { text: string; sources: Source[] } {
  let text = typeof body.output_text === "string" ? body.output_text : "";
  const sources: Source[] = [];
  const output = Array.isArray(body.output) ? body.output : [];
  for (const item of [...output, body]) {
    const content = Array.isArray((item as { content?: unknown }).content) ? (item as { content: Record<string, unknown>[] }).content : [];
    for (const block of content) {
      if (block.type === "output_text" && typeof block.text === "string") text = block.text;
      const annotations = Array.isArray(block.annotations) ? block.annotations : [];
      for (const note of annotations) {
        const ann = note as { type?: string; url?: string; title?: string };
        if (ann.type === "url_citation") pushSource(sources, ann.url, ann.title);
      }
    }
  }
  const citations = Array.isArray(body.citations) ? body.citations : [];
  for (const url of citations) pushSource(sources, typeof url === "string" ? url : undefined);
  for (const item of output) {
    const action = (item as { action?: { sources?: { url?: string }[] } }).action;
    if (!Array.isArray(action?.sources)) continue;
    for (const source of action.sources) pushSource(sources, source.url);
  }
  return { text, sources };
}

function pushSource(sources: Source[], url: string | undefined, title?: string) {
  const safe = httpUrl(url);
  if (!safe) return;
  const next = label(title, safe);
  const existing = sources.find((source) => source.url === safe);
  if (!existing) {
    sources.push({ url: safe, title: next });
    return;
  }
  if (title && existing.title === label(undefined, safe)) existing.title = next;
}

function cleanNote(text: string) {
  return text
    .replace(/\s*\[\[\d+\]\]\((https?:\/\/[^)\s]+)\)/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+([.,;:])/g, "$1")
    .trim();
}

function httpUrl(url: string | undefined) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    const host = parsed.hostname.replace(/^www\./, "");
    const arxiv = parsed.pathname.match(/(\d{4}\.\d{4,5})/);
    if (host.endsWith("arxiv.org") && arxiv) return `https://arxiv.org/abs/${arxiv[1]}`;
    if (parsed.pathname.length > 1) parsed.pathname = parsed.pathname.replace(/\/+$/, "");
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return null;
  }
}

function label(title: string | undefined, url: string) {
  if (title && !/^https?:/i.test(title) && !/^\d+$/.test(title)) return title.slice(0, 140);
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    const arxiv = parsed.pathname.match(/(\d{4}\.\d{4,5})/);
    if (host.endsWith("arxiv.org") && arxiv) return `arXiv ${arxiv[1]}`;
    if (host === "ieeexplore.ieee.org") return "IEEE Xplore";
    const slug = decodeURIComponent(parsed.pathname)
      .split("/")
      .filter((part) => part.length > 12 && !/^\d+$/.test(part))
      .at(-1);
    if (slug) {
      const pretty = slug
        .replace(/\.(html|pdf|php)$/i, "")
        .replace(/[:_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (pretty.length > 12) return pretty.slice(0, 140);
    }
    return host;
  } catch {
    return url;
  }
}
