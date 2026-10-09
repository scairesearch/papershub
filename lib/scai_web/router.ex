defmodule ScaiWeb.Router do
  use ScaiWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, html: {ScaiWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", ScaiWeb do
    pipe_through :browser

    live_session :app, on_mount: ScaiWeb.Nav do
      live "/", WorkspaceLive
      live "/search", SearchLive
      live "/papers/:id", PaperLive
      live "/graph/:id", GraphLive
      live "/concepts", ConceptsLive
      live "/read/:id", ReadLive
      live "/gaps", GapsLive
      live "/briefs/:id", BriefLive
      live "/index", IndexLive
    end
  end

  scope "/", ScaiWeb do
    pipe_through :api

    get "/health", HealthController, :index
    get "/api/search", ApiController, :search
    get "/api/papers/:id", ApiController, :paper
    get "/briefs/:id/export", ApiController, :export_brief
  end
end
