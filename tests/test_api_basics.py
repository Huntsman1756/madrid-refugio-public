from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parents[1]))

from api import fetch_aemet_data, normalize_address, point_in_madrid


def test_normalize_address_lowercases_and_trims():
    assert (
        normalize_address("  Calle de Alcala 10, Madrid  ")
        == "calle de alcala 10, madrid"
    )


def test_point_in_madrid_accepts_city_coordinates():
    assert point_in_madrid(40.4168, -3.7038) is True


def test_point_in_madrid_rejects_outside_coordinates():
    assert point_in_madrid(41.3874, 2.1686) is False


def test_fetch_aemet_data_returns_error_without_key(monkeypatch):
    monkeypatch.setattr("api.AEMET_API_KEY", None)
    assert fetch_aemet_data() == {"error": "AEMET_API_KEY no configurada"}
