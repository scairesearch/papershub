defmodule ScaiWeb.GapsLive do
  use ScaiWeb, :live_view

  def mount(_params, _session, socket) do
    {:ok, socket |> assign(:active, :gaps) |> assign(:page_title, "Gaps") |> assign(:gaps, Scai.Corpus.gaps() ++ Scai.Desk.custom_gaps())}
  end

  def render(assigns) do
    ~H"""
    <section class="page">
      <p class="kicker">{Scai.Corpus.problem().name}</p>
      <h1>Gaps on the active problem</h1>
      <p class="lede">{Scai.Corpus.problem().scope}</p>
      <ol class="hits">
        <li :for={g <- @gaps}>
          <a href={~p"/briefs/#{g.id}"}>{g.question}</a>
          <p class="meta"><span>{g.reason}</span></p>
          <p class="tldr">{g.next}</p>
        </li>
      </ol>
    </section>
    """
  end
end

defmodule ScaiWeb.BriefLive do
  use ScaiWeb, :live_view

  def mount(%{"id" => id}, _session, socket) do
    gap = Scai.Corpus.gap(id) || Scai.Desk.custom_gap(id) || hd(Scai.Corpus.gaps())
    {:ok,
     socket
     |> assign(:active, :gaps)
     |> assign(:page_title, "Brief")
     |> assign(:brief, Scai.Brief.build(gap))}
  end

  def render(assigns) do
    ~H"""
    <section class="page brief">
      <p class="kicker">Brief · {@brief.gap.reason}</p>
      <h1>{@brief.gap.question}</h1>
      <p class="lede">{@brief.problem.why}</p>
      <h2>Evidence for</h2>
      <ul class="claims">
        <li :for={c <- @brief.for}>
          {c.text}
          <em><a href={~p"/papers/#{c.paper_id}"}>{Scai.Brief.paper_title(c.paper_id, @brief.papers)}</a> · {c.span}</em>
        </li>
      </ul>
      <h2>Evidence against</h2>
      <ul class="claims">
        <li :for={c <- @brief.against}>
          {c.text}
          <em><a href={~p"/papers/#{c.paper_id}"}>{Scai.Brief.paper_title(c.paper_id, @brief.papers)}</a> · {c.span}</em>
        </li>
      </ul>
      <h2>Place footprint</h2>
      <ul>
        <li :for={{title, place} <- @brief.footprint}>{title} · {place}</li>
      </ul>
      <h2>Next experiment</h2>
      <p class="prose">{@brief.gap.next}</p>
      <p class="actions"><a href={~p"/gaps"}>All gaps</a> <a href={~p"/concepts"}>Concept canvas</a> <a href={~p"/briefs/#{@brief.gap.id}/export"}>Export</a></p>
    </section>
    """
  end
end
