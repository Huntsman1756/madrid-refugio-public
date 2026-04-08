from __future__ import annotations

import json
import logging
import os
import re
import socket
import time
from datetime import datetime
from pathlib import Path
from typing import List, Tuple

import geopandas as gpd
import networkx as nx
import osmnx as ox
import pandas as pd
import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from pyproj import Transformer
from shapely.geometry import LineString, Point

from build_madrid_search_index import (
    DEFAULT_META_OUTPUT_PATH,
    DEFAULT_MUNICIPAL_CSV_PATH,
    DEFAULT_OUTPUT_PATH,
    build_search_index_files,
    normalize_search_text,
)

try:
    from zoneinfo import ZoneInfo
except ImportError:
    from backports.zoneinfo import ZoneInfo


BASE_DIR = Path(__file__).resolve().parent
PROCESSED_DIR = Path(os.getenv("DATA_DIR", str(BASE_DIR / "data" / "processed")))
APP_PROCESSED_DIR = BASE_DIR / "data" / "processed"
GRAPH_PATH = PROCESSED_DIR / "madrid_shadow_graph.graphml"
GRAPH_RELEASE_MARKER_PATH = PROCESSED_DIR / ".graph_release_tag"
REFUGIOS_PATH = APP_PROCESSED_DIR / "refugios_sustitutos.geojson"
FUENTES_PATH = APP_PROCESSED_DIR / "fuentes.geojson"
SHADOW_MATRIX_PATH = PROCESSED_DIR / "shadow_matrix.parquet"
SEARCH_INDEX_PATH = PROCESSED_DIR / DEFAULT_OUTPUT_PATH.name
SEARCH_INDEX_META_PATH = PROCESSED_DIR / DEFAULT_META_OUTPUT_PATH.name
SEARCH_SOURCE_CSV_PATH = PROCESSED_DIR / DEFAULT_MUNICIPAL_CSV_PATH.name
GITHUB_REPO = "Huntsman1756/madrid-refugio"
RELEASE_TAG = "v1.4"
RELEASE_BASE_URL = f"https://github.com/{GITHUB_REPO}/releases/download/{RELEASE_TAG}"
GRAPH_RELEASE_URL = f"{RELEASE_BASE_URL}/madrid_shadow_graph.graphml"
SHADOW_MATRIX_RELEASE_URL = f"{RELEASE_BASE_URL}/shadow_matrix.parquet"

logger = logging.getLogger("madrid_refugio")
if not logger.handlers:
    logging.basicConfig(
        level=os.getenv("LOG_LEVEL", "INFO").upper(),
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )

GEOCODE_TIMEOUT_SECONDS = 8

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
    "moncloa, madrid": (40.43547, -3.71894),
    "moncloa, madrid, spain": (40.43547, -3.71894),
    "chamberí, madrid": (40.4362, -3.7032),
    "chamberí, madrid, spain": (40.4362, -3.7032),
}
MADRID_BBOX = {
    "lat_min": 40.31,
    "lat_max": 40.55,
    "lon_min": -3.83,
    "lon_max": -3.52,
}


class AppState:
    graph: nx.MultiDiGraph | None = None
    refugios_utm: gpd.GeoDataFrame | None = None
    fuentes_utm: gpd.GeoDataFrame | None = None
    shadow_dict: dict | None = None
    weather_cache: dict | None = None
    weather_last_update: float = 0
    search_index: list[dict] | None = None
    startup_errors: list[str] = []


if "app_state" not in globals():
    app_state = AppState()
if "runtime_lock" not in globals():
    runtime_lock = None

AEMET_API_KEY = os.getenv("AEMET_API_KEY")
MADRID_MUNICIPIO_ID = "28079"


class RoutingInputError(ValueError):
    def __init__(self, detail: str, error_code: str):
        super().__init__(detail)
        self.detail = detail
        self.error_code = error_code


class ResolvedLocation(BaseModel):
    label: str
    kind: str | None = None
    lat: float
    lon: float


class RouteRequest(BaseModel):
    origin: str | ResolvedLocation
    destination: str | ResolvedLocation
    hour: int
    preference: float = 1.0


def record_startup_error(message: str) -> None:
    if message not in app_state.startup_errors:
        app_state.startup_errors.append(message)


