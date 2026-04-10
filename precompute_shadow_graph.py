"""
Precompute Shadow Graph - Madrid Refugio
=======================================
Construye un grafo peatonal conectado a partir del poligono disuelto de
los distritos solicitados, calcula la matriz de sombras por lotes
territoriales y guarda los artefactos listos para produccion.
"""

import sys

sys.stdout.reconfigure(encoding="utf-8")

import argparse
import json
import os
import time
import warnings
from datetime import datetime
from pathlib import Path

import geopandas as gpd
import networkx as nx
import numpy as np
import osmnx as ox
import pandas as pd
from shapely.geometry import LineString, box
from shapely.ops import unary_union

from importlib.machinery import SourceFileLoader

generate_shadows = SourceFileLoader("shadow_engine", "06b_shadow_engine.py").load_module().generate_shadows
tree_integrator = SourceFileLoader("tree_integrator", "06e_integrate_trees.py").load_module()

warnings.filterwarnings("ignore", category=FutureWarning)

DISTRITOS = [
    "Arganzuela, Madrid, Spain",
    "Barajas, Madrid, Spain",
    "Carabanchel, Madrid, Spain",
    "Centro, Madrid, Spain",
    "Chamartin, Madrid, Spain",
    "Chamberi, Madrid, Spain",
    "Ciudad Lineal, Madrid, Spain",
    "Fuencarral-El Pardo, Madrid, Spain",
    "Hortaleza, Madrid, Spain",
    "Latina, Madrid, Spain",
    "Moncloa-Aravaca, Madrid, Spain",
    "Moratalaz, Madrid, Spain",
    "Puente de Vallecas, Madrid, Spain",
    "Retiro, Madrid, Spain",
    "Salamanca, Madrid, Spain",
    "San Blas-Canillejas, Madrid, Spain",
    "Tetuan, Madrid, Spain",
    "Usera, Madrid, Spain",
    "Vicalvaro, Madrid, Spain",
    "Villa de Vallecas, Madrid, Spain",
    "Villaverde, Madrid, Spain",
]

REFERENCE_DATE = datetime(2025, 7, 15)
HOURS = list(range(8, 21))

BASE_DIR = Path(__file__).resolve().parent
PROCESSED_DIR = BASE_DIR / "data" / "processed"
EDIFICIOS_PATH = PROCESSED_DIR / "edificios_alturas.geojson"
OUTPUT_GRAPH = PROCESSED_DIR / "madrid_shadow_graph.graphml"
OUTPUT_MATRIX = PROCESSED_DIR / "shadow_matrix.parquet"
OUTPUT_SUMMARY = PROCESSED_DIR / "shadow_summary.json"
TREES_PATH = Path(os.getenv("TREES_PATH", BASE_DIR / "data" / "raw" / "arbolado_detalle.xlsx"))
DISTRICTS_GEOJSON_PATH = BASE_DIR / "frontend" / "public" / "data" / "barrios_merged.geojson"


def normalize_district_name(raw_name: str) -> str:
    replacements = str.maketrans(
        {
            "á": "a",
            "é": "e",
            "í": "i",
            "ó": "o",
            "ú": "u",
            "Á": "a",
            "É": "e",
            "Í": "i",
            "Ó": "o",
            "Ú": "u",
        }
    )
    normalized = raw_name.translate(replacements).lower()
    normalized = normalized.replace(", madrid, spain", "")
    normalized = normalized.replace(", madrid", "")
    normalized = normalized.replace("-", " ")
    normalized = " ".join(normalized.split())
    return normalized


def load_district_shapes(districts_path: Path = DISTRICTS_GEOJSON_PATH) -> gpd.GeoDataFrame:
    district_shapes = gpd.read_file(districts_path)[["NOMDIS", "geometry"]].copy()
    district_shapes["district_lookup"] = district_shapes["NOMDIS"].map(normalize_district_name)
    return district_shapes


