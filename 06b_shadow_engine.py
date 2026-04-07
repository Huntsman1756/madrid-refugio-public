import pybdshadow
import geopandas as gpd
import pandas as pd
from datetime import datetime

def generate_shadows(edificios, dt, precision=1.0):
    """
    edificios: GeoDataFrame in EPSG:25830
    dt: datetime object for solar position
    """
    # pybdshadow requires EPSG:4326 and 'height' column
    edificios_4326 = edificios.to_crs(4326)
    edificios_4326['building_id'] = range(len(edificios_4326))
    
    # Process in chunks to handle pybdshadow internal geometry errors
    CHUNK_SIZE = 5000
    all_shadows = []
    total = len(edificios_4326)
    
    for start in range(0, total, CHUNK_SIZE):
        chunk = edificios_4326.iloc[start:start+CHUNK_SIZE].copy()
        try:
            shadows_chunk = pybdshadow.bdshadow_sunlight(chunk, date=dt)
            if not shadows_chunk.empty:
                all_shadows.append(shadows_chunk)
        except Exception as e:
            print(f"    [WARN] Chunk {start}-{start+len(chunk)} failed: {e}")
            # Try individual buildings in the failed chunk
            for idx in range(len(chunk)):
                try:
                    single = chunk.iloc[[idx]].copy()
                    s = pybdshadow.bdshadow_sunlight(single, date=dt)
                    if not s.empty:
                        all_shadows.append(s)
                except Exception:
                    pass  # Skip this building
    
    if not all_shadows:
        return gpd.GeoDataFrame(geometry=[], crs=25830)
    
    concatenated = pd.concat(all_shadows, ignore_index=True)
    if isinstance(concatenated, gpd.GeoDataFrame):
        shadows = concatenated
        if shadows.crs is None:
            shadows.set_crs(4326, inplace=True)
    else:
        shadows = gpd.GeoDataFrame(concatenated, geometry='geometry', crs=4326)
        
    # Optional: explicitly set to 4326 if they mismatch slightly in string representation
    shadows.set_crs(4326, allow_override=True, inplace=True)
    
    # Reproject back to EPSG:25830
    if not shadows.empty:
        if shadows.crs is None:
            shadows.set_crs(4326, inplace=True)
            
        def safe_buffer(geom):
            try:
                if geom is None or geom.is_empty:
                    return None
                g2 = geom.buffer(0)
                if g2.is_empty: return None
                return g2
            except:
                return None
                
        shadows['geometry'] = shadows.geometry.apply(safe_buffer)
        shadows = shadows.dropna(subset=['geometry'])
        shadows = shadows[shadows.geometry.is_valid & ~shadows.geometry.is_empty].copy()
        
        try:
            shadows_utm = shadows.to_crs(25830)
            shadows_utm['geometry'] = shadows_utm.geometry.apply(safe_buffer)
            shadows_utm = shadows_utm.dropna(subset=['geometry'])
            return shadows_utm
        except Exception as e:
            print(f"    [WARN] to_crs failed: {e}. Recovering valid geometries row-by-row.")
            valid_rows = []
            for _, row in shadows.iterrows():
                try:
                    gdf = gpd.GeoDataFrame([row], crs=4326)
                    gdf_utm = gdf.to_crs(25830)
                    valid_rows.append(gdf_utm)
                except:
                    pass
            if valid_rows:
                return pd.concat(valid_rows, ignore_index=True)
            return gpd.GeoDataFrame(geometry=[], crs=25830)
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