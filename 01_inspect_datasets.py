from __future__ import annotations

import json
import zipfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import geopandas as gpd
import pandas as pd
import requests

BASE_DIR = Path(__file__).resolve().parent
RAW_DIR = BASE_DIR / "data" / "raw"
PROCESSED_DIR = BASE_DIR / "data" / "processed"
INVENTORY_PATH = PROCESSED_DIR / "dataset_inventory.json"

MADRID_BBOX = {
    "lat_min": 40.31,
    "lat_max": 40.55,
    "lon_min": -3.83,
    "lon_max": -3.52,
}


@dataclass(frozen=True)
class DatasetSpec:
    key: str
    label: str
    url: str | None
    filename: str | None
    kind: str
    update_label: str
    fallback: str | None = None
    notes: str | None = None


DATASETS: dict[str, DatasetSpec] = {
    "arbolado_detalle": DatasetSpec(
        key="arbolado_detalle",
        label="Arbolado en parques y zonas verdes de Madrid (detalle)",
        url=(
            "https://datos.madrid.es/dataset/300761-0-arbolado-especies/resource/"
            "300761-0-arbolado-especies-xlsx/download/300761-0-arbolado-especies-xlsx.xlsx"
        ),
        filename="arbolado_detalle.xlsx",
        kind="xlsx",
        update_label="Publicado 2025-05-05; frecuencia semestral",
        notes=(
            "El portal indica que cubre zonas verdes y arbolado viario. "
            "NUM_PARQUE nulo se usa como proxy de arbolado viario."
        ),
    ),
    "zonas_verdes": DatasetSpec(
        key="zonas_verdes",
        label="Superficie de parques y zonas verdes de Madrid. 2024. Distrito",
        url=(
            "https://datos.madrid.es/dataset/300266-0-arbolado-superficie/resource/"
            "300266-19-arbolado-superficie-csv/download/300266-19-arbolado-superficie-csv.csv"
        ),
        filename="zonas_verdes_superficie.csv",
        kind="csv",
        update_label="Ultima modificacion 2025-03-28",
    ),
    "fuentes": DatasetSpec(
        key="fuentes",
        label="Fuentes de agua para beber. 2025",
        url=(
            "https://datos.madrid.es/dataset/300051-0-fuentes/resource/"
            "300051-1-fuentes-csv/download/300051-1-fuentes-csv.csv"
        ),
        filename="fuentes_agua.csv",
        kind="csv",
        update_label="Ultima modificacion 2025-07-04",
    ),
    "bibliotecas": DatasetSpec(
        key="bibliotecas",
        label="Bibliobuses y bibliotecas publicas municipales",
        url=(
            "https://datos.madrid.es/dataset/201747-0-bibliobuses-bibliotecas/resource/"
            "201747-5-bibliobuses-bibliotecas-geo/download/"
            "201747-5-bibliobuses-bibliotecas-geo.geo"
        ),
        filename="bibliotecas.geojson",
        kind="geojson",
        update_label="Recurso GEO oficial del portal",
        fallback="refugios_sustitutos",
    ),
    "centros_culturales": DatasetSpec(
        key="centros_culturales",
        label="Centros culturales",
        url=(
            "https://datos.madrid.es/dataset/200304-0-centros-culturales/resource/"
            "200304-2-centros-culturales-geo/download/200304-2-centros-culturales-geo.geo"
        ),
        filename="centros_culturales.geojson",
        kind="geojson",
        update_label="Recurso GEO oficial del portal",
        fallback="refugios_sustitutos",
    ),
    "polideportivos": DatasetSpec(
        key="polideportivos",
        label="Centros Deportivos Municipales (polideportivos)",
        url=(
            "https://datos.madrid.es/dataset/200186-0-polideportivos/resource/"
            "200186-2-polideportivos-geo/download/200186-2-polideportivos-geo.geo"
        ),
        filename="polideportivos.geojson",
        kind="geojson",
        update_label="Ultima modificacion 2026-02-26",
        fallback="refugios_sustitutos",
    ),
    "aire_estaciones": DatasetSpec(
        key="aire_estaciones",
        label="Calidad del aire. Estaciones de control",
        url=(
            "https://datos.madrid.es/dataset/212629-0-estaciones-control-aire/resource/"
            "212629-0-estaciones-control-aire-csv/download/"
            "212629-0-estaciones-control-aire-csv.csv"
        ),
        filename="aire_estaciones.csv",
        kind="csv",
        update_label="Cobertura temporal hasta 2024-12-10",
    ),
    "aire_horario": DatasetSpec(
        key="aire_horario",
        label="Calidad del aire. Datos horarios 2024",
        url=(
            "https://datos.madrid.es/dataset/201200-0-calidad-aire-horario/resource/"
            "201200-0-calidad-aire-horario-zip/download/201200-0-calidad-aire-horario-zip.zip"
        ),
        filename="aire_horario_2024.zip",
        kind="zip_csv",
        update_label="Anio de datos 2024",
    ),
    "padron": DatasetSpec(
        key="padron",
        label="Padron municipal historico. 2026. Enero",
        url=(
            "https://datos.madrid.es/dataset/209163-0-padron-municipal-historico/resource/"
            "209163-27-padron-municipal-historico-csv/download/"
            "209163-27-padron-municipal-historico-csv.csv"
        ),
        filename="padron_2026_enero.csv",
        kind="csv",
        update_label="FX_DATOS_INI = 2026-01-01",
    ),
    "barrios": DatasetSpec(
        key="barrios",
        label="Limites administrativos actuales. Barrios municipales (SHP)",
        url="https://geoportal.madrid.es/fsdescargas/IDEAM_WBGEOPORTAL/LIMITES_ADMINISTRATIVOS/Barrios/Barrios.zip",
        filename="barrios.zip",
        kind="shp_zip",
        update_label="Publicado 2025-10-02; frecuencia mensual",
    ),
    "refugios_exactos": DatasetSpec(
        key="refugios_exactos",
        label="Refugios climaticos habilitados",
        url=None,
        filename=None,
        kind="missing",
        update_label="Busqueda portal 2026-04-05",
        notes=(
            "No aparece dataset propio en el portal con las consultas "
            "'refugios climaticos' y 'refugio calor'."
        ),
    ),
    "itinerarios": DatasetSpec(
        key="itinerarios",
        label="Itinerarios peatonales accesibles",
        url=None,
        filename=None,
        kind="missing",
        update_label="Busqueda portal 2026-04-05",
        notes=(
            "No aparece un dataset exacto. El conjunto mas cercano encontrado es "
            "'Accesibilidad y movilidad en aceras y calzadas. Ano 2024', pero "
            "describe actuaciones y no una red de itinerarios peatonales."
        ),
    ),
}


