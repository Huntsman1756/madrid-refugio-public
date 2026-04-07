import geopandas as gpd
import networkx as nx
from shapely.geometry import LineString
from shapely.ops import unary_union
import osmnx as ox

def calculate_shadow_fractions(shadows, graph):
    """
    shadows: GeoDataFrame of shadow polygons in EPSG:25830
    graph: MultiDiGraph in EPSG:25830
    Returns dict: { (u, v, key): shadow_fraction }
    """
    shadow_fractions = {}
    
    if shadows.empty:
        for u, v, key, data in graph.edges(keys=True, data=True):
            shadow_fractions[(u, v, key)] = 0.0
        return shadow_fractions

    # Create unary union of all shadows. 
    # Use unary_union to merge overlapping shadows
    print("Uniting shadow polygons...")
    # Buffer 0 can help fix invalid geometries
    valid_shadows = shadows.geometry.buffer(0)
    shadow_union = unary_union(valid_shadows)
    
    print("Intersecting with graph edges...")
    for u, v, key, data in graph.edges(keys=True, data=True):
        if "geometry" in data:
            geom = data["geometry"]
        else:
            # If no geometry, create straight line
            point_u = (graph.nodes[u]['x'], graph.nodes[u]['y'])
            point_v = (graph.nodes[v]['x'], graph.nodes[v]['y'])
            geom = LineString([point_u, point_v])
            
        geom_length = geom.length
        if geom_length == 0:
            shadow_fractions[(u, v, key)] = 0.0
            continue
            
        # Intersect with the giant shadow polygon
        try:
            intersection = geom.intersection(shadow_union)
            shadow_fraction = intersection.length / geom_length
            # Clamp between 0 and 1
            shadow_fraction = max(0.0, min(1.0, shadow_fraction))
        except Exception as e:
            # Fallback if intersection fails (e.g., topological error)
            print(f"Intersection failed for edge {u}-{v}: {e}")
            shadow_fraction = 0.0
            
        shadow_fractions[(u, v, key)] = shadow_fraction
        
    return shadow_fractions