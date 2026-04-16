from __future__ import annotations

import importlib.util
import json
import subprocess
import sys
import tempfile
import textwrap
from pathlib import Path

import pytest


ROOT = Path(__file__).resolve().parents[1]
SCRIPT_PATH = ROOT / "build_madrid_search_index.py"
CURATED_PATH = ROOT / "data" / "reference" / "madrid_search_curated.json"


def load_builder_module():
    assert SCRIPT_PATH.exists(), f"Missing builder script: {SCRIPT_PATH}"

    spec = importlib.util.spec_from_file_location(
        "build_madrid_search_index", SCRIPT_PATH
    )
    assert spec is not None and spec.loader is not None

    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_curated_entries_include_gomez_ulla_demo_destination():
    assert CURATED_PATH.exists(), f"Missing curated JSON: {CURATED_PATH}"

    curated_entries = json.loads(CURATED_PATH.read_text(encoding="utf-8"))

    assert any(entry["label"] == "Gomez Ulla" for entry in curated_entries)
    assert any(entry["kind"] == "demo_destination" for entry in curated_entries)


def test_builder_defaults_to_versioned_curated_data_file():
    module = load_builder_module()

    assert module.CURATED_PATH == CURATED_PATH


def test_builder_processed_dir_uses_data_dir_env(monkeypatch):
    with tempfile.TemporaryDirectory(dir=ROOT) as temp_dir:
        monkeypatch.setenv("DATA_DIR", temp_dir)
        module = load_builder_module()

    assert module.PROCESSED_DIR == Path(temp_dir)
    assert module.DEFAULT_OUTPUT_PATH == Path(temp_dir) / "madrid_search_index.json"
    assert (
        module.DEFAULT_MUNICIPAL_CSV_PATH
        == Path(temp_dir) / "213605-4-callejero-oficial-madrid-csv.csv"
    )


def test_build_address_entry_normalizes_search_text_and_keeps_kind():
    module = load_builder_module()

    entry = module.build_address_entry(
        label="Calle de Alcala 10",
        lat=40.417,
        lon=-3.703,
        kind="address",
        source="municipal",
        district="Centro",
    )

    assert entry == {
        "label": "Calle de Alcala 10",
        "search_text": "calle de alcala 10",
        "lat": 40.417,
        "lon": -3.703,
        "kind": "address",
        "source": "municipal",
        "district": "Centro",
    }


def test_merge_entries_keeps_curated_entries_when_no_municipal_data():
    module = load_builder_module()

    curated_entries = [
        module.build_address_entry(
            label="Gomez Ulla",
            lat=40.4211,
            lon=-3.6738,
            kind="demo_destination",
            source="curated",
        )
    ]

    merged = module.merge_entries([], curated_entries)

    assert merged == curated_entries


def test_merge_entries_prefers_curated_entry_on_duplicate_collision():
    module = load_builder_module()

    municipal_entry = module.build_address_entry(
        label="Gomez Ulla Municipal",
        lat=40.4211,
        lon=-3.6738,
        kind="demo_destination",
        source="municipal",
        district="Centro",
    )
    curated_entry = module.build_address_entry(
        label="Gomez Ulla",
        lat=40.4211,
        lon=-3.6738,
        kind="demo_destination",
        source="curated",
        district="Salamanca",
    )

    merged = module.merge_entries([municipal_entry], [curated_entry])

    assert merged == [curated_entry]


def test_load_municipal_entries_skips_rows_with_invalid_uppercase_coordinates():
    module = load_builder_module()

    with tempfile.TemporaryDirectory(dir=ROOT) as temp_dir:
        csv_path = Path(temp_dir) / "municipal.csv"
        csv_path.write_text(
            textwrap.dedent(
                """\
                direccion,LATITUD,LONGITUD,distrito
                Bad Row,nope,-3.70,Centro
                Good Row,40.42,-3.71,Centro
                """
            ),
            encoding="utf-8",
        )

        entries = module.load_municipal_entries(csv_path)

    assert entries == [
        {
            "label": "Good Row",
            "search_text": "good row",
            "lat": 40.42,
            "lon": -3.71,
            "kind": "address",
            "source": "municipal",
            "district": "Centro",
        }
    ]


