"""
06e_integrate_trees.py — Madrid Refugio
=======================================
Integra el dataset de arbolado viario (661k ejemplares) en el grafo de sombras.
Calcula una puntuación de sombra biológica estática para cada arista.
"""

import sys
import time
from pathlib import Path
import pandas as pd
import geopandas as gpd
import osmnx as ox
import networkx as nx
from shapely.geometry import Point, LineString

# Paths
BASE_DIR = Path(__file__).resolve().parent
PROCESSED_DIR = BASE_DIR / "data" / "processed"
RAW_DIR = BASE_DIR / "data" / "raw"
GRAPH_PATH = PROCESSED_DIR / "madrid_shadow_graph.graphml"
TREES_PATH = RAW_DIR / "arbolado_detalle.xlsx"

TREE_SHADE_RADIUS = 4.0  # metros de radio de sombra lineal por árbol

def to_numeric(series: pd.Series) -> pd.Series:
    return pd.to_numeric(series.astype(str).str.replace(",", ".", regex=False), errors="coerce")

def load_arbolado_fast() -> gpd.GeoDataFrame:
    print("Cargando dataset de arbolado (661k registros)...")
    # Nota: read_excel es lento, pero es lo que tenemos.
    df = pd.read_excel(TREES_PATH)
    print(f"  Registros leídos: {len(df)}")
    
    # Limpiar columnas
    df.columns = [str(col).strip() for col in df.columns]
    
    # Filtrar solo los que tienen coordenadas
    df["X"] = to_numeric(df["X"])
    df["Y"] = to_numeric(df["Y"])
    df = df[df["X"].notna() & df["Y"].notna()].copy()
    
    # Convertir a GDF (Madrid usa EPSG:25830)
    gdf = gpd.GeoDataFrame(df, geometry=gpd.points_from_xy(df["X"], df["Y"], crs="EPSG:25830"))
    return gdf

def main():
    if not GRAPH_PATH.exists():
        print(f"Error: No se encuentra el grafo en {GRAPH_PATH}")
        return

    t0 = time.time()
    
    # 1. Cargar Grafo
    print(f"Cargando grafo: {GRAPH_PATH}...")
    G = ox.load_graphml(GRAPH_PATH)
    
    # 2. Cargar Árboles
    trees_gdf = load_arbolado_fast()
    
    # 3. Filtrar árboles que caen dentro del área del grafo (optimizador)
    print("Filtrando árboles por el área del grafo...")
    nodes_df, edges_df = ox.graph_to_gdfs(G)
    minx, miny, maxx, maxy = edges_df.total_bounds
    trees_in_area = trees_gdf.cx[minx:maxx, miny:maxy].copy()
    print(f"  Árboles en el área de la demo: {len(trees_in_area)}")
    
    if len(trees_in_area) == 0:
        print("No hay árboles en esta zona. Abortando.")
        return

    # 4. Calcular sombra biológica
    print("Calculando intersecciones arbolado -> aristas...")
    # Buffer de aristas para capturar árboles cercanos (5 metros)
    edges_buffer = edges_df.copy()
    edges_buffer["geometry"] = edges_buffer.geometry.buffer(5.0)
    
    # Para evitar problemas con MultiIndex en sjoin, reseteamos el index temporalmente
    edges_buffer = edges_buffer.reset_index()
    
    # Join espacial
    join = gpd.sjoin(trees_in_area[["geometry"]], edges_buffer, how="inner", predicate="within")
    
    # Contar árboles por arista usando las columnas u, v, key que ahora son regulares
    # groupby(...).size() devuelve una Serie con MultiIndex (u, v, key)
    tree_counts = join.groupby(["u", "v", "key"]).size()
    
    print(f"Integrando shade_score en {len(tree_counts)} aristas...")
    
    # 5. Actualizar atributos del grafo
    edges_updated = 0
    for (u, v, key), count in tree_counts.items():
        if G.has_edge(u, v, key):
            edge_data = G[u][v][key]
            length = float(edge_data.get("length", 1.0))
            # Puntuación de sombra: cada árbol aporta un radio de sombra
            # shade_score = min(1.0, (num_árboles * radio_sombra) / longitud)
            shade = min(1.0, (count * TREE_SHADE_RADIUS) / length)
            edge_data["shade_score"] = shade
            edges_updated += 1

    # Asegurar que todas las aristas tengan shade_score (aunque sea 0)
    for u, v, key, data in G.edges(keys=True, data=True):
        if "shade_score" not in data:
            data["shade_score"] = 0.0

    print(f"  Aristas actualizadas con sombra biológica: {edges_updated}")
    
    # 6. Guardar
    print(f"Guardando grafo actualizado → {GRAPH_PATH}")
    ox.save_graphml(G, GRAPH_PATH)
    
    print(f"✅ COMPLETADO en {(time.time()-t0)/60:.1f} minutos.")

if __name__ == "__main__":
    main()
