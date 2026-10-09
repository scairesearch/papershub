defmodule Scai.Brief do
  def build(gap) do
    papers = Scai.Corpus.papers()
    claims = Enum.flat_map(papers, & &1.claims)
    {for_claims, against} =
      case gap.id do
        "india-coverage" ->
          {Enum.filter(claims, &(&1.stance == "supports" and &1.paper_id in ["prithvi", "skysense"])),
           Enum.filter(claims, &(&1.paper_id in ["prithvi", "skysense", "clay"] and &1.stance == "disputes"))}
        "global-vs-local" ->
          {Enum.filter(claims, &(&1.paper_id in ["gfm", "scalemae"])),
           Enum.filter(claims, &(&1.paper_id == "prithvi" and &1.stance == "disputes"))}
        _ ->
          paper_id = gap[:paper_id]
          {Enum.filter(claims, &(&1.paper_id == paper_id)),
           Enum.filter(claims, &(&1.stance == "disputes"))}
      end
    %{gap: gap, problem: Scai.Corpus.problem(), for: for_claims, against: against, papers: papers}
  end

  def paper_title(id, papers), do: Enum.find_value(papers, id, &if(&1.id == id, do: &1.title))
end
