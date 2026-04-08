"""
Precompute Shadow Graph — Madrid Refugio
=========================================
Genera un grafo peatonal ampliado para múltiples distritos de Madrid,
calcula la matriz de sombras de edificios para 13 franjas horarias,
y guarda todo listo para producción.

Uso:
    python precompute_shadow_graph.py

Tiempo estimado: 1-2 horas para 4 distritos.
"""

import argparse
import json
import time
import warnings
from datetime import datetime
from pathlib import Path

import geopandas as gpd
import networkx as nx
import numpy as np
import osmnx as ox
import pandas as pd
from shapely.geometry import box, LineString, Point
from shapely.ops import unary_union

# Reutilizar el motor de sombras existente
from importlib.machinery import SourceFileLoader
generate_shadows = SourceFileLoader("shadow_engine", "06b_shadow_engine.py").load_module().generate_shadows

warnings.filterwarnings("ignore", category=FutureWarning)

# ─── CONFIGURACIÓN ─────────────────────────────────────────
DISTRITOS = [
    "Tetuán, Madrid, Spain",
    "Chamberí, Madrid, Spain",
    "Fuencarral-El Pardo, Madrid, Spain",
]

# Fecha de referencia: pico de ola de calor
REFERENCE_DATE = datetime(2025, 7, 15)
HOURS = list(range(8, 21))  # 08:00 a 20:00

# Paths
BASE_DIR = Path(__file__).resolve().parent
PROCESSED_DIR = BASE_DIR / "data" / "processed"
EDIFICIOS_PATH = PROCESSED_DIR / "edificios_alturas.geojson"
OUTPUT_GRAPH = PROCESSED_DIR / "madrid_shadow_graph.graphml"
OUTPUT_MATRIX = PROCESSED_DIR / "shadow_matrix.parquet"
OUTPUT_SUMMARY = PROCESSED_DIR / "shadow_summary.json"

TREE_BUFFER_METERS = 15
ESTIMATED_CROWN_DIAMETER_M = 6.0


def ensure_edge_geometry(graph: nx.MultiDiGraph) -> None:
    """Ensure every edge has a geometry attribute."""
    for u, v, key, data in graph.edges(keys=True, data=True):
        if "geometry" not in data or data["geometry"] is None:
            data["geometry"] = LineString(
                [(graph.nodes[u]["x"], graph.nodes[u]["y"]),
                 (graph.nodes[v]["x"], graph.nodes[v]["y"])]
            )


def download_multi_district_graph(distritos_list) -> nx.MultiDiGraph:
    """Download a walk graph covering multiple districts and merge them."""
    print(f"\n{'='*60}")
    print(f"PASO 1: Descargando grafo peatonal para {len(distritos_list)} distritos")
    print(f"{'='*60}")
    
    graphs = []
    for distrito in distritos_list:
        print(f"  → Descargando: {distrito}...")
        try:
            g = ox.graph_from_place(distrito, network_type="walk", simplify=True)
            graphs.append(g)
            print(f"    ✓ {len(g.nodes)} nodos, {len(g.edges)} aristas")
        except Exception as e:
            print(f"    ✗ Error: {e}")
    
    if not graphs:
        raise RuntimeError("No se pudo descargar ningún grafo.")
    
    # Merge all graphs
    print(f"\n  Fusionando {len(graphs)} grafos...")
    merged = graphs[0]
    for g in graphs[1:]:
        merged = nx.compose(merged, g)
    
    print(f"  ✓ Grafo fusionado: {len(merged.nodes)} nodos, {len(merged.edges)} aristas")
    return merged


def calculate_shadow_fractions(shadows: gpd.GeoDataFrame, graph: nx.MultiDiGraph) -> dict:
    """Calculate what fraction of each edge is in shadow."""
    shadow_fractions = {}
    
    if shadows.empty:
        for u, v, key in graph.edges(keys=True):
            shadow_fractions[(u, v, key)] = 0.0
        return shadow_fractions

    # Union all shadow polygons
    valid_shadows = shadows.geometry.buffer(0)
    shadow_union = unary_union(valid_shadows)
    
    total_edges = len(graph.edges)
    for i, (u, v, key, data) in enumerate(graph.edges(keys=True, data=True)):
        if i % 2000 == 0 and i > 0:
            print(f"    Intersectando arista {i}/{total_edges}...")
        
        if "geometry" in data:
            geom = data["geometry"]
        else:
            point_u = (graph.nodes[u]['x'], graph.nodes[u]['y'])
            point_v = (graph.nodes[v]['x'], graph.nodes[v]['y'])
            geom = LineString([point_u, point_v])
            
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


