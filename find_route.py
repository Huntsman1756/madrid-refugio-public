import osmnx as ox
import networkx as nx
import pandas as pd
from pyproj import Transformer
from shapely.geometry import Point

# Load data
print("Loading graph and matrix...")
G = ox.load_graphml('data/processed/madrid_shadow_graph.graphml')
shadow_df = pd.read_parquet('data/processed/shadow_matrix.parquet')
shadow_dict = shadow_df.set_index(["u", "v", "key"]).to_dict("index")

transformer = Transformer.from_crs("EPSG:4326", "EPSG:25830", always_xy=True)
hour_col = "h14"

def get_shadow_score(u, v, d):
    t_shade = float(d.get("shade_score", 0.0))
    b_shade = 0.0
    key = d.get("key", 0)
    if (u, v, key) in shadow_dict:
        b_shade = float(shadow_dict[(u, v, key)].get(hour_col, 0.0))
    return max(t_shade, b_shade)

# Formula 1: The current highly aggressive one
def weight_aggressive(u, v, d):
    shade = get_shadow_score(u, v, d)
    return float(d.get("length", 1.0)) / (shade + 0.001)

# Formula 2: Balanced (max shade reduces cost by 50%)
def weight_balanced(u, v, d):
    shade = get_shadow_score(u, v, d)
    shadow_factor = 1.0 - (shade * 0.5)
    return float(d.get("length", 1.0)) * shadow_factor

# Formula 3: Strong but controlled (max shade = 0.2x cost)
def weight_strong(u, v, d):
    shade = get_shadow_score(u, v, d)
    shadow_factor = 1.0 - (shade * 0.8)
    return float(d.get("length", 1.0)) * max(shadow_factor, 0.1)

# Formula 4: Even stronger but controlled (max shade = 0.1x cost)
def weight_very_strong(u, v, d):
    shade = get_shadow_score(u, v, d)
    shadow_factor = 1.0 - (shade * 0.9)
    return float(d.get("length", 1.0)) * max(shadow_factor, 0.05)

def calc_metrics(route):
    dist = 0.0
    shade_dist = 0.0
    for u, v in zip(route[:-1], route[1:]):
        edge_data = min(G.get_edge_data(u, v).values(), key=lambda x: float(x.get("length", float("inf"))))
        length = float(edge_data.get("length", 0.0))
        shade = get_shadow_score(u, v, edge_data)
        dist += length
        shade_dist += length * shade
    return dist, shade_dist

p1 = {"name": "Nuevos Ministerios", "lat": 40.4460, "lon": -3.6933}
p2 = {"name": "Plaza Castilla", "lat": 40.4655, "lon": -3.6883}

x1, y1 = transformer.transform(p1["lon"], p1["lat"])
x2, y2 = transformer.transform(p2["lon"], p2["lat"])

orig = ox.distance.nearest_nodes(G, x1, y1)
dest = ox.distance.nearest_nodes(G, x2, y2)

ruta_std = nx.shortest_path(G, orig, dest, weight='length')
dist_std, sombra_std = calc_metrics(ruta_std)

print(f"Ruta Estándar:")
print(f"  Distancia: {dist_std:.0f}m")
print(f"  Sombra: {sombra_std:.1f}m\n")

formulas = {
    "Aggressive (current)": weight_aggressive,
    "Balanced (0.5x)": weight_balanced,
    "Strong (0.8x)": weight_strong,
    "Very Strong (0.9x)": weight_very_strong
}

for name, func in formulas.items():
    ruta_eco = nx.shortest_path(G, orig, dest, weight=func)
    dist_eco, sombra_eco = calc_metrics(ruta_eco)
    dist_ratio = dist_eco / dist_std
    shade_mult = sombra_eco / sombra_std if sombra_std > 0 else float('inf')
    
    print(f"--- {name} ---")
    print(f"  Distancia Confort: {dist_eco:.0f}m (Ratio: {dist_ratio:.2f}x)")
    print(f"  Sombra Confort: {sombra_eco:.1f}m (Mult: {shade_mult:.1f}x)\n")
