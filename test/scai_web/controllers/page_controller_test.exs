defmodule ScaiWeb.PageControllerTest do
  use ScaiWeb.ConnCase

  test "GET /", %{conn: conn} do
    conn = get(conn, ~p"/")
    assert html_response(conn, 200) =~ "SCAI Research"
  end

  test "GET /health", %{conn: conn} do
    conn = get(conn, "/health")
    assert json_response(conn, 200)["ok"] == true
  end
end
