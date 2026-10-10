import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { FileText, Pause, Play } from "lucide-react";
import { CONCEPTS, GAPS, SNAPSHOT, STAGES, makeChunk, runStages, type Canonical, type Stage } from "@/data/catalog";
import { CLAIMS, EMPTY_DESK, INCOMING, PAPERS, PROBLEM, claimsFor, paperById, type Desk } from "@/data/program";

export const Route = createFileRoute("/")({ component: Home });

const CHUNK = 24;

function Home() {
  const [view, setView] = useState<"pipeline" | "map" | "read" | "brief" | "new">("map");
  const [running, setRunning] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [stage, setStage] = useState<Stage>("Land");
  const [seen, setSeen] = useState<Canonical[]>([]);
  const [selected, setSelected] = useState<Canonical | null>(null);
  const [concept, setConcept] = useState<string>("federated-index");
  const [gapId, setGapId] = useState<(typeof GAPS)[number]["id"]>("india-coverage");
  const [paperId, setPaperId] = useState("prithvi");
  const [desk, setDesk] = useState<Desk>(EMPTY_DESK);
  const [deskReady, setDeskReady] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const cursorRef = useRef(0);

  useEffect(() => {
    const raw = localStorage.getItem("papershub-desk");
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Desk;
        if (Array.isArray(parsed.accepted) && Array.isArray(parsed.rejected)) {
          setDesk({
            accepted: parsed.accepted,
            rejected: parsed.rejected,
            seen: Array.isArray(parsed.seen) ? parsed.seen : [],
            pinned: Array.isArray(parsed.pinned) ? parsed.pinned : [],
          });
        }
      } catch {
        /* keep the empty desk */
      }
    }
    setDeskReady(true);
  }, []);

  useEffect(() => {
    if (!deskReady) return;
    localStorage.setItem("papershub-desk", JSON.stringify(desk));
  }, [desk, deskReady]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const c = cursorRef.current;
      const batch = makeChunk(c, CHUNK).map(runStages);
      cursorRef.current = c + CHUNK;
      setCursor(cursorRef.current);
      setSeen((prev) => [...batch].reverse().concat(prev).slice(0, 80));
      setSelected((cur) => cur ?? batch.find((p) => p.kept) ?? null);
      setStage(STAGES[Math.floor(cursorRef.current / CHUNK) % STAGES.length]);
      setElapsed(startedAt ? Date.now() - startedAt : 0);
    }, 320);
    return () => window.clearInterval(id);
  }, [running, startedAt]);

  const kept = seen.filter((p) => p.kept);
  const rate = elapsed > 0 ? Math.round((cursor / elapsed) * 1000) : 0;

  function toggle() {
    setRunning((on) => {
      if (!on) setStartedAt(Date.now() - elapsed);
      return !on;
    });
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-5 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
        <div>
          <p className="text-sm tracking-wide text-muted">SCAI Research</p>
          <h1 className="text-3xl text-ink">papershub</h1>
          <p className="max-w-xl text-pretty text-muted">
            A research program, not a search engine. The catalog is {format(SNAPSHOT.works)} OpenAlex works.
            This run keeps only what can touch the federated geo-local index.
          </p>
        </div>
        <nav className="flex flex-wrap gap-2">
          <Tab on={view === "map"} onClick={() => setView("map")}>Map</Tab>
          <Tab on={view === "read"} onClick={() => setView("read")}>Read</Tab>
          <Tab on={view === "brief"} onClick={() => setView("brief")}>Brief</Tab>
          <Tab on={view === "new"} onClick={() => setView("new")}>New</Tab>
          <Tab on={view === "pipeline"} onClick={() => setView("pipeline")}>Pipeline</Tab>
        </nav>
      </header>

      {view === "pipeline" ? (
        <Pipeline
          running={running}
          stage={stage}
          cursor={cursor}
          rate={rate}
          seen={seen}
          kept={kept}
          selected={selected}
          onToggle={toggle}
          onSelect={setSelected}
        />
      ) : view === "read" ? (
        <Read paperId={paperId} onPaper={setPaperId} desk={desk} onDesk={setDesk} />
      ) : view === "brief" ? (
        <Brief gapId={gapId} onGap={setGapId} desk={desk} />
      ) : view === "new" ? (
        <NewWorks desk={desk} onDesk={setDesk} />
      ) : (
        <MapView concept={concept} onConcept={setConcept} desk={desk} onRead={(id) => { setPaperId(id); setView("read"); }} onBrief={(id) => { setGapId(id); setView("brief"); }} />
      )}
    </main>
  );
}

