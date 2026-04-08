import os
import osmnx as ox

print(f"GraphML size: {os.path.getsize('data/processed/madrid_shadow_graph.graphml') / (1024*1024):.2f} MB")
print(f"Parquet size: {os.path.getsize('data/processed/shadow_matrix.parquet') / (1024*1024):.2f} MB")

G = ox.load_graphml('data/processed/madrid_shadow_graph.graphml')
print(f'Nodos: {G.number_of_nodes()}')
print(f'Aristas: {G.number_of_edges()}')
edges = ox.graph_to_gdfs(G, nodes=False)
print(f'Columna shadow_weight existe: {"shadow_weight" in edges.columns}')
if "shadow_weight" in edges.columns:
    print(f'Shadow weight medio: {edges["shadow_weight"].mean():.4f}')
