defmodule Scai.Desk do
  @moduledoc """
  Process store for accepted claims, notes, and the working set.
  Lives for the server lifetime. One researcher in v1.
  """
  use GenServer

  def start_link(_opts), do: GenServer.start_link(__MODULE__, [], name: __MODULE__)

  @impl true
  def init(_) do
    :ets.new(:scai_notes, [:named_table, :public, :bag, read_concurrency: true])
    :ets.new(:scai_claims, [:named_table, :public, :bag, read_concurrency: true])
    :ets.new(:scai_papers, [:named_table, :public, read_concurrency: true])
    :ets.new(:scai_cache, [:named_table, :public, read_concurrency: true])
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
    note
  end

  def notes(paper_id), do: :ets.lookup(:scai_notes, paper_id) |> Enum.map(&elem(&1, 1))

  def accept_claim(paper_id, claim) do
    :ets.insert(:scai_claims, {paper_id, Map.put(claim, :accepted, true)})
    :ok
  end

  def accepted(paper_id), do: :ets.lookup(:scai_claims, paper_id) |> Enum.map(&elem(&1, 1))

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
end
