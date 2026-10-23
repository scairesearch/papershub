defmodule ScaiWeb.HomeLive do
  use ScaiWeb, :live_view

  def mount(_params, _session, socket) do
    {:ok,
     socket
     |> assign(:active, :home)
     |> assign(:page_title, "SCAI Research")
     |> assign(:snapshot, Scai.Lab.snapshot())
     |> assign(:systems, Scai.Lab.systems())
     |> assign(:spatial, Scai.Lab.spatial())
     |> assign(:questions, Scai.Lab.questions())
     |> assign(:instruments, Scai.Lab.instruments())}
  end

  def render(assigns) do
    ~H"""
    <section class="page">
      <p class="kicker">SCAI Research Labs · India · 2025</p>
      <h1>Supercomputing research for systems that have to work at population scale.</h1>
      <p class="lede">
        Elixir and Phoenix LiveView are the lab stack. papershub is the desk inside this app:
        a concept graph of claims you have accepted, not a chat window over a PDF.
      </p>
      <p class="actions">
        <a href={~p"/papers"}>Open the desk</a>
        <a href={~p"/research"}>The research program</a>
      </p>

      <dl class="stats">
        <div>
          <dt>Literature, not our index</dt>
          <dd>{Scai.Lab.format_count(@snapshot.works)}</dd>
          <p class="muted">OpenAlex works, {@snapshot.as_of}. The desk does not hold them.</p>
        </div>
        <div>
          <dt>Published library</dt>
          <dd>Gale 0.1.1</dd>
          <p class="muted">HTTP/1.1, HTTP/2, and HTTP/3 on Hex.</p>
        </div>
      </dl>

      <div class="cols">
        <div>
          <h2>Systems</h2>
          <ul class="plain">
            <li :for={item <- @systems}>{item}</li>
          </ul>
          <a href={~p"/systems"}>Program</a>
        </div>
        <div>
          <h2>Spatial</h2>
          <ul class="plain">
            <li :for={item <- @spatial}>{item}</li>
          </ul>
          <a href={~p"/spatial"}>Program</a>
        </div>
      </div>

      <h2>Instruments</h2>
      <p class="muted">Three things exist. Only one of them is this desk, and only one is a published package.</p>
      <ul class="hits">
        <li :for={item <- @instruments}>
          <strong>{item.name}</strong>
          <p class="meta">{item.line}</p>
          <a href={item.href}>{item.status}</a>
        </li>
      </ul>

      <h2>Questions the lab is organized around</h2>
      <p class="muted">These are open. This site does not report them as results.</p>
      <ol class="questions">
        <li :for={{q, i} <- Enum.with_index(@questions, 1)}>
          <span class="meta">0{i}</span>
          <p>{q}</p>
        </li>
      </ol>
    </section>
    """
  end
end