def test_load_municipal_entries_supports_real_madrid_csv_headers():
    module = load_builder_module()

    with tempfile.TemporaryDirectory(dir=ROOT) as temp_dir:
        csv_path = Path(temp_dir) / "madrid_official.csv"
        csv_path.write_text(
            textwrap.dedent(
                """\
                COD_VIA,VIA_CLASE,VIA_NOMBRE,NUMERO,CALIFICADOR,DISTRITO,BARRIO,LATITUD,LONGITUD
                123,CALLE,ALCALA,45,,Centro,Sol,40.4200,-3.6910
                124,AVENIDA,AMERICA,S/N,BIS,Salamanca,Guindalera,40.4381,-3.6762
                125,CALLE,MALASAÑA,12,,Centro,Universidad,,
                """
            ),
            encoding="utf-8",
        )

        entries = module.load_municipal_entries(csv_path)

    assert entries == [
        {
            "label": "Calle Alcala 45, Madrid",
            "search_text": "calle alcala 45 madrid",
            "lat": 40.42,
            "lon": -3.691,
            "kind": "address",
            "source": "municipal",
            "district": "Centro",
        },
        {
            "label": "Avenida America S/N BIS, Madrid",
            "search_text": "avenida america s n bis madrid",
            "lat": 40.4381,
            "lon": -3.6762,
            "kind": "address",
            "source": "municipal",
            "district": "Salamanca",
        },
    ]


def test_load_municipal_entries_supports_cp1252_official_export():
    module = load_builder_module()

    with tempfile.TemporaryDirectory(dir=ROOT) as temp_dir:
        csv_path = Path(temp_dir) / "madrid_official_cp1252.csv"
        csv_path.write_bytes(
            textwrap.dedent(
                """\
                COD_VIA,VIA_CLASE,VIA_NOMBRE,NUMERO,CALIFICADOR,DISTRITO,BARRIO,LATITUD,LONGITUD
                123,CALLE,ALCALÁ,45,,Centro,Sol,40.4200,-3.6910
                """
            ).encode("cp1252")
        )

        entries = module.load_municipal_entries(csv_path)

    assert entries == [
        {
            "label": "Calle Alcalá 45, Madrid",
            "search_text": "calle alcala 45 madrid",
            "lat": 40.42,
            "lon": -3.691,
            "kind": "address",
            "source": "municipal",
            "district": "Centro",
        }
    ]


def test_load_municipal_entries_supports_semicolon_delimited_dms_coordinates():
    module = load_builder_module()

    with tempfile.TemporaryDirectory(dir=ROOT) as temp_dir:
        csv_path = Path(temp_dir) / "madrid_official_dms.csv"
        csv_path.write_bytes(
            textwrap.dedent(
                """\
                COD_VIA;VIA_CLASE;VIA_NOMBRE;NUMERO;CALIFICADOR;DISTRITO;BARRIO;LATITUD;LONGITUD
                123;CALLE;ALCALÁ;45;;Centro;Sol;40°25'12.00'' N;3°41'27.60'' W
                """
            ).encode("cp1252")
        )

        entries = module.load_municipal_entries(csv_path)

    assert len(entries) == 1
    assert entries[0]["label"] == "Calle Alcalá 45, Madrid"
    assert entries[0]["search_text"] == "calle alcala 45 madrid"
    assert entries[0]["kind"] == "address"
    assert entries[0]["source"] == "municipal"
    assert entries[0]["district"] == "Centro"
    assert entries[0]["lat"] == pytest.approx(40.42)
    assert entries[0]["lon"] == pytest.approx(-3.691)


def test_summarize_index_size_reports_dual_threshold_flag_and_values():
    module = load_builder_module()

    summary = module.summarize_index_size(
        [{"label": "A"}], raw_threshold_bytes=10_000, gzip_threshold_bytes=1
    )

    assert summary["raw_bytes"] > 0
    assert summary["gzip_bytes"] > 0
    assert summary["over_threshold"] is True
    assert summary["raw_threshold_bytes"] == 10_000
    assert summary["gzip_threshold_bytes"] == 1


def test_cli_generates_index_and_meta_files():
    with tempfile.TemporaryDirectory(dir=ROOT) as temp_dir:
        temp_path = Path(temp_dir)
        output_path = temp_path / "madrid_search_index.json"
        meta_path = temp_path / "madrid_search_index.meta.json"

        result = subprocess.run(
            [
                sys.executable,
                str(SCRIPT_PATH),
                "--output",
                str(output_path),
                "--meta-output",
                str(meta_path),
                "--raw-threshold-bytes",
                "1",
                "--gzip-threshold-bytes",
                "1",
            ],
            cwd=ROOT,
            capture_output=True,
            text=True,
        )

        assert result.returncode == 0, result.stderr
        assert output_path.exists()
        assert meta_path.exists()

        payload = json.loads(output_path.read_text(encoding="utf-8"))
        meta = json.loads(meta_path.read_text(encoding="utf-8"))

        assert any(entry["label"] == "Gomez Ulla" for entry in payload)
        assert meta["raw_bytes"] > 0
        assert meta["gzip_bytes"] > 0
        assert meta["over_threshold"] is True
        assert meta["raw_threshold_bytes"] == 1
        assert meta["gzip_threshold_bytes"] == 1
