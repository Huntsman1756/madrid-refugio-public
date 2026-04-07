from __future__ import annotations

import json
from pathlib import Path

import branca.colormap as bcm
import folium
import geopandas as gpd
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent
RAW_DIR = BASE_DIR / "data" / "raw"
PROCESSED_DIR = BASE_DIR / "data" / "processed"
OUTPUT_DIR = BASE_DIR / "output"
INVENTORY_PATH = PROCESSED_DIR / "dataset_inventory.json"
GO_NOGO_PATH = BASE_DIR / "go_nogo.md"
GO_NOGO_COPY_PATH = BASE_DIR / "go_nogo_refugio.md"


def load_inventory() -> dict:
    return json.loads(INVENTORY_PATH.read_text(encoding="utf-8"))


def refresh_map_status(top3_lines: list[str]) -> None:
    content = GO_NOGO_PATH.read_text(encoding="utf-8")
    content = content.replace("| Mapa de cobertura generado | si | no | NO-GO |", "| Mapa de cobertura generado | si | si | GO |")
    if "## Top 3 barrios con peor cobertura" in content:
        prefix, _ = content.split("## Top 3 barrios con peor cobertura", 1)
        tail = [
            "## Top 3 barrios con peor cobertura",
            *top3_lines,
            "",
            "## Dato clave para la memoria",
            "Madrid: 31 refugios climaticos = 1 por cada 110.100 habitantes (Greenpeace 2025)",
            "Barcelona: 1 por cada 4.200 habitantes",
            "",
            "## DECISION: GO REFUGIO",
            "",
            "Notas:",
            "- No se ha encontrado dataset propio de refugios climaticos en el portal. El analisis operativo usa bibliotecas + centros culturales + polideportivos como sustituto documentado.",
            "- El criterio no negociable de arbolado viario se ha evaluado sobre el dataset oficial 2025 de arbolado detallado, separando viario mediante NUM_PARQUE nulo.",
        ]
        content = prefix.rstrip() + "\n\n" + "\n".join(tail) + "\n"
    GO_NOGO_PATH.write_text(content, encoding="utf-8")
    GO_NOGO_COPY_PATH.write_text(content, encoding="utf-8")


def main() -> None:
    _inventory = load_inventory()
    barrios = gpd.read_file(RAW_DIR / "barrios.zip").to_crs(4326)
    coddis = barrios["CODDIS"].astype(int)
    cod_bar = barrios["COD_BAR"].astype(int)
    barrios["barrio_key"] = coddis * 100 + (cod_bar - coddis * 10)
    comfort = pd.read_csv(PROCESSED_DIR / "barrio_comfort.csv")
    refugios = gpd.read_file(PROCESSED_DIR / "refugios_sustitutos.geojson").to_crs(4326)
    fuentes = gpd.read_file(PROCESSED_DIR / "fuentes.geojson").to_crs(4326)

    merged = barrios.merge(comfort, on="barrio_key", how="left")
    m = folium.Map(location=[40.4168, -3.7038], zoom_start=11, tiles="CartoDB positron")
    colormap = bcm.LinearColormap(
        ["#b10026", "#fdae61", "#1a9850"],
        vmin=merged["coverage_ratio"].min(),
        vmax=merged["coverage_ratio"].max(),
    )
    colormap.caption = "Cobertura de refugios por barrio"
    colormap.add_to(m)

    def style_function(feature):
        value = feature["properties"].get("coverage_ratio")
        color = "#cccccc" if value is None else colormap(value)
        return {"fillColor": color, "color": "#4b5563", "weight": 0.8, "fillOpacity": 0.65}

    popup = folium.GeoJsonPopup(
        fields=["barrio_nombre", "coverage_ratio", "pop_65plus", "refugios_proximos", "fuentes_proximas", "tree_density", "no2_medio"],
        aliases=["Barrio", "Coverage ratio", "Pop 65+", "Refugios proximos", "Fuentes proximas", "Tree density", "NO2 medio"],
        localize=True,
        labels=True,
    )
    folium.GeoJson(
        merged,
        style_function=style_function,
        popup=popup,
        tooltip=folium.GeoJsonTooltip(fields=["barrio_nombre", "coverage_ratio"], aliases=["Barrio", "Coverage ratio"]),
        name="Cobertura por barrio",
    ).add_to(m)

    for row in refugios.itertuples():
        folium.CircleMarker(
            location=[row.geometry.y, row.geometry.x],
            radius=4,
            color="#1d4ed8",
            fill=True,
            fill_opacity=0.85,
            popup=f"{row.title} ({getattr(row, 'tipo_refugio', 'refugio')})",
        ).add_to(m)

    fuentes_fg = folium.FeatureGroup(name="Fuentes de agua", show=False)
    for row in fuentes.itertuples():
        folium.CircleMarker(
            location=[row.geometry.y, row.geometry.x],
            radius=2,
            color="#0ea5e9",
            fill=True,
            fill_opacity=0.6,
            popup=str(getattr(row, "UBICACION", "Fuente")),
        ).add_to(fuentes_fg)
    fuentes_fg.add_to(m)

    title_html = """
    <h3 align="center" style="font-size:16px"><b>Deficit de cobertura de refugios climaticos por barrio — Madrid 2026</b></h3>
    """
    m.get_root().html.add_child(folium.Element(title_html))
    folium.LayerControl(collapsed=False).add_to(m)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUTPUT_DIR / "mapa_cobertura.html"
    m.save(out_path)

    worst = comfort.nsmallest(1, ["coverage_ratio", "pop_65plus"]).iloc[0]
    best = comfort.nlargest(1, ["coverage_ratio", "refugios_proximos"]).iloc[0]
    refugios_count = len(refugios)
    mayores_total = comfort["pop_65plus"].sum()
    ratio = mayores_total / refugios_count if refugios_count else float("nan")
    print(
        f"Barrio con peor cobertura: {worst['barrio_nombre']} — "
        f"{int(worst['pop_65plus'])} mayores, {int(worst['refugios_proximos'])} refugios en 400m"
    )
    print(f"Barrio con mejor cobertura: {best['barrio_nombre']}")
    print(f"Madrid global: 1 refugio por cada {ratio:,.0f} habitantes mayores de 65")
    print(f"Mapa guardado en: {out_path}")

    top3 = comfort.nsmallest(3, ["coverage_ratio", "pop_65plus"])
    top3_lines = [
        f"- {row.barrio_nombre}: coverage_ratio={row.coverage_ratio:.4f}, pop_65plus={int(row.pop_65plus)}, refugios_proximos={int(row.refugios_proximos)}"
        for row in top3.itertuples()
    ]
    refresh_map_status(top3_lines)


if __name__ == "__main__":
    main()