def ensure_dirs() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


def download(spec: DatasetSpec) -> Path | None:
    if not spec.url or not spec.filename:
        return None
    path = RAW_DIR / spec.filename
    if path.exists():
        return path
    response = requests.get(spec.url, timeout=240)
    response.raise_for_status()
    path.write_bytes(response.content)
    return path


def read_csv_auto(path: Path, nrows: int | None = None) -> pd.DataFrame:
    last_error: Exception | None = None
    for encoding in ("utf-8-sig", "utf-8", "latin1"):
        try:
            return pd.read_csv(path, sep=";", encoding=encoding, nrows=nrows)
        except Exception as exc:
            last_error = exc
    raise RuntimeError(f"Could not read CSV {path}") from last_error


def normalize_columns(columns: list[str]) -> list[str]:
    return [str(col).replace("\ufeff", "").strip() for col in columns]


def to_numeric(series: pd.Series) -> pd.Series:
    return pd.to_numeric(series.astype(str).str.replace(",", ".", regex=False), errors="coerce")


def infer_geometry_from_table(df: pd.DataFrame) -> tuple[bool, str | None, pd.Series | None, pd.Series | None]:
    cols = {col.upper(): col for col in df.columns}
    if "X" in cols and "Y" in cols:
        x = to_numeric(df[cols["X"]])
        y = to_numeric(df[cols["Y"]])
        return True, "EPSG:25830", x, y
    if "COORDENADA_X_ETRS89" in cols and "COORDENADA_Y_ETRS89" in cols:
        x = to_numeric(df[cols["COORDENADA_X_ETRS89"]])
        y = to_numeric(df[cols["COORDENADA_Y_ETRS89"]])
        return True, "EPSG:25830", x, y
    if "COORD_GIS_X" in cols and "COORD_GIS_Y" in cols:
        x = to_numeric(df[cols["COORD_GIS_X"]])
        y = to_numeric(df[cols["COORD_GIS_Y"]])
        return True, "EPSG:25830", x, y
    if "LATITUD" in cols and "LONGITUD" in cols:
        x = to_numeric(df[cols["LONGITUD"]])
        y = to_numeric(df[cols["LATITUD"]])
        return True, "EPSG:4326", x, y
    return False, None, None, None


