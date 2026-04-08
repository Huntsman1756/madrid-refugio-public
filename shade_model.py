from __future__ import annotations

TREE_INFLUENCE_RADIUS_M = 10.0
TREE_SHADE_PER_TREE = 0.15
TREE_SHADE_CAP = 0.60
COMBINED_SHADE_CAP = 0.95
SHADE_WEIGHT_FACTOR = 0.80
MIN_SHADOW_FACTOR = 0.10


def clamp(value: float, lower: float, upper: float) -> float:
    return max(lower, min(upper, value))


def compute_tree_shade_score(
    tree_count: int,
    per_tree: float = TREE_SHADE_PER_TREE,
    cap: float = TREE_SHADE_CAP,
) -> float:
    if tree_count <= 0:
        return 0.0
    return clamp(tree_count * per_tree, 0.0, cap)


def combine_shade_scores(
    tree_shade: float,
    building_shade: float,
    cap: float = COMBINED_SHADE_CAP,
) -> float:
    return clamp(max(tree_shade, 0.0) + max(building_shade, 0.0), 0.0, cap)


def compute_shadow_factor(
    tree_shade: float,
    building_shade: float,
    preference: float = 1.0,
    resource_bonus: float = 1.0,
) -> float:
    pref = clamp(preference, 0.0, 1.0)
    combined_shade = combine_shade_scores(tree_shade, building_shade)
    shadow_factor = (1.0 - (combined_shade * SHADE_WEIGHT_FACTOR * pref)) * (
        1.0 + (resource_bonus - 1.0) * pref
    )
    return max(shadow_factor, MIN_SHADOW_FACTOR)


def compute_comfort_weight(
    length: float,
    tree_shade: float,
    building_shade: float,
    preference: float = 1.0,
    resource_bonus: float = 1.0,
) -> float:
    edge_length = max(float(length), 0.0)
    return edge_length * compute_shadow_factor(
        tree_shade=tree_shade,
        building_shade=building_shade,
        preference=preference,
        resource_bonus=resource_bonus,
    )
