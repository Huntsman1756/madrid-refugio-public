from pathlib import Path

from playwright.sync_api import sync_playwright


OUTPUT_DIR = Path(__file__).resolve().parent.parent / "tmp" / "video-capture"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

APP_URL = "http://127.0.0.1:3500"
API_URL = "http://127.0.0.1:3501"


def select_autocomplete_option(page, selector: str, query: str) -> None:
    field = page.locator(selector)
    field.wait_for(state="visible")
    field.click()
    field.fill("")
    field.fill(query)
    page.wait_for_selector('[role="option"]', timeout=15000)
    page.get_by_role("option").first.click()
    page.wait_for_timeout(600)


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1920, "height": 1080})
    context.route(
        f"{APP_URL}/api/**",
        lambda route: route.continue_(url=route.request.url.replace(APP_URL, API_URL)),
    )

    page = context.new_page()
    page.goto(APP_URL, wait_until="networkidle")
    page.wait_for_timeout(2200)

    select_autocomplete_option(page, 'input[name="origin"]', "bravo murillo 243")
    select_autocomplete_option(page, 'input[name="destination"]', "nuevos")
    page.get_by_role("button", name="14:00").click()
    page.wait_for_timeout(200)
    page.get_by_role("button", name="Más sombra").click()
    page.wait_for_timeout(500)

    search_path = OUTPUT_DIR / "authoritative-search.png"
    page.screenshot(path=str(search_path), full_page=False)

    page.get_by_role("button", name="Buscar ruta con sombra").click()
    page.wait_for_selector("text=Ruta Eco-Refugio", timeout=120000)
    page.wait_for_timeout(2500)

    results_path = OUTPUT_DIR / "authoritative-results.png"
    page.screenshot(path=str(results_path), full_page=False)

    page.mouse.wheel(0, 380)
    page.wait_for_timeout(1800)

    metrics_path = OUTPUT_DIR / "authoritative-metrics.png"
    page.screenshot(path=str(metrics_path), full_page=False)

    print(search_path)
    print(results_path)
    print(metrics_path)

    context.close()
    browser.close()
