import { createFileRoute } from "@tanstack/react-router";
import { PageHead, SiteFrame } from "@/components/site-frame";
import { CONTACT } from "@/data/lab";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact · SCAI Research" }] }),
  component: Contact,
});

function Contact() {
  return (
    <SiteFrame>
      <PageHead
        kicker="Contact"
        title="Write to the lab."
        lede="One public address, from the GitHub organization. There is no form on this page and nothing is stored."
      />
      <dl className="mt-10 max-w-xl divide-y divide-line border-y border-line">
        <Row label="Email" value={CONTACT.email} href={`mailto:${CONTACT.email}`} />
        <Row label="Code" value="github.com/scairesearch" href={CONTACT.github} />
        <Row label="Place" value={CONTACT.place} />
        <Row label="Library" value="Gale on Hex" href="https://hex.pm/packages/gale" />
        <Row label="Desk source" value="papershub" href="https://github.com/scairesearch/papershub" />
      </dl>
    </SiteFrame>
  );
}

function Row({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="grid gap-1 py-4 sm:grid-cols-[8rem_1fr] sm:items-baseline">
      <dt className="text-sm text-muted">{label}</dt>
      <dd>
        {href ? (
          <a href={href} className="text-lg text-ink hover:text-accent">
            {value}
          </a>
        ) : (
          <span className="text-lg text-ink">{value}</span>
        )}
      </dd>
    </div>
  );
}
