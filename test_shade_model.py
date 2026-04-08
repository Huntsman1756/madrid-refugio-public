import unittest

from shade_model import (
    combine_shade_scores,
    compute_comfort_weight,
    compute_tree_shade_score,
)


class ShadeModelTests(unittest.TestCase):
    def test_tree_shade_score_caps_at_configured_limit(self):
        self.assertEqual(compute_tree_shade_score(0), 0.0)
        self.assertAlmostEqual(compute_tree_shade_score(2), 0.3)
        self.assertAlmostEqual(compute_tree_shade_score(10), 0.6)

    def test_combined_shade_is_additive_with_cap(self):
        self.assertAlmostEqual(combine_shade_scores(0.25, 0.4), 0.65)
        self.assertAlmostEqual(combine_shade_scores(0.6, 0.6), 0.95)

    def test_comfort_weight_respects_preference_and_combined_shade(self):
        self.assertAlmostEqual(
            compute_comfort_weight(100.0, tree_shade=0.3, building_shade=0.4, preference=1.0),
            44.0,
        )
        self.assertAlmostEqual(
            compute_comfort_weight(100.0, tree_shade=0.3, building_shade=0.4, preference=0.0),
            100.0,
        )


if __name__ == "__main__":
    unittest.main()
