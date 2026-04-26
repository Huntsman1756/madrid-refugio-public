from playwright.sync_api import sync_playwright
import os

BASE = "http://localhost:8788"
OUT  = r"G:\_Proyectos\refugio_madrid\prototype\screenshots"
os.makedirs(OUT, exist_ok=True)

ERRORS = []

def snap_section(page, selector, path, extra_height=80, wait_ms=500):
    """Scroll to selector, wait, then screenshot its bounding box."""
    el = page.locator(selector).first
    el.scroll_into_view_if_needed()
    page.wait_for_timeout(wait_ms)
    bb = el.bounding_box()
    if not bb:
        ERRORS.append(f"No bounding box for {selector}")
        return
    y = max(0, bb["y"] - 20)
    h = bb["height"] + extra_height
    # Clamp to page height
    page_h = page.evaluate("document.documentElement.scrollHeight")
    h = min(h, page_h - y)
    if h <= 0:
        ERRORS.append(f"Zero height for {selector}")
        return
    page.screenshot(path=path, clip={"x": 0, "y": y, "width": 1280, "height": h})


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})

    # ── HOMEPAGE ────────────────────────────────────
    page = ctx.new_page()
    console_msgs = []
    failed_reqs  = []
    page.on("console", lambda m: console_msgs.append(f"[{m.type}] {m.text}"))
    page.on("requestfailed", lambda r: failed_reqs.append(r.url))
    page.on("response", lambda r: failed_reqs.append(f"HTTP {r.status} {r.url}") if r.status >= 400 else None)
    page.goto(f"{BASE}/index.html")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(2000)          # let Leaflet + CountUp settle

    page.screenshot(path=f"{OUT}/01_homepage_full.png", full_page=True)
    page.screenshot(path=f"{OUT}/02_homepage_hero.png",
                    clip={"x": 0, "y": 0, "width": 1280, "height": 900})
    snap_section(page, ".stats-strip",  f"{OUT}/03_homepage_stats.png",    extra_height=40)
    snap_section(page, "#mapa",         f"{OUT}/04_homepage_map.png",      extra_height=60, wait_ms=1000)
    snap_section(page, "#planificador", f"{OUT}/05_homepage_planner.png",  extra_height=40)
    snap_section(page, "#datos",        f"{OUT}/06_homepage_datasets.png", extra_height=40)

    page.close()

    # ── METODOLOGÍA ─────────────────────────────────
    page2 = ctx.new_page()
    page2.on("console", lambda m: console_msgs.append(f"[{m.type}] {m.text}"))
    page2.goto(f"{BASE}/metodologia.html")
    page2.wait_for_load_state("networkidle")
    page2.wait_for_timeout(1500)

    page2.screenshot(path=f"{OUT}/07_metodologia_full.png", full_page=True)
    page2.screenshot(path=f"{OUT}/08_metodologia_hero.png",
                     clip={"x": 0, "y": 0, "width": 1280, "height": 900})
    snap_section(page2, "#pipeline",    f"{OUT}/09_metodologia_pipeline.png", extra_height=40)
    snap_section(page2, "#datos",       f"{OUT}/10_metodologia_table.png",    extra_height=40)
    snap_section(page2, "#metricas",    f"{OUT}/11_metodologia_metrics.png",  extra_height=40)
    snap_section(page2, "#tecnologia",  f"{OUT}/12_metodologia_tech.png",     extra_height=40)

    page2.close()
    browser.close()

# ── REPORT ──────────────────────────────────────────
print("Screenshots saved to:", OUT)
saved = sorted(os.listdir(OUT))
for f in saved:
    size = os.path.getsize(os.path.join(OUT, f))
    print(f"  {f:45s}  {size//1024:>5} KB")

if ERRORS:
    print("\nWarnings:")
    for e in ERRORS:
        print(" ", e)

js_errors = [m for m in console_msgs if "[error]" in m.lower() or "failed to load" in m.lower()]
if js_errors:
    print("\nBrowser console errors/warnings:")
    for e in js_errors:
        print(" ", e)
else:
    print("\nNo JS errors in console.")

if failed_reqs:
    print("\nFailed requests (404s etc.):")
    for url in failed_reqs:
        print(" ", url)
else:
    print("No failed network requests.")
