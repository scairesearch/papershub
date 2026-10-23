import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead, SiteFrame } from "@/components/site-frame";
import { SNAPSHOT } from "@/data/catalog";
import { QUESTIONS, SPATIAL, SYSTEMS, THREADS } from "@/data/lab";

export const Route = createFileRoute("/research")({
  head: () => ({ meta: [{ title: "Research · SCAI Research" }] }),
  component: Research,
});

function Research() {
  return (
    <SiteFrame>
      <PageHead
        kicker="Program"
        title="Two columns, one lab."
        lede="Systems work is how the computation runs. Spatial work is what the computation is about. papershub is where a program keeps its claims."
      />

      <section className="grid gap-10 py-12 md:grid-cols-2">
        <Column title="Systems" href="/systems" items={SYSTEMS} />
        <Column title="Spatial" href="/spatial" items={SPATIAL} />
      </section>

      <section className="border-t border-line py-12">
        <h2 className="text-3xl">Open questions</h2>
        <ul className="mt-6 max-w-3xl space-y-4">
          {QUESTIONS.map((item) => (
            <li key={item.id} className="border-l-2 border-accent pl-4 text-pretty text-lg">
              {item.q}
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-3xl text-pretty text-sm text-muted">
          OpenAlex listed {SNAPSHOT.works.toLocaleString("en-IN")} works on {SNAPSHOT.asOf}, including about{" "}
          {SNAPSHOT.arxivInside.toLocaleString("en-IN")} arXiv preprints already inside that count. That snapshot is the literature the lab wants to reason over. It is not loaded into this site.
        </p>
      </section>

      <section className="border-t border-line py-12">
        <h2 className="text-3xl">Institutional threads</h2>
        <p className="mt-2 max-w-2xl text-pretty text-muted">
          Named in the 2025 program. This is not a staff list, and it is not a claim that those institutions run this lab.
        </p>
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {THREADS.map((thread) => (
            <li key={thread.where} className="border border-line bg-card p-4">
              <h3 className="text-2xl">{thread.where}</h3>
              <p className="mt-2 text-pretty text-muted">{thread.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <p className="border-t border-line pt-8">
        <Link to="/papers" className="text-accent">
          Work the seeded program in papershub
        </Link>
      </p>
    </SiteFrame>
  );
}

function Column({ title, href, items }: { title: string; href: "/systems" | "/spatial"; items: readonly string[] }) {
  return (
    <div>
      <h2 className="text-3xl">{title}</h2>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item} className="border-b border-line py-2">
            {item}
          </li>
        ))}
      </ul>
      <Link to={href} className="mt-4 inline-flex min-h-11 items-center text-sm text-accent">
        Open {title.toLowerCase()}
      </Link>
    </div>
  );
}
