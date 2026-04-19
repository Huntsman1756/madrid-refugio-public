from __future__ import annotations

import os
from pathlib import Path

from build_madrid_search_index import (
    DEFAULT_META_OUTPUT_PATH,
    DEFAULT_MUNICIPAL_CSV_PATH,
    DEFAULT_OUTPUT_PATH,
    download_official_street_csv,
    build_search_index_files,
)


def ensure_search_data() -> None:
    processed_dir = Path(os.getenv("DATA_DIR", str(DEFAULT_OUTPUT_PATH.parent)))
    csv_path = processed_dir / DEFAULT_MUNICIPAL_CSV_PATH.name
    index_path = processed_dir / DEFAULT_OUTPUT_PATH.name
    meta_path = processed_dir / DEFAULT_META_OUTPUT_PATH.name

    if not csv_path.exists():
        print(f"Downloading official Madrid street CSV to {csv_path}...")
        download_official_street_csv(csv_path)

    if not index_path.exists() or not meta_path.exists():
        print("Building Madrid search index before startup...")
        build_search_index_files(
            csv_path=csv_path,
            output_path=index_path,
            meta_output_path=meta_path,
        )


if __name__ == "__main__":
    ensure_search_data()
