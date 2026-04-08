import osmnx as ox
import networkx as nx

G = ox.load_graphml('data/processed/madrid_shadow_graph.graphml')
u, v = list(G.edges())[0]

def test_weight(u, v, d):
    print(f"DEBUG d: {d}")
    return 1.0

nx.shortest_path(G, u, v, weight=test_weight)
