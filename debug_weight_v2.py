import osmnx as ox
import networkx as nx

G = ox.load_graphml('data/processed/madrid_shadow_graph.graphml')
u, v = list(G.edges())[0]

def test_weight(u, v, d):
    print(f"DEBUG weight call: u={u}, v={v}, d_type={type(d)}")
    print(f"DEBUG d keys: {list(d.keys())}")
    return 1.0

try:
    nx.shortest_path(G, u, v, weight=test_weight)
except Exception as e:
    print(f"Error: {e}")
