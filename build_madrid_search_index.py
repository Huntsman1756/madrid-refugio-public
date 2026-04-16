from __future__ import annotations

import argparse
import csv
import gzip
import json
import os
import re
import unicodedata
from pathlib import Path

import requests


BASE_DIR = Path(__file__).resolve().parent
PROCESSED_DIR = Path(os.getenv("DATA_DIR", str(BASE_DIR / "data" / "processed")))
REFERENCE_DIR = BASE_DIR / "data" / "reference"
CURATED_PATH = REFERENCE_DIR / "madrid_search_curated.json"
DEFAULT_OUTPUT_PATH = PROCESSED_DIR / "madrid_search_index.json"
DEFAULT_META_OUTPUT_PATH = PROCESSED_DIR / "madrid_search_index.meta.json"
DEFAULT_MUNICIPAL_CSV_PATH = PROCESSED_DIR / "213605-4-callejero-oficial-madrid-csv.csv"
OFFICIAL_STREET_CSV_URL = "https://datos.madrid.es/dataset/213605-0-callejero-oficial/resource/213605-4-callejero-oficial-madrid-csv/download/213605-4-callejero-oficial-madrid-csv.csv"
DEFAULT_RAW_THRESHOLD_BYTES = 5 * 1024 * 1024
DEFAULT_GZIP_THRESHOLD_BYTES = int(1.5 * 1024 * 1024)

DISTRICT_NAMES = {
    "1": "Centro",
    "2": "Arganzuela",
    "3": "Retiro",
    "4": "Salamanca",
    "5": "Chamartin",
    "6": "Tetuan",
    "7": "Chamberi",
    "8": "Fuencarral-El Pardo",
    "9": "Moncloa-Aravaca",
    "10": "Latina",
    "11": "Carabanchel",
    "12": "Usera",
    "13": "Puente de Vallecas",
    "14": "Moratalaz",
    "15": "Ciudad Lineal",
    "16": "Hortaleza",
    "17": "Villaverde",
    "18": "Villa de Vallecas",
    "19": "Vicalvaro",
    "20": "San Blas-Canillejas",
    "21": "Barajas",
}


