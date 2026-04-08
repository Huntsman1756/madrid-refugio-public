from __future__ import annotations

import json
import os
import requests
import socket
import gzip
import shutil
from datetime import datetime
try:
    from zoneinfo import ZoneInfo
except ImportError:
    from backports.zoneinfo import ZoneInfo
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


def get_processed_dir() -> Path:
    data_dir = os.getenv("DATA_DIR")
    if data_dir:
        return Path(data_dir)
    return BASE_DIR / "data" / "processed"


PROCESSED_DIR = get_processed_dir()
GRAPH_PATH = PROCESSED_DIR / "madrid_shadow_graph.graphml"
REFUGIOS_PATH = PROCESSED_DIR / "refugios_sustitutos.geojson"
FUENTES_PATH = PROCESSED_DIR / "fuentes.geojson"
SHADOW_MATRIX_PATH = PROCESSED_DIR / "shadow_matrix.parquet"

import sys
import time

def check_data_files():
    missing = [p for p in [GRAPH_PATH, SHADOW_MATRIX_PATH] if not p.exists()]
    if missing:
        print("\n❌ Error Crítico: Faltan archivos de datos básicos para arrancar el backend.")
        for f in missing:
            print(f"   - {f}")
        print("Asegúrate de que los archivos están en 'data/processed/'.\n")
        sys.exit(1)

# Se llamará dentro de startup_event tras la descarga
# check_data_files()

GEOCODE_TIMEOUT_SECONDS = 8

