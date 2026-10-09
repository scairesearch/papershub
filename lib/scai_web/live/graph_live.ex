defmodule ScaiWeb.GraphLive do
  use ScaiWeb, :live_view

  def mount(%{"id" => id}, _session, socket) do
    origin = Scai.Corpus.paper(id) || Scai.Sources.fetch(id) || Scai.Corpus.paper("prithvi")
    graph = Scai.Graph.neighborhood(origin)
    {:ok,
     socket
     |> assign(:active, :graph)
     |> assign(:page_title, "Graph")
     |> assign(:origin, origin)
     |> assign(:graph, graph)
     |> assign(:selected, origin.id)}
  end

  def handle_event("select", %{"id" => id}, socket) do
    {:noreply, assign(socket, :selected, id)}
  end

  def render(assigns) do
    selected = Enum.find(assigns.graph.nodes, &(&1.id == assigns.selected)) || assigns.origin
    assigns = assign(assigns, :focus, selected)

    ~H"""
    <section class="split">
      <div>
        <p class="kicker">Neighborhood · origin {@origin.id}</p>
        <h1>{@origin.title}</h1>
        <p class="muted">Size is citation count. Color is year. Edges are shared concepts or a citation link, not citations alone.</p>
        <svg viewBox="0 0 640 500" class="graph" role="img">
          <line :for={e <- @graph.edges} x1={x(@graph.nodes, e.from)} y1={y(@graph.nodes, e.from)} x2={x(@graph.nodes, e.to)} y2={y(@graph.nodes, e.to)} />
          <g :for={n <- @graph.nodes} phx-click="select" phx-value-id={n.id} class={if @selected == n.id, do: "picked", else: nil}>
            <circle cx={n.x} cy={n.y} r={Scai.Graph.radius(n)} fill={Scai.Graph.year_color(n.year)} />
            <text x={n.x} y={n.y + Scai.Graph.radius(n) + 12}>{short(n.title)}</text>
          </g>
        </svg>
      </div>
      <aside>
        <h2>Inspector</h2>
        <p class="paper-title">{@focus.title}</p>
        <p class="meta">{@focus.year} · {@focus.venue} · {@focus.citations} citations</p>
        <p>{@focus.tldr}</p>
        <p class="actions">
          <a href={~p"/papers/#{@focus.id}"}>Record</a>
          <a href={~p"/read/#{@focus.id}"}>Read</a>
          <a href={~p"/graph/#{@focus.id}"}>Make origin</a>
        </p>
        <h2>Prior works</h2>
        <ul>
          <li :for={p <- @graph.prior}><a href={~p"/graph/#{p.id}"}>{p.year} · {short(p.title)}</a></li>
        </ul>
        <h2>Derivative works</h2>
        <ul>
          <li :for={p <- @graph.derivative}><a href={~p"/graph/#{p.id}"}>{p.year} · {short(p.title)}</a></li>
        </ul>
      </aside>
    </section>
    """
  end

  defp x(nodes, id), do: Enum.find_value(nodes, 320, &if(&1.id == id, do: &1.x))
  defp y(nodes, id), do: Enum.find_value(nodes, 250, &if(&1.id == id, do: &1.y))
  defp short(title), do: title |> String.slice(0, 28) |> String.trim()
end
