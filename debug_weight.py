import osmnx as ox
import networkx as nx

G = ox.load_graphml('data/processed/madrid_shadow_graph.graphml')
edge = list(G.edges(keys=True, data=True))[0]
u, v, k, d = edge
print(f"Edge keys: {d.keys()}")

def test_weight(u, v, d):
    if 'length' not in d:
        print(f"MISSING length in weight function! Keys: {d.keys()}")
        return 999999.0
    return d['length']

# Try a very short path
orig = u
dest = v
nx.shortest_path(G, orig, dest, weight=test_weight)
