from __future__ import annotations

import json
import unicodedata
import zipfile
from pathlib import Path
from typing import Any

import geopandas as gpd
import numpy as np
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent
RAW_DIR = BASE_DIR / "data" / "raw"
PROCESSED_DIR = BASE_DIR / "data" / "processed"
INVENTORY_PATH = PROCESSED_DIR / "dataset_inventory.json"
BARRIO_COMFORT_PATH = PROCESSED_DIR / "barrio_comfort.csv"
GO_NOGO_PATH = BASE_DIR / "go_nogo.md"
GO_NOGO_COPY_PATH = BASE_DIR / "go_nogo_refugio.md"
REFUGIOS_GEOJSON_PATH = PROCESSED_DIR / "refugios_sustitutos.geojson"
FUENTES_GEOJSON_PATH = PROCESSED_DIR / "fuentes.geojson"
AIR_MEANS_PATH = PROCESSED_DIR / "aire_no2_2024_por_estacion.csv"

NO2_MAGNITUD = 8


def require_inventory() -> dict[str, Any]:
    if not INVENTORY_PATH.exists():
        raise FileNotFoundError("Run 01_inspect_datasets.py first")
    return json.loads(INVENTORY_PATH.read_text(encoding="utf-8"))


def normalize_columns(columns: list[str]) -> list[str]:
    return [str(col).replace("\ufeff", "").strip() for col in columns]


def read_csv_auto(path: Path) -> pd.DataFrame:
    last_error: Exception | None = None
    for encoding in ("utf-8-sig", "utf-8", "latin1"):
        try:
            return pd.read_csv(path, sep=";", encoding=encoding)
        except Exception as exc:
            last_error = exc
    raise RuntimeError(f"Could not read CSV {path}") from last_error


def to_numeric(series: pd.Series) -> pd.Series:
    return pd.to_numeric(series.astype(str).str.replace(",", ".", regex=False), errors="coerce")


def normalize_text(value: object) -> str:
    text = "" if pd.isna(value) else str(value).strip().upper()
    text = unicodedata.normalize("NFKD", text)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = "".join(ch if ch.isalnum() or ch.isspace() else " " for ch in text)
    return " ".join(text.split())


def load_barrios() -> gpd.GeoDataFrame:
    barrios = gpd.read_file(RAW_DIR / "barrios.zip")
    coddis = barrios["CODDIS"].astype(int)
    cod_bar = barrios["COD_BAR"].astype(int)
    barrios["barrio_num_padron"] = cod_bar - coddis * 10
    barrios["barrio_key"] = coddis * 100 + barrios["barrio_num_padron"]
    barrios["area_km2"] = barrios["AREA"].astype(float) / 1_000_000.0
    barrios["distrito_norm"] = barrios["NOMDIS"].map(normalize_text)
    barrios["barrio_norm"] = barrios["NOMBRE"].map(normalize_text)
    return barrios


def load_arbolado() -> tuple[pd.DataFrame, gpd.GeoDataFrame]:
    df = pd.read_excel(RAW_DIR / "arbolado_detalle.xlsx")
    df.columns = normalize_columns(list(df.columns))
    df["X"] = to_numeric(df["X"])
    df["Y"] = to_numeric(df["Y"])
    df = df[df["X"].notna() & df["Y"].notna()].copy()
    gdf = gpd.GeoDataFrame(df, geometry=gpd.points_from_xy(df["X"], df["Y"], crs="EPSG:25830"))
    return df, gdf


def load_refugios() -> gpd.GeoDataFrame:
    if REFUGIOS_GEOJSON_PATH.exists():
        return gpd.read_file(REFUGIOS_GEOJSON_PATH)
    frames = [
        gpd.read_file(RAW_DIR / "bibliotecas.geojson").assign(tipo_refugio="biblioteca"),
        gpd.read_file(RAW_DIR / "centros_culturales.geojson").assign(tipo_refugio="centro_cultural"),
        gpd.read_file(RAW_DIR / "polideportivos.geojson").assign(tipo_refugio="polideportivo"),
    ]
    refugios = gpd.GeoDataFrame(pd.concat(frames, ignore_index=True), geometry="geometry", crs="EPSG:4326")
    refugios.to_file(REFUGIOS_GEOJSON_PATH, driver="GeoJSON")
    return refugios


