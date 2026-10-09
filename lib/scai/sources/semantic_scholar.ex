defmodule Scai.Sources.Seed do
  def search(query) do
    q = String.downcase(query)
    papers =
      Enum.filter(Scai.Corpus.papers(), fn p ->
        blob = Enum.join([p.title, p.tldr, p.abstract | p.fields ++ p.authors], " ") |> String.downcase()
        String.contains?(blob, q) or Enum.any?(String.split(q), &String.contains?(blob, &1))
      end)
    {:ok, papers}
  end
end

defmodule Scai.Sources.SemanticScholar do
  @url "https://api.semanticscholar.org/graph/v1"
  @fields "paperId,title,abstract,year,venue,citationCount,influentialCitationCount,authors,externalIds,url,tldr,fieldsOfStudy,referenceCount"

  def search(query) do
    case get("/paper/search", query: query, limit: 8, fields: @fields) do
      {:ok, %{"data" => rows}} when is_list(rows) ->
        {:ok, Enum.map(rows, &normalize/1)}
      {:ok, _} -> {:ok, []}
      other -> other
    end
  end

  def fetch(id) do
    case get("/paper/#{id}", fields: @fields <> ",references.paperId,references.title,citations.paperId,citations.title") do
      {:ok, row} when is_map(row) -> {:ok, normalize(row)}
      other -> other
    end
  end

  defp normalize(row) do
    authors = row |> Map.get("authors", []) |> Enum.map(& &1["name"]) |> Enum.reject(&is_nil/1)
    tldr = get_in(row, ["tldr", "text"])
    ext = row["externalIds"] || %{}
    %{
      id: "s2:" <> to_string(row["paperId"]),
      source: "semantic_scholar",
      title: row["title"] || "Untitled",
      authors: authors,
      year: row["year"],
      venue: row["venue"],
      citations: row["citationCount"] || 0,
      influential: row["influentialCitationCount"] || 0,
      counts_note: "Semantic Scholar",
      fields: List.wrap(row["fieldsOfStudy"]),
      url: row["url"] || semantic_url(row["paperId"]),
      arxiv: ext["ArXiv"],
      doi: ext["DOI"],
      tldr: tldr || clip(row["abstract"]),
      abstract: row["abstract"] || "No abstract returned by Semantic Scholar.",
      concepts: [],
      references: refs(row["references"]),
      reference_stubs: stubs(row["references"]),
      cited_by: refs(row["citations"]),
      claims: []
    }
  end

  defp refs(nil), do: []
  defp refs(rows), do: Enum.map(rows, &("s2:" <> to_string(&1["paperId"]))) |> Enum.reject(&(&1 == "s2:"))

  defp stubs(nil), do: []
  defp stubs(rows) do
    Enum.map(rows, fn row ->
      %{
        id: "s2:" <> to_string(row["paperId"]),
        source: "semantic_scholar",
        title: row["title"] || "Untitled reference",
        authors: [],
        year: row["year"],
        venue: nil,
        citations: row["citationCount"] || 0,
        influential: nil,
        counts_note: "Semantic Scholar",
        fields: [],
        url: nil,
        arxiv: nil,
        doi: nil,
        tldr: nil,
        abstract: "Reference stub from the origin paper. Open the record to load the abstract.",
        concepts: [],
        references: [],
        cited_by: [],
        claims: []
      }
    end)
    |> Enum.reject(&(&1.id == "s2:"))
  end

  defp semantic_url(id), do: "https://www.semanticscholar.org/paper/#{id}"
  defp clip(nil), do: nil
  defp clip(text), do: String.slice(text, 0, 220)

  defp get(path, params) do
    req(@url <> path, params)
  end

  defp req(url, params) do
    headers =
      [{"user-agent", "ScaiResearch/0.1"}]
      |> then(fn h ->
        case System.get_env("SEMANTIC_SCHOLAR_API_KEY") do
          nil -> h
          "" -> h
          key -> [{"x-api-key", key} | h]
        end
      end)

    case Req.get(url, params: params, receive_timeout: 12_000, retry: false, headers: headers) do
      {:ok, %{status: status, body: body}} when status in 200..299 -> {:ok, body}
      {:ok, %{status: status, body: body}} -> {:error, {:http, status, clip_err(body)}}
      {:error, reason} -> {:error, reason}
    end
  end

  defp clip_err(body) when is_binary(body), do: String.slice(body, 0, 120)
  defp clip_err(body), do: inspect(body) |> String.slice(0, 120)
end
