import Config

config :logger, level: :info

config :scai, ScaiWeb.Endpoint,
  cache_static_manifest: "priv/static/cache_manifest.json",
  check_origin: false

