import { useRef, useState } from "react";
import { GAPS } from "@/data/catalog";
import { PROBLEM } from "@/data/program";

type Source = { url: string; title: string };
type Phase = "idle" | "searching" | "writing" | "done";

export function LiveAgent({ claims }: { claims: string[] }) {
  const [question, setQuestion] = useState<string>(GAPS[0].question);
  const [note, setNote] = useState("");
  const [sources, setSources] = useState<Source[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  async function run() {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setPhase("searching");
    setError("");
    setNote("");
    setSources([]);
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ question, problem: PROBLEM.name, scope: PROBLEM.scope, claims }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? `The search failed (${res.status}).`);
        setPhase("idle");
        return;
      }
      if (!res.body) {
        setError("The search returned nothing.");
        setPhase("idle");
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() ?? "";
        for (const chunk of chunks) apply(chunk, setNote, setSources, setPhase, setError);
      }
      setPhase((current) => (current === "idle" ? "idle" : "done"));
    } catch (err) {
      if (controller.signal.aborted) {
        setPhase("idle");
        return;
      }
      setError(err instanceof Error ? err.message : "The search stopped.");
      setPhase("idle");
    }
  }

  function stop() {
    abortRef.current?.abort();
    setPhase("idle");
  }

  const busy = phase === "searching" || phase === "writing";

  return (
    <section className="mt-5 grid gap-4 lg:grid-cols-[280px_1fr]">
      <div className="space-y-3">
        <div className="rounded-lg border border-line bg-card p-4">
          <p className="text-sm text-muted">Problem</p>
          <h2 className="text-xl">{PROBLEM.name}</h2>
          <p className="mt-2 text-sm text-pretty text-muted">{PROBLEM.scope}</p>
          <p className="mt-3 text-sm text-muted">
            {claims.length === 0
              ? "No accepted claim is attached."
              : `${claims.length} accepted ${claims.length === 1 ? "claim is" : "claims are"} attached.`}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-card p-4 text-sm text-pretty text-muted">
          This searches the live web. The note is not a claim. To put something on the map, open Read and accept a span.
        </div>
      </div>
      <div className="rounded-lg border border-line bg-card p-4">
        <label htmlFor="research-question" className="text-sm text-muted">
          Question
        </label>
        <textarea
          id="research-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value.slice(0, 400))}
          rows={3}
          className="mt-2 w-full rounded-md border border-line bg-bg px-3 py-2 text-ink"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" onClick={run} disabled={busy || question.trim().length < 8} className="min-h-11 rounded-md bg-accent px-4 text-accent-ink disabled:opacity-50">
            {busy ? "Researching" : "Search live"}
          </button>
          {busy && (
            <button type="button" onClick={stop} className="min-h-11 rounded-md border border-line px-4">
              Stop
            </button>
          )}
          <p className="text-sm text-muted">{phase === "searching" ? "Searching" : phase === "writing" ? "Writing" : phase === "done" ? "Done" : "Idle"}</p>
        </div>
        {error && <p className="mt-3 text-sm text-drop">{error}</p>}
        <div className="mt-4 min-h-24 whitespace-pre-wrap text-pretty">{note || <span className="text-muted">The note will appear here as it is written.</span>}</div>
        {sources.length > 0 && (
          <div className="mt-4 border-t border-line pt-3">
            <h3 className="text-xl">Sources</h3>
            <ul className="mt-2 space-y-2 text-sm">
              {sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} className="text-accent" target="_blank" rel="noreferrer">
                    {source.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

function apply(
  chunk: string,
  setNote: (value: string | ((prev: string) => string)) => void,
  setSources: (value: Source[] | ((prev: Source[]) => Source[])) => void,
  setPhase: (value: Phase) => void,
  setError: (value: string) => void,
) {
  const line = chunk.split("\n").find((item) => item.startsWith("data:"));
  if (!line) return;
  let event: { type?: string; text?: string; url?: string; title?: string; error?: string };
  try {
    event = JSON.parse(line.slice(5).trim()) as typeof event;
  } catch {
    return;
  }
  if (event.type === "status") setPhase("searching");
  if (event.type === "delta" && event.text) {
    setPhase("writing");
    setNote((prev) => prev + event.text);
  }
  if (event.type === "source" && event.url) {
    const url = event.url;
    const title = event.title || url;
    setSources((prev) => (prev.some((source) => source.url === url) ? prev : [...prev, { url, title }]));
  }
  if (event.type === "error" && event.error) {
    setError(event.error);
    setPhase("idle");
  }
  if (event.type === "done") setPhase("done");
}
