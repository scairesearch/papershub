import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead, SiteFrame } from "@/components/site-frame";
import { STUDIOS } from "@/data/lab";

export const Route = createFileRoute("/studio")({
  head: () => ({ meta: [{ title: "Studio · SCAI Research" }] }),
  component: Studio,
});

function Studio() {
  return (
    <SiteFrame>
      <PageHead
        kicker="Venture map"
        title="The 2025 program names six studios. This site is one of them."
        lede="Dates below are the roadmap, not launch announcements. An address is listed only when the program wrote one down. Being listed is not the same as being up."
      />

      <ol className="mt-10 divide-y divide-line border-y border-line">
        {STUDIOS.map((studio, i) => (
          <li key={studio.name} className="grid gap-2 py-5 sm:grid-cols-[4rem_1fr_auto] sm:items-baseline">
            <p className="tabular-nums text-muted">{String(i + 1).padStart(2, "0")}</p>
            <div>
              <h2 className="text-2xl">{studio.name}</h2>
              <p className="text-pretty text-muted">{studio.line}</p>
            </div>
            <div className="text-sm">
              <p className="text-muted">{studio.when}</p>
              {studio.href === "/" ? (
                <Link to="/" className="text-accent">
                  This site
                </Link>
              ) : studio.href ? (
                <a href={studio.href} className="text-accent">
                  Named address
                </a>
              ) : (
                <p className="text-muted">No address in the program</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </SiteFrame>
  );
}
