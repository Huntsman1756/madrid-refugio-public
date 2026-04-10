import unittest
from unittest.mock import patch
from types import SimpleNamespace

import geopandas as gpd
import networkx as nx
from shapely.geometry import LineString, Polygon

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
        self.neighborhoods = gpd.GeoDataFrame(
            {
                "NOMDIS": ["Centro", "Centro", "Barajas"],
                "geometry": [
                    Polygon([(0, 0), (1, 0), (1, 1), (0, 1)]),
                    Polygon([(1, 0), (2, 0), (2, 1), (1, 1)]),
                    Polygon([(2, 0), (3, 0), (3, 1), (2, 1)]),
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

    @patch("precompute_shadow_graph.gpd.read_file")
    def test_get_processing_areas_dissolves_by_district(self, mock_read_file):
        mock_read_file.return_value = self.neighborhoods

        areas = psg.get_processing_areas(
            ["Centro, Madrid, Spain", "Barajas, Madrid, Spain"],
            districts_path=psg.DISTRICTS_GEOJSON_PATH,
        )

        self.assertEqual(list(areas["NOMDIS"]), ["Barajas", "Centro"])
        self.assertEqual(len(areas), 2)

    @patch("precompute_shadow_graph.unary_union")
    def test_calculate_shadow_fractions_recovers_after_union_failure(self, mock_unary_union):
        graph = nx.MultiDiGraph()
        graph.add_node(1, x=0, y=0)
        graph.add_node(2, x=1, y=0)
        graph.add_edge(1, 2, key=0, geometry=LineString([(0, 0), (1, 0)]))

        shadows = gpd.GeoDataFrame(
            {"geometry": [Polygon([(0, -1), (1, -1), (1, 1), (0, 1)])]},
            crs="EPSG:4326",
        )

        mock_unary_union.side_effect = [Exception("boom"), Polygon([(0, -1), (1, -1), (1, 1), (0, 1)])]
        fractions = psg.calculate_shadow_fractions(shadows, graph)

        self.assertIn((1, 2, 0), fractions)
        self.assertGreaterEqual(fractions[(1, 2, 0)], 0.99)


if __name__ == "__main__":
    unittest.main()
