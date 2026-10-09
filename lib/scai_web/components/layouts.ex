defmodule ScaiWeb.Layouts do
  use ScaiWeb, :html

  embed_templates "layouts/*"

  def active(current, current), do: "on"
  def active(_, _), do: nil
end