def load_fuentes() -> gpd.GeoDataFrame:
    df = read_csv_auto(RAW_DIR / "fuentes_agua.csv")
    df.columns = normalize_columns(list(df.columns))
    df["LONGITUD"] = to_numeric(df["LONGITUD"])
    df["LATITUD"] = to_numeric(df["LATITUD"])
    valid_latlon = df["LONGITUD"].notna() & df["LATITUD"].notna()
    if valid_latlon.any():
        gdf = gpd.GeoDataFrame(
            df[valid_latlon].copy(),
            geometry=gpd.points_from_xy(df.loc[valid_latlon, "LONGITUD"], df.loc[valid_latlon, "LATITUD"], crs="EPSG:4326"),
        )
    else:
        df["COORD_GIS_X"] = to_numeric(df["COORD_GIS_X"])
        df["COORD_GIS_Y"] = to_numeric(df["COORD_GIS_Y"])
        valid = df["COORD_GIS_X"].notna() & df["COORD_GIS_Y"].notna()
        gdf = gpd.GeoDataFrame(
            df[valid].copy(),
            geometry=gpd.points_from_xy(df.loc[valid, "COORD_GIS_X"], df.loc[valid, "COORD_GIS_Y"], crs="EPSG:25830"),
        )
    gdf.to_file(FUENTES_GEOJSON_PATH, driver="GeoJSON")
    return gdf


def load_padron_barrio() -> pd.DataFrame:
    df = read_csv_auto(RAW_DIR / "padron_2026_enero.csv")
    df.columns = normalize_columns(list(df.columns))
    numeric_cols = [
        "COD_DISTRITO",
        "COD_BARRIO",
        "COD_EDAD_INT",
        "ESPANOLESHOMBRES",
        "ESPANOLESMUJERES",
        "EXTRANJEROSHOMBRES",
        "EXTRANJEROSMUJERES",
    ]
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    df = df[df["COD_EDAD_INT"] >= 65].copy()
    df["poblacion"] = (
        df["ESPANOLESHOMBRES"].fillna(0)
        + df["ESPANOLESMUJERES"].fillna(0)
        + df["EXTRANJEROSHOMBRES"].fillna(0)
        + df["EXTRANJEROSMUJERES"].fillna(0)
    )
    df["barrio_key"] = df["COD_DISTRITO"].astype(int) * 100 + df["COD_BARRIO"].astype(int)
    grouped = (
        df.groupby(["barrio_key", "DESC_DISTRITO", "DESC_BARRIO"], as_index=False)["poblacion"]
        .sum()
        .rename(columns={"poblacion": "pop_65plus"})
    )
    grouped["distrito_norm"] = grouped["DESC_DISTRITO"].map(normalize_text)
    grouped["barrio_norm"] = grouped["DESC_BARRIO"].map(normalize_text)
    return grouped


def compute_no2_means() -> pd.DataFrame:
    if AIR_MEANS_PATH.exists():
        cached = pd.read_csv(AIR_MEANS_PATH)
        if "ESTACION" in cached.columns and "CODIGO" not in cached.columns:
            cached = cached.rename(columns={"ESTACION": "CODIGO"})
            cached.to_csv(AIR_MEANS_PATH, index=False)
        return cached

    monthly_frames: list[pd.DataFrame] = []
    usecols = ["ESTACION", "MAGNITUD"] + [f"H{i:02d}" for i in range(1, 25)] + [f"V{i:02d}" for i in range(1, 25)]
    with zipfile.ZipFile(RAW_DIR / "aire_horario_2024.zip") as zf:
        for name in [n for n in zf.namelist() if n.lower().endswith(".csv")]:
            df = pd.read_csv(zf.open(name), sep=";", encoding="latin1", usecols=usecols)
            df = df[df["MAGNITUD"] == NO2_MAGNITUD].copy()
            if df.empty:
                continue
            values = []
            for hour in range(1, 25):
                h_col = f"H{hour:02d}"
                v_col = f"V{hour:02d}"
                tmp = df[["ESTACION", h_col, v_col]].rename(columns={h_col: "valor", v_col: "valido"})
                tmp = tmp[tmp["valido"] == "V"].copy()
                tmp["valor"] = pd.to_numeric(tmp["valor"], errors="coerce")
                values.append(tmp[["ESTACION", "valor"]])
            monthly_frames.append(pd.concat(values, ignore_index=True))
    values = pd.concat(monthly_frames, ignore_index=True)
    means = (
        values.groupby("ESTACION", as_index=False)["valor"]
        .mean()
        .rename(columns={"ESTACION": "CODIGO", "valor": "no2_medio_2024"})
    )
    means.to_csv(AIR_MEANS_PATH, index=False)
    return means


