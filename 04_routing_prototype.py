from __future__ import annotations

import importlib.util
import json
from pathlib import Path

import geopandas as gpd
import networkx as nx
import numpy as np
import osmnx as ox
import pandas as pd
from shapely.geometry import LineString, Point

BASE_DIR = Path(__file__).resolve().parent
PROCESSED_DIR = BASE_DIR / "data" / "processed"
GRAPH_PATH = PROCESSED_DIR / "madrid_walk_graph.graphml"
ROUTING_SUMMARY_PATH = PROCESSED_DIR / "routing_summary.json"

ORIGIN = "Calle Bravo Murillo 1, Madrid, Spain"
DESTINATION = "Calle Bravo Murillo 100, Madrid, Spain"
TREE_BUFFER_METERS = 15
ESTIMATED_CROWN_DIAMETER_M = 6.0


def load_day1_module():
    module_path = BASE_DIR / "02_comfort_index.py"
    spec = importlib.util.spec_from_file_location("comfort_day1", module_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Could not load helpers from {module_path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def ensure_edge_geometry(graph: nx.MultiDiGraph) -> None:
    for u, v, key, data in graph.edges(keys=True, data=True):
        if "geometry" not in data or data["geometry"] is None:
            data["geometry"] = LineString(
                [
                    (graph.nodes[u]["x"], graph.nodes[u]["y"]),
                    (graph.nodes[v]["x"], graph.nodes[v]["y"]),
                ]
            )


def download_graph() -> nx.MultiDiGraph:
    print("Downloading Madrid walk graph from OpenStreetMap...")
    return ox.graph_from_place("Madrid, Spain", network_type="walk", simplify=True)


def route_edge_metrics(graph: nx.MultiDiGraph, route: list[int]) -> tuple[float, float]:
    length_total = 0.0
    shade_total = 0.0
    for u, v in zip(route[:-1], route[1:]):
        edge_data = min(graph.get_edge_data(u, v).values(), key=lambda item: item.get("length", float("inf")))
        length_total += float(edge_data.get("length", 0.0))
        shade_total += float(edge_data.get("shade_score", 0.0)) * float(edge_data.get("length", 0.0))
    return length_total, shade_total


def route_edges_gdf(graph: nx.MultiDiGraph, route: list[int]) -> gpd.GeoDataFrame:
    rows = []
    for u, v in zip(route[:-1], route[1:]):
        key, edge_data = min(
            graph.get_edge_data(u, v).items(),
            key=lambda item: item[1].get("length", float("inf")),
        )
        rows.append(
            {
                "u": u,
                "v": v,
                "key": key,
                "length": float(edge_data.get("length", 0.0)),
                "geometry": edge_data["geometry"],
            }
        )
    return gpd.GeoDataFrame(rows, geometry="geometry", crs="EPSG:25830")


def main() -> None:
    day1 = load_day1_module()
    _, arbolado = day1.load_arbolado()
    arbolado_viario = arbolado[arbolado["NUM_PARQUE"].isna()].copy()

    graph = download_graph()
    ensure_edge_geometry(graph)
    graph_proj = ox.project_graph(graph, to_crs="EPSG:25830")
    ensure_edge_geometry(graph_proj)

    origin_latlon = ox.geocode(ORIGIN)
    destination_latlon = ox.geocode(DESTINATION)
    points_utm = gpd.GeoSeries(
        [
            Point(origin_latlon[1], origin_latlon[0]),
            Point(destination_latlon[1], destination_latlon[0]),
        ],
        crs="EPSG:4326",
    ).to_crs("EPSG:25830")
    origin_point = points_utm.iloc[0]
    destination_point = points_utm.iloc[1]
    origin_node = ox.distance.nearest_nodes(graph_proj, origin_point.x, origin_point.y)
    destination_node = ox.distance.nearest_nodes(graph_proj, destination_point.x, destination_point.y)

    shortest_route = ox.routing.shortest_path(graph_proj, origin_node, destination_node, weight="length")
    if shortest_route is None:
        raise RuntimeError("Could not compute shortest route for the Bravo Murillo test case")

    edges_proj = ox.graph_to_gdfs(graph_proj, nodes=False, edges=True).reset_index()
    shortest_edges = route_edges_gdf(graph_proj, shortest_route)

    corridor_radii = [250, 400, 700]
    weighted_graph = None
    comfort_route = None
    last_radius = None

    for corridor_radius in corridor_radii:
        union_geom = shortest_edges.geometry.union_all()
        corridor = union_geom.buffer(corridor_radius)
        candidate_edges = edges_proj[edges_proj.geometry.intersects(corridor)].copy()
        if candidate_edges.empty:
            continue

        edge_buffers = candidate_edges[["u", "v", "key", "length", "geometry"]].copy()
        edge_buffers["geometry"] = edge_buffers.geometry.buffer(TREE_BUFFER_METERS)
        edge_buffers = gpd.GeoDataFrame(edge_buffers, geometry="geometry", crs="EPSG:25830")

        tree_hits = gpd.sjoin(
            arbolado_viario[["geometry"]],
            edge_buffers[["u", "v", "key", "length", "geometry"]],
            how="inner",
            predicate="within",
        )
        tree_counts = (
            tree_hits.groupby(["u", "v", "key"])
            .size()
            .rename("tree_count")
            .reset_index()
        )
        candidate_edges = candidate_edges.merge(tree_counts, on=["u", "v", "key"], how="left")
        candidate_edges["tree_count"] = candidate_edges["tree_count"].fillna(0).astype(int)
        candidate_edges["crown_diameter_m"] = ESTIMATED_CROWN_DIAMETER_M
        candidate_edges["shade_raw"] = (
            candidate_edges["tree_count"] * candidate_edges["crown_diameter_m"]
        ) / candidate_edges["length"].replace(0, np.nan)
        candidate_edges["shade_raw"] = candidate_edges["shade_raw"].replace([np.inf, -np.inf], np.nan).fillna(0.0)

        candidate_edges["shade_score"] = 0.0
        shaded_mask = candidate_edges["shade_raw"] > 0
        if shaded_mask.any():
            candidate_edges.loc[shaded_mask, "shade_score"] = (
                candidate_edges.loc[shaded_mask, "shade_raw"]
                .rank(method="average", pct=True)
                .astype(float)
            )
        candidate_edges["comfort_weight"] = candidate_edges["length"] * (
            1.0 + (1.0 - candidate_edges["shade_score"]) * 0.8
        )

        candidate_nodes = set(candidate_edges["u"]).union(candidate_edges["v"])
        weighted_graph = graph_proj.subgraph(candidate_nodes).copy()
        for u, v, key, data in weighted_graph.edges(keys=True, data=True):
            data["tree_count"] = int(data.get("tree_count", 0) or 0)
            data["shade_raw"] = float(data.get("shade_raw", 0.0) or 0.0)
            data["shade_score"] = float(data.get("shade_score", 0.0) or 0.0)
            data["comfort_weight"] = float(data.get("length", 0.0) or 0.0)
            data["crown_diameter_m"] = float(data.get("crown_diameter_m", ESTIMATED_CROWN_DIAMETER_M) or ESTIMATED_CROWN_DIAMETER_M)
        for row in candidate_edges.itertuples():
            weighted_graph[row.u][row.v][row.key]["tree_count"] = int(row.tree_count)
            weighted_graph[row.u][row.v][row.key]["shade_raw"] = float(row.shade_raw)
            weighted_graph[row.u][row.v][row.key]["shade_score"] = float(row.shade_score)
            weighted_graph[row.u][row.v][row.key]["comfort_weight"] = float(row.comfort_weight)
            weighted_graph[row.u][row.v][row.key]["crown_diameter_m"] = float(row.crown_diameter_m)

        comfort_route = ox.routing.shortest_path(weighted_graph, origin_node, destination_node, weight="comfort_weight")
        last_radius = corridor_radius
        if comfort_route is None:
            continue
        if comfort_route != shortest_route:
            break

    if weighted_graph is None or comfort_route is None:
        raise RuntimeError("Could not compute comfort route for the Bravo Murillo test case")

    shortest_length, shortest_shade = route_edge_metrics(weighted_graph, shortest_route)
    comfort_length, comfort_shade = route_edge_metrics(weighted_graph, comfort_route)

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    ox.save_graphml(weighted_graph, GRAPH_PATH)
    routing_summary = {
        "origin": ORIGIN,
        "destination": DESTINATION,
        "corridor_radius_m": last_radius,
        "shortest_length_m": round(shortest_length, 1),
        "comfort_length_m": round(comfort_length, 1),
        "distance_delta_m": round(comfort_length - shortest_length, 1),
        "distance_delta_pct": round(((comfort_length - shortest_length) / shortest_length) * 100.0, 1) if shortest_length else 0.0,
        "shortest_shade_score": round(shortest_shade, 3),
        "comfort_shade_score": round(comfort_shade, 3),
        "shade_delta": round(comfort_shade - shortest_shade, 3),
        "shade_ratio": round((comfort_shade / shortest_shade), 1) if shortest_shade else None,
        "routes_are_different": comfort_route != shortest_route,
        "estimated_crown_diameter_m": ESTIMATED_CROWN_DIAMETER_M,
    }
    ROUTING_SUMMARY_PATH.write_text(json.dumps(routing_summary, indent=2), encoding="utf-8")

    print("Routing prototype completed")
    print(f"Origin: {ORIGIN}")
    print(f"Destination: {DESTINATION}")
    print(f"Corridor radius used: {last_radius} m")
    print("Tree crown diameter column not found in official dataset; using constant 6.0 m per tree.")
    print(f"Shortest route length: {shortest_length:.1f} m")
    print(f"Comfort route length: {comfort_length:.1f} m")
    print(f"Distance delta: {comfort_length - shortest_length:.1f} m")
    print(f"Shortest route accumulated shade score: {shortest_shade:.3f}")
    print(f"Comfort route accumulated shade score: {comfort_shade:.3f}")
    print(f"Shade delta: {comfort_shade - shortest_shade:.3f}")
    print(f"Routes are different: {'yes' if comfort_route != shortest_route else 'no'}")
    print(f"Graph saved to: {GRAPH_PATH}")
    print(f"Routing summary saved to: {ROUTING_SUMMARY_PATH}")


if __name__ == "__main__":
    main()
