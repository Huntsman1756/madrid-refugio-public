from __future__ import annotations

import json
import socket
from pathlib import Path
from typing import List, Tuple

import geopandas as gpd
import networkx as nx
import osmnx as ox
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pyproj import Transformer
from shapely.geometry import LineString, Point

# --- Configuration & Paths ---
BASE_DIR = Path(__file__).resolve().parent
PROCESSED_DIR = BASE_DIR / "data" / "processed"
GRAPH_PATH = PROCESSED_DIR / "madrid_shadow_graph.graphml"
REFUGIOS_PATH = PROCESSED_DIR / "refugios_sustitutos.geojson"
FUENTES_PATH = PROCESSED_DIR / "fuentes.geojson"
SHADOW_MATRIX_PATH = PROCESSED_DIR / "shadow_matrix.parquet"

import sys
def check_data_files():
    missing = [p for p in [GRAPH_PATH, SHADOW_MATRIX_PATH] if not p.exists()]
    if missing:
        print("\n❌ Error Crítico: Faltan archivos de datos básicos para arrancar el backend.")
        for f in missing:
            print(f"   - {f}")
        print("Asegúrate de que los archivos están en 'data/processed/'.\n")
        sys.exit(1)

check_data_files()

GEOCODE_TIMEOUT_SECONDS = 8
_LOCAL_GEOCACHE = {
    "calle bravo murillo 1, madrid": (40.44795, -3.70312),
    "calle bravo murillo 1, madrid, spain": (40.44795, -3.70312),
    "calle bravo murillo 100, madrid": (40.45685, -3.70355),
    "calle bravo murillo 100, madrid, spain": (40.45685, -3.70355),
}
MADRID_BBOX = {
    "lat_min": 40.31,
    "lat_max": 40.55,
    "lon_min": -3.83,
    "lon_max": -3.52,
}

# --- Global State for Caching ---
class AppState:
    graph: nx.MultiDiGraph | None = None
    refugios_utm: gpd.GeoDataFrame | None = None
    fuentes_utm: gpd.GeoDataFrame | None = None
    shadow_dict: dict | None = None

app_state = AppState()

# --- Utility Functions ---

def ensure_edge_geometry(graph: nx.MultiDiGraph) -> None:
    for u, v, key, data in graph.edges(keys=True, data=True):
        if "geometry" not in data or data["geometry"] is None:
            data["geometry"] = LineString(
                [
                    (graph.nodes[u]["x"], graph.nodes[u]["y"]),
                    (graph.nodes[v]["x"], graph.nodes[v]["y"]),
                ]
            )

def route_edges_gdf(graph: nx.MultiDiGraph, route: list[int]) -> gpd.GeoDataFrame:
    rows = []
    for u, v in zip(route[:-1], route[1:]):
        edge_data_dict = graph.get_edge_data(u, v)
        if not edge_data_dict:
            continue
        key, edge_data = min(
            edge_data_dict.items(),
            key=lambda item: float(item[1].get("length", float("inf"))),
        )
        geom = edge_data.get("geometry")
        if geom is None:
            point_u = (graph.nodes[u]["x"], graph.nodes[u]["y"])
            point_v = (graph.nodes[v]["x"], graph.nodes[v]["y"])
            geom = LineString([point_u, point_v])
        rows.append(
            {
                "u": u,
                "v": v,
                "key": key,
                "length": float(edge_data.get("length", 0.0)),
                "shade_score": float(edge_data.get("shade_score", 0.0)),
                "geometry": geom,
            }
        )
    return gpd.GeoDataFrame(rows, geometry="geometry", crs="EPSG:25830")

def route_metrics(graph: nx.MultiDiGraph, route: list[int], hour_col: str = None, shadow_dict: dict = None) -> tuple[float, float, float]:
    total_length = 0.0
    total_t_shade = 0.0
    total_b_shade = 0.0
    for u, v in zip(route[:-1], route[1:]):
        edge_data_dict = graph.get_edge_data(u, v)
        if not edge_data_dict:
            continue
        edge_data = min(
            edge_data_dict.values(),
            key=lambda item: float(item.get("length", float("inf"))),
        )
        edge_length = float(edge_data.get("length", 0.0))
        edge_t_shade = float(edge_data.get("shade_score", 0.0))
        edge_b_shade = 0.0
        
        if hour_col and shadow_dict:
            edge_key = edge_data.get("key", 0)
            if (u, v, edge_key) in shadow_dict:
                edge_b_shade = float(shadow_dict[(u, v, edge_key)].get(hour_col, 0.0))
        
        total_length += edge_length
        total_t_shade += edge_t_shade * edge_length
        total_b_shade += edge_b_shade * edge_length
        
    return total_length, total_t_shade, total_b_shade

