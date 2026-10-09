defmodule ScaiWeb.WorkspaceLive do
  use ScaiWeb, :live_view

  def mount(_params, _session, socket) do
    {:ok,
     socket
     |> assign(:active, :workspace)
     |> assign(:page_title, "Workspace")
     |> assign(:selected, "federated-index")
     |> assign(:problem, Scai.Corpus.problem())
     |> assign(:concepts, Scai.Corpus.concepts())
     |> assign(:gaps, Scai.Corpus.gaps() ++ Scai.Desk.custom_gaps())
     |> assign(:papers, Scai.Corpus.papers())}
  end

  def handle_event("select", %{"id" => id}, socket), do: {:noreply, assign(socket, :selected, id)}

  def render(assigns) do
    concept = Scai.Corpus.concept(assigns.selected)
    papers = Enum.filter(assigns.papers, &(assigns.selected in &1.concepts))
    claims = Enum.flat_map(papers, & &1.claims)
    nodes = layout(assigns.concepts)
    assigns = assign(assigns, concept: concept, concept_papers: papers, claims: claims, nodes: nodes)

    ~H"""
    <section class="workspace">
      <aside class="rail">
        <p class="kicker">Problem</p>
        <h2>{@problem.name}</h2>
        <p>{@problem.scope}</p>
        <p class="kicker">Gaps</p>
        <ul>
          <li :for={g <- @gaps}>
            <a href={~p"/briefs/#{g.id}"}>{g.question}</a>
            <span class="meta">{g.reason}</span>
          </li>
        </ul>
      </aside>
      <div class="canvas">
        <p class="kicker">Concept graph · accept a claim before it lands here</p>
        <svg viewBox="0 0 640 420" class="graph" role="img">
          <line :for={n <- @nodes} :if={n.parent} x1={n.x} y1={n.y} x2={parent_x(@nodes, n.parent)} y2={parent_y(@nodes, n.parent)} />
          <g :for={n <- @nodes} phx-click="select" phx-value-id={n.id} class={if @selected == n.id, do: "picked", else: nil}>
            <rect x={n.x - 78} y={n.y - 16} width="156" height="32" rx="4" fill={if @selected == n.id, do: "#5b2d8e", else: "#fffdf8"} stroke="#5b2d8e" />
            <text x={n.x} y={n.y + 4} fill={if @selected == n.id, do: "#fffdf8", else: "#1c1915"}>{n.name}</text>
          </g>
        </svg>
      </div>
      <aside class="inspector">
        <p class="kicker">Inspector</p>
        <h2>{@concept.name}</h2>
        <p>{@concept.definition}</p>
        <h2>Papers</h2>
        <ul>
          <li :for={p <- @concept_papers}>
            <a href={~p"/read/#{p.id}"}>{p.title}</a>
            <span class="meta">{p.method.name} · {p.place.footprint}</span>
          </li>
        </ul>
        <h2>Claims</h2>
        <ul>
          <li :for={c <- @claims}><span class={c.stance}>{c.stance}</span> {c.text}</li>
        </ul>
        <p class="actions"><a href={~p"/briefs/india-coverage/export"}>Export brief</a></p>
      </aside>
    </section>
    """
  end

  defp layout(concepts) do
    roots = Enum.filter(concepts, &is_nil(&1.parent))
    children = Enum.filter(concepts, & &1.parent)
    root_nodes = roots |> Enum.with_index() |> Enum.map(fn {c, i} -> Map.merge(c, %{x: 120 + i * 200, y: 70}) end)
    child_nodes = children |> Enum.with_index() |> Enum.map(fn {c, i} -> Map.merge(c, %{x: 100 + rem(i, 4) * 150, y: 220 + div(i, 4) * 90}) end)
    root_nodes ++ child_nodes
  end

  defp parent_x(nodes, id), do: Enum.find_value(nodes, 320, &if(&1.id == id, do: &1.x))
  defp parent_y(nodes, id), do: Enum.find_value(nodes, 70, &if(&1.id == id, do: &1.y))
end
