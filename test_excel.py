import pandas as pd
import time

file = 'data/raw/arbolado_detalle.xlsx'
print(f"Opening {file}...")
try:
    t0 = time.time()
    # Read only first few rows to test
    df = pd.read_excel(file, nrows=10)
    print(f"Success! Read {len(df)} rows in {time.time()-t0:.1f}s")
    print(f"Columns: {df.columns.tolist()}")
except Exception as e:
    print(f"Error reading Excel: {e}")
