from pathlib import Path
import sys
import tempfile
from unittest.mock import Mock

from fastapi.testclient import TestClient

sys.path.append(str(Path(__file__).resolve().parents[1]))

import api
from api import app, app_state, fetch_aemet_data, normalize_address, point_in_madrid


ROOT = Path(__file__).resolve().parents[1]


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


def test_ensure_search_index_downloads_csv_and_builds_index(monkeypatch):
    with tempfile.TemporaryDirectory(dir=ROOT) as temp_dir:
        temp_path = Path(temp_dir)
        csv_path = temp_path / "official.csv"
        index_path = temp_path / "madrid_search_index.json"
        meta_path = temp_path / "madrid_search_index.meta.json"

        download_calls = []
        build_calls = []

        def fake_download(url: str, destination: Path) -> None:
            download_calls.append((url, destination))
            destination.write_text(
                "direccion,LATITUD,LONGITUD\nPuerta del Sol,40.4169,-3.7035\n",
                encoding="utf-8",
            )

        def fake_build(
            csv_source: Path, output_path: Path, meta_output_path: Path
        ) -> None:
            build_calls.append((csv_source, output_path, meta_output_path))
            output_path.write_text(
                '[{"label":"Puerta del Sol","search_text":"puerta del sol","lat":40.4169,"lon":-3.7035,"kind":"address"}]',
                encoding="utf-8",
            )
            meta_output_path.write_text(
                '{"raw_bytes": 1, "gzip_bytes": 1}', encoding="utf-8"
            )

        monkeypatch.setattr("api.SEARCH_SOURCE_CSV_PATH", csv_path)
        monkeypatch.setattr("api.SEARCH_INDEX_PATH", index_path)
        monkeypatch.setattr("api.SEARCH_INDEX_META_PATH", meta_path)
        monkeypatch.setattr("api.download_file", fake_download)
        monkeypatch.setattr("api.generate_search_index", fake_build)

        entries = api.ensure_search_index()

        assert entries == [
            {
                "label": "Puerta del Sol",
                "search_text": "puerta del sol",
                "lat": 40.4169,
                "lon": -3.7035,
                "kind": "address",
            }
        ]
        assert download_calls == [(api.MADRID_OFFICIAL_STREET_CSV_URL, csv_path)]
        assert build_calls == [(csv_path, index_path, meta_path)]


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

        download_mock = Mock(
            side_effect=AssertionError("download_file should not be called")
        )
        generate_mock = Mock(
            side_effect=AssertionError("generate_search_index should not be called")
        )

        monkeypatch.setattr("api.SEARCH_SOURCE_CSV_PATH", csv_path)
        monkeypatch.setattr("api.SEARCH_INDEX_PATH", index_path)
        monkeypatch.setattr("api.SEARCH_INDEX_META_PATH", meta_path)
        monkeypatch.setattr("api.download_file", download_mock)
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
        download_mock.assert_not_called()
        generate_mock.assert_not_called()


def test_ensure_search_index_builds_from_downloaded_csv_with_versioned_curated_data(
    monkeypatch,
):
    with tempfile.TemporaryDirectory(dir=ROOT) as temp_dir:
        temp_path = Path(temp_dir)
        csv_path = temp_path / "official.csv"
        index_path = temp_path / "madrid_search_index.json"
        meta_path = temp_path / "madrid_search_index.meta.json"

        def fake_download(url: str, destination: Path) -> None:
            destination.write_text(
                "direccion,LATITUD,LONGITUD\nPuerta del Sol,40.4169,-3.7035\n",
                encoding="utf-8",
            )

        monkeypatch.setattr("api.SEARCH_SOURCE_CSV_PATH", csv_path)
        monkeypatch.setattr("api.SEARCH_INDEX_PATH", index_path)
        monkeypatch.setattr("api.SEARCH_INDEX_META_PATH", meta_path)
        monkeypatch.setattr("api.download_file", fake_download)

        entries = api.ensure_search_index()

        labels = {entry["label"] for entry in entries}

        assert "Puerta del Sol" in labels
        assert "Gomez Ulla" in labels
        assert index_path.exists()
        assert meta_path.exists()


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
