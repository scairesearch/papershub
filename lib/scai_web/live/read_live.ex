defmodule ScaiWeb.ReadLive do
  use ScaiWeb, :live_view

  def mount(%{"id" => id}, _session, socket) do
    paper = Scai.Corpus.paper(id) || Scai.Sources.fetch(id)
    {:ok,
     socket
     |> assign(:active, :read)
     |> assign(:page_title, "Read")
     |> assign(:paper, paper)
     |> assign(:span, "Abstract")
     |> assign(:notes, notes(paper))}
  end

  def handle_event("note", %{"body" => body, "span" => span}, socket) do
    Scai.Desk.add_note(socket.assigns.paper.id, String.trim(body), span)
    {:noreply, assign(socket, :notes, notes(socket.assigns.paper))}
  end

  def handle_event("accept", %{"id" => id}, socket) do
    claim = Enum.find(socket.assigns.paper.claims, &(&1.id == id))
    if claim, do: Scai.Desk.accept_claim(socket.assigns.paper.id, claim)
    {:noreply, assign(socket, :notes, notes(socket.assigns.paper))}
  end

  defp notes(nil), do: []
  defp notes(paper), do: %{notes: Scai.Desk.notes(paper.id), accepted: Scai.Desk.accepted(paper.id)}

  def render(assigns) do
    ~H"""
    <section class="page" :if={!@paper}>
      <h1>That paper is not loaded.</h1>
      <a href={~p"/"}>Search</a>
    </section>
    <section class="split" :if={@paper}>
      <article>
        <p class="kicker">Reading room</p>
        <h1>{@paper.title}</h1>
        <p class="meta">{Enum.join(Enum.take(@paper.authors, 3), ", ")} · {@paper.year}</p>
        <h2>Abstract <em>span</em></h2>
        <p class="prose">{@paper.abstract}</p>
        <form phx-submit="note" class="note-form">
          <input type="hidden" name="span" value="Abstract" />
          <textarea name="body" rows="3" placeholder="A note stays off the graph until you accept a claim."></textarea>
          <button type="submit">Save note</button>
        </form>
      </article>
      <aside>
        <h2>Claims</h2>
        <ul class="claims">
          <li :for={c <- @paper.claims}>
            <span class={c.stance}>{c.stance}</span>
            {c.text}
            <em>{c.span}</em>
            <button phx-click="accept" phx-value-id={c.id}>Accept onto graph</button>
          </li>
        </ul>
        <p :if={@paper.claims == []} class="muted">Live index records have no seed claims. A note is all you can attach until a span is accepted.</p>
        <h2>Accepted</h2>
        <ul>
          <li :for={c <- @notes.accepted}>{c.text}</li>
        </ul>
        <h2>Notes</h2>
        <ul>
          <li :for={n <- @notes.notes}><em>{n.span}</em> {n.body}</li>
        </ul>
      </aside>
    </section>
    """
  end
end
