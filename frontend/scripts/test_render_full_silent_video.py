from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
import unittest


SCRIPT_PATH = Path(__file__).resolve().parent / "render_full_silent_video.py"


def load_module():
    spec = spec_from_file_location("render_full_silent_video", SCRIPT_PATH)
    module = module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


class RenderTimelineTest(unittest.TestCase):
    def test_scene_timeline_matches_audio_length(self):
        module = load_module()

        total_frames = sum(beat["frames"] for beat in module.BEATS)
        beat_keys = [beat["key"] for beat in module.BEATS]

        self.assertEqual(total_frames, 3322)
        self.assertEqual(module.TOTAL_BEAT_FRAMES, 3322)
        self.assertGreater(module.AUDIO_DURATION_SECONDS, 132.8)
        self.assertLess(module.AUDIO_DURATION_SECONDS, 132.9)
        self.assertEqual(module.BEAT_FRAMES, [beat["frames"] for beat in module.BEATS])
        self.assertEqual(
            beat_keys,
            [
                "human-problem",
                "unequal-routes",
                "vulnerable-person",
                "product-introduction",
                "real-time-routing",
                "not-just-a-map",
                "dynamic-shadow",
                "solar-position",
                "better-routing",
                "open-data-intro",
                "dataset-list",
                "public-value",
                "closing-impact",
            ],
        )


if __name__ == "__main__":
    unittest.main()