# --- Rendimiento y Estabilidad ---
# Caché local de geocodificación para evitar latencia y dependencia de APIs externas (Nominatim)
# durante la navegación de las rutas de demo. No influye en el cálculo algorítmico.
_GEOCODING_CACHE = {
    "calle marqués de viana 1, madrid": (40.46175, -3.70063),
    "calle marqués de viana 1, madrid, spain": (40.46175, -3.70063),
    "calle marques de viana 1, madrid": (40.46175, -3.70063),
    "calle marques de viana 1, madrid, spain": (40.46175, -3.70063),
    "plaza de castilla, madrid": (40.46597, -3.69038),
    "plaza de castilla, madrid, spain": (40.46597, -3.69038),
    "calle de bravo murillo 243, madrid": (40.46250, -3.69800),
    "calle de bravo murillo 243, madrid, spain": (40.46250, -3.69800),
    "calle de bravo murillo 303, madrid": (40.46500, -3.69300),
    "nuevos ministerios, madrid": (40.4460, -3.6933),
    "nuevos ministerios, madrid, spain": (40.4460, -3.6933),
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
    # Caché meteorológica
    weather_cache: dict | None = None
    weather_last_update: float = 0

app_state = AppState()

# --- AEMET Integration ---
AEMET_API_KEY = os.getenv("AEMET_API_KEY")
MADRID_MUNICIPIO_ID = "28079"

def fetch_aemet_data():
    """Implementa el patrón de doble fetch de AEMET OpenData"""
    if not AEMET_API_KEY:
        return {"error": "AEMET_API_KEY no configurada"}
    
    # Cache de 15 minutos (900 segundos)
    if app_state.weather_cache and (time.time() - app_state.weather_last_update < 900):
        return app_state.weather_cache

    try:
        # Paso 1: Obtener URL temporal
        url_meta = f"https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/horaria/{MADRID_MUNICIPIO_ID}?api_key={AEMET_API_KEY}"
        resp_meta = requests.get(url_meta, timeout=10)
        meta = resp_meta.json()
        
        if meta.get("estado") != 200:
            return {"error": f"AEMET Error: {meta.get('descripcion')}"}
        
        # Paso 2: Obtener datos reales de la URL temporal
        url_datos = meta.get("datos")
        resp_datos = requests.get(url_datos, timeout=10)
        datos = resp_datos.json()
        
        # Extraer info relevante buscando la hora más cercana a la actual
        # Ajustamos por zona horaria de forma robusta
        prediccion = datos[0]["prediccion"]["dia"][0]
        try:
            from zoneinfo import ZoneInfo
            hora_madrid = datetime.now(ZoneInfo("Europe/Madrid")).hour
        except Exception:
            # Fallback si zoneinfo no está disponible o falla
            hora_madrid = (datetime.utcnow().hour + 2) % 24
        
        # Filtrar temperatura por periodo más cercano
        temp_list = prediccion.get("temperatura", [])
        if temp_list:
            best_t = min(temp_list, key=lambda h: abs(int(h.get("periodo", "0")) - hora_madrid))
            temp_actual = best_t.get("value")
            forecast_hour = best_t.get("periodo")
        else:
            temp_actual = "N/A"
            forecast_hour = "--"

        # Filtrar estado del cielo
        cielo_list = prediccion.get("estadoCielo", [])
        if cielo_list:
            best_c = min(cielo_list, key=lambda h: abs(int(h.get("periodo", "0")) - hora_madrid))
            cielo_desc = best_c.get("descripcion")
        else:
            cielo_desc = "Despejado"
        
        result = {
            "municipio": "Madrid",
            "temperatura": temp_actual,
            "estado_cielo": cielo_desc,
            "timestamp": f"{forecast_hour}:00",
            "fuente": "AEMET (OpenData)"
        }
        
        app_state.weather_cache = result
        app_state.weather_last_update = time.time()
        return result
    except Exception as e:
        return {"error": f"Error conectando con AEMET: {str(e)}"}


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

def route_edges_gdf(graph: nx.MultiDiGraph, route: list[int], hour_col: str = None, shadow_dict: dict = None, pref: float = 0.0) -> gpd.GeoDataFrame:
    rows = []
    for u, v in zip(route[:-1], route[1:]):
        edge_data_dict = graph.get_edge_data(u, v)
        if not edge_data_dict:
            continue
        
        # Encontrar la arista que minimiza el peso (Dijkstra's choice)
        best_key = None
        min_w = float('inf')
        for key, data in edge_data_dict.items():
            t_shade = float(data.get("shade_score", 0.0))
            b_shade = 0.0
            if shadow_dict and (u, v, key) in shadow_dict:
                b_shade = float(shadow_dict[(u, v, key)].get(hour_col, 0.0))
            
            combined_shade = max(t_shade, b_shade)
            res_bonus = float(data.get("resource_bonus", 1.0))
            shadow_factor = (1.0 - (combined_shade * 0.8 * pref)) * (1.0 + (res_bonus - 1.0) * pref)
            
            w = float(data.get("length", 1.0)) * max(shadow_factor, 0.1)
            if w < min_w:
                min_w = w
                best_key = key
        
        edge_data = edge_data_dict[best_key]
        geom = edge_data.get("geometry")
        if geom is None:
            point_u = (graph.nodes[u]["x"], graph.nodes[u]["y"])
            point_v = (graph.nodes[v]["x"], graph.nodes[v]["y"])
            geom = LineString([point_u, point_v])
        rows.append(
            {
                "u": u,
                "v": v,
                "key": best_key,
                "length": float(edge_data.get("length", 0.0)),
                "shade_score": float(edge_data.get("shade_score", 0.0)),
                "geometry": geom,
            }
        )
    return gpd.GeoDataFrame(rows, geometry="geometry", crs="EPSG:25830")

def route_metrics(graph: nx.MultiDiGraph, route: list[int], hour_col: str = None, shadow_dict: dict = None, pref: float = 0.0) -> tuple[float, float, float]:
    total_length = 0.0
    total_t_shade = 0.0
    total_b_shade = 0.0
    for u, v in zip(route[:-1], route[1:]):
        edge_data_dict = graph.get_edge_data(u, v)
        if not edge_data_dict:
            continue
        
        best_key = None
        min_w = float('inf')
        for key, data in edge_data_dict.items():
            t_shade = float(data.get("shade_score", 0.0))
            b_shade = 0.0
            if shadow_dict and (u, v, key) in shadow_dict:
                b_shade = float(shadow_dict[(u, v, key)].get(hour_col, 0.0))
            
            combined_shade = max(t_shade, b_shade)
            res_bonus = float(data.get("resource_bonus", 1.0))
            shadow_factor = (1.0 - (combined_shade * 0.8 * pref)) * (1.0 + (res_bonus - 1.0) * pref)
            
            w = float(data.get("length", 1.0)) * max(shadow_factor, 0.1)
            if w < min_w:
                min_w = w
                best_key = key
        
        edge_data = edge_data_dict[best_key]
        edge_length = float(edge_data.get("length", 0.0))
        edge_t_shade = float(edge_data.get("shade_score", 0.0))
        edge_b_shade = 0.0
        
        if hour_col and shadow_dict:
            if (u, v, best_key) in shadow_dict:
                edge_b_shade = float(shadow_dict[(u, v, best_key)].get(hour_col, 0.0))
        
        total_length += edge_length
        total_t_shade += edge_t_shade * edge_length
        total_b_shade += edge_b_shade * edge_length
        
    return total_length, total_t_shade, total_b_shade

def count_points_near_route(points: gpd.GeoDataFrame, route_gdf: gpd.GeoDataFrame, buffer_m: float) -> int:
    if route_gdf.empty:
        return 0
    route_buffer = route_gdf.geometry.union_all().buffer(buffer_m)
    return int(points[points.geometry.within(route_buffer)].shape[0])

def get_points_near_route(points: gpd.GeoDataFrame, route_gdf: gpd.GeoDataFrame, buffer_m: float) -> List[Tuple[float, float]]:
    if route_gdf.empty:
        return []
    route_buffer = route_gdf.geometry.union_all().buffer(buffer_m)
    nearby = points[points.geometry.within(route_buffer)]
    if nearby.empty:
        return []
    # Convert to WGS84 for the frontend
    nearby_wgs84 = nearby.to_crs("EPSG:4326")
    return [(float(geom.y), float(geom.x)) for geom in nearby_wgs84.geometry]

def point_in_madrid(lat: float, lon: float) -> bool:
    return (
        MADRID_BBOX["lat_min"] <= lat <= MADRID_BBOX["lat_max"]
        and MADRID_BBOX["lon_min"] <= lon <= MADRID_BBOX["lon_max"]
    )

def normalize_address(address: str) -> str:
    return " ".join(address.strip().lower().split())

def geocode_address(address: str) -> tuple[float, float]:
    normalized = normalize_address(address)
    if normalized in _GEOCODING_CACHE:
        lat, lon = _GEOCODING_CACHE[normalized]
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
            "Usa una dirección en el corredor Estrecho / Valdeacederas / Plaza de Castilla."
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

@app.get("/api/weather")
def get_weather():
    return fetch_aemet_data()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://madrid-refugio.vercel.app",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/api/health")
def api_health_check():
    return health_check()

@app.on_event("startup")
def startup_event():
    print(f"\n--- Madrid Refugio: Iniciando Backend ---")
    print(f"Directorio de datos resuelto: {PROCESSED_DIR}")
    
    # --- Solución para Railway (Descarga desde GitHub Releases si LFS falla) ---
    def download_and_extract(path: Path, url: str):
        # Si el archivo real no existe o es un puntero LFS
        if not path.exists() or path.stat().st_size < 1000000:
            gz_path = path.with_suffix(path.suffix + ".gz")
            print(f"⚠️  {path.name} no encontrado en volumen. Descargando desde GitHub Releases...")
            try:
                r = requests.get(url, stream=True, timeout=300)
                r.raise_for_status()
                path.parent.mkdir(parents=True, exist_ok=True)
                with open(gz_path, "wb") as f:
                    for chunk in r.iter_content(chunk_size=8192):
                        f.write(chunk)
                
                print(f"Descomprimiendo {gz_path.name}...")
                with gzip.open(gz_path, 'rb') as f_in:
                    with open(path, 'wb') as f_out:
                        shutil.copyfileobj(f_in, f_out)
                
                gz_path.unlink() # Borrar el comprimido
                print(f"✓ {path.name} listo ({path.stat().st_size / 1e6:.1f} MB)")
            except Exception as e:
                print(f"❌ Error procesando {path.name}: {e}")

        else:
            print(f"Grafo cargado desde volumen local ({path.stat().st_size / 1e6:.1f} MB)")

    RELEASE_BASE_URL = "https://github.com/Huntsman1756/madrid-refugio/releases/download/v1.2"
    
    # Descargar y descomprimir el grafo
    download_and_extract(GRAPH_PATH, f"{RELEASE_BASE_URL}/madrid_shadow_graph.graphml.gz")
    
    # Descargar la matriz (esta no va comprimida en .gz extra, ya es parquet)
    if not SHADOW_MATRIX_PATH.exists() or SHADOW_MATRIX_PATH.stat().st_size < 100000:
        print("shadow_matrix.parquet no encontrada en volumen. Descargando desde GitHub Releases...")
        try:
            SHADOW_MATRIX_PATH.parent.mkdir(parents=True, exist_ok=True)
            r = requests.get(f"{RELEASE_BASE_URL}/shadow_matrix.parquet", stream=True, timeout=300)
            r.raise_for_status()
            with open(SHADOW_MATRIX_PATH, "wb") as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
            print(f"✓ Matriz descargada.")
        except Exception as e:
            print(f"❌ Error descargando matriz: {e}")

    else:
        print(f"shadow_matrix.parquet cargada desde volumen local ({SHADOW_MATRIX_PATH.stat().st_size / 1e6:.1f} MB)")

    print(f"Verificando integridad de datos en {GRAPH_PATH}...")
    
    if not GRAPH_PATH.exists():
        raise RuntimeError(f"ERROR: No se encuentra el grafo en {GRAPH_PATH}")
    
    file_size = GRAPH_PATH.stat().st_size
    print(f"Tamaño del archivo de grafo: {file_size / (1024*1024):.2f} MB")
    
    print("Cargando grafo en memoria (esto puede tardar 1-2 min)...")
    t_start = time.time()
    try:
        graph = ox.load_graphml(GRAPH_PATH)
        print(f"✓ Grafo cargado en {time.time() - t_start:.1f} segundos.")
    except Exception as e:
        print(f"❌ Error al cargar el grafo: {str(e)}")
        raise e

    ensure_edge_geometry(graph)
    
    app_state.refugios_utm = gpd.read_file(REFUGIOS_PATH).to_crs("EPSG:25830")
    app_state.fuentes_utm = gpd.read_file(FUENTES_PATH).to_crs("EPSG:25830")

    # --- Pre-calculate Resource Proximity Bonus ---
    # We want the Eco-Route to prefer edges near fountains/shelters
    print("Calculando proximidad a recursos para el grafo...")
    # Buffer resources once
    fuentes_buffer = app_state.fuentes_utm.geometry.union_all().buffer(50.0) # 50m for fountains
    refugios_buffer = app_state.refugios_utm.geometry.union_all().buffer(150.0) # 150m for shelters

    for u, v, key, data in graph.edges(keys=True, data=True):
        data["key"] = key
        data["length"] = float(data.get("length", 0.0) or 0.0)
        data["shade_score"] = float(data.get("shade_score", 0.0) or 0.0)
        
        # Calculate resource bonus (discount factor)
        # Default bonus is 1.0 (no discount)
        bonus = 1.0
        geom = data["geometry"]
        if fuentes_buffer.intersects(geom):
            bonus -= 0.05 # 5% discount for fountains
        if refugios_buffer.intersects(geom):
            bonus -= 0.10 # 10% discount for shelters
        data["resource_bonus"] = max(0.8, bonus) # Max 20% total discount

        # Siempre recalculamos el peso base de confort incorporando el bonus de recursos
        shade = float(data.get("shade_score", 0.0))
        shadow_factor = (1.0 - (shade * 0.8)) * data["resource_bonus"]
        data["comfort_weight"] = data["length"] * max(shadow_factor, 0.1)
    
    app_state.graph = graph
    
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
    preference: float = 1.0  # 0.0: Priorizar distancia, 1.0: Priorizar sombra

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
        pref = max(0.0, min(1.0, req.preference))

        def get_dynamic_weight(u, v, d):
            # En MultiDiGraph, d es un diccionario de aristas {key: attr_dict}
            weights = []
            for key, data in d.items():
                t_shade = float(data.get("shade_score", 0.0))
                b_shade = 0.0
                if app_state.shadow_dict and (u, v, key) in app_state.shadow_dict:
                    b_shade = float(app_state.shadow_dict[(u, v, key)].get(hour_col, 0.0))
                
                combined_shade = max(t_shade, b_shade)
                res_bonus = float(data.get("resource_bonus", 1.0))
                
                # El factor de sombra se escala por la preferencia del usuario
                # Aplicamos el bonus de recursos solo si la preferencia es > 0
                shadow_factor = (1.0 - (combined_shade * 0.8 * pref)) * (1.0 + (res_bonus - 1.0) * pref)
                edge_weight = float(data.get("length", 1.0)) * max(shadow_factor, 0.1)
                weights.append(edge_weight)
            
            return min(weights) if weights else 1.0e6

        shortest_route = nx.shortest_path(graph, origin_node, destination_node, weight="length")
        comfort_route = nx.shortest_path(graph, origin_node, destination_node, weight=get_dynamic_weight)

        if shortest_route is None or comfort_route is None:
            raise ValueError("No se ha podido calcular una ruta válida entre estos puntos.")

        shortest_length, shortest_t_shade, shortest_b_shade = route_metrics(graph, shortest_route, hour_col, app_state.shadow_dict, pref=0.0)
        comfort_length, comfort_t_shade, comfort_b_shade = route_metrics(graph, comfort_route, hour_col, app_state.shadow_dict, pref=pref)
        
        shortest_gdf = route_edges_gdf(graph, shortest_route, hour_col, app_state.shadow_dict, pref=0.0)
        comfort_gdf = route_edges_gdf(graph, comfort_route, hour_col, app_state.shadow_dict, pref=pref)

        shortest_fuentes_pts = get_points_near_route(fuentes_utm, shortest_gdf, buffer_m=75.0)
        comfort_fuentes_pts = get_points_near_route(fuentes_utm, comfort_gdf, buffer_m=75.0)
        shortest_refugios_pts = get_points_near_route(refugios_utm, shortest_gdf, buffer_m=200.0)
        comfort_refugios_pts = get_points_near_route(refugios_utm, comfort_gdf, buffer_m=200.0)

        # Calcular métricas humanas
        # Velocidad media de caminata: 1.4 m/s (5 km/h)
        WALKING_SPEED = 1.4
        
        # Sombra total ganada en metros
        shade_gain_m = (comfort_t_shade + comfort_b_shade) - (shortest_t_shade + shortest_b_shade)
        # Tiempo "ahorrado" bajo el sol directo (segundos)
        time_saved_sun_sec = shade_gain_m / WALKING_SPEED
        # Tiempo extra de caminata total (segundos)
        extra_effort_sec = (comfort_length - shortest_length) / WALKING_SPEED

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
                    "fuentes": len(shortest_fuentes_pts),
                    "fuentes_pts": shortest_fuentes_pts,
                    "refugios": len(shortest_refugios_pts),
                    "refugios_pts": shortest_refugios_pts
                },
                "comfort": {
                    "length": comfort_length,
                    "tree_shade": comfort_t_shade,
                    "building_shade": comfort_b_shade,
                    "fuentes": len(comfort_fuentes_pts),
                    "fuentes_pts": comfort_fuentes_pts,
                    "refugios": len(comfort_refugios_pts),
                    "refugios_pts": comfort_refugios_pts
                },
                "human": {
                    "sun_time_saved_min": round(max(0, time_saved_sun_sec / 60), 1),
                    "extra_effort_min": round(max(0, extra_effort_sec / 60), 1)
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
