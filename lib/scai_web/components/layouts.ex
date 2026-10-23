defmodule ScaiWeb.Layouts do
  use ScaiWeb, :html

  embed_templates "layouts/*"

  def active(current, current), do: "on"
  def active(_, _), do: nil

  @desk [:workspace, :search, :read, :gaps, :index, :graph, :concepts]
  def desk?(active) when active in @desk, do: "on"
  def desk?(_), do: nil
end
