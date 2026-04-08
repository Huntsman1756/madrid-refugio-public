import osmnx as ox
G = ox.load_graphml('data/processed/madrid_shadow_graph.graphml')
data = list(G.edges(data=True))[0][2]
print(f"Type: {type(data.get('length'))}")
print(f"Value: {repr(data.get('length'))}")
