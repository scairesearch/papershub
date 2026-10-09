defmodule Scai.Graph do
  @moduledoc """
  Origin-centered similarity neighborhood.
  Node area follows citation count. Color follows year.
  Edges are similarity, not citation-only: shared concepts, shared references, or a citation link.
  """

  def neighborhood(origin, limit \\ 11) do
    pool = Scai.Corpus.papers()
    others = Enum.reject(pool, &(&1.id == origin.id))

    ranked =
      others
      |> Enum.map(fn paper -> {paper, score(origin, paper)} end)
      |> Enum.filter(fn {_p, s} -> s > 0 end)
      |> Enum.sort_by(&elem(&1, 1), :desc)
      |> Enum.take(limit)
      |> fallback(origin, others, limit)

    nodes = [origin | Enum.map(ranked, &elem(&1, 0))]
    edges = edges(origin, ranked)
    %{nodes: layout(nodes), edges: edges, prior: prior(origin, pool), derivative: derivative(origin, pool)}
  end

  defp fallback([], origin, others, limit) do
    tokens = origin.title |> String.downcase() |> String.split(~r/[^a-z0-9]+/, trim: true) |> MapSet.new()
    others
    |> Enum.map(fn paper ->
      overlap = paper.title |> String.downcase() |> String.split(~r/[^a-z0-9]+/, trim: true) |> MapSet.new() |> MapSet.intersection(tokens) |> MapSet.size()
      {paper, overlap}
    end)
    |> Enum.filter(fn {_p, s} -> s > 0 end)
    |> Enum.sort_by(&elem(&1, 1), :desc)
    |> Enum.take(limit)
  end

  defp fallback(ranked, _origin, _others, _limit), do: ranked

  def score(a, b) do
    shared = MapSet.intersection(MapSet.new(a.concepts || []), MapSet.new(b.concepts || [])) |> MapSet.size()
    fields = MapSet.intersection(MapSet.new(a.fields || []), MapSet.new(b.fields || [])) |> MapSet.size()
    cites = if b.id in (a.references || []) or a.id in (b.references || []) or b.id in (a.cited_by || []) or a.id in (b.cited_by || []), do: 2, else: 0
    shared * 3 + fields + cites
  end

  defp edges(origin, ranked) do
    Enum.flat_map(ranked, fn {paper, s} ->
      base = [%{from: origin.id, to: paper.id, weight: s}]
      extra =
        ranked
        |> Enum.filter(fn {other, _} -> other.id > paper.id and score(paper, other) >= 3 end)
        |> Enum.map(fn {other, _} -> %{from: paper.id, to: other.id, weight: 1} end)
      base ++ extra
    end)
  end

  defp prior(origin, pool) do
    pool
    |> Enum.filter(fn p -> p.id in (origin.references || []) or (p.year && origin.year && p.year <= origin.year and score(origin, p) >= 3 and p.id != origin.id) end)
    |> Enum.sort_by(& &1.year)
    |> Enum.take(6)
  end

  defp derivative(origin, pool) do
    pool
    |> Enum.filter(fn p -> p.id in (origin.cited_by || []) or (p.year && origin.year && p.year >= origin.year and score(origin, p) >= 3 and p.id != origin.id) end)
    |> Enum.sort_by(& &1.year, :desc)
    |> Enum.take(6)
  end

  defp layout(nodes) do
    [origin | rest] = nodes
    n = max(length(rest), 1)
    placed =
      rest
      |> Enum.with_index()
      |> Enum.map(fn {paper, i} ->
        angle = 2 * :math.pi() * i / n - :math.pi() / 2
        radius = if rem(i, 2) == 0, do: 168, else: 228
        Map.merge(paper, %{x: 320 + radius * :math.cos(angle), y: 250 + radius * :math.sin(angle), origin: false})
      end)
    [Map.merge(origin, %{x: 320, y: 250, origin: true}) | placed]
  end

  def year_color(nil), do: "#8a8175"
  def year_color(year) when year < 2020, do: "#8a6a3b"
  def year_color(year) when year < 2023, do: "#3f6f8c"
  def year_color(_), do: "#5b2d8e"

  def radius(paper) do
    c = paper.citations || 0
    (10 + :math.sqrt(c) / 3) |> min(28) |> max(9)
  end
end
