from pathlib import Path
import sys

from fastapi.testclient import TestClient

sys.path.append(str(Path(__file__).resolve().parents[1]))

from api import app, app_state, fetch_aemet_data, normalize_address, point_in_madrid


def test_normalize_address_lowercases_and_trims():
    assert (
        normalize_address("  Calle de Alcala 10, Madrid  ")
        == "calle de alcala 10, madrid"
    )


def test_point_in_madrid_accepts_city_coordinates():
    assert point_in_madrid(40.4168, -3.7038) is True


def test_point_in_madrid_rejects_outside_coordinates():
    assert point_in_madrid(41.3874, 2.1686) is False


def test_fetch_aemet_data_returns_error_without_key(monkeypatch):
    monkeypatch.setattr("api.AEMET_API_KEY", None)
    assert fetch_aemet_data() == {"error": "AEMET_API_KEY no configurada"}


def test_route_endpoint_accepts_latlon_origin(monkeypatch):
    app_state.graph = object()
    app_state.refugios_utm = object()
    app_state.fuentes_utm = object()
    app_state.shadow_dict = {}

    def fake_geocode(address: str):
        if address == "40.4168,-3.7038":
            return (40.4168, -3.7038)
        return (40.4170, -3.7040)

    monkeypatch.setattr("api.geocode_address", fake_geocode)
    monkeypatch.setattr(
        "api.nearest_node",
        lambda graph, lat, lon: 1 if (lat, lon) == (40.4168, -3.7038) else 2,
    )
    monkeypatch.setattr(
        "api.route_metrics", lambda *args, **kwargs: (100.0, 50.0, 25.0)
    )
    monkeypatch.setattr("api.route_edges_gdf", lambda *args, **kwargs: object())
    monkeypatch.setattr("api.get_points_near_route", lambda *args, **kwargs: [])
    monkeypatch.setattr(
        "api.extract_wgs84_coords",
        lambda graph, route: [(40.4168, -3.7038), (40.4170, -3.7040)],
    )
    monkeypatch.setattr("api.nx.shortest_path", lambda *args, **kwargs: [1, 2])

    client = TestClient(app)
    response = client.post(
        "/api/route",
        json={
            "origin": "40.4168,-3.7038",
            "destination": "Museo del Prado, Madrid",
            "hour": 14,
            "preference": 1.0,
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["origin_latlon"] == [40.4168, -3.7038]
    assert payload["destination_latlon"] == [40.417, -3.704]
    assert payload["metrics"]["human"]["sun_time_saved_min"] == 0.0
