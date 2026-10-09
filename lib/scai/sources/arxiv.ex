defmodule Scai.Sources.Arxiv do
  @url "https://export.arxiv.org/api/query"

  def search(query) do
    case Req.get(@url, params: [search_query: "all:" <> query, start: 0, max_results: 6], receive_timeout: 7_000, retry: false) do
      {:ok, %{status: 200, body: body}} when is_binary(body) -> {:ok, parse_feed(body)}
      {:ok, %{status: status}} -> {:error, {:http, status}}
      {:error, reason} -> {:error, reason}
    end
  end

  def harvest(category, start, max_results) do
    case Req.get(@url,
           params: [search_query: "cat:" <> category, start: start, max_results: max_results, sortBy: "submittedDate", sortOrder: "descending"],
           receive_timeout: 20_000,
           retry: false,
           headers: [{"user-agent", "ScaiResearch/0.1 (mailto:niranjan@deceptiveai.in)"}]
         ) do
      {:ok, %{status: 200, body: body}} when is_binary(body) -> {:ok, parse_feed(body)}
      {:ok, %{status: status}} -> {:error, {:http, status}}
      {:error, reason} -> {:error, reason}
    end
  end

  def fetch(id) do
    case search("id:" <> id) do
      {:ok, [paper | _]} -> {:ok, paper}
      {:ok, []} -> {:error, :not_found}
      other -> other
    end
  end

  defp parse_feed(xml) do
    ~r/<entry>(.*?)<\/entry>/s
    |> Regex.scan(xml, capture: :all_but_first)
    |> Enum.map(fn [entry] ->
      arxiv = extract(entry, "id") |> to_string() |> String.split("/abs/") |> List.last() |> String.split("v") |> hd()
      %{
        id: "ax:" <> arxiv,
        source: "arxiv",
        title: extract(entry, "title") |> clean(),
        authors: Regex.scan(~r/<name>([^<]+)<\/name>/, entry) |> Enum.map(fn [_, n] -> n end) |> Enum.take(8),
        year: year(extract(entry, "published")),
        venue: "arXiv",
        citations: 0,
        influential: nil,
        counts_note: "arXiv has no citation count",
        fields: ["arXiv"],
        url: "https://arxiv.org/abs/" <> arxiv,
        arxiv: arxiv,
        doi: nil,
        tldr: extract(entry, "summary") |> clean() |> String.slice(0, 220),
        abstract: extract(entry, "summary") |> clean(),
        concepts: [],
        references: [],
        cited_by: [],
        claims: []
      }
    end)
  end

  defp extract(entry, tag) do
    case Regex.run(~r/<#{tag}[^>]*>(.*?)<\/#{tag}>/s, entry) do
      [_, value] -> value
      _ -> ""
    end
  end

  defp clean(text) do
    text |> String.replace(~r/\s+/, " ") |> String.trim()
  end

  defp year(<<y::binary-size(4), _::binary>>), do: String.to_integer(y)
  defp year(_), do: nil
end
