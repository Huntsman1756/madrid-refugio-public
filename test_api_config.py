import importlib
import os
import tempfile
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


if __name__ == "__main__":
    unittest.main()