def main(distritos_list=None, merge=False):
    if distritos_list is None:
        distritos_list = DISTRITOS
        
    t0 = time.time()
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    
    # ─── PASO 1: Descargar grafo ───
    merged_graph = download_multi_district_graph(distritos_list)
    
    # Project to EPSG:25830 (Madrid UTM)
    print("\n  Proyectando a EPSG:25830...")
    graph_proj = ox.project_graph(merged_graph, to_crs="EPSG:25830")
    ensure_edge_geometry(graph_proj)
    
    num_nodes = len(graph_proj.nodes)
    num_edges = len(graph_proj.edges)
    print(f"  ✓ Grafo proyectado: {num_nodes} nodos, {num_edges} aristas")
    
    # ─── PASO 2: Cargar edificios ───
    print(f"\n{'='*60}")
    print("PASO 2: Cargando edificios del área de interés")
    print(f"{'='*60}")
    
    nodes_df, edges_df = ox.graph_to_gdfs(graph_proj)
    minx, miny, maxx, maxy = edges_df.total_bounds
    
    # Buffer 200m around graph bbox
    bbox_geom = box(minx - 200, miny - 200, maxx + 200, maxy + 200)
    
    print(f"  Bbox del grafo: ({minx:.0f}, {miny:.0f}) → ({maxx:.0f}, {maxy:.0f})")
    print(f"  Cargando edificios (esto puede tardar ~1 min)...")
    
    edificios = gpd.read_file(EDIFICIOS_PATH, bbox=bbox_geom)
    
    if len(edificios) == 0:
        raise RuntimeError("No se encontraron edificios en el bbox del grafo.")
    
    # Explode MultiPolygons into Polygons (pybdshadow requires simple Polygons)
    from shapely.geometry import MultiPolygon, Polygon
    multi_mask = edificios.geometry.geom_type == "MultiPolygon"
    if multi_mask.any():
        print(f"  Explotando {multi_mask.sum()} MultiPolygons...")
        edificios = edificios.explode(index_parts=False).reset_index(drop=True)
    
    # Keep only valid Polygons with area > 0
    edificios = edificios[edificios.geometry.geom_type == "Polygon"].copy()
    
    # Fix invalid geometries (unclosed rings, self-intersections)
    from shapely.validation import make_valid
    edificios["geometry"] = edificios.geometry.apply(lambda g: make_valid(g) if g is not None else g)
    edificios["geometry"] = edificios.geometry.buffer(0)
    edificios = edificios[edificios.geometry.is_valid & (edificios.geometry.area > 0)]
    # Re-filter after make_valid may produce MultiPolygons
    edificios = edificios[edificios.geometry.geom_type == "Polygon"].copy()
    
    # Simplify geometries for speed
    edificios["geometry"] = edificios.geometry.simplify(1.0)
    print(f"  OK: {len(edificios)} edificios (Polygon simples) listos para sombras")
    
    # ─── PASO 3: Calcular matriz de sombras ───
    print(f"\n{'='*60}")
    print("PASO 3: Calculando matriz de sombras (13 franjas horarias)")
    print(f"{'='*60}")
    
    matrix_data = {(u, v, key): {} for u, v, key in graph_proj.edges(keys=True)}
    
    for h in HOURS:
        dt = datetime(REFERENCE_DATE.year, REFERENCE_DATE.month, REFERENCE_DATE.day, h, 0)
        print(f"\n  ═══ Hora {h:02d}:00 ═══")
        
        t_h = time.time()
        shadows = generate_shadows(edificios, dt)
        t_shadow = time.time() - t_h
        print(f"  Sombras generadas: {len(shadows)} polígonos ({t_shadow:.1f}s)")
        
        t_h = time.time()
        fractions = calculate_shadow_fractions(shadows, graph_proj)
        t_frac = time.time() - t_h
        print(f"  Intersecciones calculadas ({t_frac:.1f}s)")
        
        avg_shadow = np.mean(list(fractions.values()))
        print(f"  Sombra media: {avg_shadow:.1%}")
        
        for edge_tuple, frac in fractions.items():
            matrix_data[edge_tuple][f"h{h:02d}"] = frac
    
    # ─── PASO 4: Guardar resultados ───
    print(f"\n{'='*60}")
    print("PASO 4: Guardando resultados")
    print(f"{'='*60}")
    
    # 4.1 Merge Graph if required
    if merge and OUTPUT_GRAPH.exists():
        print("  [Merge] Cargando grafo existente para fusionar...")
        g_existing = ox.load_graphml(OUTPUT_GRAPH)
        graph_proj = nx.compose(g_existing, graph_proj)
        num_nodes = len(graph_proj.nodes)
        num_edges = len(graph_proj.edges)
        print(f"  [Merge] ✓ Grafo fusionado: {num_nodes} nodos, {num_edges} aristas")

    print(f"  Guardando grafo → {OUTPUT_GRAPH}")
    ox.save_graphml(graph_proj, OUTPUT_GRAPH)
    graph_size_mb = OUTPUT_GRAPH.stat().st_size / (1024 * 1024)
    print(f"  ✓ Grafo guardado: {graph_size_mb:.1f} MB")
    
    # 4.2 Merge Matrix
    print(f"  Procesando matriz de sombras...")
    records = []
    for (u, v, key), hour_data in matrix_data.items():
        row = {'u': u, 'v': v, 'key': key}
        row.update(hour_data)
        records.append(row)
    
    df = pd.DataFrame(records)
    
    if merge and OUTPUT_MATRIX.exists():
        print("  [Merge] Combinando matriz de sombras existente...")
        df_existing = pd.read_parquet(OUTPUT_MATRIX)
        df = pd.concat([df_existing, df])
        df = df.drop_duplicates(subset=['u', 'v', 'key'], keep='last').reset_index(drop=True)
        print(f"  [Merge] ✓ Matriz fusionada: {len(df)} registros totales")
        
    print(f"  Guardando matriz → {OUTPUT_MATRIX}")
    df.to_parquet(OUTPUT_MATRIX, engine="pyarrow")
    matrix_size_mb = OUTPUT_MATRIX.stat().st_size / (1024 * 1024)
    print(f"  ✓ Matriz guardada: {matrix_size_mb:.1f} MB")
    
    # 4.3 Merge Summary
    if merge and OUTPUT_SUMMARY.exists():
        print("  [Merge] Actualizando resumen...")
        with open(OUTPUT_SUMMARY, "r") as f:
            old_summary = json.load(f)
        merged_distritos = list(set(old_summary.get("distritos", []) + distritos_list))
        total_buildings = old_summary.get("num_buildings_used", 0) + len(edificios)
    else:
        merged_distritos = distritos_list
        total_buildings = len(edificios)
        
    summary = {
        "reference_date": "2025-07-15",
        "distritos": merged_distritos,
        "hours": [f"h{h:02d}" for h in HOURS],
        "num_nodes": num_nodes,
        "num_edges": num_edges,
        "num_buildings_used": total_buildings,
        "graph_file_mb": round(graph_size_mb, 1),
        "matrix_file_mb": round(matrix_size_mb, 1),
        "processing_time_minutes": round((time.time() - t0) / 60, 1),
    }
    with open(OUTPUT_SUMMARY, "w") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    
    elapsed = time.time() - t0
    print(f"\n{'='*60}")
    print(f"✅ COMPLETADO en {elapsed/60:.1f} minutos")
    if merge:
        print(f"   MODO: Merge (Fusión incremental)")
    print(f"   Grafo:  {OUTPUT_GRAPH} ({graph_size_mb:.1f} MB)")
    print(f"   Matriz: {OUTPUT_MATRIX} ({matrix_size_mb:.1f} MB)")
    print(f"   Nodos:  {num_nodes}, Aristas: {num_edges}")
    print(f"   Edificios nuevos: {len(edificios)} (Total acumulado: {total_buildings})")
    print(f"{'='*60}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Precomputar matriz de sombras de Madrid Refugio.")
    parser.add_argument(
        "--distrito", 
        type=str, 
        help="Distrito específico a procesar (ej. 'Centro' o 'Centro, Madrid, Spain'). Si se omite, se usan los distritos por defecto."
    )
    parser.add_argument(
        "--merge", 
        action="store_true", 
        help="Fusionar con el grafo y matriz existentes en lugar de sobreescribirlos."
    )
    args = parser.parse_args()
    
    if args.distrito:
        # Asegurarse de que termine en ', Madrid, Spain' para Nominatim/OSMnx
        distrito = args.distrito.strip()
        if ", madrid" not in distrito.lower():
            distrito = f"{distrito}, Madrid, Spain"
        main(distritos_list=[distrito], merge=args.merge)
    else:
        main(merge=args.merge)