def error_response(detail: str, error_code: str, status_code: int) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"detail": detail, "error_code": error_code},
    )


def fetch_aemet_data():
    if not AEMET_API_KEY:
        return {
            "municipio": "Madrid",
            "temperatura": "N/D",
            "estado_cielo": "AEMET no disponible",
            "timestamp": "",
            "fuente": "AEMET (OpenData)",
            "error": "AEMET_API_KEY no configurada",
        }
    if app_state.weather_cache and (time.time() - app_state.weather_last_update < 900):
        return app_state.weather_cache
    try:
        url_meta = (
            "https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/"
            f"horaria/{MADRID_MUNICIPIO_ID}?api_key={AEMET_API_KEY}"
        )
        resp_meta = requests.get(url_meta, timeout=10)
        meta = resp_meta.json()
        if meta.get("estado") != 200:
            return {"error": f"AEMET Error: {meta.get('descripcion')}"}
        url_datos = meta.get("datos")
        resp_datos = requests.get(url_datos, timeout=10)
        datos = resp_datos.json()
        prediccion = datos[0]["prediccion"]["dia"][0]
        try:
            hora_madrid = datetime.now(ZoneInfo("Europe/Madrid")).hour
        except Exception:
            hora_madrid = (datetime.utcnow().hour + 2) % 24
        temp_list = prediccion.get("temperatura", [])
        if temp_list:
            best_t = min(
                temp_list, key=lambda h: abs(int(h.get("periodo", "0")) - hora_madrid)
            )
            temp_actual = best_t.get("value")
            forecast_hour = best_t.get("periodo")
        else:
            temp_actual = "N/A"
            forecast_hour = "--"
        cielo_list = prediccion.get("estadoCielo", [])
        cielo_desc = (
            min(
                cielo_list, key=lambda h: abs(int(h.get("periodo", "0")) - hora_madrid)
            ).get("descripcion")
            if cielo_list
            else "Despejado"
        )
        result = {
            "municipio": "Madrid",
            "temperatura": temp_actual,
            "estado_cielo": cielo_desc,
            "timestamp": f"{forecast_hour}:00",
            "fuente": "AEMET (OpenData)",
        }
        app_state.weather_cache = result
        app_state.weather_last_update = time.time()
        return result
    except Exception as e:
        return {"error": f"Error conectando con AEMET: {str(e)}"}


def get_allowed_origins() -> list[str]:
    origins = {
        "https://madrid-refugio.vercel.app",
        "http://localhost:3000",
    }
    for env_key in ("FRONTEND_ORIGIN", "ADDITIONAL_ALLOWED_ORIGINS"):
        raw = os.getenv(env_key, "")
        if not raw:
            continue
        for origin in raw.split(","):
            origin = origin.strip()
            if origin:
                origins.add(origin)
    return sorted(origins)


def resolve_release_asset_download(asset_name: str) -> tuple[str, dict]:
    github_token = os.getenv("GITHUB_TOKEN") or os.getenv("GH_TOKEN")
    if not github_token:
        if asset_name == "madrid_shadow_graph.graphml":
            return GRAPH_RELEASE_URL, {}
        if asset_name == "shadow_matrix.parquet":
            return SHADOW_MATRIX_RELEASE_URL, {}
        return f"{RELEASE_BASE_URL}/{asset_name}", {}

    api_headers = {
        "Authorization": f"Bearer {github_token}",
        "Accept": "application/vnd.github+json",
    }
    release_resp = requests.get(
        f"https://api.github.com/repos/{GITHUB_REPO}/releases/tags/{RELEASE_TAG}",
        headers=api_headers,
        timeout=30,
    )
    release_resp.raise_for_status()
    release_data = release_resp.json()

    for asset in release_data.get("assets", []):
        if asset.get("name") == asset_name:
            return asset["url"], {
                "Authorization": f"Bearer {github_token}",
                "Accept": "application/octet-stream",
            }

    raise RuntimeError(
        f"No se ha encontrado el asset '{asset_name}' en el release {RELEASE_TAG}."
    )


