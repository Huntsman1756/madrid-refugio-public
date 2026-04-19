import json
import re
import unicodedata
from copy import deepcopy
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from playwright.sync_api import Page, sync_playwright


OUTPUT_DIR = Path(__file__).resolve().parent.parent / "tmp" / "video-capture"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
APP_URL = "http://127.0.0.1:3500"

EXAMPLES = [
    {
        "origin_query": "bravo murillo",
        "origin": {
            "id": "bravo-murillo-243",
            "label": "Calle de Bravo Murillo 243, Madrid",
            "kind": "address",
            "lat": 40.4625,
            "lon": -3.6980,
        },
        "destination_query": "nuevos",
        "destination": {
            "id": "nuevos-ministerios",
            "label": "Nuevos Ministerios, Madrid",
            "kind": "place",
            "lat": 40.4460,
            "lon": -3.6933,
        },
        "route": {
            "origin_label": "Calle de Bravo Murillo 243, Madrid",
            "destination_label": "Nuevos Ministerios, Madrid",
            "origin_latlon": [40.4625, -3.6980],
            "destination_latlon": [40.4460, -3.6933],
            "shortest_coords": [
                [40.4625, -3.6980],
                [40.4588, -3.6971],
                [40.4548, -3.6960],
                [40.4508, -3.6949],
                [40.4460, -3.6933],
            ],
            "comfort_coords": [
                [40.4625, -3.6980],
                [40.4611, -3.7008],
                [40.4570, -3.6999],
                [40.4528, -3.6978],
                [40.4487, -3.6951],
                [40.4460, -3.6933],
            ],
            "metrics": {
                "shortest": {
                    "length": 2360,
                    "tree_shade": 410,
                    "building_shade": 240,
                    "fuentes": 1,
                    "fuentes_pts": [[40.4548, -3.6960]],
                    "refugios": 1,
                    "refugios_pts": [[40.4518, -3.6972]],
                },
                "comfort": {
                    "length": 2580,
                    "tree_shade": 640,
                    "building_shade": 540,
                    "fuentes": 2,
                    "fuentes_pts": [[40.4594, -3.7004], [40.4511, -3.6965]],
                    "refugios": 2,
                    "refugios_pts": [[40.4570, -3.6996], [40.4491, -3.6958]],
                },
                "human": {
                    "sun_time_saved_min": 8.4,
                    "extra_effort_min": 2.6,
                },
            },
        },
    },
    {
        "origin_query": "plaza de castilla",
        "origin": {
            "id": "plaza-castilla",
            "label": "Plaza de Castilla, Madrid",
            "kind": "place",
            "lat": 40.4668,
            "lon": -3.6896,
        },
        "destination_query": "hospital",
        "destination": {
            "id": "hospital-clinico",
            "label": "Hospital Clínico San Carlos, Madrid",
            "kind": "address",
            "lat": 40.4407,
            "lon": -3.7178,
        },
        "route": {
            "origin_label": "Plaza de Castilla, Madrid",
            "destination_label": "Hospital Clínico San Carlos, Madrid",
            "origin_latlon": [40.4668, -3.6896],
            "destination_latlon": [40.4407, -3.7178],
            "shortest_coords": [
                [40.4668, -3.6896],
                [40.4618, -3.6950],
                [40.4558, -3.7012],
                [40.4483, -3.7092],
                [40.4407, -3.7178],
            ],
            "comfort_coords": [
                [40.4668, -3.6896],
                [40.4638, -3.6934],
                [40.4586, -3.6994],
                [40.4522, -3.7062],
                [40.4460, -3.7124],
                [40.4407, -3.7178],
            ],
            "metrics": {
                "shortest": {
                    "length": 3820,
                    "tree_shade": 520,
                    "building_shade": 310,
                    "fuentes": 1,
                    "fuentes_pts": [[40.4522, -3.7062]],
                    "refugios": 1,
                    "refugios_pts": [[40.4468, -3.7121]],
                },
                "comfort": {
                    "length": 4210,
                    "tree_shade": 910,
                    "building_shade": 620,
                    "fuentes": 3,
                    "fuentes_pts": [[40.4600, -3.6976], [40.4520, -3.7060], [40.4444, -3.7140]],
                    "refugios": 2,
                    "refugios_pts": [[40.4550, -3.7028], [40.4462, -3.7128]],
                },
                "human": {
                    "sun_time_saved_min": 11.2,
                    "extra_effort_min": 4.1,
                },
            },
        },
    },
    {
        "origin_query": "matadero",
        "origin": {
            "id": "matadero",
            "label": "Calle Matadero 1, Madrid",
            "kind": "address",
            "lat": 40.3918,
            "lon": -3.6988,
        },
        "destination_query": "retiro",
        "destination": {
            "id": "retiro",
            "label": "Calle Alto Del Retiro 1, Madrid",
            "kind": "address",
            "lat": 40.4153,
            "lon": -3.6844,
        },
        "route": {
            "origin_label": "Calle Matadero 1, Madrid",
            "destination_label": "Calle Alto Del Retiro 1, Madrid",
            "origin_latlon": [40.3918, -3.6988],
            "destination_latlon": [40.4153, -3.6844],
            "shortest_coords": [
                [40.3918, -3.6988],
                [40.3970, -3.6950],
                [40.4025, -3.6912],
                [40.4090, -3.6875],
                [40.4153, -3.6844],
            ],
            "comfort_coords": [
                [40.3918, -3.6988],
                [40.3962, -3.7006],
                [40.4016, -3.6968],
                [40.4073, -3.6915],
                [40.4118, -3.6873],
                [40.4153, -3.6844],
            ],
            "metrics": {
                "shortest": {
                    "length": 3280,
                    "tree_shade": 460,
                    "building_shade": 180,
                    "fuentes": 1,
                    "fuentes_pts": [[40.4025, -3.6912]],
                    "refugios": 1,
                    "refugios_pts": [[40.4090, -3.6875]],
                },
                "comfort": {
                    "length": 3490,
                    "tree_shade": 1040,
                    "building_shade": 420,
                    "fuentes": 2,
                    "fuentes_pts": [[40.3962, -3.7006], [40.4073, -3.6915]],
                    "refugios": 2,
                    "refugios_pts": [[40.4016, -3.6968], [40.4118, -3.6873]],
                },
                "human": {
                    "sun_time_saved_min": 9.7,
                    "extra_effort_min": 2.8,
                },
            },
        },
    },
]

