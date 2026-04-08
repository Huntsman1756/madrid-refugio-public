import osmnx as ox
import networkx as nx
import pandas as pd
from pyproj import Transformer

G = ox.load_graphml('data/processed/madrid_shadow_graph.graphml')
for u, v, key, data in G.edges(keys=True, data=True):
    data["key"] = key
    data["length"] = float(data.get("length", 0.0) or 0.0)

transformer = Transformer.from_crs("EPSG:4326", "EPSG:25830", always_xy=True)
lat1, lon1 = 40.4460, -3.6933 
lat2, lon2 = 40.46597, -3.69038
x1, y1 = transformer.transform(lon1, lat1)
x2, y2 = transformer.transform(lon2, lat2)
orig = ox.distance.nearest_nodes(G, x1, y1)
dest = ox.distance.nearest_nodes(G, x2, y2)

path_std = nx.shortest_path(G, orig, dest, weight="length")
path_pref0 = nx.shortest_path(G, orig, dest, weight=lambda u,v,d: d['length'])

print(f"Path lengths: std={len(path_std)}, pref0={len(path_pref0)}")
print(f"Paths identical? {path_std == path_pref0}")

if path_std != path_pref0:
    for i, (n1, n2) in enumerate(zip(path_std, path_pref0)):
        if n1 != n2:
            print(f"First difference at index {i}: {n1} vs {n2}")
            break
