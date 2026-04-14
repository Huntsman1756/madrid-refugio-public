from __future__ import annotations

import argparse
import json
import sys
from typing import Any

import requests


def assert_ok(response: requests.Response, label: str) -> dict[str, Any]:
    if response.status_code != 200:
        raise RuntimeError(f"{label}: expected 200, got {response.status_code} -> {response.text[:300]}")
    try:
        return response.json()
    except Exception as exc:
        raise RuntimeError(f"{label}: invalid JSON response") from exc


def main() -> int:
    parser = argparse.ArgumentParser(description="Smoke test Madrid Refugio production endpoints.")
    parser.add_argument("--base-url", default="https://madrid-refugio.vercel.app", help="Frontend base URL")
    parser.add_argument("--origin", default="Plaza Elíptica, Madrid")
    parser.add_argument("--destination", default="Hospital Central de la Defensa Gómez Ulla, Madrid")
    parser.add_argument("--hour", type=int, default=14)
    parser.add_argument("--preference", type=float, default=0.5)
    args = parser.parse_args()

    session = requests.Session()
    base_url = args.base_url.rstrip("/")

    health = assert_ok(session.get(f"{base_url}/api/health", timeout=30), "health")
    weather = assert_ok(session.get(f"{base_url}/api/weather", timeout=30), "weather")
    route = assert_ok(
        session.post(
            f"{base_url}/api/route",
            json={
                "origin": args.origin,
                "destination": args.destination,
                "hour": args.hour,
                "preference": args.preference,
            },
            timeout=60,
        ),
        "route",
    )

    if not route.get("comfort_coords"):
        raise RuntimeError("route: comfort_coords missing or empty")

    print(
        json.dumps(
            {
                "health": health,
                "weather": weather,
                "route_summary": {
                    "sun_time_saved_min": route["metrics"]["human"]["sun_time_saved_min"],
                    "extra_effort_min": route["metrics"]["human"]["extra_effort_min"],
                    "comfort_points": len(route["comfort_coords"]),
                },
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        raise SystemExit(1)
