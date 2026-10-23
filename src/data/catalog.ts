export const SNAPSHOT = {
  works: 510_800_000,
  asOf: "29 June 2026",
  source: "OpenAlex",
  core: 324_000_000,
  arxivInside: 2_500_000,
} as const;

export type Place = "india" | "global" | "unknown";

export type RawPaper = {
  id: string;
  title: string;
  year: number;
  fields: string[];
  abstract: string;
  doi: string | null;
  arxiv: string | null;
  citations: number;
};

export type Canonical = RawPaper & {
  key: string;
  place: Place;
  method: string;
  kept: boolean;
  reason: string;
};

export const STAGES = ["Land", "Normalize", "Select", "Enrich", "Shard"] as const;
export type Stage = (typeof STAGES)[number];

export const CONCEPTS = [
  { id: "foundation-model", name: "Foundation model", parent: null, x: 120, y: 70 },
  { id: "self-supervised", name: "Self-supervised", parent: "foundation-model", x: 90, y: 190 },
  { id: "multispectral", name: "Multispectral", parent: "foundation-model", x: 250, y: 190 },
  { id: "change-detection", name: "Change detection", parent: null, x: 400, y: 70 },
  { id: "population", name: "Population", parent: null, x: 540, y: 70 },
  { id: "data-fusion", name: "Data fusion", parent: null, x: 250, y: 310 },
  { id: "federated-index", name: "Federated index", parent: "data-fusion", x: 430, y: 310 },
] as const;

export type ConceptId = (typeof CONCEPTS)[number]["id"];

const POOL: Omit<RawPaper, "id" | "year" | "citations">[] = [
  {
    title: "Masked autoencoders on temporal Sentinel-2 tiles",
    fields: ["Remote sensing", "Foundation models"],
    abstract: "A masked autoencoder pretrains on multi-spectral satellite imagery and transfers to segmentation.",
    doi: "10.0000/satmae",
    arxiv: "2207.08051",
  },
  {
    title: "Seasonal contrast from uncurated remote sensing",
    fields: ["Remote sensing"],
    abstract: "Images of the same place in different seasons are treated as positives.",
    doi: null,
    arxiv: "2103.16607",
  },
  {
    title: "Scale-aware reconstruction for geospatial tiles",
    fields: ["Remote sensing"],
    abstract: "Ground sample distance is an input. A 10 m tile is not a crop of a 1 m tile.",
    doi: "10.0000/scalemae",
    arxiv: "2212.14532",
  },
  {
    title: "HLS foundation model for Earth observation",
    fields: ["Remote sensing", "Foundation models"],
    abstract: "Pretraining on Harmonized Landsat Sentinel. Published evaluations do not establish district-scale India coverage.",
    doi: null,
    arxiv: "2310.18660",
  },
  {
    title: "Radar-optical masked autoencoders",
    fields: ["Remote sensing", "Data fusion"],
    abstract: "SAR and optical views are contrasted in one objective. Fusion is not a late concatenate.",
    doi: "10.0000/croma",
    arxiv: "2311.00566",
  },
  {
    title: "Population mapping from census and night lights",
    fields: ["Population", "Remote sensing"],
    abstract: "Dasymetric allocation of census counts onto satellite-derived settlement. Evaluation is global, not an India holdout.",
    doi: "10.0000/pop",
    arxiv: null,
  },
  {
    title: "District-scale consistency between embeddings and census",
    fields: ["Remote sensing", "Population"],
    abstract: "A consistency constraint joins satellite embeddings to India district census. The footprint is India.",
    doi: "10.0000/india-index",
    arxiv: null,
  },
  {
    title: "Attention is all you need, language only",
    fields: ["Natural language processing"],
    abstract: "A transformer language model. No imagery, no place, no census.",
    doi: "10.0000/attn",
    arxiv: "1706.03762",
  },
  {
    title: "Protein structure from amino-acid sequences",
    fields: ["Computational biology"],
    abstract: "A folding model. Not a geospatial method.",
    doi: "10.0000/fold",
    arxiv: null,
  },
  {
    title: "Recommendation systems on video watch graphs",
    fields: ["Information retrieval"],
    abstract: "Collaborative filtering over watch histories. No satellite or census.",
    doi: null,
    arxiv: null,
  },
  {
    title: "Theorem proving with large language models",
    fields: ["Formal methods"],
    abstract: "Proof search in a formal library. Out of scope for the geo-local index.",
    doi: "10.0000/proof",
    arxiv: null,
  },
  {
    title: "Sentinel-1 flood extent over river basins",
    fields: ["Remote sensing", "Change detection"],
    abstract: "SAR change detection for floods. The reported basins are not named as India.",
    doi: null,
    arxiv: null,
  },
];