def should_refresh_release_asset(
    path: Path,
    min_size_bytes: int,
    force_refresh: bool = False,
    marker_path: Path | None = None,
    expected_tag: str | None = None,
) -> bool:
    if force_refresh or not path.exists() or path.stat().st_size < min_size_bytes:
        return True
    if marker_path and expected_tag:
        if not marker_path.exists():
            return True
        return marker_path.read_text(encoding="utf-8").strip() != expected_tag
    return False


def ensure_edge_geometry(graph: nx.MultiDiGraph) -> None:
    for u, v, key, data in graph.edges(keys=True, data=True):
        if "geometry" not in data or data["geometry"] is None:
            data["geometry"] = LineString(
                [
                    (graph.nodes[u]["x"], graph.nodes[u]["y"]),
                    (graph.nodes[v]["x"], graph.nodes[v]["y"]),
                ]
            )


def get_tree_shade_score(data: dict) -> float:
    if "tree_shade_score" in data:
        return float(data.get("tree_shade_score", 0.0) or 0.0)
    return float(data.get("shade_score", 0.0) or 0.0)


def route_edges_gdf(
    graph: nx.MultiDiGraph,
    route: list[int],
    hour_col: str | None = None,
    shadow_dict: dict | None = None,
    pref: float = 0.0,
) -> gpd.GeoDataFrame:
    rows = []
    for u, v in zip(route[:-1], route[1:]):
        edge_data_dict = graph.get_edge_data(u, v)
        if not edge_data_dict:
            continue
        best_key = None
        min_w = float("inf")
        for key, data in edge_data_dict.items():
            t_shade = get_tree_shade_score(data)
            b_shade = (
                float(shadow_dict[(u, v, key)].get(hour_col, 0.0))
                if shadow_dict and hour_col and (u, v, key) in shadow_dict
                else 0.0
            )
            combined_shade = max(t_shade, b_shade)
            res_bonus = float(data.get("resource_bonus", 1.0))
            weight = float(data.get("length", 1.0)) * max(
                (1.0 - (combined_shade * 0.8 * pref))
                * (1.0 + (res_bonus - 1.0) * pref),
                0.1,
            )
            if weight < min_w:
                min_w = weight
                best_key = key
        edge_data = edge_data_dict[best_key]
        geom = edge_data.get("geometry")
        if geom is None:
            geom = LineString(
                [
                    (graph.nodes[u]["x"], graph.nodes[u]["y"]),
                    (graph.nodes[v]["x"], graph.nodes[v]["y"]),
                ]
            )
        rows.append(
            {
                "u": u,
                "v": v,
                "key": best_key,
                "length": float(edge_data.get("length", 0.0)),
                "shade_score": get_tree_shade_score(edge_data),
                "geometry": geom,
            }
        )
    return gpd.GeoDataFrame(rows, geometry="geometry", crs="EPSG:25830")


def route_metrics(
    graph: nx.MultiDiGraph,
    route: list[int],
    hour_col: str | None = None,
    shadow_dict: dict | None = None,
    pref: float = 0.0,
) -> tuple[float, float, float]:
    total_length = 0.0
    total_t_shade = 0.0
    total_b_shade = 0.0
    for u, v in zip(route[:-1], route[1:]):
        edge_data_dict = graph.get_edge_data(u, v)
        if not edge_data_dict:
            continue
        best_key = None
        min_w = float("inf")
        for key, data in edge_data_dict.items():
            t_shade = get_tree_shade_score(data)
            b_shade = (
                float(shadow_dict[(u, v, key)].get(hour_col, 0.0))
                if shadow_dict and hour_col and (u, v, key) in shadow_dict
                else 0.0
            )
            combined_shade = max(t_shade, b_shade)
            res_bonus = float(data.get("resource_bonus", 1.0))
            weight = float(data.get("length", 1.0)) * max(
                (1.0 - (combined_shade * 0.8 * pref))
                * (1.0 + (res_bonus - 1.0) * pref),
                0.1,
            )
            if weight < min_w:
                min_w = weight
                best_key = key
        edge_data = edge_data_dict[best_key]
        edge_length = float(edge_data.get("length", 0.0))
        edge_t_shade = get_tree_shade_score(edge_data)
        edge_b_shade = (
            float(shadow_dict[(u, v, best_key)].get(hour_col, 0.0))
            if shadow_dict and hour_col and (u, v, best_key) in shadow_dict
            else 0.0
        )
        total_length += edge_length
        total_t_shade += edge_t_shade * edge_length
        total_b_shade += edge_b_shade * edge_length
    return total_length, total_t_shade, total_b_shade


