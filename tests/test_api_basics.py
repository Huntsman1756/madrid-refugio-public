import importlib
import importlib.util
import sys
import tempfile
from unittest.mock import Mock
import os
from pathlib import Path

from fastapi.testclient import TestClient

sys.path.append(str(Path(__file__).resolve().parents[1]))

import api
from api import app, app_state, fetch_aemet_data, normalize_address, point_in_madrid


ROOT = Path(__file__).resolve().parents[1]


def load_isolated_api_module(module_name: str = "api_isolated_test"):
    spec = importlib.util.spec_from_file_location(module_name, ROOT / "api.py")
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


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
    assert fetch_aemet_data() == {
        "municipio": "Madrid",
        "temperatura": "N/D",
        "estado_cielo": "AEMET no disponible",
        "timestamp": "",
        "fuente": "AEMET (OpenData)",
        "error": "AEMET_API_KEY no configurada",
    }


def test_suggest_endpoint_filters_and_limits_results(monkeypatch):
    app_state.search_index = [
        {
            "label": "Plaza de Castilla",
            "search_text": "plaza de castilla",
            "lat": 40.466,
            "lon": -3.6904,
            "kind": "demo_origin",
            "district": "Tetuan",
        },
        {
            "label": "Museo del Prado",
            "search_text": "museo del prado",
            "lat": 40.4138,
            "lon": -3.6921,
            "kind": "place",
            "district": "Retiro",
        },
        {
            "label": "Plaza Mayor",
            "search_text": "plaza mayor",
            "lat": 40.4155,
            "lon": -3.7074,
            "kind": "area",
            "district": "Centro",
        },
    ]

    client = TestClient(app)
    response = client.get("/api/suggest", params={"q": "plaza", "limit": 1})

    assert response.status_code == 200
    assert response.json() == [
        {
            "id": "plaza-de-castilla-40.466--3.6904-demo_origin",
            "label": "Plaza de Castilla",
            "kind": "place",
            "lat": 40.466,
            "lon": -3.6904,
            "district": "Tetuan",
        }
    ]


def test_suggest_endpoint_returns_empty_list_for_blank_queries():
    app_state.search_index = []

    client = TestClient(app)
    response = client.get("/api/suggest", params={"q": "   "})

    assert response.status_code == 200
    assert response.json() == []


def test_ensure_search_index_requires_prepared_csv_when_index_missing(monkeypatch):
    with tempfile.TemporaryDirectory(dir=ROOT) as temp_dir:
        temp_path = Path(temp_dir)
        csv_path = temp_path / "official.csv"
        index_path = temp_path / "madrid_search_index.json"
        meta_path = temp_path / "madrid_search_index.meta.json"

        monkeypatch.setattr("api.SEARCH_SOURCE_CSV_PATH", csv_path)
        monkeypatch.setattr("api.SEARCH_INDEX_PATH", index_path)
        monkeypatch.setattr("api.SEARCH_INDEX_META_PATH", meta_path)

        try:
            api.ensure_search_index()
            assert False, "ensure_search_index should fail when CSV is missing"
        except RuntimeError as exc:
            message = str(exc)

        assert str(csv_path) in message
        assert "must be prepared before startup or /api/suggest" in message


def test_ensure_search_index_reuses_existing_index_without_download(monkeypatch):
    with tempfile.TemporaryDirectory(dir=ROOT) as temp_dir:
        temp_path = Path(temp_dir)
        csv_path = temp_path / "official.csv"
        index_path = temp_path / "madrid_search_index.json"
        meta_path = temp_path / "madrid_search_index.meta.json"
        index_path.write_text(
            '[{"label":"Plaza Mayor","search_text":"plaza mayor","lat":40.4155,"lon":-3.7074,"kind":"area"}]',
            encoding="utf-8",
        )

        generate_mock = Mock(
            side_effect=AssertionError("generate_search_index should not be called")
        )

        monkeypatch.setattr("api.SEARCH_SOURCE_CSV_PATH", csv_path)
        monkeypatch.setattr("api.SEARCH_INDEX_PATH", index_path)
        monkeypatch.setattr("api.SEARCH_INDEX_META_PATH", meta_path)
        monkeypatch.setattr("api.generate_search_index", generate_mock)

        entries = api.ensure_search_index()

        assert entries == [
            {
                "label": "Plaza Mayor",
                "search_text": "plaza mayor",
                "lat": 40.4155,
                "lon": -3.7074,
                "kind": "area",
            }
        ]
        generate_mock.assert_not_called()


def test_ensure_search_index_builds_from_downloaded_csv_with_versioned_curated_data(
    monkeypatch,
):
    with tempfile.TemporaryDirectory(dir=ROOT) as temp_dir:
        temp_path = Path(temp_dir)
        csv_path = temp_path / "official.csv"
        index_path = temp_path / "madrid_search_index.json"
        meta_path = temp_path / "madrid_search_index.meta.json"

        csv_path.write_text(
            "direccion,LATITUD,LONGITUD\nPuerta del Sol,40.4169,-3.7035\n",
            encoding="utf-8",
        )

        monkeypatch.setattr("api.SEARCH_SOURCE_CSV_PATH", csv_path)
        monkeypatch.setattr("api.SEARCH_INDEX_PATH", index_path)
        monkeypatch.setattr("api.SEARCH_INDEX_META_PATH", meta_path)

        entries = api.ensure_search_index()

        labels = {entry["label"] for entry in entries}

        assert "Puerta del Sol" in labels
        assert "Gomez Ulla" in labels
        assert index_path.exists()
        assert meta_path.exists()


