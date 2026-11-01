const { chromium } = require('playwright');
const path = require('path');

const url = 'file:///C:/Users/ASUS25/Downloads/gestion-estudiantil-landing/index.html';
const shots = path.join(__dirname, 'shots');

const revealAll = async (page) => {
  await page.evaluate(async () => {
    const height = document.documentElement.scrollHeight;
    for (let y = 0; y < height; y += 420) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 70));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(500);
};

(async () => {
  const browser = await chromium.launch();

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await desktop.goto(url, { waitUntil: 'load' });
  await revealAll(desktop);
  await desktop.locator('.cta').scrollIntoViewIfNeeded();
  await desktop.waitForTimeout(400);
  await desktop.locator('.cta').screenshot({ path: path.join(shots, 'v3-cta-2.png') });

  const menu = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await menu.goto(url, { waitUntil: 'load' });
  await menu.waitForTimeout(400);
  await menu.click('#menuToggle');
  await menu.waitForTimeout(300);
  await menu.screenshot({ path: path.join(shots, 'v3-menu.png') });

  await menu.click('.nav-login');
  await menu.waitForTimeout(300);
  await menu.screenshot({ path: path.join(shots, 'v3-dialog.png') });
  await menu.close();

  const small = await browser.newPage({ viewport: { width: 320, height: 900 } });
  await small.goto(url, { waitUntil: 'load' });
  await revealAll(small);
  await small.screenshot({ path: path.join(shots, 'v3-320-full.png'), fullPage: true });

  const tablet = await browser.newPage({ viewport: { width: 768, height: 1000 } });
  await tablet.goto(url, { waitUntil: 'load' });
  await revealAll(tablet);
  await tablet.locator('.hero').screenshot({ path: path.join(shots, 'v3-hero-768.png') });
  await tablet.locator('.facts').screenshot({ path: path.join(shots, 'v3-facts-768.png') });

  const phone = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await phone.goto(url, { waitUntil: 'load' });
  await revealAll(phone);
  await phone.locator('.hero').screenshot({ path: path.join(shots, 'v3-hero-390.png') });
  await phone.locator('.cta').screenshot({ path: path.join(shots, 'v3-cta-390.png') });

  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
