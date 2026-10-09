defmodule Scai.Desk do
  @moduledoc """
  Process store for accepted claims, notes, and the working set.
  Working set, notes, accepted claims, and promoted gaps are written to priv/desk.json.
  """
  use GenServer

  def start_link(_opts), do: GenServer.start_link(__MODULE__, [], name: __MODULE__)

  @impl true
  def init(_) do
    :ets.new(:scai_notes, [:named_table, :public, :bag, read_concurrency: true])
    :ets.new(:scai_claims, [:named_table, :public, :bag, read_concurrency: true])
    :ets.new(:scai_papers, [:named_table, :public, read_concurrency: true])
    :ets.new(:scai_cache, [:named_table, :public, read_concurrency: true])
    :ets.new(:scai_pins, [:named_table, :public, read_concurrency: true])
    :ets.new(:scai_gaps, [:named_table, :public, read_concurrency: true])
    load()
    {:ok, %{problem_id: "geo-index"}}
  end

  def problem_id, do: GenServer.call(__MODULE__, :problem)

  def cache_paper(paper) when is_map(paper) do
    :ets.insert(:scai_papers, {paper.id, paper})
    paper
  end

  def get_paper(id) do
    case :ets.lookup(:scai_papers, id) do
      [{^id, paper}] -> paper
      _ -> nil
    end
  end

  def add_note(paper_id, body, span) do
    note = %{id: Base.encode16(:crypto.strong_rand_bytes(4)), body: body, span: span, at: DateTime.utc_now()}
    :ets.insert(:scai_notes, {paper_id, note})
    persist()
    note
  end

  def notes(paper_id), do: :ets.lookup(:scai_notes, paper_id) |> Enum.map(&elem(&1, 1))

  def accept_claim(paper_id, claim) do
    :ets.insert(:scai_claims, {paper_id, Map.put(claim, :accepted, true)})
    persist()
    :ok
  end

  def accepted(paper_id), do: :ets.lookup(:scai_claims, paper_id) |> Enum.map(&elem(&1, 1))

  def pin(paper) when is_map(paper) do
    :ets.insert(:scai_pins, {paper.id, paper})
    persist()
    :ok
  end

  def unpin(id) do
    :ets.delete(:scai_pins, id)
    persist()
  end
  def pinned?(id), do: :ets.member(:scai_pins, id)
  def pins, do: :ets.tab2list(:scai_pins) |> Enum.map(&elem(&1, 1))

  def add_gap(attrs) do
    gap = %{
      id: "gap-" <> Base.encode16(:crypto.strong_rand_bytes(3)),
      problem_id: "geo-index",
      question: attrs.question,
      reason: attrs.reason || "single-paper",
      next: attrs.next || "Name the missing method or the contradicting span before treating this as a result.",
      paper_id: attrs[:paper_id]
    }
    :ets.insert(:scai_gaps, {gap.id, gap})
    persist()
    gap
  end

  def custom_gaps, do: :ets.tab2list(:scai_gaps) |> Enum.map(&elem(&1, 1))
  def custom_gap(id) do
    case :ets.lookup(:scai_gaps, id) do
      [{^id, gap}] -> gap
      _ -> nil
    end
  end

  def cache_put(key, value), do: :ets.insert(:scai_cache, {key, value, System.system_time(:second)})
  def cache_get(key, ttl) do
    case :ets.lookup(:scai_cache, key) do
      [{^key, value, at}] ->
        if System.system_time(:second) - at < ttl, do: value, else: nil
      _ -> nil
    end
  end

  @impl true
  def handle_call(:problem, _from, state), do: {:reply, state.problem_id, state}

  defp path do
    Application.get_env(:scai, :desk_path) || Path.join(to_string(:code.priv_dir(:scai)), "desk.json")
  end

  defp load do
    case File.read(path()) do
      {:ok, body} ->
        case Jason.decode(body) do
          {:ok, data} -> restore(data)
          _ -> :ok
        end
      _ -> :ok
    end
  end

  defp restore(data) do
    Enum.each(data["pins"] || [], fn paper -> :ets.insert(:scai_pins, {paper["id"], atomize(paper)}) end)
    Enum.each(data["gaps"] || [], fn gap -> :ets.insert(:scai_gaps, {gap["id"], atomize(gap)}) end)
    Enum.each(data["notes"] || [], fn note -> :ets.insert(:scai_notes, {note["paper_id"], atomize(note)}) end)
    Enum.each(data["claims"] || [], fn claim -> :ets.insert(:scai_claims, {claim["paper_id"], atomize(claim)}) end)
  end

  defp persist do
    payload = %{
      pins: pins() |> Enum.map(&stringify/1),
      gaps: custom_gaps() |> Enum.map(&stringify/1),
      notes: bag(:scai_notes),
      claims: bag(:scai_claims)
    }
    File.mkdir_p!(Path.dirname(path()))
    File.write!(path(), Jason.encode!(payload))
  end

  defp bag(table) do
    :ets.tab2list(table)
    |> Enum.map(fn {paper_id, item} -> item |> stringify() |> Map.put("paper_id", paper_id) end)
  end

  defp stringify(%DateTime{} = dt), do: DateTime.to_iso8601(dt)
  defp stringify(%{} = map), do: Map.new(map, fn {k, v} -> {to_string(k), stringify(v)} end)
  defp stringify(list) when is_list(list), do: Enum.map(list, &stringify/1)
  defp stringify(other), do: other

  defp atomize(map) when is_map(map) do
    Map.new(map, fn {k, v} -> {String.to_atom(k), atomize(v)} end)
  end
  defp atomize(list) when is_list(list), do: Enum.map(list, &atomize/1)
  defp atomize(other), do: other
end
