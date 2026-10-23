import { useMemo, useState } from "react";
import { CODE } from "@/data/code";
import { PAPERS, type Desk } from "@/data/program";
import { LINKS, workStanding } from "@/lib/engine";

export function CatalogView({ desk, onOpen }: { desk: Desk; onOpen: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const [task, setTask] = useState("All");
  const [onlyCode, setOnlyCode] = useState(false);
  const [sort, setSort] = useState<"citations" | "year">("citations");

  const tasks = ["All", ...new Set(Object.values(CODE).map((c) => c.task))];
  const q = query.trim().toLowerCase();

  const rows = useMemo(() => {
    return PAPERS.map((paper) => {
      const card = CODE[paper.id];
      const link = LINKS[paper.id];
      return { paper, card, citations: link?.citations ?? 0 };
    })
      .filter(({ paper, card }) => {
        if (!card) return false;
        if (task !== "All" && card.task !== task) return false;
        if (onlyCode && !card.code) return false;
        if (!q) return true;
        const blob = `${paper.title} ${paper.authors} ${paper.abstract} ${card.tldr} ${card.task} ${card.dataset} ${card.fields.join(" ")}`.toLowerCase();
        return blob.includes(q);
      })
      .sort((a, b) => (sort === "year" ? b.paper.year - a.paper.year : b.citations - a.citations));
  }, [q, task, onlyCode, sort]);

  const datasets = useMemo(() => {
    const map = new Map<string, { name: string; papers: string[] }>();
    for (const paper of PAPERS) {
      const card = CODE[paper.id];
      if (!card) continue;
      const row = map.get(card.dataset) ?? { name: card.dataset, papers: [] };
      row.papers.push(paper.title);
      map.set(card.dataset, row);
    }
    return [...map.values()].filter((d) => !q || `${d.name} ${d.papers.join(" ")}`.toLowerCase().includes(q));
  }, [q]);

  return (
    <section className="mt-5">
      <form className="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()} role="search">
        <label htmlFor="catalog-search" className="text-sm text-muted">Search papers and datasets</label>
        <div className="flex flex-wrap gap-2">
          <input
            id="catalog-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SatMAE, BigEarthNet, HLS"
            className="min-w-56 flex-1 rounded-md border border-line bg-card px-3 py-3 text-ink"
          />
        <select value={sort} onChange={(e) => setSort(e.target.value as "citations" | "year")} className="rounded-md border border-line bg-card px-3 py-2" aria-label="Sort papers">
          <option value="citations">Citations</option>
          <option value="year">Year</option>
        </select>
        <button type="button" onClick={() => setOnlyCode((v) => !v)} className={`min-h-11 rounded-md border px-3 ${onlyCode ? "border-accent bg-accent text-accent-ink" : "border-line"}`}>
          Has code
        </button>
        </div>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {tasks.map((name) => (
          <button key={name} type="button" onClick={() => setTask(name)} className={`rounded-full border px-3 py-1 text-sm ${task === name ? "border-accent bg-accent text-accent-ink" : "border-line"}`}>
            {name}
          </button>
        ))}
      </div>

      <h2 className="mt-5 text-xl">Papers <span className="text-sm text-muted">{rows.length}</span></h2>
      <ul className="mt-2 divide-y divide-line overflow-hidden rounded-lg border border-line bg-card">
        {rows.length === 0 && <li className="p-4 text-muted">No paper matches.</li>}
        {rows.map(({ paper, card, citations }) => {
          const standing = workStanding(paper.id, desk);
          return (
          <li key={paper.id} className="px-4 py-4">
            <button type="button" onClick={() => onOpen(paper.id)} className="text-left">
              <span className="text-lg text-ink">{paper.title}</span>
            </button>
            <p className="text-sm text-muted">
              {paper.authors} · {paper.year} · {paper.venue} · {citations} citations · {card.influential} influential
            </p>
            <p className="mt-1 text-sm">
              {standing.onGraph ? "On the map" : "Not on the map"}
              {" · "}
              {standing.accepted} of {standing.claims} claims accepted
              {" · "}
              {standing.place}
              {" · "}
              {standing.cost}
            </p>
            <p className="mt-1 text-pretty">{card.tldr}</p>
            <p className="mt-2 flex flex-wrap gap-2 text-sm">
              {card.fields.map((field) => (
                <span key={field} className="rounded-full border border-line px-2 py-0.5 text-muted">{field}</span>
              ))}
              <span className="rounded-full border border-line px-2 py-0.5">{card.task}</span>
              <button type="button" onClick={() => setQuery(card.dataset)} className="rounded-full border border-line px-2 py-0.5">
                {card.dataset}
              </button>
            </p>
            <p className="mt-2 text-sm">
              {card.code ? (
                <a href={card.code} className="text-accent underline" target="_blank" rel="noreferrer">{card.codeNote}</a>
              ) : (
                <span className="text-muted">{card.codeNote}</span>
              )}
              {card.result && <span className="mt-1 block text-muted">{card.result}</span>}
            </p>
          </li>
          );
        })}
      </ul>

      <h2 className="mt-6 text-xl">Datasets <span className="text-sm text-muted">{datasets.length}</span></h2>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2">
        {datasets.length === 0 && <li className="text-muted">No dataset matches.</li>}
        {datasets.map((d) => (
          <li key={d.name}>
            <button type="button" onClick={() => setQuery(d.name)} className="h-full w-full rounded-lg border border-line bg-card px-4 py-3 text-left">
              <span className="text-ink">{d.name}</span>
              <span className="mt-1 block text-sm text-muted">{d.papers.length} {d.papers.length === 1 ? "paper" : "papers"} · {d.papers.join(", ")}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
