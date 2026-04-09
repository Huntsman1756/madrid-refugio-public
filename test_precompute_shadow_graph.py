import unittest
from unittest.mock import patch
from types import SimpleNamespace

import geopandas as gpd
from shapely.geometry import Polygon

import precompute_shadow_graph as psg


class PrecomputeShadowGraphTests(unittest.TestCase):
    def setUp(self):
        self.districts = gpd.GeoDataFrame(
            {
                "NOMDIS": ["Centro", "Barajas"],
                "geometry": [
                    Polygon([(0, 0), (1, 0), (1, 1), (0, 1)]),
                    Polygon([(1, 0), (2, 0), (2, 1), (1, 1)]),
                ],
            },
            crs="EPSG:4326",
        )

    @patch("precompute_shadow_graph.gpd.read_file")
    def test_get_area_polygon_dissolves_multiple_districts(self, mock_read_file):
        mock_read_file.return_value = self.districts

        polygon = psg.get_area_polygon(
            ["Centro, Madrid, Spain", "Barajas, Madrid, Spain"],
            districts_path=psg.DISTRICTS_GEOJSON_PATH,
        )

        self.assertAlmostEqual(polygon.area, 2.0)

    @patch("precompute_shadow_graph.ox.graph_from_polygon")
    @patch("precompute_shadow_graph.gpd.read_file")
    def test_download_graph_for_area_uses_single_polygon_fetch(self, mock_read_file, mock_graph_from_polygon):
        mock_read_file.return_value = self.districts
        fake_graph = SimpleNamespace(nodes=[1, 2], edges=[(1, 2)])
        mock_graph_from_polygon.return_value = fake_graph

        graph = psg.download_graph_for_area(["Centro, Madrid, Spain", "Barajas, Madrid, Spain"])

        self.assertIs(graph, fake_graph)
        mock_graph_from_polygon.assert_called_once()


if __name__ == "__main__":
    unittest.main()
