defmodule Scai.Lab do
  @moduledoc false

  def contact do
    %{
      email: "governance@creativehumans.in",
      github: "https://github.com/scairesearch/papershub",
      place: "India"
    }
  end

  def snapshot do
    %{works: 510_800_000, as_of: "29 June 2026", arxiv_inside: 2_500_000}
  end

  def systems do
    [
      "Superfast cloud computing",
      "Distributed systems",
      "Computational linguistics",
      "Software engineering",
      "Autonomous systems and communications",
      "Energy and carbon footprints",
      "Digital security",
      "Social and geo-economic assessment"
    ]
  end

  def spatial do
    [
      "Earth observatory and astronomy",
      "Network economics and sustainable development",
      "Satellite and remote sensing analytics",
      "Civil and spatial engineering",
      "Spatial data and location-aware systems",
      "Ecology and climate research",
      "Population dynamics and simulation"
    ]
  end

  def questions do
    [
      "What foundational systems can run at the scale of India's population?",
      "What would a 100× more efficient computation platform actually measure?",
      "How do you map problems onto publications, as a concept graph rather than a search box?",
      "How does a geo-local index stay consistent across satellite, census, and a paper's claim?"
    ]
  end

  def layers do
    ["Parcels", "Zoning", "Topography", "Wetlands", "Demographics", "Land cover", "Imagery", "Basemap"]
  end

  def threads do
    [
      %{
        where: "IISc CDS",
        note: "Dependency graphs of concept maps, federated geo-local indexes, prosopography, and the effect of human activity on climate."
      },
      %{
        where: "IIT Kharagpur",
        note: "Source tracing at the cloud and the edge, narrative investigation, and geospatial indexing for cyber safety."
      }
    ]
  end

  def instruments do
    [
      %{name: "papershub", status: "This app", line: "The desk. A problem, a concept graph, and the claims you have actually accepted.", href: "/papers"},
      %{name: "Gale", status: "Hex 0.1.1", line: "Phoenix adapter for HTTP/1.1, HTTP/2, and HTTP/3. The only published library.", href: "https://hex.pm/packages/gale"},
      %{name: "gpark", status: "Not run on a GPU", line: "PTX emitted from Elixir and Python. Static checks pass. No device has executed it.", href: "https://github.com/scairesearch/gpark"}
    ]
  end

  def studios do
    [
      %{name: "Deceptive AI", when: "Since January 2021", line: "Venture studio. AGI for everyday life.", href: "https://deceptiveai.in/"},
      %{name: "SCAI Research Labs", when: "2025", line: "Supercomputing AI research. This site.", href: "/"},
      %{name: "Awasm Cloud", when: "Named in the program", line: "AI-native cloud. Efficient and sustainable computing.", href: "https://awasmcloud.com/"},
      %{name: "Consumer Wise", when: "September 2026", line: "World insights and customer awareness.", href: nil},
      %{name: "Creative AGI", when: "September 2026–27", line: "Agents and network computing, with Weeklycode.", href: "https://creativeagi.tech/"},
      %{name: "Weeklycode", when: "September 2026–27", line: "The network-computing half of that pair.", href: "https://weeklycode.tech/"},
      %{name: "Spatial Clues", when: "September 2027", line: "Fundamental superintelligence on the roadmap. The spatial program inside this lab is already running.", href: "https://spatialclues.com/"}
    ]
  end

  def format_count(n) when is_integer(n) do
    n
    |> Integer.to_string()
    |> String.reverse()
    |> String.replace(~r/(\d{3})(?=\d)/, "\\1,")
    |> String.reverse()
  end
end
