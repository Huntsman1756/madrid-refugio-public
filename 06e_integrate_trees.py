"""
06e_integrate_trees.py - Madrid Refugio
=======================================
Integra el dataset de arbolado viario en el grafo de sombras y expone
helpers reutilizables para el pipeline offline.
"""

from __future__ import annotations

import argparse
import time
from pathlib import Path

import geopandas as gpd
import osmnx as ox
import pandas as pd

from shade_model import TREE_INFLUENCE_RADIUS_M, compute_tree_shade_score

BASE_DIR = Path(__file__).resolve().parent
PROCESSED_DIR = BASE_DIR / "data" / "processed"
RAW_DIR = BASE_DIR / "data" / "raw"
DEFAULT_GRAPH_PATH = PROCESSED_DIR / "madrid_shadow_graph.graphml"
DEFAULT_TREES_PATH = RAW_DIR / "arbolado_detalle.xlsx"


def to_numeric(series: pd.Series) -> pd.Series:
    return pd.to_numeric(series.astype(str).str.replace(",", ".", regex=False), errors="coerce")


def load_arbolado_fast(trees_path: str | Path = DEFAULT_TREES_PATH) -> gpd.GeoDataFrame:
    trees_path = Path(trees_path)
    if not trees_path.exists():
        raise FileNotFoundError(f"No se encuentra el dataset de arbolado en {trees_path}")

    print(f"Cargando dataset de arbolado: {trees_path}")
    df = pd.read_excel(trees_path)
    print(f"  Registros leidos: {len(df)}")

    df.columns = [str(col).strip() for col in df.columns]
    if "NUM_PARQUE" in df.columns:
        df = df[df["NUM_PARQUE"].isna()].copy()

    df["X"] = to_numeric(df["X"])
    df["Y"] = to_numeric(df["Y"])
    df = df[df["X"].notna() & df["Y"].notna()].copy()

    gdf = gpd.GeoDataFrame(
        df,
        geometry=gpd.points_from_xy(df["X"], df["Y"], crs="EPSG:25830"),
    )
    print(f"  Arboles viarios con coordenadas validas: {len(gdf)}")
    return gdf


def annotate_tree_shade(
    graph,
    trees_gdf: gpd.GeoDataFrame,
    influence_radius: float = TREE_INFLUENCE_RADIUS_M,
) -> dict:
    nodes_df, edges_df = ox.graph_to_gdfs(graph)
    minx, miny, maxx, maxy = edges_df.total_bounds
    trees_in_area = trees_gdf.cx[
        minx - influence_radius:maxx + influence_radius,
        miny - influence_radius:maxy + influence_radius,
    ].copy()

    print(f"  Arboles en el area del grafo: {len(trees_in_area)}")
    edges_buffer = edges_df.reset_index()[["u", "v", "key", "geometry"]].copy()
    edges_buffer["geometry"] = edges_buffer.geometry.buffer(influence_radius)

    if trees_in_area.empty:
        tree_counts = {}
    else:
        join = gpd.sjoin(
            trees_in_area[["geometry"]],
            edges_buffer,
            how="inner",
            predicate="within",
        )
        tree_counts = join.groupby(["u", "v", "key"]).size().to_dict()

    total_tree_hits = 0
    shaded_edges = 0
    max_tree_count = 0
    for u, v, key, data in graph.edges(keys=True, data=True):
        tree_count = int(tree_counts.get((u, v, key), 0))
        tree_shade_score = float(compute_tree_shade_score(tree_count))
        data["tree_count"] = tree_count
        data["tree_shade_score"] = tree_shade_score
        data["shade_score"] = tree_shade_score

        total_tree_hits += tree_count
        if tree_count > 0:
            shaded_edges += 1
            max_tree_count = max(max_tree_count, tree_count)

    return {
        "trees_in_area": int(len(trees_in_area)),
        "edges_with_tree_shade": int(shaded_edges),
        "total_tree_hits": int(total_tree_hits),
        "max_tree_count_on_edge": int(max_tree_count),
        "influence_radius_m": float(influence_radius),
    }


def main(
    graph_path: str | Path = DEFAULT_GRAPH_PATH,
    trees_path: str | Path = DEFAULT_TREES_PATH,
    output_path: str | Path | None = None,
    influence_radius: float = TREE_INFLUENCE_RADIUS_M,
) -> None:
    graph_path = Path(graph_path)
    output_path = Path(output_path) if output_path else graph_path

    if not graph_path.exists():
        raise FileNotFoundError(f"No se encuentra el grafo en {graph_path}")

    t0 = time.time()
    print(f"Cargando grafo: {graph_path}")
    graph = ox.load_graphml(graph_path)
    trees_gdf = load_arbolado_fast(trees_path)

    print("Integrando sombra de arbolado en aristas...")
    stats = annotate_tree_shade(graph, trees_gdf, influence_radius=influence_radius)

    print(f"Guardando grafo actualizado -> {output_path}")
    ox.save_graphml(graph, output_path)

    elapsed_min = (time.time() - t0) / 60
    print(f"Aristas con sombra de arbolado: {stats['edges_with_tree_shade']}")
    print(f"Maximo arboles por arista: {stats['max_tree_count_on_edge']}")
    print(f"Completado en {elapsed_min:.1f} minutos")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Integrar arbolado viario en el grafo.")
    parser.add_argument("--graph-path", default=str(DEFAULT_GRAPH_PATH))
    parser.add_argument("--trees-path", default=str(DEFAULT_TREES_PATH))
    parser.add_argument("--output-path")
    parser.add_argument("--influence-radius", type=float, default=TREE_INFLUENCE_RADIUS_M)
    args = parser.parse_args()

    main(
        graph_path=args.graph_path,
        trees_path=args.trees_path,
        output_path=args.output_path,
        influence_radius=args.influence_radius,
    )