def get_points_near_route(
    points: gpd.GeoDataFrame, route_gdf: gpd.GeoDataFrame, buffer_m: float
) -> List[Tuple[float, float]]:
    if route_gdf.empty:
        return []
    nearby = points[
        points.geometry.within(route_gdf.geometry.union_all().buffer(buffer_m))
    ]
    if nearby.empty:
        return []
    nearby_wgs84 = nearby.to_crs("EPSG:4326")
    return [(float(geom.y), float(geom.x)) for geom in nearby_wgs84.geometry]


def point_in_madrid(lat: float, lon: float) -> bool:
    return (
        MADRID_BBOX["lat_min"] <= lat <= MADRID_BBOX["lat_max"]
        and MADRID_BBOX["lon_min"] <= lon <= MADRID_BBOX["lon_max"]
    )


def normalize_address(address: str) -> str:
    return " ".join(address.strip().lower().split())


def slugify_search_label(value: str) -> str:
    return (
        value.strip()
        .lower()
        .replace("á", "a")
        .replace("é", "e")
        .replace("í", "i")
        .replace("ó", "o")
        .replace("ú", "u")
        .replace("ü", "u")
        .replace("ñ", "n")
    )


def search_kind_from_entry(kind: str) -> str:
    if kind == "address":
        return "address"
    if kind == "area":
        return "area"
    return "place"


def search_option_from_entry(entry: dict) -> dict:
    slug = re.sub(r"[^a-z0-9]+", "-", slugify_search_label(entry["label"]))
    slug = re.sub(r"^-+|-+$", "", slug)
    slug = re.sub(r"-+", "-", slug)
    payload = {
        "id": f"{slug}-{entry['lat']}-{entry['lon']}-{entry['kind']}",
        "label": entry["label"],
        "kind": search_kind_from_entry(entry["kind"]),
        "lat": entry["lat"],
        "lon": entry["lon"],
    }
    if entry.get("district"):
        payload["district"] = entry["district"]
    return payload


def filter_search_index(entries: list[dict], query: str, limit: int) -> list[dict]:
    normalized_query = normalize_search_text(query)
    if not normalized_query or limit <= 0:
        return []

    matches = []
    for entry in entries:
        haystack = entry.get("search_text") or normalize_search_text(entry["label"])
        if haystack.startswith(normalized_query):
            score = 0
        elif normalized_query in haystack:
            score = 1
        else:
            continue
        matches.append((score, normalize_search_text(entry["label"]), entry))

    matches.sort(key=lambda item: (item[0], item[1]))
    return [search_option_from_entry(entry) for _, _, entry in matches[:limit]]


def load_search_index(index_path: Path = DEFAULT_OUTPUT_PATH) -> list[dict]:
    if not index_path.exists():
        return []
    return json.loads(index_path.read_text(encoding="utf-8"))


def get_search_index_operational_error() -> str:
    return (
        "Search index prerequisites missing: "
        f"{SEARCH_SOURCE_CSV_PATH} must be prepared before startup or /api/suggest. "
        "Prebuild the Madrid search index during deployment preparation; runtime CSV downloads are disabled."
    )


def generate_search_index(
    csv_source: Path,
    output_path: Path = SEARCH_INDEX_PATH,
    meta_output_path: Path = SEARCH_INDEX_META_PATH,
) -> list[dict]:
    return build_search_index_files(
        csv_path=csv_source,
        output_path=output_path,
        meta_output_path=meta_output_path,
    )


def ensure_search_index() -> list[dict]:
    entries = load_search_index(SEARCH_INDEX_PATH)
    if entries:
        return entries

    if not SEARCH_SOURCE_CSV_PATH.exists():
        raise RuntimeError(get_search_index_operational_error())

    generated_entries = generate_search_index(
        SEARCH_SOURCE_CSV_PATH,
        output_path=SEARCH_INDEX_PATH,
        meta_output_path=SEARCH_INDEX_META_PATH,
    )
    return generated_entries or load_search_index(SEARCH_INDEX_PATH)