def get_area_polygon(distritos_list, districts_path: Path = DISTRICTS_GEOJSON_PATH):
    if not districts_path.exists():
        raise FileNotFoundError(f"No existe GeoJSON de distritos: {districts_path}")

    district_shapes = load_district_shapes(districts_path)
    requested = {normalize_district_name(name) for name in distritos_list}
    selected = district_shapes[district_shapes["district_lookup"].isin(requested)].copy()

    if selected.empty:
        raise RuntimeError("No se encontraron poligonos locales para los distritos solicitados.")

    return selected.to_crs("EPSG:4326").geometry.union_all()


def get_processing_areas(distritos_list, districts_path: Path = DISTRICTS_GEOJSON_PATH) -> gpd.GeoDataFrame:
    district_shapes = load_district_shapes(districts_path).to_crs("EPSG:25830")
    requested = {normalize_district_name(name) for name in distritos_list}
    selected = district_shapes[district_shapes["district_lookup"].isin(requested)].copy()

    if selected.empty:
        raise RuntimeError("No se encontraron areas de procesamiento para los distritos solicitados.")

    return selected.sort_values("NOMDIS").reset_index(drop=True)


def ensure_edge_geometry(graph: nx.MultiDiGraph) -> None:
    for u, v, key, data in graph.edges(keys=True, data=True):
        if "geometry" not in data or data["geometry"] is None:
            data["geometry"] = LineString(
                [(graph.nodes[u]["x"], graph.nodes[u]["y"]), (graph.nodes[v]["x"], graph.nodes[v]["y"])]
            )


def download_graph_for_area(distritos_list, retain_all: bool = False) -> nx.MultiDiGraph:
    print(f"\n{'=' * 60}")
    print(f"PASO 1: Descargando grafo peatonal para {len(distritos_list)} distritos")
    print(f"{'=' * 60}")

    area_polygon = get_area_polygon(distritos_list)
    print("  -> Usando un unico poligono disuelto para garantizar conectividad inter-distrito")
    graph = ox.graph_from_polygon(area_polygon, network_type="walk", simplify=True, retain_all=retain_all)
    print(f"  OK: {len(graph.nodes)} nodos, {len(graph.edges)} aristas")
    return graph


def get_district_polygon(distrito: str):
    try:
        polygon = get_area_polygon([distrito])
    except Exception:
        return None
    print(f"    -> Usando fallback local por poligono para {distrito}")
    return polygon


