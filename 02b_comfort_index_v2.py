from __future__ import annotations

import importlib.util
from pathlib import Path

import geopandas as gpd
import numpy as np
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent
PROCESSED_DIR = BASE_DIR / "data" / "processed"
OUTPUT_PATH = PROCESSED_DIR / "barrio_comfort_v2.csv"


def load_day1_module():
    module_path = BASE_DIR / "02_comfort_index.py"
    spec = importlib.util.spec_from_file_location("comfort_day1", module_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Could not load helpers from {module_path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def minmax_normalize(series: pd.Series) -> pd.Series:
    min_value = float(series.min())
    max_value = float(series.max())
    if np.isclose(max_value, min_value):
        return pd.Series(np.zeros(len(series)), index=series.index, dtype=float)
    return (series - min_value) / (max_value - min_value)


def main() -> None:
    day1 = load_day1_module()
    _inventory = day1.require_inventory()

    barrios = day1.load_barrios()
    _, arbolado = day1.load_arbolado()
    refugios = day1.load_refugios().to_crs(barrios.crs)
    fuentes = day1.load_fuentes().to_crs(barrios.crs)
    aire_utm = day1.load_air_stations().to_crs(barrios.crs)
    padron_df = day1.load_padron_barrio()

    tree_join = gpd.sjoin(
        arbolado[["geometry"]],
        barrios[["barrio_key", "geometry"]],
        how="inner",
        predicate="within",
    )
    tree_counts = tree_join.groupby("barrio_key").size().rename("tree_count")

    centroids = barrios[["barrio_key", "geometry"]].copy()
    centroids["geometry"] = centroids.geometry.centroid
    centroids = gpd.GeoDataFrame(centroids, geometry="geometry", crs=barrios.crs)

    buffers_300 = centroids.copy()
    buffers_300["geometry"] = buffers_300.geometry.buffer(300)
    buffers_400 = centroids.copy()
    buffers_400["geometry"] = buffers_400.geometry.buffer(400)

    refugios_300 = day1.count_points_within_buffer(refugios, buffers_300, "barrio_key").rename("refugios_300m")
    refugios_400 = day1.count_points_within_buffer(refugios, buffers_400, "barrio_key").rename("refugios_400m")
    fuentes_400 = day1.count_points_within_buffer(fuentes, buffers_400, "barrio_key").rename("fuentes_400m")

    stations = aire_utm[["geometry", "no2_medio_2024"]].dropna().copy()
    station_xy = np.column_stack((stations.geometry.x.to_numpy(), stations.geometry.y.to_numpy()))
    station_no2 = stations["no2_medio_2024"].to_numpy(dtype=float)
    no2_values = [day1.idw_value(pt.x, pt.y, station_xy, station_no2) for pt in centroids.geometry]

    comfort = (
        barrios[["barrio_key", "NOMBRE", "area_km2"]]
        .copy()
        .rename(columns={"NOMBRE": "barrio_nombre"})
    )
    comfort["tree_count"] = comfort["barrio_key"].map(tree_counts).fillna(0).astype(int)
    comfort["tree_density"] = comfort["tree_count"] / comfort["area_km2"].replace(0, np.nan)
    comfort["refugios_300m"] = comfort["barrio_key"].map(refugios_300).fillna(0).astype(int)
    comfort["refugios_400m"] = comfort["barrio_key"].map(refugios_400).fillna(0).astype(int)
    comfort["refugios_proximos"] = comfort["refugios_400m"]
    comfort["fuentes_400m"] = comfort["barrio_key"].map(fuentes_400).fillna(0).astype(int)
    comfort["fuentes_proximas"] = comfort["fuentes_400m"]
    comfort["no2_medio"] = no2_values
    comfort = comfort.merge(padron_df[["barrio_key", "pop_65plus"]], on="barrio_key", how="left")
    comfort["pop_65plus"] = comfort["pop_65plus"].fillna(0).astype(int)

    pop_thousands = (comfort["pop_65plus"] / 1000.0).replace(0, np.nan)
    comfort["coverage_ratio_300m"] = (comfort["refugios_300m"] / pop_thousands).fillna(0.0)
    comfort["coverage_ratio_400m"] = (comfort["refugios_400m"] / pop_thousands).fillna(0.0)
    comfort["coverage_ratio"] = comfort["coverage_ratio_400m"]
    comfort["coverage_ratio_suavizado"] = (np.maximum(comfort["refugios_400m"], 0.1) / pop_thousands).fillna(0.0)

    comfort["tree_density"] = comfort["tree_density"].fillna(0.0)
    tree_density_max = max(float(comfort["tree_density"].max()), 1.0)
    raw_vulnerability = (
        (1.0 / np.maximum(comfort["refugios_400m"].astype(float), 0.1))
        * (comfort["no2_medio"].fillna(comfort["no2_medio"].median()) / 40.0)
        * (1.0 - (comfort["tree_density"] / tree_density_max).clip(0.0, 1.0))
    )
    comfort["vulnerability_index_raw"] = raw_vulnerability
    comfort["vulnerability_index"] = minmax_normalize(raw_vulnerability).fillna(0.0)

    comfort = comfort.sort_values(
        ["vulnerability_index", "pop_65plus", "refugios_400m"],
        ascending=[False, False, True],
    ).reset_index(drop=True)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    comfort[
        [
            "barrio_key",
            "barrio_nombre",
            "tree_density",
            "refugios_300m",
            "refugios_400m",
            "refugios_proximos",
            "fuentes_400m",
            "fuentes_proximas",
            "no2_medio",
            "pop_65plus",
            "coverage_ratio_300m",
            "coverage_ratio_400m",
            "coverage_ratio",
            "coverage_ratio_suavizado",
            "vulnerability_index_raw",
            "vulnerability_index",
        ]
    ].to_csv(OUTPUT_PATH, index=False)

    top10 = comfort.nlargest(10, "vulnerability_index")[
        [
            "barrio_nombre",
            "pop_65plus",
            "refugios_300m",
            "refugios_400m",
            "tree_density",
            "no2_medio",
            "vulnerability_index",
        ]
    ]
    zero_300 = int((comfort["refugios_300m"] == 0).sum())
    zero_400 = int((comfort["refugios_400m"] == 0).sum())
    downgraded = int(((comfort["refugios_400m"] > 0) & (comfort["refugios_300m"] == 0)).sum())

    print(f"barrios sin refugio en 300m: {zero_300}")
    print(f"barrios sin refugio en 400m: {zero_400}")
    print(f"barrios que pasan de >0 refugios en 400m a 0 en 300m: {downgraded}")
    print("\nTop 10 barrios por vulnerability_index")
    print(top10.to_string(index=False))
    print(f"\nArchivo generado: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
