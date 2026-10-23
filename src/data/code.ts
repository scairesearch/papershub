export type CodeCard = {
  tldr: string;
  fields: string[];
  task: string;
  dataset: string;
  code: string | null;
  codeNote: string;
  result: string | null;
  influential: number;
};

/** Seed figures and official repositories. Not a live Semantic Scholar or Papers with Code pull. */
export const CODE: Record<string, CodeCard> = {
  satmae: {
    tldr: "Masked autoencoder over temporal and multi-spectral satellite tiles, not RGB video.",
    fields: ["Remote sensing", "Foundation models"],
    task: "Scene classification",
    dataset: "fMoW",
    code: "https://github.com/sustainlab-group/SatMAE",
    codeNote: "Official repository",
    result: "ViT-Large top-1 63.84% in the official repository table.",
    influential: 90,
  },
  seco: {
    tldr: "Seasonal views of one place are positives, so the representation keeps what is stable.",
    fields: ["Remote sensing", "Self-supervision"],
    task: "Scene classification",
    dataset: "BigEarthNet",
    code: "https://github.com/ServiceNow/seasonal-contrast",
    codeNote: "Official repository",
    result: null,
    influential: 60,
  },
  scalemae: {
    tldr: "Ground sample distance is an input. A 10 m tile and a 1 m tile are not the same crop.",
    fields: ["Remote sensing", "Foundation models"],
    task: "Scene classification",
    dataset: "RESISC45",
    code: "https://github.com/bair-climate-initiative/scale-mae",
    codeNote: "Official repository",
    result: null,
    influential: 40,
  },
  prithvi: {
    tldr: "HLS foundation model aimed at a family of Earth-observation tasks, not one benchmark.",
    fields: ["Remote sensing", "Foundation models"],
    task: "Semantic segmentation",
    dataset: "HLS",
    code: "https://github.com/NASA-IMPACT/hls-foundation-model",
    codeNote: "Official repository",
    result: null,
    influential: 70,
  },
  croma: {
    tldr: "Optical and radar are aligned in one pretraining objective.",
    fields: ["Remote sensing", "Data fusion"],
    task: "Scene classification",
    dataset: "BigEarthNet",
    code: "https://github.com/antofuller/CROMA",
    codeNote: "Official repository",
    result: null,
    influential: 24,
  },
  worldpop: {
    tldr: "Census counts redistributed onto satellite-derived settlement. A map, not a model checkpoint.",
    fields: ["Population mapping"],
    task: "Population mapping",
    dataset: "WorldPop",
    code: "https://www.worldpop.org/",
    codeNote: "Dataset, not a model repository",
    result: null,
    influential: 70,
  },
  skysense: {
    tldr: "Multi-modal foundation model aimed at universal interpretation. India is not the reported test.",
    fields: ["Remote sensing", "Data fusion"],
    task: "Semantic segmentation",
    dataset: "Not named as India",
    code: null,
    codeNote: "No official code in this record",
    result: null,
    influential: 16,
  },
  clay: {
    tldr: "Open Earth-observation backbone. Open weights are not an India holdout.",
    fields: ["Remote sensing", "Foundation models"],
    task: "Embedding",
    dataset: "Sentinel-2",
    code: "https://github.com/Clay-foundation/model",
    codeNote: "Official repository, Apache-2.0",
    result: null,
    influential: 12,
  },
};