def load_air_stations() -> gpd.GeoDataFrame:
    stations = read_csv_auto(RAW_DIR / "aire_estaciones.csv")
    stations.columns = normalize_columns(list(stations.columns))
    stations["CODIGO_CORTO"] = pd.to_numeric(stations["CODIGO_CORTO"], errors="coerce")
    stations["LONGITUD"] = to_numeric(stations["LONGITUD"])
    stations["LATITUD"] = to_numeric(stations["LATITUD"])
    stations = stations[stations["LONGITUD"].notna() & stations["LATITUD"].notna()].copy()
    means = compute_no2_means()
    stations = stations.merge(means, left_on="CODIGO_CORTO", right_on="CODIGO", how="left")
    stations = stations.drop(columns=["CODIGO"], errors="ignore")
    return gpd.GeoDataFrame(
        stations,
        geometry=gpd.points_from_xy(stations["LONGITUD"], stations["LATITUD"], crs="EPSG:4326"),
    )


def count_points_within_buffer(points: gpd.GeoDataFrame, buffers: gpd.GeoDataFrame, id_column: str) -> pd.Series:
    joined = gpd.sjoin(points, buffers[[id_column, "geometry"]], how="inner", predicate="within")
    return joined.groupby(id_column).size()


def idw_value(target_x: float, target_y: float, station_xy: np.ndarray, station_values: np.ndarray, power: float = 2.0) -> float:
    distances = np.sqrt((station_xy[:, 0] - target_x) ** 2 + (station_xy[:, 1] - target_y) ** 2)
    if np.any(distances == 0):
        return float(station_values[distances == 0][0])
    weights = 1.0 / np.power(distances, power)
    return float(np.sum(weights * station_values) / np.sum(weights))


