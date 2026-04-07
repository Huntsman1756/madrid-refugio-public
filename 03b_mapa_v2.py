from __future__ import annotations

from pathlib import Path

import branca.colormap as bcm
import folium
import geopandas as gpd
import numpy as np
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent
RAW_DIR = BASE_DIR / "data" / "raw"
PROCESSED_DIR = BASE_DIR / "data" / "processed"
OUTPUT_DIR = BASE_DIR / "output"
COMFORT_V2_PATH = PROCESSED_DIR / "barrio_comfort_v2.csv"
MAP_PATH = OUTPUT_DIR / "mapa_vulnerabilidad_v2.html"


def qcut_safe(values: pd.Series, labels: list[str]) -> pd.Series:
    ranked = values.rank(method="first")
    return pd.qcut(ranked, q=min(len(labels), ranked.nunique()), labels=labels[: min(len(labels), ranked.nunique())])


def main() -> None:
    barrios = gpd.read_file(RAW_DIR / "barrios.zip").to_crs(4326)
    coddis = barrios["CODDIS"].astype(int)
    cod_bar = barrios["COD_BAR"].astype(int)
    barrios["barrio_key"] = coddis * 100 + (cod_bar - coddis * 10)

    comfort = pd.read_csv(COMFORT_V2_PATH)
    refugios = gpd.read_file(PROCESSED_DIR / "refugios_sustitutos.geojson").to_crs(4326)
    fuentes = gpd.read_file(PROCESSED_DIR / "fuentes.geojson").to_crs(4326)

    merged = barrios.merge(comfort, on="barrio_key", how="left")
    merged["vulnerability_index"] = merged["vulnerability_index"].fillna(0.0)
    merged["no2_medio"] = merged["no2_medio"].fillna(merged["no2_medio"].median())

    vuln_colors = ["#1a9850", "#91cf60", "#fee08b", "#fc8d59", "#b30000"]
    vuln_labels = ["Q1 mejor", "Q2", "Q3", "Q4", "Q5 peor"]
    merged["vulnerability_quintile"] = qcut_safe(merged["vulnerability_index"], vuln_labels).astype(str)
    vulnerability_palette = dict(zip(vuln_labels, vuln_colors))
    vulnerability_colormap = bcm.StepColormap(
        colors=vuln_colors,
        index=[0.0, 0.2, 0.4, 0.6, 0.8, 1.0],
        vmin=0.0,
        vmax=1.0,
        caption="Indice de vulnerabilidad compuesta (0 mejor, 1 peor)",
    )

    no2_colormap = bcm.LinearColormap(
        colors=["#deebf7", "#9ecae1", "#3182bd", "#08519c"],
        vmin=float(merged["no2_medio"].min()),
        vmax=float(merged["no2_medio"].max()),
        caption="NO2 medio estimado por barrio (ug/m3)",
    )

    tooltip = folium.GeoJsonTooltip(
        fields=[
            "NOMBRE",
            "pop_65plus",
            "refugios_300m",
            "refugios_400m",
            "no2_medio",
            "vulnerability_index",
        ],
        aliases=[
            "Barrio",
            "Mayores de 65",
            "Refugios 300m",
            "Refugios 400m",
            "NO2 medio",
            "Vulnerability index",
        ],
        localize=True,
        labels=True,
        sticky=False,
    )

    m = folium.Map(location=[40.4168, -3.7038], zoom_start=11, tiles="CartoDB positron")

    vulnerability_fg = folium.FeatureGroup(name="Indice de vulnerabilidad", show=True)
    folium.GeoJson(
        merged,
        name="Indice de vulnerabilidad",
        style_function=lambda feature: {
            "fillColor": vulnerability_palette.get(feature["properties"].get("vulnerability_quintile"), "#cccccc"),
            "color": "#374151",
            "weight": 0.7,
            "fillOpacity": 0.75,
        },
        tooltip=tooltip,
    ).add_to(vulnerability_fg)
    vulnerability_fg.add_to(m)

    refugios_fg = folium.FeatureGroup(name="Cobertura refugios 400m", show=False)

    def refugio_fill(value: float | int | None) -> str:
        if value is None:
            return "#cccccc"
        if value <= 0:
            return "#b30000"
        if value == 1:
            return "#f97316"
        return "#1a9850"

    folium.GeoJson(
        merged,
        name="Cobertura refugios 400m",
        style_function=lambda feature: {
            "fillColor": refugio_fill(feature["properties"].get("refugios_400m")),
            "color": "#4b5563",
            "weight": 0.7,
            "fillOpacity": 0.65,
        },
        tooltip=tooltip,
    ).add_to(refugios_fg)
    refugios_fg.add_to(m)

    no2_fg = folium.FeatureGroup(name="NO2 medio por barrio", show=False)
    folium.GeoJson(
        merged,
        name="NO2 medio por barrio",
        style_function=lambda feature: {
            "fillColor": no2_colormap(feature["properties"].get("no2_medio")),
            "color": "#4b5563",
            "weight": 0.7,
            "fillOpacity": 0.65,
        },
        tooltip=tooltip,
    ).add_to(no2_fg)
    no2_fg.add_to(m)

    refugio_markers = folium.FeatureGroup(name="Refugios sustitutos", show=True)
    for row in refugios.itertuples():
        title = getattr(row, "title", getattr(row, "nombre", "Refugio sustituto"))
        category = getattr(row, "tipo_refugio", "refugio")
        folium.CircleMarker(
            location=[row.geometry.y, row.geometry.x],
            radius=4,
            color="#1d4ed8",
            fill=True,
            fill_opacity=0.9,
            popup=f"{title} ({category})",
        ).add_to(refugio_markers)
    refugio_markers.add_to(m)

    fuentes_fg = folium.FeatureGroup(name="Fuentes de agua (1 de cada 5)", show=False)
    sampled_fuentes = fuentes.iloc[::5].copy()
    for row in sampled_fuentes.itertuples():
        label = getattr(row, "UBICACION", getattr(row, "NOMBRE", "Fuente"))
        folium.CircleMarker(
            location=[row.geometry.y, row.geometry.x],
            radius=2,
            color="#0ea5e9",
            fill=True,
            fill_opacity=0.55,
            popup=str(label),
        ).add_to(fuentes_fg)
    fuentes_fg.add_to(m)

    title_html = """
    <h3 align="center" style="font-size:16px"><b>Deficit de cobertura de refugios climaticos por barrio - Madrid 2026</b></h3>
    """
    m.get_root().html.add_child(folium.Element(title_html))
    vulnerability_colormap.add_to(m)
    no2_colormap.add_to(m)
    folium.LayerControl(collapsed=False).add_to(m)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    m.save(MAP_PATH)

    zero_300 = int((comfort["refugios_300m"] == 0).sum())
    zero_400 = int((comfort["refugios_400m"] == 0).sum())
    downgraded = int(((comfort["refugios_400m"] > 0) & (comfort["refugios_300m"] == 0)).sum())
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

    print(f"Mapa guardado en: {MAP_PATH}")
    print(f"Barrios sin refugios a 300m: {zero_300}")
    print(f"Barrios sin refugios a 400m: {zero_400}")
    print(f"Barrios que caen a cero al pasar de 400m a 300m: {downgraded}")
    print("\nTop 10 barrios mas criticos")
    print(top10.to_string(index=False))


if __name__ == "__main__":
    main()
