import { makeChunk, runStages, type Canonical } from "@/data/catalog";
import { CLAIMS, INCOMING, PAPERS, type Claim, type Desk } from "@/data/program";

export type Cost = "population" | "district" | "lab-only";

export const LINKS: Record<string, { refs: string[]; citedBy: string[]; citations: number; cost: Cost; costNote: string }> = {
  satmae: { refs: ["seco"], citedBy: ["scalemae", "prithvi", "croma"], citations: 1100, cost: "lab-only", costNote: "From-scratch pretraining. Not a population-scale run." },
  seco: { refs: [], citedBy: ["satmae", "croma"], citations: 700, cost: "district", costNote: "Contrastive pass on tiles. Feasible at district scale, not as a global retrain." },
  scalemae: { refs: ["satmae"], citedBy: ["prithvi", "clay"], citations: 420, cost: "lab-only", costNote: "Scale-conditioned pretraining stays a lab job." },
  prithvi: { refs: ["satmae", "scalemae"], citedBy: ["clay", "skysense"], citations: 800, cost: "lab-only", costNote: "HLS backbone. Inference can be district. Training is not population-scale." },
  croma: { refs: ["seco", "satmae"], citedBy: ["clay"], citations: 260, cost: "district", costNote: "Radar-optical alignment on a region. Not a census of the country." },
  worldpop: { refs: [], citedBy: [], citations: 900, cost: "population", costNote: "Gridded population already runs at country scale. The missing piece is the consistency rule." },
  skysense: { refs: ["prithvi", "croma"], citedBy: [], citations: 200, cost: "lab-only", costNote: "Multi-modal pretraining. Universal claim, lab cost." },
  clay: { refs: ["prithvi", "scalemae", "croma"], citedBy: [], citations: 180, cost: "district", costNote: "Open weights make inference cheap. Training the checkpoint was not." },
};

export function workStanding(paperId: string, desk: Desk) {
  const claims = CLAIMS.filter((c) => c.paperId === paperId);
  const accepted = claims.filter((c) => desk.accepted.includes(c.id)).length;
  const paper = PAPERS.find((p) => p.id === paperId);
  return {
    claims: claims.length,
    accepted,
    onGraph: accepted > 0,
    place: paper?.place ?? "unknown",
    cost: LINKS[paperId]?.cost ?? "lab-only",
  };
}
export function searchWorks(query: string) {
  const q = query.trim().toLowerCase();
  const rows = [
    ...PAPERS.map((p) => ({ id: p.id, title: p.title, year: p.year, kind: "seed" as const, text: `${p.title} ${p.abstract} ${p.method}` })),
    ...INCOMING.map((w) => ({ id: w.id, title: w.title, year: Number(w.arrived.slice(0, 4)), kind: "new" as const, text: `${w.title} ${w.abstract}` })),
  ];
  if (!q) return rows;
  return rows.filter((r) => r.text.toLowerCase().includes(q));
}

export function neighborhood(originId: string) {
  const link = LINKS[originId];
  if (!link) return [];
  const ids = [...new Set([originId, ...link.refs, ...link.citedBy])];
  return ids.map((id) => {
    const paper = PAPERS.find((p) => p.id === id);
    const meta = LINKS[id];
    return {
      id,
      title: paper?.title ?? id,
      year: paper?.year ?? 0,
      citations: meta?.citations ?? 0,
      cost: meta?.cost ?? "lab-only",
      origin: id === originId,
      edge: id === originId ? "origin" : link.refs.includes(id) ? "cites" : "cited-by",
    };
  });
}

export function contradictions() {
  const byConcept = new Map<string, Claim[]>();
  for (const claim of CLAIMS) {
    const list = byConcept.get(claim.concept) ?? [];
    list.push(claim);
    byConcept.set(claim.concept, list);
  }
  return [...byConcept.entries()]
    .map(([concept, claims]) => ({
      concept,
      supports: claims.filter((c) => c.stance === "supports" || c.stance === "reports"),
      disputes: claims.filter((c) => c.stance === "disputes"),
    }))
    .filter((row) => row.supports.length > 0 && row.disputes.length > 0);
}

export function serverPass(chunks = 4): { landed: number; kept: number; dropped: number; sample: Canonical[] } {
  const papers = makeChunk(0, chunks * 24).map(runStages);
  const kept = papers.filter((p) => p.kept);
  return { landed: papers.length, kept: kept.length, dropped: papers.length - kept.length, sample: kept.slice(0, 8) };
}