def geocode_address(address: str) -> tuple[float, float]:
    normalized = normalize_address(address)
    if normalized in _GEOCODING_CACHE:
        return _GEOCODING_CACHE[normalized]

    coord_match = re.match(r"^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$", normalized)
    if coord_match:
        lat, lon = float(coord_match.group(1)), float(coord_match.group(2))
        if not point_in_madrid(lat, lon):
            raise RoutingInputError(
                "La dirección está fuera de Madrid. Prueba con una dirección dentro del municipio.",
                "outside_madrid",
            )
        return lat, lon

    previous_timeout = socket.getdefaulttimeout()
    socket.setdefaulttimeout(GEOCODE_TIMEOUT_SECONDS)
    try:
        lat, lon = ox.geocode(address)
    except Exception as exc:
        raise RoutingInputError(
            "No hemos encontrado esa dirección. Prueba con una calle y número o elige una sugerencia.",
            "geocode_not_found",
        ) from exc
    finally:
        socket.setdefaulttimeout(previous_timeout)

    if not point_in_madrid(lat, lon):
        raise RoutingInputError(
            "La dirección está fuera de Madrid. Prueba con una dirección dentro del municipio.",
            "outside_madrid",
        )
    return lat, lon


def nearest_node(graph: nx.MultiDiGraph, lat: float, lon: float) -> int:
    point_graph = (
        gpd.GeoSeries([Point(lon, lat)], crs="EPSG:4326").to_crs("EPSG:25830").iloc[0]
    )
    if not (
        400_000 < point_graph.x < 500_000 and 4_400_000 < point_graph.y < 4_550_000
    ):
        raise RoutingInputError(
            "La dirección está fuera de la red peatonal activa. Usa una dirección dentro del corredor cargado.",
            "out_of_corridor",
        )
    node_id = ox.distance.nearest_nodes(graph, point_graph.x, point_graph.y)
    node_data = graph.nodes[node_id]
    if point_graph.distance(Point(float(node_data["x"]), float(node_data["y"]))) > 1000:
        raise RoutingInputError(
            "La dirección está fuera de la red peatonal activa. Usa una dirección dentro del corredor cargado.",
            "out_of_corridor",
        )
    return node_id


def extract_wgs84_coords(
    graph: nx.MultiDiGraph, route: list[int]
) -> List[Tuple[float, float]]:
    transformer = Transformer.from_crs("EPSG:25830", "EPSG:4326", always_xy=True)
    coords = []
    for node_id in route:
        nd = graph.nodes[node_id]
        lon_wgs, lat_wgs = transformer.transform(float(nd["x"]), float(nd["y"]))
        coords.append((lat_wgs, lon_wgs))
    return coords


def resolve_route_location(
    location: str | ResolvedLocation,
) -> tuple[tuple[float, float], str]:
    if isinstance(location, str):
        return geocode_address(location), location
    if not point_in_madrid(location.lat, location.lon):
        raise RoutingInputError(
            "La dirección está fuera de Madrid. Prueba con una dirección dentro del municipio.",
            "outside_madrid",
        )
    return (location.lat, location.lon), location.label


