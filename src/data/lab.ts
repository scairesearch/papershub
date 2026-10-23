export const CONTACT = {
  email: "governance@creativehumans.in",
  github: "https://github.com/scairesearch",
  place: "India",
} as const;

export const SYSTEMS = [
  "Superfast cloud computing",
  "Distributed systems",
  "Computational linguistics",
  "Software engineering",
  "Autonomous systems and communications",
  "Energy and carbon footprints",
  "Digital security",
  "Social and geo-economic assessment",
] as const;

export const SPATIAL = [
  "Earth observatory and astronomy",
  "Network economics and sustainable development",
  "Satellite and remote sensing analytics",
  "Civil and spatial engineering",
  "Spatial data and location-aware systems",
  "Ecology and climate research",
  "Population dynamics and simulation",
] as const;

export const QUESTIONS = [
  {
    id: "foundations",
    q: "What foundational systems can run at the scale of India's population?",
  },
  {
    id: "efficiency",
    q: "What would a 100× more efficient computation platform actually measure?",
  },
  {
    id: "literature",
    q: "How do you map problems onto publications, as a concept graph rather than a search box?",
  },
  {
    id: "place",
    q: "How does a geo-local index stay consistent across satellite, census, and a paper's claim?",
  },
] as const;

export const LAYERS = [
  "Parcels",
  "Zoning",
  "Topography",
  "Wetlands",
  "Demographics",
  "Land cover",
  "Imagery",
  "Basemap",
] as const;

export const THREADS = [
  {
    where: "IISc CDS",
    note: "Dependency graphs of concept maps, federated geo-local indexes, prosopography, and the effect of human activity on climate.",
  },
  {
    where: "IIT Kharagpur",
    note: "Source tracing at the cloud and the edge, narrative investigation, and geospatial indexing for cyber safety.",
  },
] as const;

export const INSTRUMENTS = [
  {
    name: "papershub",
    href: "/papers",
    external: false,
    status: "Open on this site",
    line: "The desk. A problem, a concept graph, and the claims you have actually accepted.",
  },
  {
    name: "Gale",
    href: "https://hex.pm/packages/gale",
    external: true,
    status: "Hex 0.1.1",
    line: "Phoenix adapter for HTTP/1.1, HTTP/2, and HTTP/3. The only published library.",
  },
  {
    name: "gpark",
    href: "https://github.com/scairesearch/gpark",
    external: true,
    status: "Not run on a GPU",
    line: "PTX emitted from Elixir and Python. Static checks pass. No device has executed it.",
  },
] as const;

export const STUDIOS = [
  {
    name: "Deceptive AI",
    when: "Since January 2021",
    line: "Venture studio. AGI for everyday life.",
    href: "https://deceptiveai.in/",
  },
  {
    name: "SCAI Research Labs",
    when: "2025",
    line: "Supercomputing AI research. This site.",
    href: "/",
  },
  {
    name: "Awasm Cloud",
    when: "Named in the program",
    line: "AI-native cloud. Efficient and sustainable computing.",
    href: "https://awasmcloud.com/",
  },
  {
    name: "Consumer Wise",
    when: "September 2026",
    line: "World insights and customer awareness.",
    href: null,
  },
  {
    name: "Creative AGI",
    when: "September 2026–27",
    line: "Agents and network computing, with Weeklycode.",
    href: "https://creativeagi.tech/",
  },
  {
    name: "Weeklycode",
    when: "September 2026–27",
    line: "The network-computing half of that pair.",
    href: "https://weeklycode.tech/",
  },
  {
    name: "Spatial Clues",
    when: "September 2027",
    line: "Fundamental superintelligence on the roadmap. The spatial program inside this lab is already running.",
    href: "https://spatialclues.com/",
  },
] as const;