SUGGESTIONS = [item["origin"] for item in EXAMPLES] + [item["destination"] for item in EXAMPLES]


def save_named_video(page: Page, name: str) -> None:
    page.close()
    page.video.save_as(str(OUTPUT_DIR / name))


def mock_suggestions(query: str) -> list[dict]:
    normalized = unicodedata.normalize("NFKD", query.strip().lower()).encode("ascii", "ignore").decode("ascii")
    if not normalized:
        return []
    return [
        option
        for option in SUGGESTIONS
        if normalized in unicodedata.normalize("NFKD", option["label"].lower()).encode("ascii", "ignore").decode("ascii")
    ]


def build_route_response(payload: dict) -> dict:
    origin = payload.get("origin", {})
    destination = payload.get("destination", {})
    origin_label = origin.get("label", "").lower()
    destination_label = destination.get("label", "").lower()
    hour = int(payload.get("hour", 14))

    for example in EXAMPLES:
        if example["origin"]["label"].lower() == origin_label and example["destination"]["label"].lower() == destination_label:
            route = deepcopy(example["route"])
            heat_factor = max(0, hour - 10)
            route["metrics"]["shortest"]["building_shade"] += heat_factor * 6
            route["metrics"]["comfort"]["building_shade"] += heat_factor * 12
            route["metrics"]["comfort"]["tree_shade"] += heat_factor * 8
            route["metrics"]["human"]["sun_time_saved_min"] = round(
                route["metrics"]["human"]["sun_time_saved_min"] + (heat_factor * 0.28), 1
            )
            route["metrics"]["human"]["extra_effort_min"] = round(
                route["metrics"]["human"]["extra_effort_min"] + (0.1 if hour == 18 else 0.0), 1
            )
            if hour >= 18:
                route["metrics"]["comfort"]["building_shade"] = max(
                    route["metrics"]["comfort"]["building_shade"] - 24, 0
                )
            return route

    return deepcopy(EXAMPLES[0]["route"])


def select_autocomplete_option(page: Page, selector: str, query: str, expected_label: str | None = None) -> None:
    field = page.locator(selector)
    field.wait_for(state="visible")
    field.click()
    field.fill("")
    field.fill(query)
    page.get_by_role("option").first.wait_for(timeout=15000)
    page.get_by_role("option").first.click()
    page.wait_for_timeout(700)


def choose_hour(page: Page, hour_label: str) -> None:
    page.get_by_role("button", name=hour_label).click()
    page.wait_for_timeout(300)


def choose_preference(page: Page, label: str) -> None:
    page.get_by_role("button", name=re.compile(label, re.I)).click()
    page.wait_for_timeout(400)


