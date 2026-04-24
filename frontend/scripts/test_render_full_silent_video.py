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

        total_frames = sum(section["frames"] for section in module.SECTIONS)
        section_keys = [section["key"] for section in module.SECTIONS]

        self.assertEqual(total_frames, 3322)
        self.assertEqual(module.TOTAL_FRAMES, 3322)
        self.assertGreater(module.AUDIO_DURATION_SECONDS, 132.8)
        self.assertLess(module.AUDIO_DURATION_SECONDS, 132.9)
        self.assertEqual(
            section_keys,
            [
                "home",
                "search",
                "route-result",
                "metrics",
                "simulation",
                "methodology",
                "diagnostic",
                "closing",
            ],
        )


if __name__ == "__main__":
    unittest.main()