def gdf_from_xy(df: pd.DataFrame, x: pd.Series, y: pd.Series, crs: str) -> gpd.GeoDataFrame:
    work = df.copy()
    work["_x"] = x
    work["_y"] = y
    work = work[work["_x"].notna() & work["_y"].notna()].copy()
    geometry = gpd.points_from_xy(work["_x"], work["_y"], crs=crs)
    return gpd.GeoDataFrame(work.drop(columns=["_x", "_y"]), geometry=geometry, crs=crs)


def bbox_check(gdf: gpd.GeoDataFrame) -> bool:
    if gdf.empty:
        return False
    probe = gdf.to_crs(4326)
    points = probe.geometry.representative_point()
    return bool(
        (
            points.y.between(MADRID_BBOX["lat_min"], MADRID_BBOX["lat_max"])
            & points.x.between(MADRID_BBOX["lon_min"], MADRID_BBOX["lon_max"])
        ).any()
    )


def quality_notes_from_nulls(df: pd.DataFrame, critical_cols: list[str]) -> str:
    issues: list[str] = []
    for col in critical_cols:
        if col not in df.columns:
            issues.append(f"missing {col}")
            continue
        null_pct = df[col].isna().mean() * 100
        if null_pct > 0:
            issues.append(f"{col} null {null_pct:.1f}%")
    return "ok" if not issues else "; ".join(issues)


def inspect_barrios(path: Path) -> tuple[gpd.GeoDataFrame, dict[str, Any]]:
    gdf = gpd.read_file(path)
    return gdf, {
        "rows": int(len(gdf)),
        "columns": list(gdf.columns),
        "has_geometry": True,
        "crs": str(gdf.crs),
        "geometry_rows": int(gdf.geometry.notna().sum()),
        "bbox_ok": bbox_check(gdf),
        "joinable_to_barrio": True,
        "quality": "ok",
    }


