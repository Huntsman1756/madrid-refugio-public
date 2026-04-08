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
        finally:
            if previous is None:
                os.environ.pop("DATA_DIR", None)
            else:
                os.environ["DATA_DIR"] = previous
            import api

            importlib.reload(api)


if __name__ == "__main__":
    unittest.main()
