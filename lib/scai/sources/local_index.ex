defmodule Scai.Sources.LocalIndex do
  def search(query), do: {:ok, Scai.Index.search(query)}
end
