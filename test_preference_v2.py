import osmnx as ox
import networkx as nx
import pandas as pd
from pyproj import Transformer

# Load data
G = ox.load_graphml('data/processed/madrid_shadow_graph.graphml')
shadow_df = pd.read_parquet('data/processed/shadow_matrix.parquet')
shadow_dict = shadow_df.set_index(["u", "v", "key"]).to_dict("index")
transformer = Transformer.from_crs("EPSG:4326", "EPSG:25830", always_xy=True)
hour_col = "h14"

lat1, lon1 = 40.4460, -3.6933 # Nuevos Ministerios
lat2, lon2 = 40.46597, -3.69038 # Plaza Castilla
x1, y1 = transformer.transform(lon1, lat1)
x2, y2 = transformer.transform(lon2, lat2)
orig = ox.distance.nearest_nodes(G, x1, y1)
dest = ox.distance.nearest_nodes(G, x2, y2)

def get_weight(u, v, d, pref):
    t_shade = float(d.get("shade_score", 0.0))
    b_shade = 0.0
    edge_dict = G.get_edge_data(u, v)
    key, _ = min(edge_dict.items(), key=lambda item: float(item[1].get("length", float("inf"))))
    if (u, v, key) in shadow_dict:
        b_shade = float(shadow_dict[(u, v, key)].get(hour_col, 0.0))
    combined_shade = max(t_shade, b_shade)
    shadow_factor = 1.0 - (combined_shade * 0.8 * pref)
    return float(d.get("length", 1.0)) * max(shadow_factor, 0.1)

path_std = nx.shortest_path(G, orig, dest, weight="length")
path_pref0 = nx.shortest_path(G, orig, dest, weight=lambda u,v,d: get_weight(u,v,d,0.0))
path_pref1 = nx.shortest_path(G, orig, dest, weight=lambda u,v,d: get_weight(u,v,d,1.0))

def dist(path):
    d = 0.0
    for u, v in zip(path[:-1], path[1:]):
        d += min(G.get_edge_data(u, v).values(), key=lambda x: x['length'])['length']
    return d

print(f"Distance (weight='length'): {dist(path_std):.1f}m")
print(f"Distance (pref=0.0):        {dist(path_pref0):.1f}m")
print(f"Distance (pref=1.0):        {dist(path_pref1):.1f}m")
