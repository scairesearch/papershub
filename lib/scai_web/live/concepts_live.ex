defmodule ScaiWeb.ConceptsLive do
  use ScaiWeb, :live_view

  def mount(_params, _session, socket) do
    {:ok,
     socket
     |> assign(:active, :concepts)
     |> assign(:page_title, "Concepts")
     |> assign(:concepts, Scai.Corpus.concepts())
     |> assign(:selected, "federated-index")}
  end

  def handle_event("select", %{"id" => id}, socket), do: {:noreply, assign(socket, :selected, id)}

  def render(assigns) do
    concept = Scai.Corpus.concept(assigns.selected)
    papers = Scai.Corpus.by_concept(assigns.selected) ++ Enum.filter(Scai.Desk.pins(), &(assigns.selected in (&1.concepts || [])))
    papers = Enum.uniq_by(papers, & &1.id)
    nodes = layout(assigns.concepts)
    assigns = assign(assigns, concept: concept, papers: papers, nodes: nodes)

    ~H"""
    <section class="split">
      <div>
        <p class="kicker">Concept canvas · {Scai.Corpus.problem().name}</p>
        <h1>Concepts, not papers, are the nodes.</h1>
        <svg viewBox="0 0 640 420" class="graph" role="img">
          <line :for={n <- @nodes} :if={n.parent} x1={n.x} y1={n.y} x2={parent_x(@nodes, n.parent)} y2={parent_y(@nodes, n.parent)} />
          <g :for={n <- @nodes} phx-click="select" phx-value-id={n.id} class={if @selected == n.id, do: "picked", else: nil}>
            <rect x={n.x - 70} y={n.y - 18} width="140" height="36" rx="4" fill={if @selected == n.id, do: "#5b2d8e", else: "#fffdf8"} stroke="#5b2d8e" />
            <text x={n.x} y={n.y + 4} fill={if @selected == n.id, do: "#fffdf8", else: "#1c1915"}>{n.name}</text>
          </g>
        </svg>
      </div>
      <aside>
        <h2>{@concept.name}</h2>
        <p>{@concept.definition}</p>
        <h2>Papers</h2>
        <ul>
          <li :for={p <- @papers}>
            <a href={~p"/papers/#{p.id}"}>{p.title}</a>
            <span class="meta">{p.year}</span>
          </li>
        </ul>
        <p class="actions"><a href={~p"/gaps"}>Open gaps on this problem</a></p>
      </aside>
    </section>
    """
  end

  defp layout(concepts) do
    roots = Enum.filter(concepts, &is_nil(&1.parent))
    children = Enum.filter(concepts, & &1.parent)
    root_nodes =
      roots
      |> Enum.with_index()
      |> Enum.map(fn {c, i} -> Map.merge(c, %{x: 110 + i * 200, y: 70}) end)
    child_nodes =
      children
      |> Enum.with_index()
      |> Enum.map(fn {c, i} -> Map.merge(c, %{x: 100 + rem(i, 4) * 150, y: 230 + div(i, 4) * 90}) end)
    root_nodes ++ child_nodes
  end

  defp parent_x(nodes, id), do: Enum.find_value(nodes, 320, &if(&1.id == id, do: &1.x))
  defp parent_y(nodes, id), do: Enum.find_value(nodes, 70, &if(&1.id == id, do: &1.y))
end