def prepare_buildings(buildings: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
    from shapely.validation import make_valid

    multi_mask = buildings.geometry.geom_type == "MultiPolygon"
    if multi_mask.any():
        print(f"  Explotando {multi_mask.sum()} MultiPolygons...")
        buildings = buildings.explode(index_parts=False).reset_index(drop=True)

    buildings = buildings[buildings.geometry.geom_type == "Polygon"].copy()
    buildings["geometry"] = buildings.geometry.apply(lambda g: make_valid(g) if g is not None else g)
    buildings["geometry"] = buildings.geometry.buffer(0)
    buildings = buildings[buildings.geometry.is_valid & (buildings.geometry.area > 0)]
    buildings = buildings[buildings.geometry.geom_type == "Polygon"].copy()
    buildings["geometry"] = buildings.geometry.simplify(1.0)
    return buildings


def calculate_shadow_fractions(shadows: gpd.GeoDataFrame, graph: nx.MultiDiGraph) -> dict:
    shadow_fractions = {}

    if shadows.empty:
        for u, v, key in graph.edges(keys=True):
            shadow_fractions[(u, v, key)] = 0.0
        return shadow_fractions

    valid_shadows = shadows.geometry.buffer(0)
    shadow_union = unary_union(valid_shadows)

    total_edges = len(graph.edges)
    for i, (u, v, key, data) in enumerate(graph.edges(keys=True, data=True)):
        if i % 2000 == 0 and i > 0:
            print(f"    Intersectando arista {i}/{total_edges}...")

        if "geometry" in data:
            geom = data["geometry"]
        else:
            geom = LineString([(graph.nodes[u]["x"], graph.nodes[u]["y"]), (graph.nodes[v]["x"], graph.nodes[v]["y"])])

        geom_length = geom.length
        if geom_length == 0:
            shadow_fractions[(u, v, key)] = 0.0
            continue

        try:
            intersection = geom.intersection(shadow_union)
            shadow_fraction = max(0.0, min(1.0, intersection.length / geom_length))
        except Exception:
            shadow_fraction = 0.0

        shadow_fractions[(u, v, key)] = shadow_fraction

    return shadow_fractions


def calculate_shadow_matrix_by_batches(
    graph_proj: nx.MultiDiGraph,
    processing_areas: gpd.GeoDataFrame,
    buildings_all: gpd.GeoDataFrame,
) -> dict:
    print(f"\n{'=' * 60}")
    print("PASO 3: Calculando matriz de sombras por lotes territoriales")
    print(f"{'=' * 60}")

    _, edges_df = ox.graph_to_gdfs(graph_proj)
    matrix_data = {(u, v, key): {f"h{h:02d}": 0.0 for h in HOURS} for u, v, key in graph_proj.edges(keys=True)}
    processed_edge_keys = set()

    for _, area in processing_areas.iterrows():
        area_name = area["NOMDIS"]
        area_buffer = area.geometry.buffer(200)
        area_edges = edges_df[edges_df.geometry.intersects(area_buffer)]
        area_buildings = buildings_all[buildings_all.geometry.intersects(area_buffer)].copy()

        if area_edges.empty or area_buildings.empty:
            print(f"\n  -> {area_name}: lote vacio, se omite")
            continue

        edge_keys = list(area_edges.index)
        edge_graph = graph_proj.edge_subgraph(edge_keys).copy()
        print(f"\n  {'=' * 16} {area_name} {'=' * 16}")
        print(f"  Aristas del lote: {len(edge_keys)} | Edificios del lote: {len(area_buildings)}")

        for h in HOURS:
            dt = datetime(REFERENCE_DATE.year, REFERENCE_DATE.month, REFERENCE_DATE.day, h, 0)
            print(f"\n  === Hora {h:02d}:00 ({area_name}) ===")

            t_h = time.time()
            shadows = generate_shadows(area_buildings, dt)
            t_shadow = time.time() - t_h
            print(f"  Sombras generadas: {len(shadows)} poligonos ({t_shadow:.1f}s)")

            t_h = time.time()
            fractions = calculate_shadow_fractions(shadows, edge_graph)
            t_frac = time.time() - t_h
            print(f"  Intersecciones calculadas ({t_frac:.1f}s)")

            avg_shadow = np.mean(list(fractions.values())) if fractions else 0.0
            print(f"  Sombra media: {avg_shadow:.1%}")

            for edge_tuple, frac in fractions.items():
                matrix_data[edge_tuple][f"h{h:02d}"] = frac

        processed_edge_keys.update(edge_keys)

    print(f"\n  OK: aristas procesadas en lotes {len(processed_edge_keys)} / {len(matrix_data)}")
    return matrix_data


def main(distritos_list=None, merge=False, trees_path: str | Path | None = None):
    if merge:
        raise ValueError("El modo --merge ya no es compatible con el grafo conectado de ciudad. Ejecuta el precompute completo desde cero.")

    if distritos_list is None:
        distritos_list = DISTRITOS

    t0 = time.time()
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    graph = download_graph_for_area(distritos_list)

    print("\n  Proyectando a EPSG:25830...")
    graph_proj = ox.project_graph(graph, to_crs="EPSG:25830")
    ensure_edge_geometry(graph_proj)

    num_nodes = len(graph_proj.nodes)
    num_edges = len(graph_proj.edges)
    print(f"  OK: grafo proyectado con {num_nodes} nodos y {num_edges} aristas")

    print(f"\n{'=' * 60}")
    print("PASO 2: Cargando edificios del area de interes")
    print(f"{'=' * 60}")

    _, edges_df = ox.graph_to_gdfs(graph_proj)
    minx, miny, maxx, maxy = edges_df.total_bounds
    bbox_geom = box(minx - 200, miny - 200, maxx + 200, maxy + 200)
    print(f"  Bbox del grafo: ({minx:.0f}, {miny:.0f}) -> ({maxx:.0f}, {maxy:.0f})")
    print("  Cargando edificios una sola vez para el area completa...")

    buildings_all = gpd.read_file(EDIFICIOS_PATH, bbox=bbox_geom)
    if len(buildings_all) == 0:
        raise RuntimeError("No se encontraron edificios en el bbox del grafo.")
    buildings_all = prepare_buildings(buildings_all)
    print(f"  OK: {len(buildings_all)} edificios listos para sombras")

    processing_areas = get_processing_areas(distritos_list)
    matrix_data = calculate_shadow_matrix_by_batches(graph_proj, processing_areas, buildings_all)

    print(f"\n{'=' * 60}")
    print("PASO 4: Integrando arbolado viario")
    print(f"{'=' * 60}")

    resolved_trees_path = Path(trees_path) if trees_path else TREES_PATH
    trees_gdf = tree_integrator.load_arbolado_fast(resolved_trees_path)
    tree_stats = tree_integrator.annotate_tree_shade(graph_proj, trees_gdf)
    print(
        "  OK: "
        f"{tree_stats['edges_with_tree_shade']} aristas con sombra de arbolado, "
        f"{tree_stats['trees_in_area']} arboles en el area"
    )

    print(f"\n{'=' * 60}")
    print("PASO 5: Guardando resultados")
    print(f"{'=' * 60}")

    print(f"  Guardando grafo -> {OUTPUT_GRAPH}")
    ox.save_graphml(graph_proj, OUTPUT_GRAPH)
    graph_size_mb = OUTPUT_GRAPH.stat().st_size / (1024 * 1024)
    print(f"  OK: grafo guardado ({graph_size_mb:.1f} MB)")

    print("  Procesando matriz de sombras...")
    records = []
    for (u, v, key), hour_data in matrix_data.items():
        row = {"u": u, "v": v, "key": key}
        row.update(hour_data)
        records.append(row)
    df = pd.DataFrame(records)

    print(f"  Guardando matriz -> {OUTPUT_MATRIX}")
    df.to_parquet(OUTPUT_MATRIX, engine="pyarrow")
    matrix_size_mb = OUTPUT_MATRIX.stat().st_size / (1024 * 1024)
    print(f"  OK: matriz guardada ({matrix_size_mb:.1f} MB)")

    summary = {
        "reference_date": "2025-07-15",
        "distritos": sorted(distritos_list),
        "hours": [f"h{h:02d}" for h in HOURS],
        "num_nodes": num_nodes,
        "num_edges": num_edges,
        "total_edges": num_edges,
        "num_buildings_used": len(buildings_all),
        "num_trees_used": tree_stats["trees_in_area"],
        "edges_with_tree_shade": tree_stats["edges_with_tree_shade"],
        "tree_influence_radius_m": tree_stats["influence_radius_m"],
        "graph_file_mb": round(graph_size_mb, 1),
        "matrix_file_mb": round(matrix_size_mb, 1),
        "processing_time_minutes": round((time.time() - t0) / 60, 1),
    }
    with open(OUTPUT_SUMMARY, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    elapsed = time.time() - t0
    print(f"\n{'=' * 60}")
    print(f"COMPLETADO en {elapsed / 60:.1f} minutos")
    print(f"  Grafo:  {OUTPUT_GRAPH} ({graph_size_mb:.1f} MB)")
    print(f"  Matriz: {OUTPUT_MATRIX} ({matrix_size_mb:.1f} MB)")
    print(f"  Nodos:  {num_nodes}, Aristas: {num_edges}")
    print(f"  Edificios usados: {len(buildings_all)}")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Precomputar matriz de sombras de Madrid Refugio.")
    parser.add_argument(
        "--distrito",
        type=str,
        help="Distrito especifico a procesar. Si se omite, se usa Madrid completo.",
    )
    parser.add_argument(
        "--merge",
        action="store_true",
        help="Compatibilidad legacy. El modo merge ya no se usa con el grafo conectado.",
    )
    parser.add_argument(
        "--trees-path",
        type=str,
        help="Ruta al dataset de arbolado_detalle.xlsx. Si se omite, usa TREES_PATH o data/raw/arbolado_detalle.xlsx.",
    )
    args = parser.parse_args()

    if args.distrito:
        distrito = args.distrito.strip()
        if ", madrid" not in distrito.lower():
            distrito = f"{distrito}, Madrid, Spain"
        main(distritos_list=[distrito], merge=args.merge, trees_path=args.trees_path)
    else:
        main(merge=args.merge, trees_path=args.trees_path)
