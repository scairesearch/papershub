import { CLAIMS, type Desk } from "@/data/program";

export type Skill = "Reader" | "Critic" | "Place" | "Cost";

export type Proposal = {
  id: string;
  skill: Skill;
  gapId: "india-coverage" | "global-vs-local" | "consistency";
  claimId: string | null;
  text: string;
  span: string | null;
  evidence: boolean;
};

const closed = (desk: Desk, id: string) => desk.accepted.includes(id) || desk.rejected.includes(id);

/** One bounded pass. Proposals quote stored claims or are marked as notes. Nothing is minted. */
export function onePass(desk: Desk): Proposal[] {
  const out: Proposal[] = [];
  const prithvi = CLAIMS.find((c) => c.id === "prithvi-c2");
  const sky = CLAIMS.find((c) => c.id === "skysense-c1");

  if (prithvi && !closed(desk, prithvi.id)) {
    out.push({
      id: "reader-prithvi-c2",
      skill: "Reader",
      gapId: "india-coverage",
      claimId: prithvi.id,
      text: prithvi.text,
      span: prithvi.span,
      evidence: true,
    });
  }
  if (sky && !closed(desk, sky.id)) {
    out.push({
      id: "critic-skysense",
      skill: "Critic",
      gapId: "global-vs-local",
      claimId: sky.id,
      text: sky.text,
      span: sky.span,
      evidence: true,
    });
  }
  out.push({
    id: "place-none-india",
    skill: "Place",
    gapId: "india-coverage",
    claimId: null,
    text: "No seed paper has an India footprint. Prithvi's place is unknown.",
    span: null,
    evidence: false,
  });
  out.push({
    id: "cost-consistency",
    skill: "Cost",
    gapId: "consistency",
    claimId: null,
    text: "No seed method names a consistency constraint between an embedding and census. Lab-only training is not a district method.",
    span: null,
    evidence: false,
  });
  return out.slice(0, 4);
}
