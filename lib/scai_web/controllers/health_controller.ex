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

  def export_brief(conn, %{"id" => id}) do
    gap = Scai.Corpus.gap(id) || Scai.Desk.custom_gap(id)
    if gap do
      brief = Scai.Brief.build(gap)
      body = """
      #{gap.question}

      Problem: #{brief.problem.name}
      Reason: #{gap.reason}

      Evidence for
      #{Enum.map_join(brief.for, "\n", &("- " <> &1.text))}

      Evidence against
      #{Enum.map_join(brief.against, "\n", &("- " <> &1.text))}

      Next experiment
      #{gap.next}
      """
      conn
      |> put_resp_content_type("text/plain")
      |> put_resp_header("content-disposition", "attachment; filename=\"#{id}.txt\"")
      |> send_resp(200, body)
    else
      conn |> put_status(404) |> json(%{error: "not_found"})
    end
  end

  defp public(p) do
    Map.take(p, [:id, :source, :title, :authors, :year, :venue, :citations, :influential, :counts_note, :fields, :url, :tldr, :doi, :arxiv])
  end
end