def write_go_nogo(
    inventory: dict[str, Any],
    criteria: dict[str, dict[str, Any]],
    top_worst: pd.DataFrame | None = None,
    map_generated: bool = False,
) -> None:
    inventory_lookup = {row["dataset"]: row for row in inventory["inventory_rows"]}
    top_lines = ["[pendiente: no se genero barrio_comfort.csv]"]
    if top_worst is not None and not top_worst.empty:
        top_lines = [
            f"- {row.barrio_nombre}: coverage_ratio={row.coverage_ratio:.4f}, "
            f"pop_65plus={int(row.pop_65plus)}, refugios_proximos={int(row.refugios_proximos)}"
            for row in top_worst.itertuples()
        ]

    overall_go = all(item["go"] for item in criteria.values()) and map_generated
    decision = "GO REFUGIO" if overall_go else "NO-GO"
    map_result = "si" if map_generated else "no"
    map_decision = "GO" if map_generated else "NO-GO"
    rows = [
        inventory_lookup["Arbolado viario"],
        inventory_lookup["Arbolado parques"],
        inventory_lookup["Zonas verdes superficies"],
        inventory_lookup["Refugios climaticos"],
        inventory_lookup["Fuentes de agua"],
        inventory_lookup["Calidad del aire"],
        inventory_lookup["Padron por edad"],
        inventory_lookup["Itinerarios accesibles"],
    ]

    lines = [
        "# GO / NO-GO DAY 1 — Madrid Refugio",
        "",
        f"Fecha de validacion: {pd.Timestamp.now(tz='UTC').date()}",
        "",
        "## Dataset inventory",
        "",
        "| Dataset | Encontrado | Filas | Tiene geometria | CRS | Calidad |",
        "|---|---|---|---|---|---|",
    ]
    for row in rows:
        lines.append(
            f"| {row['dataset']} | {row['encontrado']} | {row['filas']} | "
            f"{row['tiene_geometria']} | {row['crs']} | {row['calidad']} |"
        )

    lines.extend(
        [
            "",
            "## Criteria",
            "",
            "| Criterio | Umbral GO | Resultado | Decision |",
            "|---|---|---|---|",
            f"| Arbolado viario rows y coords | > 100k filas, >= 80% coords | {criteria['arbolado']['result']} | {'GO' if criteria['arbolado']['go'] else 'NO-GO'} |",
            f"| Refugios con coords | >= 15 (o sustituto) | {criteria['refugios']['result']} | {'GO' if criteria['refugios']['go'] else 'NO-GO'} |",
            f"| Padron con edad por barrio | si | {criteria['padron']['result']} | {'GO' if criteria['padron']['go'] else 'NO-GO'} |",
            f"| Estaciones calidad aire con coords | >= 10 | {criteria['aire']['result']} | {'GO' if criteria['aire']['go'] else 'NO-GO'} |",
            f"| Datasets con geometria compatible | >= 4 | {criteria['joinable']['result']} | {'GO' if criteria['joinable']['go'] else 'NO-GO'} |",
            f"| Mapa de cobertura generado | si | {map_result} | {map_decision} |",
            "",
            "## URLs reales usadas (rellenar en Step 0)",
            f"- Arbolado viario: {inventory['dataset_urls']['arbolado_viario']}",
            "- Refugios climaticos: NO ENCONTRADO EN PORTAL; sustitucion usada:",
            f"  - Bibliotecas: {inventory['dataset_urls']['refugios_sustitutos']['bibliotecas']}",
            f"  - Centros culturales: {inventory['dataset_urls']['refugios_sustitutos']['centros_culturales']}",
            f"  - Polideportivos: {inventory['dataset_urls']['refugios_sustitutos']['polideportivos']}",
            f"- Padron edad: {inventory['dataset_urls']['padron_edad']}",
            f"- Calidad del aire: {inventory['dataset_urls']['calidad_aire_historico']}",
            f"- Estaciones calidad del aire: {inventory['dataset_urls']['calidad_aire_estaciones']}",
            f"- Barrios: {inventory['dataset_urls']['barrios']}",
            "",
            "## Top 3 barrios con peor cobertura",
            *top_lines[:3],
            "",
            "## Dato clave para la memoria",
            "Madrid: 31 refugios climaticos = 1 por cada 110.100 habitantes (Greenpeace 2025)",
            "Barcelona: 1 por cada 4.200 habitantes",
            "",
            f"## DECISION: {decision}",
            "",
            "Notas:",
            "- No se ha encontrado dataset propio de refugios climaticos en el portal. El analisis operativo usa bibliotecas + centros culturales + polideportivos como sustituto documentado.",
            "- El criterio no negociable de arbolado viario se ha evaluado sobre el dataset oficial 2025 de arbolado detallado, separando viario mediante NUM_PARQUE nulo.",
        ]
    )
    content = "\n".join(lines) + "\n"
    GO_NOGO_PATH.write_text(content, encoding="utf-8")
    GO_NOGO_COPY_PATH.write_text(content, encoding="utf-8")


