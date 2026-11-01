const { chromium } = require('playwright');
const path = require('path');

const url = 'file:///C:/Users/ASUS25/Downloads/gestion-estudiantil-landing/index.html';
const shots = path.join(__dirname, 'shots');

const revealAll = async (page) => {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 300) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(90);
  }
  await page.waitForTimeout(400);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
};

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const results = {};

  for (const width of [320, 360, 390, 768, 1024, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    page.on('pageerror', (error) => errors.push(`${width}px pageerror: ${error.message}`));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(`${width}px console: ${message.text()}`);
    });

    await page.goto(url, { waitUntil: 'load' });
    await page.waitForTimeout(400);
    await revealAll(page);

    const data = await page.evaluate(() => {
      const offscreen = [];
      document.querySelectorAll('*').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.right > document.documentElement.clientWidth + 1) {
          offscreen.push(`${el.tagName}.${(el.className || '').toString().slice(0, 28)}`);
        }
      });
      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        hiddenReveals: [...document.querySelectorAll('[data-reveal]')].filter((el) => !el.classList.contains('in')).length,
        offscreen: offscreen.slice(0, 6),
        heroH: Math.round(document.querySelector('.hero').getBoundingClientRect().height),
        sectionHeights: ['.features', '.steps', '.see', '.cta'].map((sel) => Math.round(document.querySelector(sel).getBoundingClientRect().height))
      };
    });

    results[width] = data;
    console.log(width, JSON.stringify({
      overflow: data.scrollWidth - data.clientWidth,
      hiddenReveals: data.hiddenReveals,
      offscreen: data.offscreen,
      heroH: data.heroH,
      sectionHeights: data.sectionHeights
    }));

    if (width === 320 || width === 390 || width === 768 || width === 1440) {
      await page.screenshot({ path: path.join(shots, `v4-${width}.png`), fullPage: true });
    }
    await page.close();
  }

  // Interactions
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', (error) => errors.push(`final-1440 pageerror: ${error.message}`));
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(500);

  console.log('headerScrolled', await page.evaluate(() => {
    window.scrollTo(0, 400);
    return new Promise((r) => setTimeout(() => r(document.querySelector('.site-header').classList.contains('scrolled')), 250));
  }));

  await page.locator('#asi-se-ve').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.click('#tab-asistencia');
  await page.waitForTimeout(1300);
  console.log('tabAsistencia', await page.evaluate(() => ({
    counters: [...document.querySelectorAll('#panel-asistencia [data-count]')].map((el) => el.textContent),
    bar: getComputedStyle(document.querySelector('#panel-asistencia .bar > span')).width,
    track: getComputedStyle(document.querySelector('#panel-asistencia .bar')).width
  })));

  // Element shots
  await page.evaluate(() => window.scrollTo(0, 0));
  for (const [name, selector] of [['cta-3', '.cta'], ['see-3', '.see']]) {
    const element = page.locator(selector);
    await element.scrollIntoViewIfNeeded();
    await page.waitForTimeout(320);
    await element.screenshot({ path: path.join(shots, `v4-${name}.png`) });
  }

  console.log('errors', errors);
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
