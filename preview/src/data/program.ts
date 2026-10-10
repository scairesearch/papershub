import type { ConceptId } from "@/data/catalog";

export type Stance = "supports" | "disputes" | "reports";
export type Place = "india" | "global" | "unknown";

export type SeedPaper = {
  id: string;
  title: string;
  authors: string;
  year: number;
  venue: string;
  method: string;
  place: Place;
  placeNote: string;
  abstract: string;
};

export type Claim = {
  id: string;
  paperId: string;
  concept: ConceptId;
  text: string;
  span: string;
  stance: Stance;
};

export const PROBLEM = {
  name: "Federated geo-local index",
  scope: "Satellite embeddings, census, and paper claims kept consistent at district scale.",
  why: "India-scale geospatial AI fails when models, surveys, and papers disagree and cannot be joined.",
};

export const PAPERS: SeedPaper[] = [
  {
    id: "satmae",
    title: "SatMAE: Pre-training Transformers for Temporal and Multi-Spectral Satellite Imagery",
    authors: "Cong, Khanna, Meng",
    year: 2022,
    venue: "NeurIPS",
    method: "Masked autoencoder",
    place: "unknown",
    placeNote: "Evaluation place not stated as India.",
    abstract: "A masked autoencoder pretrains on multi-spectral, multi-temporal satellite tiles and transfers to classification and segmentation.",
  },
  {
    id: "seco",
    title: "Seasonal Contrast: Unsupervised Pre-Training from Uncurated Remote Sensing Data",
    authors: "Manas, Lacoste, Giro-i-Nieto",
    year: 2021,
    venue: "ICCV",
    method: "Seasonal contrast",
    place: "unknown",
    placeNote: "Sentinel imagery. India holdout not reported.",
    abstract: "Images of the same place in different seasons are positives, so the representation keeps what is stable.",
  },
  {
    id: "scalemae",
    title: "Scale-MAE: A Scale-Aware Masked Autoencoder for Multiscale Geospatial Representation Learning",
    authors: "Reed, Gupta, Li",
    year: 2023,
    venue: "ICCV",
    method: "Scale-aware MAE",
    place: "global",
    placeNote: "Scale is explicit. Geography of the holdout is not India.",
    abstract: "Reconstruction is conditioned on absolute scale so a model trained at one resolution is less brittle at another.",
  },
  {
    id: "prithvi",
    title: "Foundation Models for Generalist Geospatial Artificial Intelligence",
    authors: "Jakubik, Roy, Phillips",
    year: 2023,
    venue: "arXiv",
    method: "HLS masked autoencoder",
    place: "unknown",
    placeNote: "HLS pretraining. District-scale India coverage is not established.",
    abstract: "Prithvi pretrains on Harmonized Landsat Sentinel and is positioned as a generalist Earth-observation backbone.",
  },
  {
    id: "croma",
    title: "CROMA: Remote Sensing Representations with Contrastive Radar-Optical Masked Autoencoders",
    authors: "Fuller, Millard, Green",
    year: 2023,
    venue: "NeurIPS",
    method: "Radar-optical MAE",
    place: "unknown",
    placeNote: "Fusion of SAR and optical. Place of evaluation not named as India.",
    abstract: "Radar and optical are trained together. Fusion is not a late concatenate.",
  },
  {
    id: "worldpop",
    title: "Disaggregating census data for population mapping using satellite imagery",
    authors: "Stevens, Gaughan, Linard",
    year: 2015,
    venue: "PLOS ONE",
    method: "Dasymetric mapping",
    place: "global",
    placeNote: "Census allocated by settlement. Not a district consistency constraint.",
    abstract: "Population counts are redistributed onto satellite-derived settlement. The product is a map, not a joined index.",
  },
  {
    id: "skysense",
    title: "SkySense: A Multi-Modal Remote Sensing Foundation Model Towards Universal Interpretation",
    authors: "Guo, Lao, Dang",
    year: 2024,
    venue: "CVPR",
    method: "Multi-modal foundation model",
    place: "global",
    placeNote: "Universal interpretation. India is not the reported test.",
    abstract: "More modalities, one interpretation model. Geographic holdout is not the claim.",
  },
  {
    id: "clay",
    title: "Clay: an open foundation model for Earth observation",
    authors: "Clay Foundation",
    year: 2024,
    venue: "Preprint",
    method: "Open Earth-observation foundation model",
    place: "global",
    placeNote: "Open weights. Evaluation geography is not an India holdout.",
    abstract: "An open geospatial backbone. Open weights are not the same as a named India evaluation.",
  },
];

