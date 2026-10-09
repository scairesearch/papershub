defmodule ScaiWeb.SearchLive do
  use ScaiWeb, :live_view

  def mount(params, _session, socket) do
    q = params["q"] || ""
    {:ok,
     socket
     |> assign(:active, :search)
     |> assign(:page_title, "Search")
     |> assign(:q, q)
     |> assign(:loading, q != "")
     |> assign(:result, empty(q))}
  end

  def handle_params(%{"q" => q}, _uri, socket) when q != "" do
    send(self(), {:search, q})
    {:noreply, assign(socket, q: q, loading: true)}
  end

  def handle_params(_params, _uri, socket), do: {:noreply, socket}

  def handle_event("search", %{"q" => q}, socket) do
    {:noreply, push_patch(socket, to: ~p"/?q=#{q}")}
  end

  def handle_info({:search, q}, socket) do
    {:noreply, assign(socket, loading: false, result: Scai.Sources.search(q))}
  end

  defp empty(q), do: %{query: q, papers: Scai.Corpus.papers(), reports: [%{source: "seed", status: :ok, count: 12}]}

  def render(assigns) do
    ~H"""
    <section class="page">
      <p class="kicker">SCAI Research Labs</p>
      <h1>Work the literature, not the PDF.</h1>
      <p class="lede">
        Search the seed and the live indexes. Semantic Scholar, OpenAlex, arXiv, and Crossref
        sit behind one record. The graph is built here, the way Connected Papers draws a neighborhood.
      </p>
      <form phx-submit="search" class="search">
        <input type="search" name="q" value={@q} placeholder="geospatial foundation model, fusion, population" />
        <button type="submit">Search</button>
      </form>
      <p :if={@loading} class="muted">Asking the indexes…</p>
      <ul class="sources">
        <li :for={r <- @result.reports} class={r.status} title={r[:reason]}>
          {r.source}<span>{r.count}</span>
        </li>
      </ul>
      <ol class="hits">
        <li :for={p <- @result.papers}>
          <a href={~p"/papers/#{p.id}"}>{p.title}</a>
          <p class="meta">
            {Enum.join(Enum.take(p.authors, 3), ", ")} · {p.year} · {p.venue}
            <span>{p.source}</span>
            <span>{p.citations || 0} citations</span>
          </p>
          <p class="tldr">{p.tldr}</p>
          <p class="actions">
            <a href={~p"/graph/#{p.id}"}>Graph</a>
            <a href={~p"/read/#{p.id}"}>Read</a>
          </p>
        </li>
      </ol>
    </section>
    """
  end
end