def normalize_search_text(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    collapsed = "".join(char if char.isalnum() else " " for char in ascii_text.lower())
    return " ".join(collapsed.split())


def build_address_entry(
    label: str,
    lat: float,
    lon: float,
    kind: str,
    source: str,
    district: str | None = None,
) -> dict:
    entry = {
        "label": label,
        "search_text": normalize_search_text(label),
        "lat": float(lat),
        "lon": float(lon),
        "kind": kind,
        "source": source,
    }
    if district:
        entry["district"] = district
    return entry


def load_curated_entries(curated_path: Path = CURATED_PATH) -> list[dict]:
    return json.loads(curated_path.read_text(encoding="utf-8"))


def decode_csv_rows(csv_path: Path) -> tuple[list[dict[str, str]], str]:
    for encoding in ("utf-8-sig", "cp1252"):
        try:
            with csv_path.open("r", encoding=encoding, newline="") as handle:
                sample = handle.read(4096)
                handle.seek(0)
                try:
                    dialect = csv.Sniffer().sniff(sample, delimiters=",;")
                except csv.Error:
                    dialect = csv.excel
                    dialect.delimiter = ";" if ";" in sample else ","
                reader = csv.DictReader(handle, dialect=dialect)
                return list(reader), dialect.delimiter
        except UnicodeDecodeError:
            continue

    raise UnicodeDecodeError("csv", b"", 0, 1, "Unable to decode municipal CSV")


def parse_coordinate(value: str) -> float:
    cleaned = (value or "").strip()
    if not cleaned:
        raise ValueError("Missing coordinate")

    normalized = cleaned.replace(",", ".")
    try:
        return float(normalized)
    except ValueError:
        pass

    match = re.fullmatch(
        r"\s*(\d+(?:\.\d+)?)°(\d+(?:\.\d+)?)'(\d+(?:\.\d+)?)''\s*([NSEW])\s*",
        cleaned,
    )
    if not match:
        raise ValueError(f"Unsupported coordinate format: {value}")

    degrees = float(match.group(1))
    minutes = float(match.group(2))
    seconds = float(match.group(3))
    hemisphere = match.group(4)
    decimal = degrees + (minutes / 60.0) + (seconds / 3600.0)
    if hemisphere in {"S", "W"}:
        decimal *= -1
    return decimal


def normalize_district(value: str | None) -> str | None:
    district = (value or "").strip()
    if not district:
        return None
    return DISTRICT_NAMES.get(district, district)


def format_madrid_official_label(row: dict[str, str]) -> str:
    via_clase = (row.get("VIA_CLASE") or "").strip().title()
    via_nombre = (row.get("VIA_NOMBRE") or "").strip().title()
    numero = (row.get("NUMERO") or "").strip()
    calificador = (row.get("CALIFICADOR") or "").strip()

    parts = [part for part in [via_clase, via_nombre, numero, calificador] if part]
    if not parts:
        return ""

    return f"{' '.join(parts)}, Madrid"


def load_municipal_entries(csv_path: Path | None) -> list[dict]:
    if csv_path is None or not csv_path.exists():
        return []

    entries = []
    rows, _delimiter = decode_csv_rows(csv_path)

    for row in rows:
        label = (
            row.get("label") or row.get("direccion") or row.get("name") or ""
        ).strip()
        if not label:
            label = format_madrid_official_label(row)
        lat = row.get("lat") or row.get("latitude") or row.get("LATITUD")
        lon = row.get("lon") or row.get("longitude") or row.get("LONGITUD")
        if not label or lat in (None, "") or lon in (None, ""):
            continue

        try:
            lat_value = parse_coordinate(lat)
            lon_value = parse_coordinate(lon)
        except ValueError:
            continue

        entries.append(
            build_address_entry(
                label=label,
                lat=lat_value,
                lon=lon_value,
                kind=(row.get("kind") or "address").strip(),
                source=(row.get("source") or "municipal").strip(),
                district=normalize_district(
                    row.get("district") or row.get("distrito") or row.get("DISTRITO")
                ),
            )
        )
    return entries


def merge_entries(
    municipal_entries: list[dict], curated_entries: list[dict]
) -> list[dict]:
    merged = []
    seen = set()

    for entry in [*curated_entries, *municipal_entries]:
        key = (entry["lat"], entry["lon"], entry["kind"])
        if key in seen:
            continue
        seen.add(key)
        merged.append(entry)

    return merged


def summarize_index_size(
    entries: list[dict],
    raw_threshold_bytes: int = DEFAULT_RAW_THRESHOLD_BYTES,
    gzip_threshold_bytes: int = DEFAULT_GZIP_THRESHOLD_BYTES,
) -> dict:
    payload = json.dumps(entries, ensure_ascii=False, separators=(",", ":")).encode(
        "utf-8"
    )
    compressed = gzip.compress(payload)
    raw_bytes = len(payload)
    gzip_bytes = len(compressed)
    return {
        "raw_bytes": raw_bytes,
        "gzip_bytes": gzip_bytes,
        "raw_threshold_bytes": raw_threshold_bytes,
        "gzip_threshold_bytes": gzip_threshold_bytes,
        "over_threshold": raw_bytes > raw_threshold_bytes
        or gzip_bytes > gzip_threshold_bytes,
    }


def write_json(path: Path, payload: list[dict] | dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


def download_official_street_csv(
    destination: Path = DEFAULT_MUNICIPAL_CSV_PATH,
    url: str = OFFICIAL_STREET_CSV_URL,
) -> Path:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with requests.get(url, stream=True, timeout=300) as response:
        response.raise_for_status()
        with destination.open("wb") as handle:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    handle.write(chunk)
    return destination


def build_search_index(
    csv_path: Path | None = None, curated_path: Path = CURATED_PATH
) -> list[dict]:
    municipal_entries = load_municipal_entries(csv_path)
    curated_entries = load_curated_entries(curated_path)
    return merge_entries(municipal_entries, curated_entries)


def build_search_index_files(
    csv_path: Path | None = None,
    curated_path: Path = CURATED_PATH,
    output_path: Path = DEFAULT_OUTPUT_PATH,
    meta_output_path: Path = DEFAULT_META_OUTPUT_PATH,
    raw_threshold_bytes: int = DEFAULT_RAW_THRESHOLD_BYTES,
    gzip_threshold_bytes: int = DEFAULT_GZIP_THRESHOLD_BYTES,
) -> list[dict]:
    entries = build_search_index(csv_path=csv_path, curated_path=curated_path)
    meta = summarize_index_size(
        entries,
        raw_threshold_bytes=raw_threshold_bytes,
        gzip_threshold_bytes=gzip_threshold_bytes,
    )
    write_json(output_path, entries)
    write_json(meta_output_path, meta)
    return entries


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build the canonical Madrid search index"
    )
    parser.add_argument(
        "--csv", type=Path, default=None, help="Optional municipal CSV source"
    )
    parser.add_argument(
        "--curated", type=Path, default=CURATED_PATH, help="Curated entries JSON"
    )
    parser.add_argument(
        "--output", type=Path, default=DEFAULT_OUTPUT_PATH, help="Output JSON path"
    )
    parser.add_argument(
        "--meta-output",
        type=Path,
        default=DEFAULT_META_OUTPUT_PATH,
        help="Output meta JSON path",
    )
    parser.add_argument(
        "--raw-threshold-bytes",
        type=int,
        default=DEFAULT_RAW_THRESHOLD_BYTES,
        help="Raw size threshold used for over_threshold in the meta file",
    )
    parser.add_argument(
        "--gzip-threshold-bytes",
        type=int,
        default=DEFAULT_GZIP_THRESHOLD_BYTES,
        help="Gzip size threshold used for over_threshold in the meta file",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    build_search_index_files(
        csv_path=args.csv,
        curated_path=args.curated,
        output_path=args.output,
        meta_output_path=args.meta_output,
        raw_threshold_bytes=args.raw_threshold_bytes,
        gzip_threshold_bytes=args.gzip_threshold_bytes,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
