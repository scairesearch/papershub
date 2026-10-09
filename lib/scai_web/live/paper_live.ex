defmodule ScaiWeb.PaperLive do
  use ScaiWeb, :live_view

  def mount(%{"id" => id}, _session, socket) do
    case Scai.Sources.fetch(id) do
      nil -> {:ok, socket |> assign(:active, :search) |> assign(:page_title, "Missing") |> assign(:paper, nil)}
      paper -> {:ok, socket |> assign(:active, :search) |> assign(:page_title, paper.title) |> assign(:paper, paper)}
    end
  end

  def render(assigns) do
    ~H"""
    <section class="page" :if={@paper}>
      <p class="kicker">{@paper.source} · {@paper.counts_note}</p>
      <h1>{@paper.title}</h1>
      <p class="meta">
        {Enum.join(@paper.authors, ", ")} · {@paper.year} · {@paper.venue}
      </p>
      <p class="counts">
        <strong>{@paper.citations || 0}</strong> citations
        <strong>{@paper.influential || "—"}</strong> influential
      </p>
      <p class="meta">Method {method_name(@paper)} · place {place_name(@paper)}</p>
      <p class="lede">{@paper.tldr}</p>
      <p class="actions">
        <a href={~p"/graph/#{@paper.id}"}>Neighborhood graph</a>
        <a href={~p"/read/#{@paper.id}"}>Reading room</a>
        <a :if={@paper.url} href={@paper.url} target="_blank" rel="noreferrer">Source</a>
        <a :if={@paper.arxiv} href={"https://arxivisual.org/abs/#{@paper.arxiv}"} target="_blank" rel="noreferrer">Visualize externally</a>
      </p>
      <h2>Abstract</h2>
      <p class="prose">{@paper.abstract}</p>
      <h2 :if={@paper.fields != []}>Fields</h2>
      <ul class="chips">
        <li :for={f <- @paper.fields}>{f}</li>
      </ul>
      <h2 :if={@paper.claims != []}>Claims in the seed</h2>
      <ul class="claims">
        <li :for={c <- @paper.claims}>
          <span class={c.stance}>{c.stance}</span>
          {c.text}
          <em>{c.span}</em>
        </li>
      </ul>
      <h2 :if={@paper.references != []}>References in the seed graph</h2>
      <ul>
        <li :for={id <- @paper.references}><a href={~p"/papers/#{id}"}>{id}</a></li>
      </ul>
    </section>
    <section class="page" :if={!@paper}>
      <h1>Paper not in the working set.</h1>
      <p><a href={~p"/"}>Back to search</a></p>
    </section>
    """
  end

  defp method_name(%{method: %{name: name}}), do: name
  defp method_name(_), do: "Unspecified"
  defp place_name(%{place: %{footprint: footprint}}), do: footprint
  defp place_name(_), do: "unknown"
end
