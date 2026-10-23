import { Link, useRouterState } from "@tanstack/react-router";
import { CONTACT } from "@/data/lab";

const LINKS = [
  { to: "/research", label: "Research" },
  { to: "/spatial", label: "Spatial" },
  { to: "/systems", label: "Systems" },
  { to: "/studio", label: "Studio" },
  { to: "/contact", label: "Contact" },
] as const;

export function LabBar() {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="border-b border-line bg-bg">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link to="/" className="font-display text-xl text-ink">
          SCAI Research
        </Link>
        <nav aria-label="Lab" className="flex flex-wrap items-center gap-x-1 gap-y-1">
          {LINKS.map((item) => {
            const on = path === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`inline-flex min-h-11 items-center px-3 text-sm ${on ? "text-ink" : "text-muted"}`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            to="/papers"
            className={`inline-flex min-h-11 items-center rounded-md px-3 text-sm ${
              path === "/papers" ? "bg-accent text-accent-ink" : "border border-line bg-card text-ink"
            }`}
          >
            papershub
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function LabFooter() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-4 py-8 text-sm text-muted sm:px-6">
        <div>
          <p className="font-display text-base text-ink">SCAI Research Labs</p>
          <p>Supercomputing research. {CONTACT.place}.</p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <a className="inline-flex min-h-11 items-center hover:text-ink" href={`mailto:${CONTACT.email}`}>
            {CONTACT.email}
          </a>
          <a className="inline-flex min-h-11 items-center hover:text-ink" href={CONTACT.github}>
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}

export function SiteFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <LabBar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">{children}</main>
      <LabFooter />
    </div>
  );
}

export function PageHead({ kicker, title, lede }: { kicker: string; title: string; lede: string }) {
  return (
    <header className="max-w-3xl border-b border-line pb-8">
      <p className="text-sm tracking-wide text-muted">{kicker}</p>
      <h1 className="mt-2 text-4xl text-ink sm:text-5xl">{title}</h1>
      <p className="mt-4 text-pretty text-lg text-muted">{lede}</p>
    </header>
  );
}
