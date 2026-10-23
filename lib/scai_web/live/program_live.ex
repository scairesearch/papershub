defmodule ScaiWeb.ProgramLive do
  use ScaiWeb, :live_view

  @pages %{
    research: {"Research", "Two columns, one lab.", "Systems work is how the computation runs. Spatial work is what the computation is about. papershub is where a program keeps its claims."},
    spatial: {"Spatial", "A place is a stack of claims, not a basemap with pins.", "Satellite, census, zoning, and a paper can disagree about the same district. The program is the index that keeps those sources honest."},
    systems: {"Systems", "Efficiency is a measurement, not a slogan.", "The lab's systems question is what it would take to run the spatial index far cheaper than a Western per-query stack. Nothing on this page is that result."},
    studio: {"Studio", "The 2025 program names six studios. This site is one of them.", "Dates below are the roadmap, not launch announcements. An address is listed only when the program wrote one down. Being listed is not the same as being up."},
    contact: {"Contact", "Write to the lab.", "One public address, from the GitHub organization. There is no form on this page and nothing is stored."}
  }

  def mount(_params, _session, socket), do: {:ok, socket}

  def handle_params(_params, _uri, socket) do
    action = socket.assigns.live_action
    {title, heading, lede} = Map.fetch!(@pages, action)

    {:noreply,
     socket
     |> assign(:active, action)
     |> assign(:page_title, title)
     |> assign(:heading, heading)
     |> assign(:lede, lede)
     |> assign(:problem, Scai.Corpus.problem())}
  end

  def render(assigns) do
    ~H"""
    <section class="page">
      <p class="kicker">{@page_title}</p>
      <h1>{@heading}</h1>
      <p class="lede">{@lede}</p>
      <%= if @live_action == :research do %>
        <.research />
      <% end %>
      <%= if @live_action == :spatial do %>
        <.spatial problem={@problem} />
      <% end %>
      <%= if @live_action == :systems do %>
        <.systems />
      <% end %>
      <%= if @live_action == :studio do %>
        <.studio />
      <% end %>
      <%= if @live_action == :contact do %>
        <.contact />
      <% end %>
    </section>
    """
  end

  defp research(assigns) do
    assigns =
      assigns
      |> assign(:systems, Scai.Lab.systems())
      |> assign(:spatial, Scai.Lab.spatial())
      |> assign(:questions, Scai.Lab.questions())
      |> assign(:threads, Scai.Lab.threads())
      |> assign(:snapshot, Scai.Lab.snapshot())

    ~H"""
    <div class="cols">
      <div>
        <h2>Systems</h2>
        <ul class="plain"><li :for={item <- @systems}>{item}</li></ul>
        <a href={~p"/systems"}>Open systems</a>
      </div>
      <div>
        <h2>Spatial</h2>
        <ul class="plain"><li :for={item <- @spatial}>{item}</li></ul>
        <a href={~p"/spatial"}>Open spatial</a>
      </div>
    </div>
    <h2>Open questions</h2>
    <ul class="plain">
      <li :for={q <- @questions}>{q}</li>
    </ul>
    <p class="muted">
      OpenAlex listed {Scai.Lab.format_count(@snapshot.works)} works on {@snapshot.as_of}, including about {Scai.Lab.format_count(@snapshot.arxiv_inside)} arXiv preprints already inside that count. That snapshot is the literature the lab wants to reason over. It is not loaded into this site.
    </p>
    <h2>Institutional threads</h2>
    <p class="muted">Named in the 2025 program. This is not a staff list, and it is not a claim that those institutions run this lab.</p>
    <ul class="hits">
      <li :for={thread <- @threads}>
        <strong>{thread.where}</strong>
        <p class="meta">{thread.note}</p>
      </li>
    </ul>
    <p><a href={~p"/papers"}>Work the seeded program in papershub</a></p>
    """
  end

  defp spatial(assigns) do
    assigns = assign(assigns, :layers, Scai.Lab.layers())

    ~H"""
    <div class="cols">
      <div>
        <p class="muted">Current problem on the desk</p>
        <h2>{@problem.name}</h2>
        <p>{@problem.scope}</p>
        <p class="muted">{@problem.why}</p>
        <p><a href={~p"/papers"}>Open this problem in papershub</a></p>
      </div>
      <ol class="plain">
        <li :for={{layer, i} <- Enum.with_index(@layers, 1)}>{String.pad_leading(Integer.to_string(i), 2, "0")} {layer}</li>
      </ol>
    </div>
    <h2>The spatial column</h2>
    <ul class="plain"><li :for={item <- Scai.Lab.spatial()}>{item}</li></ul>
    """
  end

  defp systems(assigns) do
    ~H"""
    <ul class="hits">
      <li>
        <strong>Gale</strong>
        <p class="meta">Phoenix adapter. HTTP/1.1 and HTTP/2 over Bandit, HTTP/3 over QUIC. Hex 0.1.1.</p>
        <a href="https://hex.pm/packages/gale">Hex</a>
      </li>
      <li>
        <strong>Catalog loop</strong>
        <p class="meta">Land, normalize, select, enrich, shard. The desk streams a sample. It does not scan the OpenAlex snapshot.</p>
        <a href={~p"/index"}>Run it</a>
      </li>
      <li>
        <strong>gpark</strong>
        <p class="meta">Emits PTX from Elixir and Python. Format checks and goldens pass. No GPU has executed a kernel.</p>
        <a href="https://github.com/scairesearch/gpark">Repository</a>
      </li>
    </ul>
    <h2>What the column covers</h2>
    <ul class="plain"><li :for={item <- Scai.Lab.systems()}>{item}</li></ul>
    """
  end

  defp studio(assigns) do
    assigns = assign(assigns, :studios, Scai.Lab.studios())

    ~H"""
    <ol class="hits">
      <li :for={{studio, i} <- Enum.with_index(@studios, 1)}>
        <span class="meta">{String.pad_leading(Integer.to_string(i), 2, "0")} · {studio.when}</span>
        <strong>{studio.name}</strong>
        <p class="meta">{studio.line}</p>
        <a :if={studio.href} href={studio.href}>{if studio.href == "/", do: "This site", else: "Named address"}</a>
        <span :if={!studio.href} class="muted">No address in the program</span>
      </li>
    </ol>
    """
  end

  defp contact(assigns) do
    assigns = assign(assigns, :contact, Scai.Lab.contact())

    ~H"""
    <ul class="hits">
      <li><strong>Email</strong> <a href={"mailto:#{@contact.email}"}>{@contact.email}</a></li>
      <li><strong>Code</strong> <a href={@contact.github}>github.com/scairesearch/papershub</a></li>
      <li><strong>Place</strong> {@contact.place}</li>
      <li><strong>Library</strong> <a href="https://hex.pm/packages/gale">Gale on Hex</a></li>
    </ul>
    """
  end
end
