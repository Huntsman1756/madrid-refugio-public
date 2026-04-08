import importlib
import os
import unittest
from pathlib import Path


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
                reloaded.BASE_DIR / "data" / "processed" / "refugios_sustitutos.geojson",
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
        self.assertTrue(api.SHADOW_MATRIX_RELEASE_URL.endswith("/shadow_matrix.parquet"))

    def test_release_asset_resolver_falls_back_to_public_urls_without_github_token(self):
        previous = os.environ.get("GITHUB_TOKEN")
        if previous is None:
            os.environ.pop("GITHUB_TOKEN", None)
        else:
            os.environ.pop("GITHUB_TOKEN")
        try:
            import api

            reloaded = importlib.reload(api)
            url, headers = reloaded.resolve_release_asset_download("madrid_shadow_graph.graphml")
            self.assertEqual(url, reloaded.GRAPH_RELEASE_URL)
            self.assertEqual(headers, {})
        finally:
            if previous is not None:
                os.environ["GITHUB_TOKEN"] = previous
            import api

            importlib.reload(api)


if __name__ == "__main__":
    unittest.main()
