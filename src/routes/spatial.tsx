import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead, SiteFrame } from "@/components/site-frame";
import { CONCEPTS } from "@/data/catalog";
import { LAYERS } from "@/data/lab";
import { PROBLEM } from "@/data/program";

export const Route = createFileRoute("/spatial")({
  head: () => ({ meta: [{ title: "Spatial · SCAI Research" }] }),
  component: Spatial,
});

function Spatial() {
  return (
    <SiteFrame>
      <PageHead
        kicker="Spatial program"
        title="A place is a stack of claims, not a basemap with pins."
        lede="Satellite, census, zoning, and a paper can disagree about the same district. The program is the index that keeps those sources honest."
      />

      <section className="grid gap-10 py-12 lg:grid-cols-[1fr_280px]">
        <div>
          <p className="text-sm text-muted">Current problem on the desk</p>
          <h2 className="mt-1 text-3xl">{PROBLEM.name}</h2>
          <p className="mt-3 max-w-2xl text-pretty text-lg">{PROBLEM.scope}</p>
          <p className="mt-3 max-w-2xl text-pretty text-muted">{PROBLEM.why}</p>
          <Link to="/papers" className="mt-6 inline-flex min-h-11 items-center rounded-md bg-accent px-4 text-accent-ink">
            Open this problem in papershub
          </Link>
        </div>
        <ol className="border border-line bg-card">
          {LAYERS.map((layer, i) => (
            <li key={layer} className="flex items-baseline justify-between gap-4 border-b border-line px-4 py-2 last:border-b-0">
              <span className="text-sm tabular-nums text-muted">{String(i + 1).padStart(2, "0")}</span>
              <span className="flex-1 text-ink">{layer}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-line py-12">
        <h2 className="text-3xl">Concepts already on the desk</h2>
        <p className="mt-2 max-w-2xl text-pretty text-muted">
          A node lights only after you accept a claim. The list below is the seed vocabulary, not a knowledge graph of the field.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {CONCEPTS.map((concept) => (
            <li key={concept.id} className="rounded-md border border-line bg-card px-3 py-2 text-sm">
              {concept.name}
              {concept.parent ? <span className="text-muted"> · under {concept.parent.replace("-", " ")}</span> : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-line py-12">
        <h2 className="text-3xl">Spatial Clues</h2>
        <p className="mt-3 max-w-2xl text-pretty text-muted">
          Spatial Clues is dated September 2027 on the studio roadmap. It is not a product you can use today. The work that exists now is this program and the geospatial seed inside papershub.
        </p>
      </section>
    </SiteFrame>
  );
}
