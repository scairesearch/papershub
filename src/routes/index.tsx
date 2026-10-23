import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFrame } from "@/components/site-frame";
import { SNAPSHOT } from "@/data/catalog";
import { INSTRUMENTS, QUESTIONS, SPATIAL, SYSTEMS } from "@/data/lab";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "SCAI Research" }, { name: "description", content: "Supercomputing research lab. Spatial intelligence and the papershub desk." }],
  }),
  component: Home,
});

function format(n: number) {
  return new Intl.NumberFormat("en-IN").format(n);
}

function Home() {
  return (
    <SiteFrame>
      <section className="grid gap-10 border-b border-line pb-12 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
        <div>
          <p className="text-sm tracking-wide text-muted">SCAI Research Labs · India · 2025</p>
          <h1 className="mt-3 max-w-3xl text-4xl text-ink sm:text-6xl">
            Supercomputing research for systems that have to work at population scale.
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-lg text-muted">
            The lab keeps computation and place in one program. papershub is the desk: a concept graph of claims you have accepted, not a chat window over a PDF.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/papers" className="inline-flex min-h-11 items-center rounded-md bg-accent px-4 text-accent-ink">
              Open papershub
            </Link>
            <Link to="/research" className="inline-flex min-h-11 items-center rounded-md border border-line bg-card px-4 text-ink">
              The research program
            </Link>
          </div>
        </div>
        <dl className="grid gap-4 border-t border-line pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
          <div>
            <dt className="text-sm text-muted">Literature, not our index</dt>
            <dd className="font-display text-3xl tabular-nums text-ink">{format(SNAPSHOT.works)}</dd>
            <dd className="text-sm text-muted">OpenAlex works, {SNAPSHOT.asOf}. The desk does not hold them.</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Published library</dt>
            <dd className="font-display text-3xl text-ink">Gale 0.1.1</dd>
            <dd className="text-sm text-muted">HTTP/1.1, HTTP/2, and HTTP/3 on Hex.</dd>
          </div>
        </dl>
      </section>

      <section className="grid gap-10 py-12 md:grid-cols-2">
        <Program title="Systems" href="/systems" items={SYSTEMS} />
        <Program title="Spatial" href="/spatial" items={SPATIAL} />
      </section>

      <section className="border-t border-line py-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-3xl">Instruments</h2>
          <p className="max-w-md text-sm text-pretty text-muted">Three things exist. Only one of them is a hosted desk, and only one is a published package.</p>
        </div>
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {INSTRUMENTS.map((item) => (
            <li key={item.name} className="grid gap-2 py-4 sm:grid-cols-[160px_1fr_auto] sm:items-baseline">
              <p className="font-display text-xl text-ink">{item.name}</p>
              <p className="text-pretty text-muted">{item.line}</p>
              {item.external ? (
                <a href={item.href} className="text-sm text-accent">
                  {item.status}
                </a>
              ) : (
                <Link to={item.href} className="text-sm text-accent">
                  {item.status}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-line py-12">
        <h2 className="text-3xl">Questions the lab is organized around</h2>
        <p className="mt-2 max-w-2xl text-pretty text-muted">These are open. The site does not report them as results.</p>
        <ol className="mt-6 grid gap-4 md:grid-cols-2">
          {QUESTIONS.map((item, i) => (
            <li key={item.id} className="border border-line bg-card p-4">
              <p className="text-sm tabular-nums text-muted">0{i + 1}</p>
              <p className="mt-2 text-pretty text-lg text-ink">{item.q}</p>
            </li>
          ))}
        </ol>
      </section>
    </SiteFrame>
  );
}

function Program({ title, href, items }: { title: string; href: "/systems" | "/spatial"; items: readonly string[] }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-3xl">{title}</h2>
        <Link to={href} className="text-sm text-accent">
          Program
        </Link>
      </div>
      <ul className="mt-4 divide-y divide-line border-t border-line">
        {items.map((item) => (
          <li key={item} className="py-2 text-ink">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
