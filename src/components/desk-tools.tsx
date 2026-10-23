import { useMemo, useState } from "react";
import { CONCEPTS } from "@/data/catalog";
import { PAPERS } from "@/data/program";
import { LINKS, contradictions, neighborhood, searchWorks } from "@/lib/engine";

export function SearchView({ onOpen }: { onOpen: (id: string) => void }) {
  const [query, setQuery] = useState("india");
  const [origin, setOrigin] = useState("prithvi");
  const hits = useMemo(() => searchWorks(query), [query]);
  const ring = neighborhood(origin);
  const maxCite = Math.max(1, ...ring.map((n) => n.citations));

  return (
    <section className="mt-5 grid gap-4 lg:grid-cols-[1fr_280px]">
      <div>
        <label className="block text-sm text-muted" htmlFor="q">Search the seed and the new works</label>
        <input
          id="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mt-1 w-full rounded-md border border-line bg-card px-3 py-2 text-ink"
        />
        <ul className="mt-3 divide-y divide-line overflow-hidden rounded-lg border border-line bg-card">
          {hits.length === 0 && <li className="p-4 text-muted">Nothing in the seed or the post-snapshot list.</li>}
          {hits.map((hit) => (
            <li key={hit.id}>
              <button type="button" onClick={() => (hit.kind === "seed" ? setOrigin(hit.id) : onOpen(hit.id))} className="w-full px-4 py-3 text-left hover:bg-bg">
                <span className="block text-ink">{hit.title}</span>
                <span className="text-sm text-muted">{hit.year} · {hit.kind}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <aside className="rounded-lg border border-line bg-card p-4">
        <h2 className="text-xl">Neighborhood</h2>
        <p className="text-sm text-muted">Size is citations. An edge is a citation link in the seed, not a similarity score.</p>
        <svg viewBox="0 0 260 220" className="mt-2 h-52 w-full" role="img" aria-label="Citation neighborhood">
          {ring.filter((n) => !n.origin).map((n, i) => {
            const angle = (Math.PI * 2 * i) / Math.max(1, ring.length - 1);
            const x = 130 + Math.cos(angle) * 80;
            const y = 110 + Math.sin(angle) * 70;
            return <line key={n.id} x1="130" y1="110" x2={x} y2={y} stroke="var(--color-line)" />;
          })}
          {ring.map((n) => {
            const others = ring.filter((x) => !x.origin);
            const idx = others.findIndex((x) => x.id === n.id);
            const angle = n.origin ? 0 : (Math.PI * 2 * idx) / Math.max(1, others.length);
            const x = n.origin ? 130 : 130 + Math.cos(angle) * 80;
            const y = n.origin ? 110 : 110 + Math.sin(angle) * 70;
            const r = 8 + (n.citations / maxCite) * 10;
            return (
              <g key={n.id} onClick={() => setOrigin(n.id)} className="cursor-pointer">
                <circle cx={x} cy={y} r={r} fill={n.origin ? "var(--color-accent)" : "var(--color-card)"} stroke="var(--color-accent)" />
                <text x={x} y={y + r + 10} textAnchor="middle" fontSize="8" fill="var(--color-ink)">{n.id}</text>
              </g>
            );
          })}
        </svg>
        <ul className="mt-2 space-y-1 text-sm">
          {ring.map((n) => (
            <li key={n.id}>{n.edge} · {n.citations} · {n.cost}</li>
          ))}
        </ul>
      </aside>
    </section>
  );
}

export function LensView() {
  const rows = contradictions();
  return (
    <section className="mt-5 grid gap-4 lg:grid-cols-2">
      <div className="rounded-lg border border-line bg-card p-4">
        <h2 className="text-xl">Contradictions</h2>
        <p className="text-sm text-muted">Same concept, a supporting span and a disputing span. Neither is on the graph until you accept it.</p>
        <ul className="mt-3 space-y-4">
          {rows.map((row) => (
            <li key={row.concept}>
              <p className="text-ink">{CONCEPTS.find((c) => c.id === row.concept)?.name}</p>
              {row.disputes.map((c) => (
                <p key={c.id} className="text-sm text-drop">{c.text}</p>
              ))}
              {row.supports.slice(0, 1).map((c) => (
                <p key={c.id} className="text-sm text-keep">{c.text}</p>
              ))}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-lg border border-line bg-card p-4">
        <h2 className="text-xl">Cost</h2>
        <p className="text-sm text-muted">A method that cannot run at population scale stays marked. Training cost is not inference cost.</p>
        <ul className="mt-3 space-y-3 text-sm">
          {PAPERS.map((p) => {
            const link = LINKS[p.id];
            return (
              <li key={p.id}>
                <span className="text-ink">{p.title}</span>
                <span className={`ml-2 ${link?.cost === "population" ? "text-keep" : "text-drop"}`}>{link?.cost}</span>
                <span className="block text-muted">{link?.costNote}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
