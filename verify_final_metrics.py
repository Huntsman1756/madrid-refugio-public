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

def get_real_metrics(origin_latlon, dest_latlon, pref=1.0):
    x1, y1 = transformer.transform(origin_latlon[1], origin_latlon[0])
    x2, y2 = transformer.transform(dest_latlon[1], dest_latlon[0])
    orig = ox.distance.nearest_nodes(G, x1, y1)
    dest = ox.distance.nearest_nodes(G, x2, y2)

    def get_dynamic_weight(u, v, d):
        weights = []
        for key, data in d.items():
            t_shade = float(data.get("shade_score", 0.0))
            b_shade = 0.0
            if (u, v, key) in shadow_dict:
                b_shade = float(shadow_dict[(u, v, key)].get(hour_col, 0.0))
            combined_shade = max(t_shade, b_shade)
            shadow_factor = 1.0 - (combined_shade * 0.8 * pref)
            weights.append(float(data.get("length", 1.0)) * max(shadow_factor, 0.1))
        return min(weights)

    route_std = nx.shortest_path(G, orig, dest, weight="length")
    route_eco = nx.shortest_path(G, orig, dest, weight=get_dynamic_weight)

    def calc_metrics(route):
        length = 0.0
        shade = 0.0
        for u, v in zip(route[:-1], route[1:]):
            edge_data_dict = G.get_edge_data(u, v)
            key, edge_data = min(edge_data_dict.items(), key=lambda x: x[1]['length'])
            l = edge_data['length']
            s = 0.0
            if (u, v, key) in shadow_dict:
                s = shadow_dict[(u, v, key)].get(hour_col, 0.0)
            length += l
            shade += l * s
        return length, shade

    l_std, s_std = calc_metrics(route_std)
    l_eco, s_eco = calc_metrics(route_eco)
    return l_std, s_std, l_eco, s_eco

# Moncloa and Chamberí typical Nominatim geocodes (approx)
# Moncloa: 40.43547, -3.71894
# Chamberí: 40.4362, -3.7032
res = get_real_metrics((40.43547, -3.71894), (40.4362, -3.7032))
print(f"Shortest: {res[0]:.1f}m, Shade: {res[1]:.1f}m")
print(f"Eco:      {res[2]:.1f}m, Shade: {res[3]:.1f}m")
print(f"Diff:     {res[2]-res[0]:.1f}m")
print(f"Mult:     {res[3]/res[1]:.1f}x")
