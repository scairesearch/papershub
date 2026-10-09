defmodule Scai.Pipeline do
  @moduledoc """
  Catalog loop. Local files stand in for the GCS handoff until a bucket is mounted.
  Select keeps papers that can touch the geospatial problem. The rest stay addressable.
  """

  @geo ~w(remote sensing geospatial earth observation satellite sentinel population census eess.iv)

  def run(category \\ "seed") do
    raw = land(category)
    papers = Enum.map(raw, &normalize/1)
    selected = Enum.filter(papers, &select?/1)
    enriched = Enum.map(selected, &enrich/1)
    shard(enriched, category)
  end

  def land("seed"), do: Scai.Corpus.papers()
  def land(category) do
    case Scai.Sources.Arxiv.harvest(category, 0, 10) do
      {:ok, papers} -> papers
      _ -> []
    end
  end

  def normalize(paper) do
    paper
    |> Map.put_new(:place, %{footprint: footprint(paper), note: "Named only if the abstract says so."})
    |> Map.put_new(:method, %{id: "unspecified", name: "Unspecified"})
    |> Map.put(:id, paper.id)
  end

  def select?(paper) do
    blob = String.downcase(Enum.join([paper.title, paper.abstract | paper.fields || []], " "))
    Enum.any?(@geo, &String.contains?(blob, &1)) or paper.source == "seed"
  end

  def enrich(paper) do
    Map.update(paper, :place, %{footprint: "unknown", note: ""}, fn place ->
      Map.put(place, :footprint, place[:footprint] || footprint(paper))
    end)
  end

  def shard(papers, category) do
    path = Path.join(shard_dir(), "shard-geo.jsonl")
    File.mkdir_p!(shard_dir())
    body = papers |> Enum.map(&Jason.encode!/1) |> Enum.join("\n")
    File.write!(path, body)
    manifest = %{
      shard: "shard-geo.jsonl",
      category: category,
      count: length(papers),
      at: DateTime.utc_now() |> DateTime.to_iso8601(),
      problem_id: "geo-index"
    }
    File.write!(Path.join(shard_dir(), "manifest.json"), Jason.encode!(manifest))
    manifest
  end

  def manifest do
    path = Path.join(shard_dir(), "manifest.json")
    case File.read(path) do
      {:ok, body} ->
        case Jason.decode(body) do
          {:ok, data} -> data
          _ -> nil
        end
      _ -> nil
    end
  end

  defp footprint(paper) do
    blob = String.downcase("#{paper.title} #{paper.abstract}")
    cond do
      String.contains?(blob, "india") -> "india"
      String.contains?(blob, "global") or String.contains?(blob, "worldwide") -> "global"
      true -> "unknown"
    end
  end

  defp shard_dir, do: Path.join(to_string(:code.priv_dir(:scai)), "shards")
end