function Pipeline({
  running,
  stage,
  cursor,
  rate,
  seen,
  kept,
  selected,
  onToggle,
  onSelect,
}: {
  running: boolean;
  stage: Stage;
  cursor: number;
  rate: number;
  seen: Canonical[];
  kept: Canonical[];
  selected: Canonical | null;
  onToggle: () => void;
  onSelect: (p: Canonical) => void;
}) {
  const dropped = seen.length - kept.length;
  return (
    <section className="mt-5 grid gap-4 lg:grid-cols-[1fr_280px]">
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Snapshot" value={format(SNAPSHOT.works)} note={`${SNAPSHOT.source} · ${SNAPSHOT.asOf}`} />
          <Stat label="Landed in this run" value={format(cursor)} note="sample stream, not the snapshot" />
          <Stat label="Kept" value={String(kept.length)} note={`${dropped} dropped as outside the problem`} />
        </div>

        <div className="rounded-lg border border-line bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl">Catalog loop</h2>
            <button
              type="button"
              onClick={onToggle}
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-accent px-4 text-accent-ink"
            >
              {running ? <Pause size={16} /> : <Play size={16} />}
              {running ? "Pause" : cursor ? "Continue" : "Run sample"}
            </button>
          </div>
          <ol className="mt-4 grid gap-2 sm:grid-cols-5">
            {STAGES.map((name) => (
              <li
                key={name}
                className={`rounded-md border px-3 py-2 text-sm ${
                  stage === name && running ? "border-accent bg-bg text-ink" : "border-line text-muted"
                }`}
              >
                {name}
              </li>
            ))}
          </ol>
          <p className="mt-3 text-sm text-muted tabular-nums">
            {rate > 0 ? `${format(rate)} records/s in this preview. ` : "Idle. "}
            At 50,000 records/s on one NVMe box, a select pass of the snapshot is about three hours.
            arXiv is already inside OpenAlex ({format(SNAPSHOT.arxivInside)} preprints). Do not add the counts.
          </p>
        </div>

        <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-card">
          {seen.length === 0 && (
            <li className="p-4 text-muted">Run the sample. Each row is normalized, then kept or dropped.</li>
          )}
          {seen.map((paper) => (
            <li key={paper.id}>
              <button
                type="button"
                onClick={() => onSelect(paper)}
                className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left hover:bg-bg"
              >
                <span>
                  <span className="block text-ink">{paper.title}</span>
                  <span className="text-sm text-muted">{paper.key}</span>
                </span>
                <span
                  className={`shrink-0 rounded-md px-2 py-1 text-sm ${
                    paper.kept ? "bg-keep-soft text-keep" : "bg-drop-soft text-drop"
                  }`}
                >
                  {paper.kept ? "keep" : "drop"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <aside className="h-fit rounded-lg border border-line bg-card p-4">
        <h2 className="text-xl">Inspector</h2>
        {selected ? (
          <div className="mt-3 space-y-2 text-sm">
            <p className="text-base text-ink">{selected.title}</p>
            <p className="text-muted">{selected.year} · {selected.citations} citations</p>
            <p>Method · {selected.method}</p>
            <p>Place · {selected.place}</p>
            <p className="text-pretty text-muted">{selected.abstract}</p>
            <p className={selected.kept ? "text-keep" : "text-drop"}>{selected.reason}</p>
          </div>
        ) : (
          <p className="mt-3 text-muted">Select a row.</p>
        )}
        <h2 className="mt-6 text-xl">Shard</h2>
        <p className="mt-2 text-sm text-pretty text-muted">
          {kept.length} papers in shard-geo. The edge serves this shard. A miss falls through to OpenAlex and can be pinned. The snapshot is not loaded into the edge.
        </p>
      </aside>
    </section>
  );
}

function MapView({
  concept,
  onConcept,
  desk,
  onRead,
  onBrief,
}: {
  concept: string;
  onConcept: (id: string) => void;
  desk: Desk;
  onRead: (id: string) => void;
  onBrief: (id: (typeof GAPS)[number]["id"]) => void;
}) {
  const node = CONCEPTS.find((c) => c.id === concept) ?? CONCEPTS[0];
  const accepted = CLAIMS.filter((c) => desk.accepted.includes(c.id) && c.concept === node.id);
  const pinnedHere = INCOMING.filter((w) => desk.pinned.includes(w.id) && w.concept === node.id);
  const live = new Set([
    ...CLAIMS.filter((c) => desk.accepted.includes(c.id)).map((c) => c.concept),
    ...INCOMING.filter((w) => desk.pinned.includes(w.id)).map((w) => w.concept),
  ]);

  return (
    <section className="mt-5 grid gap-4 lg:grid-cols-[220px_1fr_260px]">
      <aside className="rounded-lg border border-line bg-card p-4">
        <p className="text-sm text-muted">Problem</p>
        <h2 className="text-xl">{PROBLEM.name}</h2>
        <p className="mt-2 text-sm text-pretty text-muted">{PROBLEM.scope}</p>
        <p className="mt-4 text-sm text-muted">Gaps</p>
        <ul className="mt-2 space-y-2">
          {GAPS.map((g) => (
            <li key={g.id}>
              <button type="button" onClick={() => onBrief(g.id)} className="min-h-11 text-left text-sm text-ink hover:text-accent">
                {g.question}
              </button>
              <span className="block text-sm text-muted">{g.reason}</span>
            </li>
          ))}
        </ul>
      </aside>
      <div className="rounded-lg border border-line bg-card p-4">
        <h2 className="text-xl">Concept graph</h2>
        <p className="text-sm text-muted">Only an accepted claim lights a node. A span you have not accepted stays a note.</p>
        <svg viewBox="0 0 640 380" className="mt-2 h-80 w-full" role="img" aria-label="Concept graph">
          {CONCEPTS.filter((c) => c.parent).map((c) => {
            const parent = CONCEPTS.find((p) => p.id === c.parent)!;
            return <line key={c.id} x1={parent.x} y1={parent.y} x2={c.x} y2={c.y} stroke="var(--color-line)" strokeWidth="1.5" />;
          })}
          {CONCEPTS.map((c) => {
            const on = c.id === concept;
            const lit = live.has(c.id);
            return (
              <g key={c.id} onClick={() => onConcept(c.id)} className="cursor-pointer">
                <rect
                  x={c.x - 62}
                  y={c.y - 16}
                  width="124"
                  height="32"
                  rx="4"
                  fill={on ? "var(--color-accent)" : "var(--color-card)"}
                  stroke={lit || on ? "var(--color-accent)" : "var(--color-line)"}
                />
                <text x={c.x} y={c.y + 4} textAnchor="middle" fontSize="11" fill={on ? "var(--color-accent-ink)" : "var(--color-ink)"}>
                  {c.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <aside className="rounded-lg border border-line bg-card p-4">
        <h2 className="text-xl">{node.name}</h2>
        <ul className="mt-3 space-y-3 text-sm">
          {accepted.length === 0 && pinnedHere.length === 0 && <li className="text-muted">No accepted claim on this concept. Open Read and accept a span.</li>}
          {accepted.map((c) => {
            const paper = paperById(c.paperId);
            return (
              <li key={c.id}>
                <button type="button" onClick={() => onRead(c.paperId)} className="text-left text-ink hover:text-accent">{paper?.title}</button>
                <span className={`mt-1 block ${c.stance === "disputes" ? "text-drop" : "text-keep"}`}>{c.stance}</span>
                <span className="block text-pretty">{c.text}</span>
                <span className="text-muted">{c.span}</span>
              </li>
            );
          })}
          {pinnedHere.map((w) => (
            <li key={w.id}>
              <span className="block text-ink">{w.title}</span>
              <span className="text-muted">New · {w.arrived} · no span yet, so it is not a claim</span>
            </li>
          ))}
        </ul>
      </aside>
    </section>
  );
}

function Read({
  paperId,
  onPaper,
  desk,
  onDesk,
}: {
  paperId: string;
  onPaper: (id: string) => void;
  desk: Desk;
  onDesk: (desk: Desk) => void;
}) {
  const paper = paperById(paperId) ?? PAPERS[0];
  const claims = claimsFor(paper.id);

  function setStance(id: string, stance: "accepted" | "rejected") {
    const accepted = desk.accepted.filter((x) => x !== id);
    const rejected = desk.rejected.filter((x) => x !== id);
    onDesk({
      ...desk,
      accepted: stance === "accepted" ? [...accepted, id] : accepted,
      rejected: stance === "rejected" ? [...rejected, id] : rejected,
    });
  }

  return (
    <section className="mt-5 grid gap-4 lg:grid-cols-[280px_1fr]">
      <ul className="space-y-2">
        {PAPERS.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => onPaper(p.id)}
              className={`w-full rounded-md border px-3 py-2 text-left ${p.id === paper.id ? "border-accent bg-card" : "border-line bg-card"}`}
            >
              <span className="block text-sm text-ink">{p.title}</span>
              <span className="text-sm text-muted">{p.year} · {p.method}</span>
            </button>
          </li>
        ))}
      </ul>
      <article className="rounded-lg border border-line bg-card p-4">
        <p className="text-sm text-muted">{paper.venue} · {paper.place} · {paper.placeNote}</p>
        <h2 className="mt-1 text-2xl">{paper.title}</h2>
        <p className="text-sm text-muted">{paper.authors} · {paper.year}</p>
        <p className="mt-3 text-pretty">{paper.abstract}</p>
        <h3 className="mt-5 text-xl">Claims</h3>
        <ul className="mt-2 space-y-3">
          {claims.map((c) => {
            const state = desk.accepted.includes(c.id) ? "accepted" : desk.rejected.includes(c.id) ? "rejected" : "note";
            return (
              <li key={c.id} className="rounded-md border border-line p-3">
                <p className="text-pretty">{c.text}</p>
                <p className="mt-1 text-sm text-muted">{c.span} · {c.stance} · {state === "note" ? "note, not on the graph" : state}</p>
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={() => setStance(c.id, "accepted")} className="min-h-11 rounded-md bg-keep px-3 text-accent-ink">Accept</button>
                  <button type="button" onClick={() => setStance(c.id, "rejected")} className="min-h-11 rounded-md border border-line px-3">Reject</button>
                </div>
              </li>
            );
          })}
        </ul>
      </article>
    </section>
  );
}

function Brief({
  gapId,
  onGap,
  desk,
}: {
  gapId: (typeof GAPS)[number]["id"];
  onGap: (id: (typeof GAPS)[number]["id"]) => void;
  desk: Desk;
}) {
  const gap = GAPS.find((g) => g.id === gapId) ?? GAPS[0];
  const accepted = CLAIMS.filter((c) => desk.accepted.includes(c.id));
  const support = accepted.filter((c) => c.stance === "supports");
  const against = accepted.filter((c) => c.stance === "disputes");
  const text = [
    PROBLEM.name,
    gap.question,
    "",
    "For",
    ...support.map((c) => `- ${c.text} (${c.span}, ${paperById(c.paperId)?.title})`),
    "",
    "Against",
    ...against.map((c) => `- ${c.text} (${c.span}, ${paperById(c.paperId)?.title})`),
    "",
    "Place",
    ...PAPERS.map((p) => `- ${p.title}: ${p.place}`),
    "",
    "Next",
    gap.next,
  ].join("\n");

  return (
    <section className="mt-5 grid gap-4 lg:grid-cols-[240px_1fr]">
      <ul className="space-y-2">
        {GAPS.map((g) => (
          <li key={g.id}>
            <button type="button" onClick={() => onGap(g.id)} className={`w-full rounded-md border px-3 py-2 text-left text-sm ${g.id === gap.id ? "border-accent bg-card" : "border-line bg-card"}`}>
              {g.question}
            </button>
          </li>
        ))}
      </ul>
      <article className="rounded-lg border border-line bg-card p-5">
        <p className="flex items-center gap-2 text-sm text-muted"><FileText size={14} /> One page</p>
        <h2 className="mt-1 text-2xl">{PROBLEM.name}</h2>
        <p className="mt-2 text-pretty">{gap.question}</p>
        <p className="text-sm text-muted">{gap.reason}</p>
        <h3 className="mt-4 text-xl">For</h3>
        <ClaimList claims={support} empty="Accept a supporting claim in Read." />
        <h3 className="mt-4 text-xl">Against</h3>
        <ClaimList claims={against} empty="Accept a disputing claim in Read. Unaccepted text is not evidence." />
        <h3 className="mt-4 text-xl">Place footprint</h3>
        <ul className="mt-1 text-sm">
          {PAPERS.map((p) => (
            <li key={p.id}>{p.title} · {p.place}</li>
          ))}
        </ul>
        <h3 className="mt-4 text-xl">Next experiment</h3>
        <p className="text-pretty">{gap.next}</p>
        <button
          type="button"
          className="mt-4 min-h-11 rounded-md bg-accent px-4 text-accent-ink"
          onClick={() => {
            const blob = new Blob([text], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${gap.id}.txt`;
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Export brief
        </button>
      </article>
    </section>
  );
}

function ClaimList({ claims, empty }: { claims: { id: string; text: string; span: string; paperId: string }[]; empty: string }) {
  if (claims.length === 0) return <p className="text-sm text-muted">{empty}</p>;
  return (
    <ul className="mt-1 space-y-2 text-sm">
      {claims.map((c) => (
        <li key={c.id}>
          <span className="text-pretty">{c.text}</span>
          <span className="block text-muted">{c.span} · {paperById(c.paperId)?.title}</span>
        </li>
      ))}
    </ul>
  );
}

function NewWorks({ desk, onDesk }: { desk: Desk; onDesk: (desk: Desk) => void }) {
  const unseen = INCOMING.filter((w) => !desk.seen.includes(w.id));

  function mark(id: string) {
    if (desk.seen.includes(id)) return;
    onDesk({ ...desk, seen: [...desk.seen, id] });
  }

  function pin(id: string) {
    const pinned = desk.pinned.includes(id) ? desk.pinned : [...desk.pinned, id];
    const seen = desk.seen.includes(id) ? desk.seen : [...desk.seen, id];
    onDesk({ ...desk, pinned, seen });
  }

  return (
    <section className="mt-5">
      <div className="rounded-lg border border-line bg-card p-4">
        <h2 className="text-xl">Works since the snapshot</h2>
        <p className="mt-1 max-w-2xl text-pretty text-sm text-muted">
          The OpenAlex snapshot closed on {SNAPSHOT.asOf}. These arrived after it. The same select rule applies: only a work that can touch the geo-local problem can be pinned. A pin is not a claim until a span is accepted in Read.
        </p>
        <p className="mt-2 text-sm tabular-nums text-ink">{unseen.length} unseen of {INCOMING.length}</p>
      </div>
      <ul className="mt-4 divide-y divide-line overflow-hidden rounded-lg border border-line bg-card">
        {INCOMING.map((work) => {
          const kept = /remote sensing|geospatial|satellite|sentinel|population|census|sar|flood/i.test(`${work.title} ${work.abstract} ${work.fields.join(" ")}`);
          const seen = desk.seen.includes(work.id);
          return (
            <li key={work.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-ink">{work.title}</p>
                <p className="text-sm text-muted">{work.arrived} · {work.abstract}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-md px-2 py-1 text-sm ${kept ? "bg-keep-soft text-keep" : "bg-drop-soft text-drop"}`}>{kept ? "keep" : "drop"}</span>
                <span className="text-sm text-muted">{seen ? "seen" : "new"}</span>
                {!seen && (
                  <button type="button" onClick={() => mark(work.id)} className="min-h-11 rounded-md border border-line px-3">Mark seen</button>
                )}
                {kept && !desk.pinned.includes(work.id) && (
                  <button type="button" onClick={() => pin(work.id)} className="min-h-11 rounded-md bg-accent px-3 text-accent-ink">Pin to map</button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-lg border border-line bg-card p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="font-display text-2xl tabular-nums text-ink">{value}</p>
      <p className="text-sm text-muted">{note}</p>
    </div>
  );
}

function Tab({ on, onClick, children }: { on: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-11 rounded-md border px-4 ${on ? "border-accent bg-accent text-accent-ink" : "border-line bg-card text-ink"}`}
    >
      {children}
    </button>
  );
}

function format(n: number) {
  return new Intl.NumberFormat("en-IN").format(n);
}
