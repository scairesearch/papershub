import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead, SiteFrame } from "@/components/site-frame";
import { STAGES } from "@/data/catalog";

export const Route = createFileRoute("/systems")({
  head: () => ({ meta: [{ title: "Systems · SCAI Research" }] }),
  component: Systems,
});

const ROWS = [
  {
    name: "Gale",
    state: "Published",
    detail: "Phoenix adapter. HTTP/1.1 and HTTP/2 over Bandit, HTTP/3 over QUIC. Hex 0.1.1. The GitHub tree has moved past that release.",
    href: "https://hex.pm/packages/gale",
    label: "Hex",
  },
  {
    name: "Catalog loop",
    state: "Sample, in papershub",
    detail: "Land, normalize, select, enrich, shard. The preview streams a sample. It does not scan the OpenAlex snapshot.",
    href: "/papers",
    label: "Run it",
  },
  {
    name: "gpark",
    state: "Lab only",
    detail: "Emits PTX from Elixir and Python. Format checks and goldens pass. No GPU has executed a kernel.",
    href: "https://github.com/scairesearch/gpark",
    label: "Repository",
  },
] as const;

function Systems() {
  return (
    <SiteFrame>
      <PageHead
        kicker="Systems program"
        title="Efficiency is a measurement, not a slogan."
        lede="The lab's systems question is what it would take to run the spatial index far cheaper than a Western per-query stack. Nothing on this page is that result."
      />

      <ol className="mt-10 flex flex-wrap gap-2">
        {STAGES.map((stage, i) => (
          <li key={stage} className="rounded-md border border-line bg-card px-3 py-2 text-sm">
            <span className="tabular-nums text-muted">{i + 1}</span> {stage}
          </li>
        ))}
      </ol>

      <ul className="mt-10 divide-y divide-line border-y border-line">
        {ROWS.map((row) => (
          <li key={row.name} className="grid gap-2 py-5 md:grid-cols-[180px_1fr]">
            <div>
              <h2 className="text-2xl">{row.name}</h2>
              <p className="text-sm text-muted">{row.state}</p>
            </div>
            <div>
              <p className="text-pretty">{row.detail}</p>
              {row.href === "/papers" ? (
                <Link to="/papers" className="mt-2 inline-flex min-h-11 items-center text-sm text-accent">
                  {row.label}
                </Link>
              ) : (
                <a href={row.href} className="mt-2 inline-flex min-h-11 items-center text-sm text-accent">
                  {row.label}
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>

      <section className="mt-12 max-w-3xl">
        <h2 className="text-3xl">What is not built</h2>
        <ul className="mt-4 space-y-2 text-pretty text-muted">
          <li>No exabyte store.</li>
          <li>No claim of a 100× saving. That figure is a question, and it needs a workload, a baseline, and a bill.</li>
          <li>No multi-tenant lab, and no swarm of agents. papershub has one live research agent. Its notes are not claims.</li>
          <li>Awasm Cloud is a named studio for the AI-native cloud. It is not this deployment.</li>
        </ul>
      </section>
    </SiteFrame>
  );
}
