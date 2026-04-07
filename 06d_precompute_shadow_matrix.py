import json
import geopandas as gpd
import pandas as pd
import osmnx as ox
import networkx as nx
from datetime import datetime
from pathlib import Path
from shapely.geometry import box

from importlib.machinery import SourceFileLoader
generate_shadows = SourceFileLoader("shadow_engine", "06b_shadow_engine.py").load_module().generate_shadows
calculate_shadow_fractions = SourceFileLoader("shadow_inter", "06c_shadow_edge_intersection.py").load_module().calculate_shadow_fractions

DATA_DIR = Path("data")
PROCESSED_DIR = DATA_DIR / "processed"

def main():
    print("Cargando grafo...")
    graph_path = PROCESSED_DIR / "madrid_walk_graph.graphml"
    if not graph_path.exists():
        print(f"Grafo no encontrado en {graph_path}. Asegúrate de ejecutar los scripts previos.")
        return
    graph = ox.load_graphml(graph_path)
    
    # Extraer bounding box del grafo
    nodes_df, edges_df = ox.graph_to_gdfs(graph)
    minx, miny, maxx, maxy = edges_df.total_bounds
    
    # Buffer de 200m
    bbox_geom = box(minx - 200, miny - 200, maxx + 200, maxy + 200)
    
    print("Cargando edificios...")
    edificios = gpd.read_file(PROCESSED_DIR / "edificios_alturas.geojson", bbox=bbox_geom)
    
    if len(edificios) == 0:
        print("No se encontraron edificios en el bbox del grafo.")
        return
        
    # Simplificar geometrías para acelerar pybdshadow
    edificios["geometry"] = edificios.geometry.simplify(1.0)
    
    print(f"{len(edificios)} edificios encontrados en la zona de interés.")
    
    # Estructura para recolectar datos
    # edge_id -> { 'h08': val, 'h09': val, ... }
    matrix_data = { (u, v, key): {} for u, v, key in graph.edges(keys=True) }
    
    # Horas a simular (8:00 a 20:00)
    hours = list(range(8, 21))
    
    for h in hours:
        dt = datetime(2025, 7, 15, h, 0)
        print(f"=== Procesando hora {h:02d}:00 ===")
        shadows = generate_shadows(edificios, dt)
        print(f"Sombras generadas: {len(shadows)} polígonos.")
        
        fractions = calculate_shadow_fractions(shadows, graph)
        
        for edge_tuple, frac in fractions.items():
            matrix_data[edge_tuple][f"h{h:02d}"] = frac
            
    # Convertir a DataFrame
    records = []
    for (u, v, key), hour_data in matrix_data.items():
        row = {'u': u, 'v': v, 'key': key}
        row.update(hour_data)
        records.append(row)
        
    df = pd.DataFrame(records)
    
    print("Guardando matriz...")
    df.to_parquet(PROCESSED_DIR / "shadow_matrix.parquet", engine="pyarrow")
    
    print("Guardando summary...")
    summary = {
        "reference_date": "2025-07-15",
        "hours": [f"h{h:02d}" for h in hours],
        "num_edges": len(graph.edges),
        "num_buildings_used": len(edificios)
    }
    with open(PROCESSED_DIR / "shadow_summary.json", "w") as f:
        json.dump(summary, f, indent=2)
        
    print("Precalculo completado.")

if __name__ == "__main__":
    main()