def inspect_tree_dataset(path: Path, barrios_gdf: gpd.GeoDataFrame) -> dict[str, Any]:
    df = pd.read_excel(path)
    df.columns = normalize_columns(list(df.columns))
    has_geometry, inferred_crs, x, y = infer_geometry_from_table(df)
    coords_ratio = float((x.notna() & y.notna()).mean() * 100) if x is not None and y is not None else 0.0
    viario_mask = df["NUM_PARQUE"].isna()
    viario_rows = int(viario_mask.sum())
    parques_rows = int((~viario_mask).sum())
    tree_gdf = gdf_from_xy(df.loc[viario_mask], x.loc[viario_mask], y.loc[viario_mask], inferred_crs or "EPSG:25830")
    joinable = False
    if has_geometry and not tree_gdf.empty:
        sample = tree_gdf.head(5000)
        joined = gpd.sjoin(sample, barrios_gdf[["CODDIS", "NUM_BAR", "geometry"]], how="left", predicate="within")
        joinable = joined["CODDIS"].notna().any()
    quality = quality_notes_from_nulls(df, ["X", "Y", "NUM_DTO", "NUM_BARRIO"])
    if quality == "ok":
        quality = (
            f"coords {coords_ratio:.1f}% ; viario inferido por NUM_PARQUE null ; "
            f"viario {viario_rows:,} / parques {parques_rows:,}"
        )
    return {
        "all_rows": int(len(df)),
        "columns": list(df.columns),
        "has_geometry": has_geometry,
        "crs": inferred_crs,
        "bbox_ok": bbox_check(tree_gdf.head(5000)),
        "joinable_to_barrio": joinable,
        "coords_ratio": coords_ratio,
        "viario_rows": viario_rows,
        "parques_rows": parques_rows,
        "quality": quality,
    }


def inspect_csv_dataset(path: Path, label: str, barrios_gdf: gpd.GeoDataFrame) -> dict[str, Any]:
    df = read_csv_auto(path)
    df.columns = normalize_columns(list(df.columns))
    has_geometry, inferred_crs, x, y = infer_geometry_from_table(df)
    geometry_count = 0
    bbox_ok = False
    joinable = False
    if has_geometry and x is not None and y is not None:
        gdf = gdf_from_xy(df, x, y, inferred_crs or "EPSG:4326")
        geometry_count = int(len(gdf))
        bbox_ok = bbox_check(gdf.head(1000))
        if not gdf.empty:
            sample = gdf.to_crs(barrios_gdf.crs).head(1000)
            joined = gpd.sjoin(sample, barrios_gdf[["CODDIS", "NUM_BAR", "geometry"]], how="left", predicate="within")
            joinable = joined["CODDIS"].notna().any()
    quality = "ok"
    if label == "fuentes":
        quality = quality_notes_from_nulls(df, ["LATITUD", "LONGITUD", "COORD_GIS_X", "COORD_GIS_Y"])
    elif label == "aire_estaciones":
        quality = quality_notes_from_nulls(df, ["LONGITUD", "LATITUD", "ESTACION"])
    elif label == "padron":
        quality = quality_notes_from_nulls(df, ["COD_BARRIO", "COD_EDAD_INT"])
    elif label == "zonas_verdes":
        quality = "ok; dataset distrital sin geometria"
    return {
        "rows": int(len(df)),
        "columns": list(df.columns),
        "has_geometry": has_geometry,
        "crs": inferred_crs,
        "geometry_rows": geometry_count,
        "bbox_ok": bbox_ok,
        "joinable_to_barrio": joinable,
        "quality": quality,
    }


def inspect_geo_dataset(path: Path, barrios_gdf: gpd.GeoDataFrame) -> dict[str, Any]:
    gdf = gpd.read_file(path)
    sample = gdf.to_crs(barrios_gdf.crs).head(500)
    joined = gpd.sjoin(sample, barrios_gdf[["CODDIS", "NUM_BAR", "geometry"]], how="left", predicate="within")
    return {
        "rows": int(len(gdf)),
        "columns": list(gdf.columns),
        "has_geometry": True,
        "crs": str(gdf.crs),
        "geometry_rows": int(gdf.geometry.notna().sum()),
        "bbox_ok": bbox_check(gdf.head(500)),
        "joinable_to_barrio": joined["CODDIS"].notna().any(),
        "quality": "ok" if gdf.geometry.notna().all() else "missing geometry rows",
    }


