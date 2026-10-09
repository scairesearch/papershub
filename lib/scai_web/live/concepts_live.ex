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
    papers = Scai.Corpus.by_concept(assigns.selected)
    assigns = assign(assigns, concept: concept, papers: papers)

    ~H"""
    <section class="split">
      <div>
        <p class="kicker">Concept canvas · {Scai.Corpus.problem().name}</p>
        <h1>Concepts, not papers, are the nodes.</h1>
        <ul class="concept-list">
          <li :for={c <- @concepts}>
            <button phx-click="select" phx-value-id={c.id} class={if @selected == c.id, do: "on", else: nil}>
              {c.name}
              <small :if={c.parent}>under {c.parent}</small>
            </button>
          </li>
        </ul>
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
end
