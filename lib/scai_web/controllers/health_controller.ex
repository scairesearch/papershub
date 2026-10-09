defmodule ScaiWeb.HealthController do
  use ScaiWeb, :controller

  def index(conn, _params) do
    json(conn, %{ok: true, service: "scairesearch"})
  end
end

defmodule ScaiWeb.ApiController do
  use ScaiWeb, :controller

  def search(conn, params) do
    result = Scai.Sources.search(params["q"] || "geospatial foundation model")
    json(conn, %{
      query: result.query,
      reports: result.reports,
      papers: Enum.map(result.papers, &public/1)
    })
  end

  def paper(conn, %{"id" => id}) do
    case Scai.Sources.fetch(id) do
      nil -> conn |> put_status(404) |> json(%{error: "not_found"})
      paper -> json(conn, public(paper))
    end
  end

  defp public(p) do
    Map.take(p, [:id, :source, :title, :authors, :year, :venue, :citations, :influential, :counts_note, :fields, :url, :tldr, :doi, :arxiv])
  end
end