def count_points_near_route(points: gpd.GeoDataFrame, route_gdf: gpd.GeoDataFrame, buffer_m: float) -> int:
    if route_gdf.empty:
        return 0
    route_buffer = route_gdf.geometry.union_all().buffer(buffer_m)
    return int(points[points.geometry.within(route_buffer)].shape[0])

def point_in_madrid(lat: float, lon: float) -> bool:
    return (
        MADRID_BBOX["lat_min"] <= lat <= MADRID_BBOX["lat_max"]
        and MADRID_BBOX["lon_min"] <= lon <= MADRID_BBOX["lon_max"]
    )

def normalize_address(address: str) -> str:
    return " ".join(address.strip().lower().split())

def geocode_address(address: str) -> tuple[float, float]:
    normalized = normalize_address(address)
    if normalized in _LOCAL_GEOCACHE:
        lat, lon = _LOCAL_GEOCACHE[normalized]
    else:
        previous_timeout = socket.getdefaulttimeout()
        socket.setdefaulttimeout(GEOCODE_TIMEOUT_SECONDS)
        try:
            lat, lon = ox.geocode(address)
        except Exception as exc:
            raise ValueError(
                "No se ha podido geocodificar la direccion. "
                "Prueba una direccion mas especifica de Madrid."
            ) from exc
        finally:
            socket.setdefaulttimeout(previous_timeout)
    if not point_in_madrid(lat, lon):
        raise ValueError("La direccion esta fuera de Madrid.")
    return lat, lon

def nearest_node(graph: nx.MultiDiGraph, lat: float, lon: float) -> int:
    # --- Guard 1: validate the projected point is within Madrid's EPSG:25830 extent ---
    # Catches edge cases where Nominatim returns a vague / wrong geocode
    # (e.g. "Madrid, España" instead of a street), producing garbage projections.
    # Madrid municipality roughly spans x=[430_000, 470_000], y=[4_460_000, 4_500_000]
    point_graph = gpd.GeoSeries([Point(lon, lat)], crs="EPSG:4326").to_crs("EPSG:25830").iloc[0]
    if not (400_000 < point_graph.x < 500_000 and 4_400_000 < point_graph.y < 4_550_000):
        raise ValueError(
            "Las coordenadas proyectadas están fuera del sistema de referencia de Madrid. "
            "Revisa que la dirección sea específica (incluye número y 'Madrid')."
        )

    # --- Guard 2: snap-distance validation ---
    # Threshold rationale: the active graph covers ~1 km² around Bravo Murillo / Tetuán.
    # 500 m allows addresses at the edges of the corridor without rejecting them,
    # while still blocking addresses in different districts (which would produce fake routes).
    MAX_SNAP_METRES = 500  # documented decision: 500 m for a ~1 km² demo graph

    node_id = ox.distance.nearest_nodes(graph, point_graph.x, point_graph.y)
    node_data = graph.nodes[node_id]
    node_point = Point(float(node_data["x"]), float(node_data["y"]))
    snap_distance = point_graph.distance(node_point)

    if snap_distance > MAX_SNAP_METRES:
        # Reverse-project the nearest node to WGS84 for a dynamic reference point
        transformer_back = Transformer.from_crs("EPSG:25830", "EPSG:4326", always_xy=True)
        ref_lon, ref_lat = transformer_back.transform(node_point.x, node_point.y)
        raise ValueError(
            f"La dirección está a {snap_distance:.0f} m del área de routing activa "
            f"(máximo permitido: {MAX_SNAP_METRES} m). "
            f"El punto más cercano del grafo está en ({ref_lat:.5f}, {ref_lon:.5f}). "
            "Usa una dirección en el corredor Bravo Murillo / Tetuán."
        )

    return node_id

def extract_wgs84_coords(graph: nx.MultiDiGraph, route: list[int]) -> List[Tuple[float, float]]:
    transformer = Transformer.from_crs("EPSG:25830", "EPSG:4326", always_xy=True)
    coords = []
    for node_id in route:
        nd = graph.nodes[node_id]
        lon_wgs, lat_wgs = transformer.transform(float(nd["x"]), float(nd["y"]))
        coords.append((lat_wgs, lon_wgs))
    return coords

# --- FastAPI App Setup ---