def load_runtime_assets(download_release_file) -> None:
    if (
        app_state.graph is not None
        and app_state.refugios_utm is not None
        and app_state.fuentes_utm is not None
        and app_state.shadow_dict is not None
    ):
        return

    try:
        download_release_file(
            GRAPH_PATH,
            "madrid_shadow_graph.graphml",
            force_refresh=os.getenv("FORCE_REFRESH_GRAPH_FROM_RELEASE") == "1",
            marker_path=GRAPH_RELEASE_MARKER_PATH,
            expected_tag=RELEASE_TAG,
        )
        download_release_file(SHADOW_MATRIX_PATH, "shadow_matrix.parquet")

        if not GRAPH_PATH.exists():
            record_startup_error(f"Grafo no disponible en {GRAPH_PATH}")
            return

        logger.info("loading graph into memory (%.1f MB)", GRAPH_PATH.stat().st_size / 1e6)
        t_start = time.time()
        graph = ox.load_graphml(GRAPH_PATH)
        logger.info("graph loaded in %.1f seconds", time.time() - t_start)

        ensure_edge_geometry(graph)
        refugios_utm = gpd.read_file(REFUGIOS_PATH).to_crs("EPSG:25830")
        fuentes_utm = gpd.read_file(FUENTES_PATH).to_crs("EPSG:25830")

        fuentes_buffer = fuentes_utm.geometry.union_all().buffer(50.0)
        refugios_buffer = refugios_utm.geometry.union_all().buffer(150.0)

        for u, v, key, data in graph.edges(keys=True, data=True):
            data["key"] = key
            data["length"] = float(data.get("length", 0.0) or 0.0)
            data["shade_score"] = get_tree_shade_score(data)
            bonus = 1.0
            geom = data["geometry"]
            if fuentes_buffer.intersects(geom):
                bonus -= 0.05
            if refugios_buffer.intersects(geom):
                bonus -= 0.10
            data["resource_bonus"] = max(0.8, bonus)
            data["comfort_weight"] = data["length"] * max(
                (1.0 - (data["shade_score"] * 0.8)) * data["resource_bonus"], 0.1
            )

        if SHADOW_MATRIX_PATH.exists():
            shadow_df = pd.read_parquet(SHADOW_MATRIX_PATH)
            shadow_dict = shadow_df.set_index(["u", "v", "key"]).to_dict("index")
        else:
            shadow_dict = {}

        app_state.graph = graph
        app_state.refugios_utm = refugios_utm
        app_state.fuentes_utm = fuentes_utm
        app_state.shadow_dict = shadow_dict
        logger.info(
            "backend started with %s nodes and %s edges",
            graph.number_of_nodes(),
            graph.number_of_edges(),
        )
    except Exception as exc:
        logger.exception("runtime initialization failed")
        record_startup_error(f"Error cargando el runtime: {exc}")


app = FastAPI(title="Madrid Refugio API")


@app.get("/api/weather")
def get_weather():
    return fetch_aemet_data()


app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {
        "status": "ok" if not app_state.startup_errors else "degraded",
        "graph_loaded": app_state.graph is not None,
        "shadow_matrix_loaded": app_state.shadow_dict is not None,
        "weather_configured": bool(AEMET_API_KEY),
        "release_tag": RELEASE_TAG,
        "startup_errors": app_state.startup_errors,
    }


@app.get("/api/health")
def api_health_check():
    return health_check()


@app.get("/api/suggest")
def suggest(q: str = "", limit: int = 8):
    if app_state.search_index is None:
        try:
            app_state.search_index = ensure_search_index()
        except RuntimeError as exc:
            return JSONResponse(status_code=503, content={"detail": str(exc)})
    return filter_search_index(app_state.search_index, q, limit)


@app.on_event("startup")
def startup_event():
    logger.info("starting backend")
    logger.info("processed data directory: %s", PROCESSED_DIR)
    app_state.startup_errors = []

    if app_state.search_index is None:
        try:
            app_state.search_index = ensure_search_index()
        except RuntimeError as exc:
            record_startup_error(str(exc))

    def download_release_file(
        path: Path,
        asset_name: str,
        force_refresh: bool = False,
        marker_path: Path | None = None,
        expected_tag: str | None = None,
    ) -> None:
        refresh_needed = should_refresh_release_asset(
            path,
            min_size_bytes=1_000_000,
            force_refresh=force_refresh,
            marker_path=marker_path,
            expected_tag=expected_tag,
        )
        if not refresh_needed:
            logger.info(
                "%s loaded from local volume (%.1f MB)",
                path.name,
                path.stat().st_size / 1e6,
            )
            return

        path.parent.mkdir(parents=True, exist_ok=True)
        download_url, headers = resolve_release_asset_download(asset_name)
        logger.info("downloading release asset %s", asset_name)
        with requests.get(download_url, headers=headers, stream=True, timeout=300) as r:
            r.raise_for_status()
            with open(path, "wb") as f:
                for chunk in r.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)

        if marker_path and expected_tag:
            marker_path.write_text(expected_tag, encoding="utf-8")
        logger.info("%s ready (%.1f MB)", path.name, path.stat().st_size / 1e6)

    load_runtime_assets(download_release_file)


