const { chromium } = require('playwright');
const path = require('path');

const url = 'file:///C:/Users/ASUS25/Downloads/gestion-estudiantil-landing/index.html';
const shots = path.join(__dirname, 'shots');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(600);

  // Reveal everything, then return to top.
  await page.evaluate(async () => {
    const height = document.documentElement.scrollHeight;
    for (let y = 0; y < height; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 80));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(700);

  for (const [name, selector] of [
    ['hero', '.hero'],
    ['features', '.features'],
    ['see', '.see'],
    ['cta', '.cta']
  ]) {
    const element = page.locator(selector);
    await element.scrollIntoViewIfNeeded();
    await page.waitForTimeout(350);
    await element.screenshot({ path: path.join(shots, `v3-${name}.png`) });
  }

  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
