import unittest
import json
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
        payload = json.loads(response.body.decode("utf-8"))
        self.assertEqual(payload["error_code"], "out_of_corridor")
        self.assertIn("red peatonal", payload["detail"])

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
        payload = json.loads(response.body.decode("utf-8"))
        self.assertEqual(payload["error_code"], "out_of_corridor")
        self.assertIn("camino peatonal", payload["detail"])

    def test_returns_geocode_not_found_when_origin_cannot_be_resolved(self):
        with patch.object(
            api,
            "geocode_address",
            side_effect=api.RoutingInputError(
                "No hemos encontrado esa dirección. Prueba con una calle y número o elige una sugerencia.",
                "geocode_not_found",
            ),
        ):
            response = api.calculate_route(
                api.RouteRequest(origin="origen", destination="destino", hour=14, preference=0.5)
            )

        self.assertIsInstance(response, JSONResponse)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.body.decode("utf-8"),
            '{"detail":"No hemos encontrado esa dirección. Prueba con una calle y número o elige una sugerencia.","error_code":"geocode_not_found"}',
        )

    def test_returns_outside_madrid_when_geocode_matches_other_city(self):
        with patch.object(
            api,
            "geocode_address",
            side_effect=api.RoutingInputError(
                "La dirección está fuera de Madrid. Prueba con una dirección dentro del municipio.",
                "outside_madrid",
            ),
        ):
            response = api.calculate_route(
                api.RouteRequest(origin="Getafe", destination="destino", hour=14, preference=0.5)
            )

        self.assertIsInstance(response, JSONResponse)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.body.decode("utf-8"),
            '{"detail":"La dirección está fuera de Madrid. Prueba con una dirección dentro del municipio.","error_code":"outside_madrid"}',
        )


if __name__ == "__main__":
    unittest.main()