export function makeChunk(start: number, count: number): RawPaper[] {
  const out: RawPaper[] = [];
  for (let i = 0; i < count; i++) {
    const n = start + i;
    const base = POOL[n % POOL.length];
    out.push({
      ...base,
      id: `W${String(n).padStart(8, "0")}`,
      year: 2016 + (n % 10),
      citations: (n * 17) % 1400,
      title: n < POOL.length ? base.title : `${base.title} (${n})`,
    });
  }
  return out;
}

const METHODS: [RegExp, string][] = [
  [/masked autoencoder|mae/i, "Masked autoencoder"],
  [/seasonal contrast/i, "Seasonal contrast"],
  [/scale-aware/i, "Scale-aware MAE"],
  [/hls|harmonized landsat/i, "HLS masked autoencoder"],
  [/radar-optical|sar/i, "Radar-optical MAE"],
  [/census|population|dasymetric/i, "Dasymetric mapping"],
  [/consistency/i, "Consistency constraint"],
  [/flood/i, "SAR change detection"],
];

const GEO = /remote sensing|geospatial|satellite|sentinel|landsat|population|census|earth observation|sar|multispectral|flood/i;

export function runStages(raw: RawPaper): Canonical {
  const key = raw.doi ? `doi:${raw.doi}` : raw.arxiv ? `arxiv:${raw.arxiv}` : `openalex:${raw.id}`;
  const blob = `${raw.title} ${raw.abstract} ${raw.fields.join(" ")}`;
  const kept = GEO.test(blob);
  const place: Place = /india/i.test(blob) ? "india" : /global/i.test(blob) ? "global" : "unknown";
  const method = METHODS.find(([re]) => re.test(blob))?.[1] ?? "Unspecified";
  return {
    ...raw,
    key,
    place,
    method,
    kept,
    reason: kept ? "touches the geo-local problem" : "outside the problem",
  };
}

export const SEED_CONCEPT: Record<string, ConceptId> = {
  "Masked autoencoders on temporal Sentinel-2 tiles": "foundation-model",
  "Seasonal contrast from uncurated remote sensing": "self-supervised",
  "Scale-aware reconstruction for geospatial tiles": "multispectral",
  "HLS foundation model for Earth observation": "foundation-model",
  "Radar-optical masked autoencoders": "data-fusion",
  "Population mapping from census and night lights": "population",
  "District-scale consistency between embeddings and census": "federated-index",
  "Sentinel-1 flood extent over river basins": "change-detection",
};

export const GAPS = [
  {
    id: "india-coverage",
    question: "Where is India actually evaluated, versus US and EU tiles?",
    reason: "missing-place",
    next: "Re-score the seed models on a held-out India tile set before claiming transfer.",
  },
  {
    id: "global-vs-local",
    question: "Does a global foundation model hold, or does a district fine-tune dominate?",
    reason: "contradiction",
    next: "Pair one global checkpoint with one local fine-tune on the same tiles.",
  },
  {
    id: "consistency",
    question: "Which method fuses satellite embeddings with census under an explicit consistency constraint?",
    reason: "missing-method",
    next: "Name the constraint. A claim without a span stays a note.",
  },
] as const;
