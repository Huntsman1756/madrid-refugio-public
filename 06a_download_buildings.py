import os
import requests
import zipfile
import geopandas as gpd
from pathlib import Path

# Paths
DATA_DIR = Path("data")
RAW_DIR = DATA_DIR / "raw" / "alturas_edificios"
PROCESSED_DIR = DATA_DIR / "processed"

RAW_DIR.mkdir(parents=True, exist_ok=True)
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

URL = "https://geoportal.madrid.es/fsdescargas/IDEAM_WBGEOPORTAL/CARTOGRAFIA/CARTOGRAFIA_ACTUALIZADA/ALTURAS_EDIFICIOS/ALTURAS_EDIFICIOS.ZIP"
ZIP_PATH = RAW_DIR / "ALTURAS_EDIFICIOS.ZIP"

print("Descargando ALTURAS_EDIFICIOS.ZIP...")
if not ZIP_PATH.exists():
    response = requests.get(URL, stream=True)
    with open(ZIP_PATH, "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    print("Descarga completada.")
else:
    print("El archivo ya existe.")

print("Descomprimiendo...")
with zipfile.ZipFile(ZIP_PATH, 'r') as zip_ref:
    zip_ref.extractall(RAW_DIR)

print("Cargando SHP con geopandas...")
shp_path = list(RAW_DIR.glob("**/*.shp"))[0]
edificios = gpd.read_file(shp_path)

print("Columnas:", edificios.columns.tolist())
print("CRS:", edificios.crs)
print("Número de polígonos:", len(edificios))

# Identificar columna de altura
altura_col = "ALTURA" if "ALTURA" in edificios.columns else None
if not altura_col:
    for col in edificios.columns:
        if "height" in col.lower() or col.lower() == "alt":
            altura_col = col
            break

print(f"Usando la columna '{altura_col}' para la altura.")
print("Rango de alturas:", edificios[altura_col].min(), "-", edificios[altura_col].max())

# Filtrar altura > 0
edificios_filtrados = edificios[edificios[altura_col] > 0].copy()
edificios_filtrados.rename(columns={altura_col: "height"}, inplace=True)

print("Guardando GeoJSON...")
out_path = PROCESSED_DIR / "edificios_alturas.geojson"
# Usamos engine="pyogrio" si es posible, es mas rapido. Pero driver="GeoJSON" por defecto.
edificios_filtrados.to_file(out_path, driver="GeoJSON")
print(f"Guardado en {out_path}. Total edificios: {len(edificios_filtrados)}")
