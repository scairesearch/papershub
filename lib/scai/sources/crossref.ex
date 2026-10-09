defmodule Scai.Sources.Crossref do
  @url "https://api.crossref.org/works"

  def search(query) do
    case Req.get(@url,
           params: [query: query, rows: 6],
           receive_timeout: 7_000,
           retry: false,
           headers: [{"user-agent", "ScaiResearch/0.1 (mailto:niranjan@deceptiveai.in)"}]
         ) do
      {:ok, %{status: 200, body: %{"message" => %{"items" => items}}}} when is_list(items) ->
        {:ok, Enum.map(items, &normalize/1)}
      {:ok, %{status: status}} -> {:error, {:http, status}}
      {:error, reason} -> {:error, reason}
    end
  end

  def fetch(doi) do
    case Req.get(@url <> "/" <> URI.encode_www_form(doi), receive_timeout: 7_000, retry: false) do
      {:ok, %{status: 200, body: %{"message" => item}}} -> {:ok, normalize(item)}
      {:ok, %{status: status}} -> {:error, {:http, status}}
      {:error, reason} -> {:error, reason}
    end
  end

  defp normalize(item) do
    doi = item["DOI"]
    title = item |> Map.get("title", []) |> List.first() || "Untitled"
    authors =
      item
      |> Map.get("author", [])
      |> Enum.map(fn a -> Enum.join(Enum.reject([a["given"], a["family"]], &is_nil/1), " ") end)
      |> Enum.reject(&(&1 == ""))
      |> Enum.take(8)

    year = get_in(item, ["issued", "date-parts"]) |> year_of()
    abstract = item["abstract"] |> to_string() |> String.replace(~r/<[^>]+>/, "") |> String.trim()

    %{
      id: "cr:" <> Base.url_encode64(to_string(doi), padding: false),
      source: "crossref",
      title: title,
      authors: authors,
      year: year,
      venue: item |> Map.get("container-title", []) |> List.first(),
      citations: item["is-referenced-by-count"] || 0,
      influential: nil,
      counts_note: "Crossref",
      fields: List.wrap(item["type"]),
      url: "https://doi.org/" <> to_string(doi),
      arxiv: nil,
      doi: doi,
      tldr: String.slice(abstract, 0, 220),
      abstract: if(abstract == "", do: "No abstract returned by Crossref.", else: abstract),
      concepts: [],
      references: [],
      cited_by: [],
      claims: []
    }
  end

  defp year_of([[y | _] | _]) when is_integer(y), do: y
  defp year_of(_), do: nil
end
