from pathlib import Path
from playwright.sync_api import sync_playwright


OUTPUT_DIR = Path(__file__).resolve().parent.parent / "tmp" / "video-capture"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1600, "height": 1200})
    page.goto("http://127.0.0.1:3500", wait_until="networkidle")
    page.wait_for_timeout(4000)

    page.screenshot(path=str(OUTPUT_DIR / "inspect-home.png"), full_page=True)

    print("TITLE:", page.title())
    print("COMBOBOXES:", page.locator('[role="combobox"]').count())
    print("INPUTS:", page.locator("input").count())
    print("BUTTONS:", page.locator("button").count())

    for i in range(page.locator("input").count()):
        locator = page.locator("input").nth(i)
        print(
            "INPUT",
            i,
            locator.get_attribute("name"),
            locator.get_attribute("placeholder"),
        )

    browser.close()
