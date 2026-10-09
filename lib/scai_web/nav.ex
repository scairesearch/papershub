defmodule ScaiWeb.Nav do
  def on_mount(:default, _params, _session, socket) do
    {:cont, Phoenix.Component.assign(socket, :active, :search)}
  end
end
