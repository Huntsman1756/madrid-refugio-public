from playwright.sync_api import sync_playwright

BASE = "http://localhost:8788"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()

    logs = []
    page.on("console", lambda m: logs.append(f"[{m.type}] {m.text}"))

    page.goto(f"{BASE}/index.html")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(3000)

    # Check if L is defined
    L_defined = page.evaluate("typeof L !== 'undefined'")
    print("Leaflet (L) defined:", L_defined)

    # Check map container dimensions
    hero_dims = page.evaluate("""() => {
        const el = document.getElementById('hero-map');
        if (!el) return 'NOT FOUND';
        const r = el.getBoundingClientRect();
        const hasLeaflet = el.classList.contains('leaflet-container');
        const hasFallback = el.querySelector('[style*="Mapa interactivo"]') !== null
                         || el.innerText.includes('Mapa interactivo');
        return { w: r.width, h: r.height, hasLeaflet, hasFallback };
    }""")
    print("hero-map:", hero_dims)

    main_dims = page.evaluate("""() => {
        const el = document.getElementById('main-map');
        if (!el) return 'NOT FOUND';
        const r = el.getBoundingClientRect();
        const hasLeaflet = el.classList.contains('leaflet-container');
        const hasFallback = el.querySelector('[style*="Mapa interactivo"]') !== null
                         || el.innerText.includes('Mapa interactivo');
        return { w: r.width, h: r.height, hasLeaflet, hasFallback };
    }""")
    print("main-map:", main_dims)

    # Check Leaflet internal maps
    leaflet_maps = page.evaluate("""() => {
        if (typeof L === 'undefined') return 'L not defined';
        const containers = document.querySelectorAll('.leaflet-container');
        return containers.length + ' leaflet containers found';
    }""")
    print("Leaflet containers:", leaflet_maps)

    # Check GeoJSON fetch
    geojson_test = page.evaluate("""async () => {
        try {
            const r = await fetch('./data/barrios_merged.geojson');
            const j = await r.json();
            return { ok: r.ok, status: r.status, features: j.features?.length,
                     sampleProps: Object.keys(j.features?.[0]?.properties || {}).slice(0, 10) };
        } catch(e) { return { error: String(e) }; }
    }""")
    print("GeoJSON fetch test:", geojson_test)

    print("\nAll console logs:")
    for l in logs:
        print(" ", l)

    browser.close()