export const CLAIMS: Claim[] = [
  { id: "satmae-c1", paperId: "satmae", concept: "foundation-model", stance: "reports", span: "Abstract", text: "Temporal and spectral bands are structure, not extra channels glued onto an RGB model." },
  { id: "seco-c1", paperId: "seco", concept: "self-supervised", stance: "reports", span: "Abstract", text: "Seasonal views of one location are positives. Appearance shift that is not land-cover change is ignored." },
  { id: "scalemae-c1", paperId: "scalemae", concept: "multispectral", stance: "supports", span: "Abstract", text: "A tile at 10 m and a tile at 1 m are not the same example with a different crop." },
  { id: "prithvi-c1", paperId: "prithvi", concept: "foundation-model", stance: "supports", span: "Abstract", text: "The claim is generalist transfer across Earth-observation tasks, not a single benchmark." },
  { id: "prithvi-c2", paperId: "prithvi", concept: "federated-index", stance: "disputes", span: "Introduction", text: "Published evaluations do not establish district-scale India coverage." },
  { id: "croma-c1", paperId: "croma", concept: "data-fusion", stance: "supports", span: "Abstract", text: "Radar and optical are trained together. Fusion is not a late concatenate." },
  { id: "worldpop-c1", paperId: "worldpop", concept: "population", stance: "reports", span: "Abstract", text: "Census counts are redistributed onto settlement. There is no consistency constraint with an embedding." },
  { id: "skysense-c1", paperId: "skysense", concept: "data-fusion", stance: "disputes", span: "Abstract", text: "Universal interpretation is the claim. Geographic holdout, including India, is not the reported test." },
  { id: "clay-c1", paperId: "clay", concept: "foundation-model", stance: "disputes", span: "Abstract", text: "Open weights do not name an India tile set." },
];

export type Desk = { accepted: string[]; rejected: string[]; seen: string[]; pinned: string[] };

export const EMPTY_DESK: Desk = { accepted: [], rejected: [], seen: [], pinned: [] };

export const INCOMING: {
  id: string;
  title: string;
  arrived: string;
  concept: ConceptId;
  fields: string[];
  abstract: string;
}[] = [
  {
    id: "new-india-tiles",
    title: "District holdout for HLS embeddings on India tiles",
    arrived: "2026-09-18",
    concept: "federated-index",
    fields: ["Remote sensing"],
    abstract: "A held-out India district set for an HLS foundation model. The footprint is India.",
  },
  {
    id: "new-sar-flood",
    title: "Sentinel-1 flood extent after the 2026 monsoon",
    arrived: "2026-08-02",
    concept: "change-detection",
    fields: ["Remote sensing", "Change detection"],
    abstract: "SAR change detection on river basins. India is named for one basin only.",
  },
  {
    id: "new-census-join",
    title: "Joining night lights to a new census release",
    arrived: "2026-07-11",
    concept: "population",
    fields: ["Population", "Remote sensing"],
    abstract: "Dasymetric update when a census revision lands. No embedding consistency constraint.",
  },
  {
    id: "new-language",
    title: "A longer context window for language models",
    arrived: "2026-10-01",
    concept: "foundation-model",
    fields: ["Natural language processing"],
    abstract: "Language modeling only. It is outside this problem.",
  },
  {
    id: "new-fusion",
    title: "Radar-optical alignment under a named consistency loss",
    arrived: "2026-09-04",
    concept: "data-fusion",
    fields: ["Remote sensing", "Data fusion"],
    abstract: "SAR and optical are trained under an explicit consistency constraint. Evaluation place is not India.",
  },
];

export function paperById(id: string) {
  return PAPERS.find((p) => p.id === id);
}

export function claimsFor(paperId: string) {
  return CLAIMS.filter((c) => c.paperId === paperId);
}