def test_suggest_endpoint_returns_503_when_search_prerequisites_are_missing(
    monkeypatch,
):
    app_state.search_index = None

    monkeypatch.setattr(
        "api.ensure_search_index",
        Mock(
            side_effect=RuntimeError(
                "Search index prerequisites missing: data/processed/213605-4-callejero-oficial-madrid-csv.csv must be prepared before startup or /api/suggest."
            )
        ),
    )

    client = TestClient(app)
    response = client.get("/api/suggest", params={"q": "plaza"})

    assert response.status_code == 503
    assert response.json() == {
        "detail": "Search index prerequisites missing: data/processed/213605-4-callejero-oficial-madrid-csv.csv must be prepared before startup or /api/suggest."
    }


def test_api_processed_dir_uses_data_dir_env(monkeypatch):
    with tempfile.TemporaryDirectory(dir=ROOT) as temp_dir:
        monkeypatch.setenv("DATA_DIR", temp_dir)
        api_isolated = load_isolated_api_module()

        assert api_isolated.PROCESSED_DIR == Path(temp_dir)
        assert (
            api_isolated.SEARCH_SOURCE_CSV_PATH
            == Path(temp_dir) / "213605-4-callejero-oficial-madrid-csv.csv"
        )
        assert (
            api_isolated.SEARCH_INDEX_PATH
            == Path(temp_dir) / "madrid_search_index.json"
        )
        monkeypatch.delenv("DATA_DIR", raising=False)


def test_health_endpoint_reports_ok_without_loaded_runtime(monkeypatch):
    app_state.graph = None
    app_state.refugios_utm = None
    app_state.fuentes_utm = None
    app_state.shadow_dict = None

    client = TestClient(app)
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_route_endpoint_lazy_loads_runtime_when_not_initialized(monkeypatch):
    app_state.graph = None
    app_state.refugios_utm = None
    app_state.fuentes_utm = None
    app_state.shadow_dict = None

    runtime_graph = object()
    runtime_refugios = object()
    runtime_fuentes = object()

    def fake_ensure_runtime_loaded():
        app_state.graph = runtime_graph
        app_state.refugios_utm = runtime_refugios
        app_state.fuentes_utm = runtime_fuentes
        app_state.shadow_dict = {}

    monkeypatch.setattr("api.ensure_runtime_loaded", fake_ensure_runtime_loaded)
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
            "origin": {
                "label": "Plaza Mayor, Madrid",
                "kind": "place",
                "lat": 40.4168,
                "lon": -3.7038,
            },
            "destination": {
                "label": "Museo del Prado, Madrid",
                "kind": "place",
                "lat": 40.4170,
                "lon": -3.7040,
            },
            "hour": 14,
            "preference": 1.0,
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["origin_label"] == "Plaza Mayor, Madrid"
    assert payload["destination_label"] == "Museo del Prado, Madrid"
    assert app_state.graph is runtime_graph


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


def test_route_endpoint_accepts_resolved_location_objects_without_geocoding(
    monkeypatch,
):
    app_state.graph = object()
    app_state.refugios_utm = object()
    app_state.fuentes_utm = object()
    app_state.shadow_dict = {}

    geocode_mock = Mock(
        side_effect=AssertionError("geocode_address should not be called")
    )
    monkeypatch.setattr("api.geocode_address", geocode_mock)
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
            "origin": {
                "label": "Plaza Mayor, Madrid",
                "kind": "place",
                "lat": 40.4168,
                "lon": -3.7038,
            },
            "destination": {
                "label": "Museo del Prado, Madrid",
                "kind": "place",
                "lat": 40.4170,
                "lon": -3.7040,
            },
            "hour": 14,
            "preference": 1.0,
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["origin_latlon"] == [40.4168, -3.7038]
    assert payload["destination_latlon"] == [40.417, -3.704]
    assert payload["origin_label"] == "Plaza Mayor, Madrid"
    assert payload["destination_label"] == "Museo del Prado, Madrid"
    geocode_mock.assert_not_called()


def test_route_endpoint_accepts_resolved_location_objects_without_kind(
    monkeypatch,
):
    app_state.graph = object()
    app_state.refugios_utm = object()
    app_state.fuentes_utm = object()
    app_state.shadow_dict = {}

    geocode_mock = Mock(
        side_effect=AssertionError("geocode_address should not be called")
    )
    monkeypatch.setattr("api.geocode_address", geocode_mock)
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
            "origin": {
                "label": "Plaza Mayor, Madrid",
                "lat": 40.4168,
                "lon": -3.7038,
            },
            "destination": {
                "label": "Museo del Prado, Madrid",
                "lat": 40.4170,
                "lon": -3.7040,
            },
            "hour": 14,
            "preference": 1.0,
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["origin_latlon"] == [40.4168, -3.7038]
    assert payload["destination_latlon"] == [40.417, -3.704]
    assert payload["origin_label"] == "Plaza Mayor, Madrid"
    assert payload["destination_label"] == "Museo del Prado, Madrid"
    geocode_mock.assert_not_called()
