from pathlib import Path
from playwright.sync_api import sync_playwright


OUTPUT_DIR = Path(__file__).resolve().parent.parent / "tmp" / "video-capture"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
APP_URL = "http://127.0.0.1:3500"


def select_autocomplete_option(page, selector: str, text: str) -> None:
    field = page.locator(selector)
    field.wait_for(state="visible")
    field.click()
    field.fill(text)
    page.wait_for_selector('[role="option"]', timeout=15000)
    page.get_by_role("option").first.click()
    page.wait_for_timeout(600)


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1920, "height": 1080})
    context.route(
        f"{APP_URL}/api/**",
        lambda route: route.continue_(
            url=route.request.url.replace(APP_URL, "http://127.0.0.1:3501")
        ),
    )
    page = context.new_page()

    page.goto(APP_URL, wait_until="networkidle")
    page.wait_for_timeout(2500)
    page.screenshot(path=str(OUTPUT_DIR / "story-hero.png"), full_page=False)

    page.mouse.wheel(0, 850)
    page.wait_for_timeout(1000)
    page.screenshot(path=str(OUTPUT_DIR / "story-how-it-works.png"), full_page=False)

    page.goto(APP_URL, wait_until="networkidle")
    page.wait_for_timeout(1500)
    select_autocomplete_option(page, 'input[name="origin"]', "Plaza de Castilla")
    select_autocomplete_option(page, 'input[name="destination"]', "Nuevos Ministerios")
    page.get_by_role("button", name="14:00").click()
    page.wait_for_timeout(250)
    page.get_by_role("button", name="Más sombra").click()
    page.wait_for_timeout(250)
    page.screenshot(path=str(OUTPUT_DIR / "story-search-filled.png"), full_page=False)

    page.get_by_role("button", name="Buscar ruta con sombra").click()
    page.wait_for_selector("text=Ruta Refugio", timeout=120000)
    page.wait_for_timeout(2500)
    page.screenshot(path=str(OUTPUT_DIR / "story-route-results.png"), full_page=False)

    page.mouse.wheel(0, 700)
    page.wait_for_timeout(1200)
    page.screenshot(path=str(OUTPUT_DIR / "story-route-metrics.png"), full_page=False)

    page.goto(f"{APP_URL}/metodologia", wait_until="networkidle")
    page.wait_for_timeout(2500)
    page.screenshot(path=str(OUTPUT_DIR / "story-metodologia.png"), full_page=False)

    context.close()
    browser.close()