@app.post("/api/route")
def calculate_route(req: RouteRequest):
    graph = app_state.graph
    refugios_utm = app_state.refugios_utm
    fuentes_utm = app_state.fuentes_utm
    if graph is None or refugios_utm is None or fuentes_utm is None:
        return error_response("backend_unavailable", "backend_unavailable", 503)

    try:
        origin_latlon, origin_label = resolve_route_location(req.origin)
        destination_latlon, destination_label = resolve_route_location(req.destination)
        origin_node = nearest_node(graph, *origin_latlon)
        destination_node = nearest_node(graph, *destination_latlon)
        hour_val = max(8, min(20, req.hour))
        hour_col = f"h{hour_val:02d}"
        pref = max(0.0, min(1.0, req.preference))

        def get_dynamic_weight(u, v, d):
            weights = []
            for key, data in d.items():
                t_shade = get_tree_shade_score(data)
                b_shade = (
                    float(app_state.shadow_dict[(u, v, key)].get(hour_col, 0.0))
                    if app_state.shadow_dict and (u, v, key) in app_state.shadow_dict
                    else 0.0
                )
                combined_shade = max(t_shade, b_shade)
                res_bonus = float(data.get("resource_bonus", 1.0))
                shadow_factor = (1.0 - (combined_shade * 0.8 * pref)) * (
                    1.0 + (res_bonus - 1.0) * pref
                )
                weights.append(float(data.get("length", 1.0)) * max(shadow_factor, 0.1))
            return min(weights) if weights else 1.0e6

        shortest_route = nx.shortest_path(
            graph, origin_node, destination_node, weight="length"
        )
        comfort_route = nx.shortest_path(
            graph, origin_node, destination_node, weight=get_dynamic_weight
        )

        shortest_length, shortest_t_shade, shortest_b_shade = route_metrics(
            graph, shortest_route, hour_col, app_state.shadow_dict, pref=0.0
        )
        comfort_length, comfort_t_shade, comfort_b_shade = route_metrics(
            graph, comfort_route, hour_col, app_state.shadow_dict, pref=pref
        )
        shortest_gdf = route_edges_gdf(
            graph, shortest_route, hour_col, app_state.shadow_dict, pref=0.0
        )
        comfort_gdf = route_edges_gdf(
            graph, comfort_route, hour_col, app_state.shadow_dict, pref=pref
        )
        shortest_fuentes_pts = get_points_near_route(
            fuentes_utm, shortest_gdf, buffer_m=75.0
        )
        comfort_fuentes_pts = get_points_near_route(
            fuentes_utm, comfort_gdf, buffer_m=75.0
        )
        shortest_refugios_pts = get_points_near_route(
            refugios_utm, shortest_gdf, buffer_m=200.0
        )
        comfort_refugios_pts = get_points_near_route(
            refugios_utm, comfort_gdf, buffer_m=200.0
        )

        walking_speed = 1.4
        shade_gain_m = (comfort_t_shade + comfort_b_shade) - (
            shortest_t_shade + shortest_b_shade
        )
        return {
            "origin_label": origin_label,
            "destination_label": destination_label,
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
                    "refugios_pts": shortest_refugios_pts,
                },
                "comfort": {
                    "length": comfort_length,
                    "tree_shade": comfort_t_shade,
                    "building_shade": comfort_b_shade,
                    "fuentes": len(comfort_fuentes_pts),
                    "fuentes_pts": comfort_fuentes_pts,
                    "refugios": len(comfort_refugios_pts),
                    "refugios_pts": comfort_refugios_pts,
                },
                "human": {
                    "sun_time_saved_min": round(
                        max(0, shade_gain_m / walking_speed / 60), 1
                    ),
                    "extra_effort_min": round(
                        max(0, (comfort_length - shortest_length) / walking_speed / 60),
                        1,
                    ),
                },
            },
        }
    except RoutingInputError as exc:
        return error_response(exc.detail, exc.error_code, 400)
    except nx.NodeNotFound:
        return error_response(
            "El origen o destino queda fuera de la red peatonal activa.",
            "out_of_corridor",
            400,
        )
    except nx.NetworkXNoPath:
        return error_response(
            "No existe un camino peatonal válido dentro de la red peatonal activa.",
            "out_of_corridor",
            400,
        )
    except ValueError as exc:
        return error_response(str(exc), "invalid_request", 400)
    except Exception as exc:
        return error_response(f"Error interno: {str(exc)}", "internal_error", 500)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
