import osmnx as ox
import networkx as nx
import pandas as pd
from pyproj import Transformer

# Load data
print("Loading graph and matrix...")
G = ox.load_graphml('data/processed/madrid_shadow_graph.graphml')
shadow_df = pd.read_parquet('data/processed/shadow_matrix.parquet')
shadow_dict = shadow_df.set_index(["u", "v", "key"]).to_dict("index")

transformer = Transformer.from_crs("EPSG:4326", "EPSG:25830", always_xy=True)
hour_col = "h14"

def calculate_with_pref(pref):
    def get_dynamic_weight(u, v, d):
        t_shade = float(d.get("shade_score", 0.0))
        b_shade = 0.0
        edge_dict = G.get_edge_data(u, v)
        if edge_dict:
            key, _ = min(edge_dict.items(), key=lambda item: float(item[1].get("length", float("inf"))))
        else:
            key = 0

        if (u, v, key) in shadow_dict:
            b_shade = float(shadow_dict[(u, v, key)].get(hour_col, 0.0))
        
        combined_shade = max(t_shade, b_shade)
        shadow_factor = 1.0 - (combined_shade * 0.8 * pref)
        return float(d.get("length", 1.0)) * max(shadow_factor, 0.1)

    lat1, lon1 = 40.4460, -3.6933 # Nuevos Ministerios
    lat2, lon2 = 40.46597, -3.69038 # Plaza Castilla
    
    x1, y1 = transformer.transform(lon1, lat1)
    x2, y2 = transformer.transform(lon2, lat2)
    
    orig = ox.distance.nearest_nodes(G, x1, y1)
    dest = ox.distance.nearest_nodes(G, x2, y2)
    
    route = nx.shortest_path(G, orig, dest, weight=get_dynamic_weight)
    
    total_length = 0.0
    for u, v in zip(route[:-1], route[1:]):
        edge_data = min(G.get_edge_data(u, v).values(), key=lambda item: float(item.get("length", float("inf"))))
        total_length += float(edge_data.get("length", 0.0))
    
    return total_length

print(f"Testing preference impact on route distance...")
dist_0 = calculate_with_pref(0.0)
dist_1 = calculate_with_pref(1.0)
dist_05 = calculate_with_pref(0.5)

print(f"Preference 0.0 (Shortest): {dist_0:.1f} m")
print(f"Preference 0.5 (Balanced): {dist_05:.1f} m")
print(f"Preference 1.0 (Coolest):  {dist_1:.1f} m")

if dist_0 != dist_1:
    print("\nSUCCESS: Routes are different based on preference!")
else:
    print("\nFAILURE: Routes are identical regardless of preference.")
