defmodule Scai.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      ScaiWeb.Telemetry,
      {DNSCluster, query: Application.get_env(:scai, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: Scai.PubSub},
      Scai.Desk,
      Scai.Index,
      ScaiWeb.Endpoint
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Scai.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    ScaiWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
