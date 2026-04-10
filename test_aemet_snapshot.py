import unittest
from datetime import datetime

from api import select_current_aemet_snapshot, select_current_sky_state


class AemetSnapshotTests(unittest.TestCase):
    def setUp(self):
        self.prediccion_dias = [
            {
                "fecha": "2026-04-09",
                "temperatura": [
                    {"periodo": "18", "value": "19"},
                    {"periodo": "21", "value": "21"},
                ],
                "estadoCielo": [
                    {"periodo": "18", "descripcion": "Despejado"},
                    {"periodo": "21", "descripcion": "Poco nuboso"},
                ],
            },
            {
                "fecha": "2026-04-10",
                "temperatura": [
                    {"periodo": "00", "value": "16"},
                    {"periodo": "03", "value": "14"},
                    {"periodo": "06", "value": "13"},
                ],
                "estadoCielo": [
                    {"periodo": "00", "descripcion": "Despejado"},
                    {"periodo": "03", "descripcion": "Nubes altas"},
                    {"periodo": "06", "descripcion": "Poco nuboso"},
                ],
            },
        ]

    def test_select_current_aemet_snapshot_chooses_closest_day_and_hour(self):
        now = datetime(2026, 4, 10, 4, 45)
        temp, timestamp = select_current_aemet_snapshot(self.prediccion_dias, now)

        self.assertEqual(temp["value"], "14")
        self.assertEqual(timestamp, "03:00")

    def test_select_current_sky_state_matches_same_temporal_slot(self):
        now = datetime(2026, 4, 10, 4, 45)
        sky = select_current_sky_state(self.prediccion_dias, now)

        self.assertEqual(sky, "Nubes altas")


if __name__ == "__main__":
    unittest.main()