def inspect_air_zip(path: Path) -> dict[str, Any]:
    with zipfile.ZipFile(path) as zf:
        csv_members = [name for name in zf.namelist() if name.lower().endswith(".csv")]
        first_csv = csv_members[0]
        df = pd.read_csv(zf.open(first_csv), sep=";", encoding="latin1", nrows=5)
    return {
        "rows": len(csv_members),
        "columns": normalize_columns(list(df.columns)),
        "has_geometry": False,
        "crs": None,
        "bbox_ok": False,
        "joinable_to_barrio": False,
        "quality": f"{len(csv_members)} monthly CSV files inside zip",
    }


def print_dataset_summary(label: str, info: dict[str, Any], update_label: str) -> None:
    print(f"\n== {label} ==")
    print(f"Rows: {info.get('rows', info.get('all_rows')):,}")
    print(f"Columns: {info['columns']}")
    print(f"Has geometry: {info['has_geometry']}")
    print(f"CRS: {info.get('crs')}")
    print(f"Update label: {update_label}")
    print(f"Quality: {info['quality']}")


def json_default(obj: Any) -> Any:
    if hasattr(obj, "item"):
        return obj.item()
    if isinstance(obj, pd.Timestamp):
        return obj.isoformat()
    raise TypeError(f"Object of type {obj.__class__.__name__} is not JSON serializable")


