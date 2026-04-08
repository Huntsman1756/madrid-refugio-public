import gzip
import shutil
import os

input_file = 'data/processed/madrid_shadow_graph.graphml'
output_file = 'data/processed/madrid_shadow_graph.graphml.gz'

print(f"Compressing {input_file}...")
with open(input_file, 'rb') as f_in:
    with gzip.open(output_file, 'wb') as f_out:
        shutil.copyfileobj(f_in, f_out)

orig_size = os.path.getsize(input_file) / (1024 * 1024)
comp_size = os.path.getsize(output_file) / (1024 * 1024)

print(f"Original: {orig_size:.2f} MB")
print(f"Compressed: {comp_size:.2f} MB")
