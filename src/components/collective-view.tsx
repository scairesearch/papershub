import { useState } from "react";
import { GAPS } from "@/data/catalog";
import { type Desk } from "@/data/program";
import { onePass, type Proposal } from "@/lib/collective";

export function CollectiveView({ desk, onDesk }: { desk: Desk; onDesk: (desk: Desk) => void }) {
  const [log, setLog] = useState<Proposal[]>([]);
  const [ran, setRan] = useState(false);

  function run() {
    setRan(true);
    const next = onePass(desk).filter((p) => !log.some((x) => x.id === p.id));
    setLog((prev) => [...prev, ...next]);
  }

  function decide(proposal: Proposal, stance: "accepted" | "rejected") {
    if (!proposal.claimId) return;
    const accepted = stance === "accepted" ? [...new Set([...desk.accepted, proposal.claimId])] : desk.accepted.filter((id) => id !== proposal.claimId);
    const rejected = stance === "rejected" ? [...new Set([...desk.rejected, proposal.claimId])] : desk.rejected.filter((id) => id !== proposal.claimId);
    onDesk({ ...desk, accepted, rejected });
  }

  return (
    <section className="mt-5 grid gap-4 lg:grid-cols-[220px_1fr]">
      <aside className="rounded-lg border border-line bg-card p-4">
        <h2 className="text-xl">Needs</h2>
        <p className="mt-1 text-sm text-muted">A skill claims a gap. It does not get a script.</p>
        <ul className="mt-3 space-y-3 text-sm">
          {GAPS.map((gap) => (
            <li key={gap.id}>
              <span className="text-ink">{gap.reason}</span>
              <span className="mt-1 block text-muted">{gap.question}</span>
            </li>
          ))}
        </ul>
        <button type="button" onClick={run} className="mt-4 min-h-11 rounded-md bg-accent px-4 text-accent-ink">
          One pass
        </button>
        <p className="mt-2 text-sm text-muted">Cap is four proposals. No new papers.</p>
      </aside>
      <div>
        <h2 className="text-xl">Proposals</h2>
        {!ran && <p className="mt-2 text-muted">The collective is idle until you run a pass.</p>}
        {ran && log.length === 0 && <p className="mt-2 text-muted">Nothing left to propose. Accepted and rejected claims stay closed.</p>}
        <ul className="mt-3 space-y-3">
          {log.map((proposal) => {
            const gap = GAPS.find((g) => g.id === proposal.gapId);
            const accepted = proposal.claimId ? desk.accepted.includes(proposal.claimId) : false;
            const rejected = proposal.claimId ? desk.rejected.includes(proposal.claimId) : false;
            return (
              <li key={proposal.id} className="rounded-lg border border-line bg-card p-4">
                <p className="text-sm text-muted">{proposal.skill} · {gap?.reason}</p>
                <p className="mt-1 text-pretty text-ink">{proposal.text}</p>
                <p className="mt-1 text-sm text-muted">{proposal.evidence ? `Span: ${proposal.span}` : "No span. This is a note, not evidence."}</p>
                {proposal.evidence ? (
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={() => decide(proposal, "accepted")} className="min-h-11 rounded-md bg-keep px-3 text-accent-ink">
                      {accepted ? "On the map" : "Accept"}
                    </button>
                    <button type="button" onClick={() => decide(proposal, "rejected")} className="min-h-11 rounded-md border border-line px-3">
                      {rejected ? "Rejected" : "Reject"}
                    </button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
