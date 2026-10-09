defmodule Scai.Index do
  @moduledoc """
  Local arXiv index. Metadata only. This is the cheap path: one API page
  indexes dozens of papers. A video render per paper is the expensive path.
  """
  use GenServer

  @categories ["cs.CV", "cs.LG", "cs.AI", "eess.IV", "cs.DC"]

  def start_link(_), do: GenServer.start_link(__MODULE__, [], name: __MODULE__)

  def categories, do: @categories

  def stats, do: GenServer.call(__MODULE__, :stats)

  def search(query) do
    q = String.downcase(query || "")
    tokens = String.split(q, ~r/[^a-z0-9]+/, trim: true)
    papers()
    |> Enum.filter(fn p ->
      blob = String.downcase(Enum.join([p.title, p.abstract | p.fields], " "))
      tokens == [] or Enum.all?(tokens, &String.contains?(blob, &1))
    end)
    |> Enum.take(40)
  end

  def papers, do: GenServer.call(__MODULE__, :papers)

  def harvest(category) when category in @categories do
    GenServer.cast(__MODULE__, {:harvest, category})
    :ok
  end

  @impl true
  def init(_) do
    :ets.new(:scai_index, [:named_table, :public, :ordered_set, read_concurrency: true])
    state = load()
    {:ok, state}
  end

  @impl true
  def handle_call(:stats, _from, state) do
    {:reply, %{count: :ets.info(:scai_index, :size), cursors: state.cursors, status: state.status}, state}
  end

  def handle_call(:papers, _from, state) do
    papers = :ets.tab2list(:scai_index) |> Enum.map(&elem(&1, 1))
    {:reply, papers, state}
  end

  @impl true
  def handle_cast({:harvest, category}, state) do
    start = state.cursors[category] || 0
    status = Map.put(state.status, category, "harvesting from #{start}")
    {:noreply, %{state | status: status}, {:continue, {:page, category, start}}}
  end

  @impl true
  def handle_continue({:page, category, start}, state) do
    case Scai.Sources.Arxiv.harvest(category, start, 25) do
      {:ok, papers} ->
        Enum.each(papers, fn paper ->
          :ets.insert(:scai_index, {paper.id, Map.put(paper, :fields, [category | paper.fields])})
        end)
        cursor = start + length(papers)
        state = %{state | cursors: Map.put(state.cursors, category, cursor), status: Map.put(state.status, category, "indexed #{cursor}")}
        save(state)
        {:noreply, state}
      {:error, reason} ->
        {:noreply, %{state | status: Map.put(state.status, category, "error #{inspect(reason)}")}}
    end
  end

  defp path, do: Application.get_env(:scai, :index_path) || Path.join(to_string(:code.priv_dir(:scai)), "arxiv_index.json")

  defp load do
    cursors = %{}
    case File.read(path()) do
      {:ok, body} ->
        case Jason.decode(body) do
          {:ok, %{"papers" => papers, "cursors" => cursors}} ->
            Enum.each(papers, fn p -> :ets.insert(:scai_index, {p["id"], atomize(p)}) end)
            %{cursors: atom_keys(cursors), status: %{}}
          _ -> %{cursors: cursors, status: %{}}
        end
      _ -> %{cursors: cursors, status: %{}}
    end
  end

  defp save(state) do
    papers = :ets.tab2list(:scai_index) |> Enum.map(fn {_id, p} -> stringify(p) end)
    File.mkdir_p!(Path.dirname(path()))
    File.write!(path(), Jason.encode!(%{papers: papers, cursors: state.cursors}))
  end

  defp atom_keys(map), do: Map.new(map, fn {k, v} -> {to_string(k), v} end)
  defp stringify(%{} = map), do: Map.new(map, fn {k, v} -> {to_string(k), stringify(v)} end)
  defp stringify(list) when is_list(list), do: Enum.map(list, &stringify/1)
  defp stringify(other), do: other
  defp atomize(%{} = map), do: Map.new(map, fn {k, v} -> {String.to_atom(k), atomize(v)} end)
  defp atomize(list) when is_list(list), do: Enum.map(list, &atomize/1)
  defp atomize(other), do: other
end
