import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    recordVideo: { dir: './videos/' },
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();
  
  console.log("Navigating to http://localhost:3000 ...");
  
  // Wait until Next.js dev server is responsive
  let ready = false;
  for (let i = 0; i < 30; i++) {
    try {
      const response = await page.goto('http://localhost:3000', { timeout: 10000 });
      if (response && response.status() === 200) {
        ready = true;
        break;
      }
    } catch (e) {
      console.log("Server not ready, retrying in 2 seconds...");
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  if (!ready) {
    console.error("Server did not start in time.");
    await browser.close();
    process.exit(1);
  }

  console.log("Page loaded. Waiting 2s for Leaflet to initialize...");
  await page.waitForTimeout(2000);
  
  console.log("Scrolling to Map and Vulnerability section...");
  await page.evaluate(() => {
    window.scrollTo({ top: 1200, behavior: 'smooth' });
  });
  await page.waitForTimeout(2000);

  console.log("Clicking on the map to select a Barrio...");
  // Find the map container and click in the center
  const mapLocator = page.locator('.leaflet-container');
  await mapLocator.waitFor({ state: 'visible', timeout: 10000 });
  const box = await mapLocator.boundingBox();
  if (box) {
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    console.log("Clicked on the map.");
    await page.waitForTimeout(2000); // Wait for the selection card to update
  }

  console.log("Scrolling back to Routing section...");
  await page.evaluate(() => {
    window.scrollTo({ top: 600, behavior: 'smooth' });
  });
  await page.waitForTimeout(1000);

  console.log("Clicking 'Calcular ruta más fresca'...");
  const calculateBtn = page.getByRole('button', { name: /calcular ruta más fresca/i });
  await calculateBtn.waitFor({ state: 'visible', timeout: 5000 });
  await calculateBtn.click();
  
  console.log("Waiting for route to calculate (this might take a bit for the first request)...");
  await page.waitForTimeout(500);
  // Wait for the route metrics table to appear
  const comparativaTitle = page.getByText(/Comparativa de Rutas/i);
  await comparativaTitle.waitFor({ state: 'visible', timeout: 45000 });
  console.log("Route calculated!");
  
  // Show the metrics table
  await page.waitForTimeout(3000);

  console.log("Scrolling down to show the updated routed map...");
  await page.evaluate(() => {
    window.scrollTo({ top: 1200, behavior: 'smooth' });
  });
  await page.waitForTimeout(4000); // Look at the routed map

  console.log("Closing context to save video...");
  await context.close();
  await browser.close();
  console.log("Demo video saved in ./videos/ directory.");
})();