import unittest
from unittest.mock import patch

import networkx as nx
from fastapi.responses import JSONResponse

import api


class RouteOutOfCorridorTests(unittest.TestCase):
    def setUp(self):
        self.previous_graph = api.app_state.graph
        self.previous_refugios = api.app_state.refugios_utm
        self.previous_fuentes = api.app_state.fuentes_utm

        graph = nx.MultiDiGraph()
        graph.add_node(0)
        api.app_state.graph = graph
        api.app_state.refugios_utm = object()
        api.app_state.fuentes_utm = object()

    def tearDown(self):
        api.app_state.graph = self.previous_graph
        api.app_state.refugios_utm = self.previous_refugios
        api.app_state.fuentes_utm = self.previous_fuentes

    def test_returns_out_of_corridor_when_nearest_node_lookup_fails(self):
        with patch.object(api, "geocode_address", side_effect=[(40.4, -3.7), (40.41, -3.69)]), patch.object(
            api, "nearest_node", side_effect=nx.NodeNotFound("missing")
        ):
            response = api.calculate_route(
                api.RouteRequest(
                    origin="origen",
                    destination="destino",
                    hour=14,
                    preference=0.5,
                )
            )

        self.assertIsInstance(response, JSONResponse)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.body.decode("utf-8"),
            '{"detail":"out_of_corridor","error_code":"out_of_corridor"}',
        )

    def test_returns_out_of_corridor_when_no_path_exists(self):
        with patch.object(api, "geocode_address", side_effect=[(40.4, -3.7), (40.41, -3.69)]), patch.object(
            api, "nearest_node", side_effect=[1, 2]
        ), patch.object(api.nx, "shortest_path", side_effect=nx.NetworkXNoPath("no path")):
            response = api.calculate_route(
                api.RouteRequest(
                    origin="origen",
                    destination="destino",
                    hour=14,
                    preference=0.5,
                )
            )

        self.assertIsInstance(response, JSONResponse)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.body.decode("utf-8"),
            '{"detail":"out_of_corridor","error_code":"out_of_corridor"}',
        )


if __name__ == "__main__":
    unittest.main()