def main() -> None:
    ensure_dirs()

    barrios_path = download(DATASETS["barrios"])
    if barrios_path is None:
        raise RuntimeError("Barrios boundary dataset is required")
    barrios_gdf, barrios_info = inspect_barrios(barrios_path)

    paths = {
        key: download(DATASETS[key])
        for key in (
            "arbolado_detalle",
            "fuentes",
            "bibliotecas",
            "centros_culturales",
            "polideportivos",
            "aire_estaciones",
            "aire_horario",
            "padron",
            "zonas_verdes",
        )
    }

    arbolado_info = inspect_tree_dataset(paths["arbolado_detalle"], barrios_gdf)
    fuentes_info = inspect_csv_dataset(paths["fuentes"], "fuentes", barrios_gdf)
    bibliotecas_info = inspect_geo_dataset(paths["bibliotecas"], barrios_gdf)
    centros_info = inspect_geo_dataset(paths["centros_culturales"], barrios_gdf)
    polideportivos_info = inspect_geo_dataset(paths["polideportivos"], barrios_gdf)
    aire_estaciones_info = inspect_csv_dataset(paths["aire_estaciones"], "aire_estaciones", barrios_gdf)
    aire_horario_info = inspect_air_zip(paths["aire_horario"])
    padron_info = inspect_csv_dataset(paths["padron"], "padron", barrios_gdf)
    zonas_info = inspect_csv_dataset(paths["zonas_verdes"], "zonas_verdes", barrios_gdf)

    refugios_fallback_rows = (
        bibliotecas_info["rows"] + centros_info["rows"] + polideportivos_info["rows"]
    )
    refugios_fallback_geometry = (
        bibliotecas_info["geometry_rows"] + centros_info["geometry_rows"] + polideportivos_info["geometry_rows"]
    )

    combined_refugios = pd.concat(
        [
            gpd.read_file(paths["bibliotecas"]).assign(tipo_refugio="biblioteca"),
            gpd.read_file(paths["centros_culturales"]).assign(tipo_refugio="centro_cultural"),
            gpd.read_file(paths["polideportivos"]).assign(tipo_refugio="polideportivo"),
        ],
        ignore_index=True,
    )
    gpd.GeoDataFrame(combined_refugios, geometry="geometry", crs="EPSG:4326").to_file(
        PROCESSED_DIR / "refugios_sustitutos.geojson",
        driver="GeoJSON",
    )

    inventory = {
        "fecha_validacion": pd.Timestamp.now(tz="UTC").isoformat(),
        "dataset_urls": {
            "arbolado_viario": DATASETS["arbolado_detalle"].url,
            "arbolado_parques": DATASETS["arbolado_detalle"].url,
            "zonas_verdes": DATASETS["zonas_verdes"].url,
            "refugios_climaticos": None,
            "refugios_sustitutos": {
                "bibliotecas": DATASETS["bibliotecas"].url,
                "centros_culturales": DATASETS["centros_culturales"].url,
                "polideportivos": DATASETS["polideportivos"].url,
            },
            "fuentes": DATASETS["fuentes"].url,
            "calidad_aire_historico": DATASETS["aire_horario"].url,
            "calidad_aire_estaciones": DATASETS["aire_estaciones"].url,
            "padron_edad": DATASETS["padron"].url,
            "barrios": DATASETS["barrios"].url,
            "itinerarios_peatonales_accesibles": None,
        },
        "inventory_rows": [
            {
                "dataset": "Arbolado viario",
                "encontrado": "si",
                "filas": arbolado_info["viario_rows"],
                "tiene_geometria": "si",
                "crs": arbolado_info["crs"],
                "calidad": arbolado_info["quality"],
            },
            {
                "dataset": "Arbolado parques",
                "encontrado": "si",
                "filas": arbolado_info["parques_rows"],
                "tiene_geometria": "si",
                "crs": arbolado_info["crs"],
                "calidad": arbolado_info["quality"],
            },
            {
                "dataset": "Zonas verdes superficies",
                "encontrado": "si",
                "filas": zonas_info["rows"],
                "tiene_geometria": "no",
                "crs": "-",
                "calidad": zonas_info["quality"],
            },
            {
                "dataset": "Refugios climaticos",
                "encontrado": "no (sustituto si)",
                "filas": refugios_fallback_rows,
                "tiene_geometria": "si",
                "crs": "EPSG:4326",
                "calidad": (
                    "Sin dataset propio; sustitucion operativa con "
                    "bibliotecas + centros culturales + polideportivos"
                ),
            },
            {
                "dataset": "Fuentes de agua",
                "encontrado": "si",
                "filas": fuentes_info["rows"],
                "tiene_geometria": "si",
                "crs": fuentes_info["crs"],
                "calidad": fuentes_info["quality"],
            },
            {
                "dataset": "Calidad del aire",
                "encontrado": "si",
                "filas": aire_estaciones_info["rows"],
                "tiene_geometria": "si",
                "crs": aire_estaciones_info["crs"],
                "calidad": (
                    f"{aire_estaciones_info['rows']} estaciones; "
                    f"{aire_horario_info['rows']} CSV mensuales 2024"
                ),
            },
            {
                "dataset": "Padron por edad",
                "encontrado": "si",
                "filas": padron_info["rows"],
                "tiene_geometria": "no",
                "crs": "-",
                "calidad": padron_info["quality"],
            },
            {
                "dataset": "Itinerarios accesibles",
                "encontrado": "no",
                "filas": 0,
                "tiene_geometria": "no",
                "crs": "-",
                "calidad": DATASETS["itinerarios"].notes,
            },
        ],
        "spatial_feasibility": [
            {
                "dataset": "Arbolado viario",
                "has_geometry": True,
                "crs": arbolado_info["crs"],
                "bbox_ok": arbolado_info["bbox_ok"],
                "joinable_to_barrio": arbolado_info["joinable_to_barrio"],
            },
            {
                "dataset": "Refugios sustitutos",
                "has_geometry": True,
                "crs": "EPSG:4326",
                "bbox_ok": bibliotecas_info["bbox_ok"] and centros_info["bbox_ok"] and polideportivos_info["bbox_ok"],
                "joinable_to_barrio": (
                    bibliotecas_info["joinable_to_barrio"]
                    and centros_info["joinable_to_barrio"]
                    and polideportivos_info["joinable_to_barrio"]
                ),
            },
            {
                "dataset": "Fuentes de agua",
                "has_geometry": fuentes_info["has_geometry"],
                "crs": fuentes_info["crs"],
                "bbox_ok": fuentes_info["bbox_ok"],
                "joinable_to_barrio": fuentes_info["joinable_to_barrio"],
            },
            {
                "dataset": "Calidad del aire estaciones",
                "has_geometry": aire_estaciones_info["has_geometry"],
                "crs": aire_estaciones_info["crs"],
                "bbox_ok": aire_estaciones_info["bbox_ok"],
                "joinable_to_barrio": aire_estaciones_info["joinable_to_barrio"],
            },
            {
                "dataset": "Barrios",
                "has_geometry": barrios_info["has_geometry"],
                "crs": barrios_info["crs"],
                "bbox_ok": barrios_info["bbox_ok"],
                "joinable_to_barrio": barrios_info["joinable_to_barrio"],
            },
            {
                "dataset": "Itinerarios accesibles",
                "has_geometry": False,
                "crs": None,
                "bbox_ok": False,
                "joinable_to_barrio": False,
            },
        ],
        "derived": {
            "arbolado_total_rows": arbolado_info["all_rows"],
            "arbolado_viario_rows": arbolado_info["viario_rows"],
            "arbolado_parques_rows": arbolado_info["parques_rows"],
            "arbolado_coords_ratio": arbolado_info["coords_ratio"],
            "refugios_exactos_encontrados": 0,
            "refugios_sustitutos_con_coords": refugios_fallback_geometry,
            "aire_estaciones_con_coords": aire_estaciones_info["geometry_rows"],
            "datasets_geometria_compatible": sum(
                1
                for row in [
                    {"has_geometry": True, "joinable": arbolado_info["joinable_to_barrio"]},
                    {"has_geometry": True, "joinable": bibliotecas_info["joinable_to_barrio"]},
                    {"has_geometry": True, "joinable": centros_info["joinable_to_barrio"]},
                    {"has_geometry": True, "joinable": polideportivos_info["joinable_to_barrio"]},
                    {"has_geometry": fuentes_info["has_geometry"], "joinable": fuentes_info["joinable_to_barrio"]},
                    {"has_geometry": aire_estaciones_info["has_geometry"], "joinable": aire_estaciones_info["joinable_to_barrio"]},
                ]
                if row["has_geometry"] and row["joinable"]
            ),
        },
    }

    INVENTORY_PATH.write_text(
        json.dumps(inventory, ensure_ascii=False, indent=2, default=json_default),
        encoding="utf-8",
    )

    print_dataset_summary("Arbolado detalle", arbolado_info, DATASETS["arbolado_detalle"].update_label)
    print_dataset_summary("Fuentes", fuentes_info, DATASETS["fuentes"].update_label)
    print_dataset_summary("Bibliotecas", bibliotecas_info, DATASETS["bibliotecas"].update_label)
    print_dataset_summary("Centros culturales", centros_info, DATASETS["centros_culturales"].update_label)
    print_dataset_summary("Polideportivos", polideportivos_info, DATASETS["polideportivos"].update_label)
    print_dataset_summary("Aire estaciones", aire_estaciones_info, DATASETS["aire_estaciones"].update_label)
    print_dataset_summary("Padron", padron_info, DATASETS["padron"].update_label)
    print_dataset_summary("Zonas verdes", zonas_info, DATASETS["zonas_verdes"].update_label)

    print("\nSpatial feasibility table")
    print("Dataset | Has geometry | CRS | Madrid bbox | Joinable to barrio")
    for row in inventory["spatial_feasibility"]:
        print(
            f"{row['dataset']} | "
            f"{'YES' if row['has_geometry'] else 'NO'} | "
            f"{row['crs']} | "
            f"{'YES' if row['bbox_ok'] else 'NO'} | "
            f"{'YES' if row['joinable_to_barrio'] else 'NO'}"
        )

    print(f"\nInventory written to {INVENTORY_PATH}")


if __name__ == "__main__":
    main()
