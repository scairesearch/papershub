defmodule Scai.Sources do
  @moduledoc """
  Fan-out across the seed and live indexes.
  Connected Papers has no public API. The neighborhood graph is built here
  from citation links and shared concepts, which is the pattern that product uses.
  """

  @sources [
    {"index", Scai.Sources.LocalIndex},
    {"seed", Scai.Sources.Seed},
    {"semantic_scholar", Scai.Sources.SemanticScholar},
    {"openalex", Scai.Sources.OpenAlex},
    {"arxiv", Scai.Sources.Arxiv},
    {"crossref", Scai.Sources.Crossref}
  ]

  def source_names, do: Enum.map(@sources, &elem(&1, 0))

  def search(query) do
    q = String.trim(query || "")
    if q == "" do
      %{query: "", papers: Scai.Corpus.papers(), reports: [%{source: "seed", status: :ok, count: length(Scai.Corpus.papers())}]}
    else
      key = "search:" <> String.downcase(q)
      case Scai.Desk.cache_get(key, 600) do
        nil ->
          result = fanout(q)
          Scai.Desk.cache_put(key, result)
          result
        cached -> cached
      end
    end
  end

  def fetch(id) do
    cond do
      paper = Scai.Corpus.paper(id) -> paper
      paper = Scai.Desk.get_paper(id) -> paper
      true -> resolve(id)
    end
  end

  def enrich(id) do
    paper = fetch(id)
    needs_refs = paper && paper.source == "semantic_scholar" && paper.references == []
    if needs_refs, do: resolve(id) || paper, else: paper
  end

  defp fanout(q) do
    outcomes =
      @sources
      |> Task.async_stream(fn {name, mod} -> {name, mod.search(q)} end,
        timeout: 20_000,
        on_timeout: :kill_task,
        max_concurrency: 5
      )
      |> Enum.to_list()

    reports =
      Enum.zip(@sources, outcomes)
      |> Enum.map(fn {{name, _mod}, outcome} ->
        case outcome do
          {:ok, {^name, {:ok, papers}}} -> {name, papers, %{source: name, status: :ok, count: length(papers)}}
          {:ok, {_name, {:error, reason}}} -> {name, [], %{source: name, status: :error, reason: inspect(reason), count: 0}}
          {:exit, reason} -> {name, [], %{source: name, status: :error, reason: inspect(reason), count: 0}}
        end
      end)

    papers =
      reports
      |> Enum.flat_map(&elem(&1, 1))
      |> Enum.map(&Scai.Desk.cache_paper/1)
      |> dedupe()

    %{query: q, papers: papers, reports: Enum.map(reports, &elem(&1, 2))}
  end

  defp resolve(id) do
    key = "paper:" <> id
    case Scai.Desk.cache_get(key, 3600) do
      %{} = paper -> paper
      _ ->
        paper =
          case id do
            "s2:" <> rest -> unwrap(Scai.Sources.SemanticScholar.fetch(rest))
            "oa:" <> rest -> unwrap(Scai.Sources.OpenAlex.fetch(rest))
            "ax:" <> rest -> unwrap(Scai.Sources.Arxiv.fetch(rest))
            "cr:" <> rest -> unwrap(Scai.Sources.Crossref.fetch(Base.url_decode64!(rest, padding: false)))
            _ -> nil
          end
        if paper, do: Scai.Desk.cache_put(key, paper)
        paper && Scai.Desk.cache_paper(paper)
    end
  end

  defp unwrap({:ok, paper}), do: paper
  defp unwrap(_), do: nil

  defp dedupe(papers) do
    papers
    |> Enum.reduce({[], MapSet.new()}, fn paper, {acc, seen} ->
      key = normalize(paper.title)
      if key == "" or MapSet.member?(seen, key) do
        {acc, seen}
      else
        {[paper | acc], MapSet.put(seen, key)}
      end
    end)
    |> elem(0)
    |> Enum.reverse()
    |> Enum.sort_by(&(&1.citations || 0), :desc)
  end

  defp normalize(title) do
    title
    |> to_string()
    |> String.downcase()
    |> String.replace(~r/[^a-z0-9]+/, " ")
    |> String.trim()
  end
end
