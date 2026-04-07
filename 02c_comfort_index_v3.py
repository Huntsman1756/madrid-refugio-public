from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent
PROCESSED_DIR = BASE_DIR / "data" / "processed"
INPUT_PATH = PROCESSED_DIR / "barrio_comfort_v2.csv"
OUTPUT_PATH = PROCESSED_DIR / "barrio_comfort_v3.csv"


def main() -> None:
    df = pd.read_csv(INPUT_PATH)
    df["log_pop"] = np.log1p(df["pop_65plus"].fillna(0))
    max_log_pop = float(df["log_pop"].max())
    df["log_pop_norm"] = df["log_pop"] / max_log_pop if max_log_pop else 0.0
    df["priority_score"] = df["vulnerability_index"] * df["log_pop_norm"]
    max_priority = float(df["priority_score"].max())
    df["priority_score_norm"] = df["priority_score"] / max_priority if max_priority else 0.0

    df = df.sort_values(
        ["priority_score_norm", "pop_65plus", "vulnerability_index"],
        ascending=[False, False, False],
    ).reset_index(drop=True)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(OUTPUT_PATH, index=False)

    top15 = df.head(15)[
        [
            "barrio_nombre",
            "pop_65plus",
            "refugios_300m",
            "refugios_400m",
            "no2_medio",
            "vulnerability_index",
            "priority_score_norm",
        ]
    ]
    print("Top 15 barrios por priority_score_norm")
    print(top15.to_string(index=False))
    print(f"\nArchivo generado: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