def fill_route(page: Page, example: dict, hour_button: str = "14:00", preference_label: str = "Más sombra") -> None:
    select_autocomplete_option(page, 'input[name="origin"]', example["origin_query"], example["origin"]["label"])
    select_autocomplete_option(page, 'input[name="destination"]', example["destination_query"], example["destination"]["label"])
    choose_hour(page, hour_button)
    choose_preference(page, preference_label)


def mock_api(context) -> None:
    def handle_api(route):
        request = route.request
        parsed = urlparse(request.url)

        if parsed.path.endswith("/api/suggest"):
            query = parse_qs(parsed.query).get("q", [""])[0]
            route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps(mock_suggestions(query)),
            )
            return

        if parsed.path.endswith("/api/route"):
            payload = request.post_data_json or {}
            route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps(build_route_response(payload)),
            )
            return

        route.continue_()

    context.route(f"{APP_URL}/api/**", handle_api)


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    def new_context_and_page(url: str = APP_URL):
        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            record_video_dir=str(OUTPUT_DIR),
            record_video_size={"width": 1920, "height": 1080},
        )
        mock_api(context)
        page = context.new_page()
        page.goto(url, wait_until="networkidle")
        page.wait_for_timeout(2200)
        return context, page

    context, page = new_context_and_page()
    page.screenshot(path=str(OUTPUT_DIR / "story-hero-live.png"), full_page=False)
    page.mouse.wheel(0, 480)
    page.wait_for_timeout(1200)
    page.screenshot(path=str(OUTPUT_DIR / "story-how-it-works-live.png"), full_page=False)
    save_named_video(page, "clip-home-hero.webm")
    context.close()

    for index, example in enumerate(EXAMPLES, start=1):
        context, page = new_context_and_page()
        fill_route(page, example)
        page.wait_for_timeout(1800)
        save_named_video(page, f"clip-search-example-{index}.webm")
        context.close()

    context, page = new_context_and_page()
    fill_route(page, EXAMPLES[0])
    page.get_by_role("button", name="Buscar ruta con sombra").click()
    page.wait_for_selector("text=Ruta eco-refugio", timeout=15000)
    page.wait_for_timeout(3200)
    save_named_video(page, "clip-route-main.webm")
    context.close()

    context, page = new_context_and_page()
    fill_route(page, EXAMPLES[1], hour_button="18:00", preference_label="Equilibrada")
    page.get_by_role("button", name="Buscar ruta con sombra").click()
    page.wait_for_selector("text=Protección", timeout=15000)
    page.wait_for_timeout(1800)
    page.mouse.wheel(0, 260)
    page.wait_for_timeout(1400)
    page.mouse.wheel(0, 260)
    page.wait_for_timeout(2800)
    save_named_video(page, "clip-route-metrics-live.webm")
    context.close()

    context, page = new_context_and_page()
    fill_route(page, EXAMPLES[0])
    page.get_by_role("button", name="Buscar ruta con sombra").click()
    page.wait_for_selector("text=Ruta eco-refugio", timeout=15000)
    page.wait_for_timeout(1800)
    page.get_by_role("button", name=re.compile("SIMULAR DÍA", re.I)).click()
    page.wait_for_timeout(11000)
    stop_button = page.get_by_role("button", name=re.compile("DETENER SIMULACIÓN", re.I))
    if stop_button.count():
        stop_button.click()
        page.wait_for_timeout(1200)
    save_named_video(page, "clip-dynamic-shadow-live.webm")
    context.close()

    context, page = new_context_and_page(f"{APP_URL}/metodologia")
    page.screenshot(path=str(OUTPUT_DIR / "story-metodologia-live.png"), full_page=False)
    page.mouse.wheel(0, 420)
    page.wait_for_timeout(1400)
    page.mouse.wheel(0, 420)
    page.wait_for_timeout(2200)
    save_named_video(page, "clip-methodology-live.webm")
    context.close()

    context, page = new_context_and_page()
    page.mouse.wheel(0, 2500)
    page.wait_for_timeout(2000)
    page.get_by_role("button", name=re.compile("Déficit de refugios", re.I)).click()
    page.wait_for_timeout(1600)
    page.get_by_role("button", name=re.compile("Villaverde", re.I)).click()
    page.wait_for_timeout(2200)
    page.screenshot(path=str(OUTPUT_DIR / "story-diagnostic-live.png"), full_page=False)
    page.wait_for_timeout(1800)
    save_named_video(page, "clip-diagnostic-live.webm")
    context.close()

    browser.close()
