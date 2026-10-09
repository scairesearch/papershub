defmodule ScaiWeb.IndexLive do
  use ScaiWeb, :live_view

  def mount(_params, _session, socket) do
    {:ok, socket |> assign(:active, :index) |> assign(:page_title, "Index") |> assign_stats()}
  end

  def handle_event("harvest", %{"category" => category}, socket) do
    Scai.Index.harvest(category)
    Process.send_after(self(), :refresh, 1500)
    {:noreply, assign(socket, :status, "Harvesting #{category}. arXiv allows about one request every few seconds.")}
  end

  def handle_info(:refresh, socket), do: {:noreply, assign_stats(socket)}

  defp assign_stats(socket) do
    stats = Scai.Index.stats()
    socket
    |> assign(:stats, stats)
    |> assign(:categories, Scai.Index.categories())
    |> assign(:status, nil)
  end

  def render(assigns) do
    ~H"""
    <section class="page">
      <p class="kicker">arXiv index · metadata only</p>
      <h1>Index the category. Do not render the paper.</h1>
      <p class="lede">
        arXivisual spends a video render on one paper. This index stores title, abstract, and id
        for a category page. That is the 100x cut: search and graph over the harvest, and open
        arXivisual only when a single paper needs a visual.
      </p>
      <p class="counts"><strong>{@stats.count}</strong> papers in the local index</p>
      <p :if={@status} class="muted">{@status}</p>
      <ul class="hits">
        <li :for={cat <- @categories}>
          <strong>{cat}</strong>
          <p class="meta">cursor {Map.get(@stats.cursors, cat, 0)} · {status_for(@stats, cat)}</p>
          <button phx-click="harvest" phx-value-category={cat}>Index next 25</button>
        </li>
      </ul>
      <p class="muted">Full arXiv is a multi-day harvest at their rate limit. Each click continues the cursor. The file is priv/arxiv_index.json.</p>
    </section>
    """
  end

  defp status_for(stats, cat), do: Map.get(stats.status, cat, "idle")
end