app = FastAPI(title="Madrid Refugio API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    print("Cargando grafo y datasets geespaciales...")
    if not GRAPH_PATH.exists():
        raise RuntimeError(f"No se encuentra el grafo en {GRAPH_PATH}")
    
    graph = ox.load_graphml(GRAPH_PATH)
    ensure_edge_geometry(graph)
    for u, v, key, data in graph.edges(keys=True, data=True):
        data["key"] = key
        data["length"] = float(data.get("length", 0.0) or 0.0)
        data["shade_score"] = float(data.get("shade_score", 0.0) or 0.0)
        stored_comfort = data.get("comfort_weight", "")
        if stored_comfort in ("", None):
            data["comfort_weight"] = data["length"] * (1.0 + (1.0 - data["shade_score"]) * 0.8)
        else:
            data["comfort_weight"] = float(stored_comfort)
    
    app_state.graph = graph
    app_state.refugios_utm = gpd.read_file(REFUGIOS_PATH).to_crs("EPSG:25830")
    app_state.fuentes_utm = gpd.read_file(FUENTES_PATH).to_crs("EPSG:25830")
    
    if SHADOW_MATRIX_PATH.exists():
        print("Cargando matriz de sombras dinámica...")
        shadow_df = pd.read_parquet(SHADOW_MATRIX_PATH)
        app_state.shadow_dict = shadow_df.set_index(["u", "v", "key"]).to_dict("index")
    else:
        app_state.shadow_dict = {}

    print("Datos cargados correctamente.")

# --- API Models ---
class RouteRequest(BaseModel):
    origin: str
    destination: str
    hour: int

@app.post("/api/route")
def calculate_route(req: RouteRequest):
    graph = app_state.graph
    refugios_utm = app_state.refugios_utm
    fuentes_utm = app_state.fuentes_utm

    if not graph or refugios_utm is None or fuentes_utm is None:
        raise HTTPException(status_code=500, detail="Server not fully initialized")

    try:
        origin_latlon = geocode_address(req.origin)
        destination_latlon = geocode_address(req.destination)
        origin_node = nearest_node(graph, *origin_latlon)
        destination_node = nearest_node(graph, *destination_latlon)

        hour_val = max(8, min(20, req.hour))
        hour_col = f"h{hour_val:02d}"

        def get_dynamic_weight(u, v, d):
            t_shade = float(d.get("shade_score", 0.0))
            b_shade = 0.0
            if app_state.shadow_dict and (u, v, d.get("key", 0)) in app_state.shadow_dict:
                b_shade = float(app_state.shadow_dict[(u, v, d.get("key", 0))].get(hour_col, 0.0))
            combined_shade = max(t_shade, b_shade)
            return float(d.get("length", 1.0)) * (1.0 + (1.0 - combined_shade) * 0.8)

        shortest_route = nx.shortest_path(graph, origin_node, destination_node, weight="length")
        comfort_route = nx.shortest_path(graph, origin_node, destination_node, weight=get_dynamic_weight)

        if shortest_route is None or comfort_route is None:
            raise ValueError("No se ha podido calcular una ruta válida entre estos puntos.")

        shortest_length, shortest_t_shade, shortest_b_shade = route_metrics(graph, shortest_route, hour_col, app_state.shadow_dict)
        comfort_length, comfort_t_shade, comfort_b_shade = route_metrics(graph, comfort_route, hour_col, app_state.shadow_dict)
        
        shortest_gdf = route_edges_gdf(graph, shortest_route)
        comfort_gdf = route_edges_gdf(graph, comfort_route)

        shortest_fuentes = count_points_near_route(fuentes_utm, shortest_gdf, buffer_m=75.0)
        comfort_fuentes = count_points_near_route(fuentes_utm, comfort_gdf, buffer_m=75.0)
        shortest_refugios = count_points_near_route(refugios_utm, shortest_gdf, buffer_m=200.0)
        comfort_refugios = count_points_near_route(refugios_utm, comfort_gdf, buffer_m=200.0)

        return {
            "origin_latlon": origin_latlon,
            "destination_latlon": destination_latlon,
            "shortest_coords": extract_wgs84_coords(graph, shortest_route),
            "comfort_coords": extract_wgs84_coords(graph, comfort_route),
            "metrics": {
                "shortest": {
                    "length": shortest_length,
                    "tree_shade": shortest_t_shade,
                    "building_shade": shortest_b_shade,
                    "fuentes": shortest_fuentes,
                    "refugios": shortest_refugios
                },
                "comfort": {
                    "length": comfort_length,
                    "tree_shade": comfort_t_shade,
                    "building_shade": comfort_b_shade,
                    "fuentes": comfort_fuentes,
                    "refugios": comfort_refugios
                }
            }
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
