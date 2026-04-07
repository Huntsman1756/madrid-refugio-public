import pybdshadow
import geopandas as gpd
from datetime import datetime

def generate_shadows(edificios, dt, precision=1.0):
    """
    edificios: GeoDataFrame in EPSG:25830
    dt: datetime object for solar position
    """
    # pybdshadow requires EPSG:4326 and 'height' column
    edificios_4326 = edificios.to_crs(4326)
    edificios_4326['building_id'] = range(len(edificios_4326))
    
    # Generate shadows
    shadows = pybdshadow.bdshadow_sunlight(
        edificios_4326, 
        date=dt
    )
    
    # Reproject back to EPSG:25830
    if not shadows.empty:
        if shadows.crs is None:
            shadows.set_crs(4326, inplace=True)
            
        from shapely.geometry import Polygon, MultiPolygon
        def close_rings(geom):
            if geom is None:
                return None
            if isinstance(geom, Polygon):
                coords = list(geom.exterior.coords)
                if coords and coords[0] != coords[-1]:
                    coords.append(coords[0])
                # We ignore interiors for shadow polygons as they usually don't matter or don't exist
                return Polygon(coords)
            elif isinstance(geom, MultiPolygon):
                return MultiPolygon([close_rings(p) for p in geom.geoms if p is not None])
            return geom
            
        shadows.geometry = shadows.geometry.apply(close_rings)
        
        # Try make_valid to fix any remaining self-intersections
        from shapely.validation import make_valid
        shadows.geometry = shadows.geometry.apply(make_valid)
        
        shadows_utm = shadows.to_crs(25830)
        return shadows_utm
    return gpd.GeoDataFrame(geometry=[], crs=25830)

if __name__ == "__main__":
    # Test script for Phase 1
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--hour", type=int, default=14)
    parser.add_argument("--output", type=str, default="test_shadow.geojson")
    args = parser.parse_args()

    print(f"Testing shadow generation for hour {args.hour}...")
    edificios = gpd.read_file("data/processed/edificios_alturas.geojson")
    
    # Take a small subset for testing
    bbox = edificios.total_bounds
    # Simplification: just take 1000 buildings for quick test
    edificios_subset = edificios.head(1000)
    
    dt = datetime(2025, 7, 15, args.hour, 0)
    shadows = generate_shadows(edificios_subset, dt)
    
    if not shadows.empty:
        shadows.to_file(args.output, driver="GeoJSON")
        print(f"Saved to {args.output}")
    else:
        print("No shadows generated.")