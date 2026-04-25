import importlib
import os
import tempfile
import unittest
from pathlib import Path

import networkx as nx


class ApiConfigTests(unittest.TestCase):
    def test_health_alias_is_registered(self):
        import api

        routes = {route.path for route in api.app.routes}
        self.assertIn("/health", routes)
        self.assertIn("/api/health", routes)

    def test_data_dir_env_overrides_processed_dir(self):
        previous = os.environ.get("DATA_DIR")
        os.environ["DATA_DIR"] = "/tmp/refugio-data"
        try:
            import api

            reloaded = importlib.reload(api)
            expected_dir = Path("/tmp/refugio-data")
            self.assertEqual(reloaded.PROCESSED_DIR, expected_dir)
            self.assertEqual(
                reloaded.GRAPH_PATH,
                expected_dir / "madrid_shadow_graph.graphml",
            )
            self.assertEqual(
                reloaded.SHADOW_MATRIX_PATH,
                expected_dir / "shadow_matrix.parquet",
            )
            self.assertEqual(
                reloaded.REFUGIOS_PATH,
                reloaded.BASE_DIR
                / "data"
                / "processed"
                / "refugios_sustitutos.geojson",
            )
            self.assertEqual(
                reloaded.FUENTES_PATH,
                reloaded.BASE_DIR / "data" / "processed" / "fuentes.geojson",
            )
        finally:
            if previous is None:
                os.environ.pop("DATA_DIR", None)
            else:
                os.environ["DATA_DIR"] = previous
            import api

            importlib.reload(api)

    def test_release_urls_match_published_assets(self):
        import api

        self.assertTrue(api.GRAPH_RELEASE_URL.endswith("/madrid_shadow_graph.graphml"))
        self.assertFalse(api.GRAPH_RELEASE_URL.endswith(".gz"))
        self.assertTrue(
            api.SHADOW_MATRIX_RELEASE_URL.endswith("/shadow_matrix.parquet")
        )

    def test_startup_does_not_download_graph_from_repo_raw_main(self):
        import api
        import inspect

        download_source = inspect.getsource(api.download_release_file)

        self.assertNotIn("/raw/main/data/processed", download_source)
        self.assertIn("resolve_release_asset_download", download_source)

    def test_release_asset_resolver_falls_back_to_public_urls_without_github_token(
        self,
    ):
        previous = os.environ.get("GITHUB_TOKEN")
        if previous is None:
            os.environ.pop("GITHUB_TOKEN", None)
        else:
            os.environ.pop("GITHUB_TOKEN")
        try:
            import api

            reloaded = importlib.reload(api)
            url, headers = reloaded.resolve_release_asset_download(
                "madrid_shadow_graph.graphml"
            )
            self.assertEqual(url, reloaded.GRAPH_RELEASE_URL)
            self.assertEqual(headers, {})
        finally:
            if previous is not None:
                os.environ["GITHUB_TOKEN"] = previous
            import api

            importlib.reload(api)

    def test_tree_shade_score_prefers_new_attribute_when_present(self):
        import api

        self.assertEqual(
            api.get_tree_shade_score({"tree_shade_score": 0.45, "shade_score": 0.10}),
            0.45,
        )
        self.assertEqual(
            api.get_tree_shade_score({"shade_score": 0.25}),
            0.25,
        )

    def test_route_edges_prefers_edge_with_higher_combined_shade(self):
        import api

        graph = nx.MultiDiGraph()
        graph.add_node(1, x=0.0, y=0.0)
        graph.add_node(2, x=1.0, y=0.0)
        graph.add_edge(1, 2, key=0, length=100.0, tree_shade_score=0.4, resource_bonus=1.0)
        graph.add_edge(1, 2, key=1, length=100.0, tree_shade_score=0.2, resource_bonus=1.0)

        route_gdf = api.route_edges_gdf(
            graph,
            [1, 2],
            hour_col="h14",
            shadow_dict={(1, 2, 0): {"h14": 0.0}, (1, 2, 1): {"h14": 0.3}},
            pref=1.0,
        )

        self.assertEqual(route_gdf.iloc[0]["key"], 1)

    def test_release_asset_refreshes_when_release_marker_is_missing_or_stale(self):
        import api

        with tempfile.TemporaryDirectory() as tmpdir:
            asset_path = Path(tmpdir) / "graph.graphml"
            asset_path.write_bytes(b"x" * 1_500_000)
            marker_path = Path(tmpdir) / ".graph_release_tag"

            self.assertTrue(
                api.should_refresh_release_asset(
                    asset_path,
                    min_size_bytes=1_000_000,
                    marker_path=marker_path,
                    expected_tag="v1.4",
                )
            )

            marker_path.write_text("v1.3", encoding="utf-8")
            self.assertTrue(
                api.should_refresh_release_asset(
                    asset_path,
                    min_size_bytes=1_000_000,
                    marker_path=marker_path,
                    expected_tag="v1.4",
                )
            )

            marker_path.write_text("v1.4", encoding="utf-8")
            self.assertFalse(
                api.should_refresh_release_asset(
                    asset_path,
                    min_size_bytes=1_000_000,
                    marker_path=marker_path,
                    expected_tag="v1.4",
                )
            )

    def test_get_allowed_origins_includes_env_overrides(self):
        previous_frontend = os.environ.get("FRONTEND_ORIGIN")
        previous_additional = os.environ.get("ADDITIONAL_ALLOWED_ORIGINS")
        os.environ["FRONTEND_ORIGIN"] = "https://custom.madrid-refugio.es"
        os.environ["ADDITIONAL_ALLOWED_ORIGINS"] = (
            "https://preview.example.com, https://ops.example.com"
        )
        try:
            import api

            reloaded = importlib.reload(api)
            origins = reloaded.get_allowed_origins()
            self.assertIn("https://madridrefugio.es", origins)
            self.assertIn("http://localhost:3000", origins)
            self.assertIn("https://custom.madrid-refugio.es", origins)
            self.assertIn("https://preview.example.com", origins)
            self.assertIn("https://ops.example.com", origins)
        finally:
            if previous_frontend is None:
                os.environ.pop("FRONTEND_ORIGIN", None)
            else:
                os.environ["FRONTEND_ORIGIN"] = previous_frontend
            if previous_additional is None:
                os.environ.pop("ADDITIONAL_ALLOWED_ORIGINS", None)
            else:
                os.environ["ADDITIONAL_ALLOWED_ORIGINS"] = previous_additional
            import api

            importlib.reload(api)

    def test_health_payload_exposes_runtime_details(self):
        import api

        response = api.health_check()

        self.assertIn("status", response)
        self.assertIn("graph_loaded", response)
        self.assertIn("shadow_matrix_loaded", response)
        self.assertIn("weather_configured", response)
        self.assertIn("release_tag", response)
        self.assertIn("startup_errors", response)

    def test_health_reports_degraded_when_startup_has_errors(self):
        import api

        previous_errors = list(api.app_state.startup_errors)
        try:
            api.app_state.startup_errors = ["missing graph"]
            response = api.health_check()
            self.assertEqual(response["status"], "degraded")
            self.assertEqual(response["startup_errors"], ["missing graph"])
        finally:
            api.app_state.startup_errors = previous_errors

    def test_startup_event_loads_runtime_assets(self):
        import api

        previous_graph = api.app_state.graph
        previous_refugios = api.app_state.refugios_utm
        previous_fuentes = api.app_state.fuentes_utm
        previous_shadow = api.app_state.shadow_dict
        previous_search_index = api.app_state.search_index
        previous_errors = list(api.app_state.startup_errors)
        called = []

        def fake_load_runtime_assets(download_release_file):
            called.append(download_release_file)
            api.app_state.graph = object()
            api.app_state.refugios_utm = object()
            api.app_state.fuentes_utm = object()
            api.app_state.shadow_dict = {}

        try:
            api.app_state.graph = None
            api.app_state.refugios_utm = None
            api.app_state.fuentes_utm = None
            api.app_state.shadow_dict = None
            api.app_state.search_index = []
            api.app_state.startup_errors = []
            from unittest.mock import patch

            with patch.object(api, "load_runtime_assets", side_effect=fake_load_runtime_assets):
                api.startup_event()

            self.assertEqual(len(called), 1)
            self.assertIsNotNone(api.app_state.graph)
            self.assertIsNotNone(api.app_state.refugios_utm)
            self.assertIsNotNone(api.app_state.fuentes_utm)
            self.assertIsNotNone(api.app_state.shadow_dict)
        finally:
            api.app_state.graph = previous_graph
            api.app_state.refugios_utm = previous_refugios
            api.app_state.fuentes_utm = previous_fuentes
            api.app_state.shadow_dict = previous_shadow
            api.app_state.search_index = previous_search_index
            api.app_state.startup_errors = previous_errors

    def test_fetch_aemet_data_without_key_returns_degraded_payload(self):
        previous_key = os.environ.get("AEMET_API_KEY")
        try:
            os.environ.pop("AEMET_API_KEY", None)
            import api

            reloaded = importlib.reload(api)
            payload = reloaded.fetch_aemet_data()
            self.assertEqual(payload["municipio"], "Madrid")
            self.assertEqual(payload["estado_cielo"], "AEMET no disponible")
            self.assertEqual(payload["fuente"], "AEMET (OpenData)")
            self.assertEqual(payload["error"], "AEMET_API_KEY no configurada")
        finally:
            if previous_key is not None:
                os.environ["AEMET_API_KEY"] = previous_key
            import api

            importlib.reload(api)


if __name__ == "__main__":
    unittest.main()