def main() -> None:
    inventory = require_inventory()

    criteria: dict[str, dict[str, Any]] = {}
    criteria["arbolado"] = {
        "go": inventory["derived"]["arbolado_viario_rows"] > 100_000
        and inventory["derived"]["arbolado_coords_ratio"] >= 80.0,
        "result": f"{inventory['derived']['arbolado_viario_rows']:,} filas; {inventory['derived']['arbolado_coords_ratio']:.1f}% coords",
    }
    criteria["refugios"] = {
        "go": inventory["derived"]["refugios_sustitutos_con_coords"] >= 15,
        "result": f"{inventory['derived']['refugios_sustitutos_con_coords']} con coords (sustituto)",
    }

    padron_df = load_padron_barrio()
    criteria["padron"] = {"go": not padron_df.empty, "result": "si" if not padron_df.empty else "no"}

    aire_stations = load_air_stations()
    aire_coords = int(aire_stations.geometry.notna().sum())
    criteria["aire"] = {"go": aire_coords >= 10, "result": f"{aire_coords}"}

    compatible_geometry = inventory["derived"]["datasets_geometria_compatible"]
    criteria["joinable"] = {"go": compatible_geometry >= 4, "result": f"{compatible_geometry}"}

    print("GO/NO-GO criteria")
    for key, value in criteria.items():
        print(f"{key}: {value['result']} -> {'GO' if value['go'] else 'NO-GO'}")

    if not all(item["go"] for item in criteria.values()):
        write_go_nogo(inventory, criteria, top_worst=None, map_generated=False)
        print(f"NO-GO: criteria failed. Written to {GO_NOGO_PATH}")
        return

    barrios = load_barrios()
    _, arbolado = load_arbolado()
    refugios = load_refugios().to_crs(barrios.crs)
    fuentes = load_fuentes().to_crs(barrios.crs)
    aire_utm = aire_stations.to_crs(barrios.crs)

    tree_join = gpd.sjoin(arbolado[["geometry"]], barrios[["barrio_key", "geometry"]], how="inner", predicate="within")
    tree_counts = tree_join.groupby("barrio_key").size().rename("tree_count")

    buffers = barrios[["barrio_key", "geometry"]].copy()
    buffers["geometry"] = buffers.geometry.centroid.buffer(400)
    buffers = gpd.GeoDataFrame(buffers, geometry="geometry", crs=barrios.crs)
    refugio_counts = count_points_within_buffer(refugios, buffers, "barrio_key").rename("refugios_proximos")
    fuentes_counts = count_points_within_buffer(fuentes, buffers, "barrio_key").rename("fuentes_proximas")

    stations = aire_utm[["geometry", "no2_medio_2024"]].dropna().copy()
    station_xy = np.column_stack((stations.geometry.x.to_numpy(), stations.geometry.y.to_numpy()))
    station_no2 = stations["no2_medio_2024"].to_numpy(dtype=float)
    no2_values = [idw_value(pt.x, pt.y, station_xy, station_no2) for pt in barrios.geometry.centroid]

    comfort = barrios[["barrio_key", "NOMBRE", "area_km2", "distrito_norm", "barrio_norm"]].copy().rename(columns={"NOMBRE": "barrio_nombre"})
    comfort["tree_count"] = comfort["barrio_key"].map(tree_counts).fillna(0).astype(int)
    comfort["tree_density"] = comfort["tree_count"] / comfort["area_km2"].replace(0, np.nan)
    comfort["refugios_proximos"] = comfort["barrio_key"].map(refugio_counts).fillna(0).astype(int)
    comfort["fuentes_proximas"] = comfort["barrio_key"].map(fuentes_counts).fillna(0).astype(int)
    comfort["no2_medio"] = no2_values
    comfort = comfort.merge(padron_df[["barrio_key", "pop_65plus"]], on="barrio_key", how="left")
    comfort["pop_65plus"] = comfort["pop_65plus"].fillna(0).astype(int)
    comfort["coverage_ratio"] = (comfort["refugios_proximos"] + 1) / (comfort["pop_65plus"] / 1000.0).replace(0, np.nan)
    comfort["coverage_ratio"] = comfort["coverage_ratio"].fillna(0.0)
    comfort["tree_density"] = comfort["tree_density"].fillna(0.0)
    comfort = comfort.sort_values(["coverage_ratio", "pop_65plus"], ascending=[True, False]).reset_index(drop=True)
    comfort[
        ["barrio_key", "barrio_nombre", "tree_density", "refugios_proximos", "fuentes_proximas", "no2_medio", "pop_65plus", "coverage_ratio"]
    ].to_csv(BARRIO_COMFORT_PATH, index=False)

    top_worst = comfort.nsmallest(5, ["coverage_ratio", "pop_65plus"])
    top_best = comfort.nlargest(5, ["coverage_ratio", "refugios_proximos"])
    print("\nTop 5 barrios with worst coverage")
    print(top_worst[["barrio_nombre", "coverage_ratio", "pop_65plus", "refugios_proximos"]].to_string(index=False))
    print("\nTop 5 barrios with best coverage")
    print(top_best[["barrio_nombre", "coverage_ratio", "pop_65plus", "refugios_proximos"]].to_string(index=False))

    write_go_nogo(inventory, criteria, top_worst=top_worst.head(3), map_generated=False)
    print(f"\nComfort index written to {BARRIO_COMFORT_PATH}")
    print(f"Interim GO/NO-GO written to {GO_NOGO_PATH}")


if __name__ == "__main__":
    main()
