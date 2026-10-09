defmodule Scai.Sources.OpenAlex do
  @url "https://api.openalex.org/works"

  def search(query) do
    case req(@url, search: query, "per-page": 8, mailto: "niranjan@deceptiveai.in") do
      {:ok, %{"results" => rows}} when is_list(rows) -> {:ok, Enum.map(rows, &normalize/1)}
      {:ok, _} -> {:ok, []}
      other -> other
    end
  end

  def fetch(id) do
    case req("https://api.openalex.org/works/#{id}", mailto: "niranjan@deceptiveai.in") do
      {:ok, row} when is_map(row) -> {:ok, normalize(row)}
      other -> other
    end
  end

  defp normalize(row) do
    openalex = row["id"] |> to_string() |> String.split("/") |> List.last()
    authors =
      row
      |> get_in(["authorships"])
      |> List.wrap()
      |> Enum.map(&get_in(&1, ["author", "display_name"]))
      |> Enum.reject(&is_nil/1)
      |> Enum.take(8)

    %{
      id: "oa:" <> openalex,
      source: "openalex",
      title: row["display_name"] || "Untitled",
      authors: authors,
      year: row["publication_year"],
      venue: get_in(row, ["primary_location", "source", "display_name"]),
      citations: row["cited_by_count"] || 0,
      influential: nil,
      counts_note: "OpenAlex",
      fields: concepts(row),
      url: row["doi"] || row["id"],
      arxiv: nil,
      doi: row["doi"],
      tldr: clip(row["abstract"] || reconstruct(row["abstract_inverted_index"])),
      abstract: row["abstract"] || reconstruct(row["abstract_inverted_index"]) || "No abstract returned by OpenAlex.",
      concepts: [],
      references: Enum.map(List.wrap(row["referenced_works"]), &("oa:" <> (String.split(&1, "/") |> List.last()))),
      cited_by: [],
      claims: []
    }
  end

  defp concepts(row) do
    row
    |> Map.get("concepts", [])
    |> Enum.map(& &1["display_name"])
    |> Enum.reject(&is_nil/1)
    |> Enum.take(4)
  end

  defp reconstruct(nil), do: nil
  defp reconstruct(index) when is_map(index) do
    index
    |> Enum.flat_map(fn {word, positions} -> Enum.map(positions, &{&1, word}) end)
    |> Enum.sort_by(&elem(&1, 0))
    |> Enum.map(&elem(&1, 1))
    |> Enum.join(" ")
  end

  defp clip(nil), do: nil
  defp clip(text), do: String.slice(text, 0, 220)

  defp req(url, params) do
    case Req.get(url, params: params, receive_timeout: 7_000, retry: false, headers: [{"user-agent", "ScaiResearch/0.1 (mailto:niranjan@deceptiveai.in)"}]) do
      {:ok, %{status: status, body: body}} when status in 200..299 -> {:ok, body}
      {:ok, %{status: status}} -> {:error, {:http, status}}
      {:error, reason} -> {:error, reason}
    end
  end
end
