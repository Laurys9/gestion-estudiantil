const { chromium } = require('playwright');
const path = require('path');

const url = 'file:///C:/Users/ASUS25/Downloads/gestion-estudiantil-landing/index.html';
const shots = path.join(__dirname, 'shots');

const scrollThrough = async (page) => {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 500) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(90);
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(350);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(250);
};

(async () => {
  const browser = await chromium.launch();
  const errors = [];

  for (const width of [1440, 1024, 768, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    page.on('pageerror', (error) => errors.push(`${width}px pageerror: ${error.message}`));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(`${width}px console: ${message.text()}`);
    });

    await page.goto(url, { waitUntil: 'load' });
    await page.waitForTimeout(400);
    await scrollThrough(page);

    const data = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      hiddenReveals: [...document.querySelectorAll('[data-reveal]')].filter((el) => !el.classList.contains('in')).length,
      h1: document.querySelector('h1').getBoundingClientRect().height,
      heroPhoto: document.querySelector('.hero-photo-frame').getBoundingClientRect().height,
      heroCard: document.querySelector('.hero-card').getBoundingClientRect(),
      activePanel: [...document.querySelectorAll('.tab-panel')].find((el) => !el.hidden)?.id,
      counters: [...document.querySelectorAll('.tab-panel:not([hidden]) [data-count]')].map((el) => el.textContent)
    }));

    console.log(width, JSON.stringify({
      overflow: data.scrollWidth - data.clientWidth,
      hiddenReveals: data.hiddenReveals,
      activePanel: data.activePanel,
      counters: data.counters,
      h1: Math.round(data.h1),
      heroPhoto: Math.round(data.heroPhoto),
      heroCard: {
        w: Math.round(data.heroCard.width),
        top: Math.round(data.heroCard.top),
        bottom: Math.round(data.heroCard.bottom)
      }
    }));

    if (width === 1440 || width === 768 || width === 390) {
      await page.screenshot({ path: path.join(shots, `v3-${width}.png`), fullPage: true });
    }
    await page.close();
  }

  // Interaction pass on mobile
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('pageerror', (error) => errors.push(`interaction pageerror: ${error.message}`));
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(300);

  await page.click('#menuToggle');
  console.log('menu', {
    open: await page.locator('#navLinks').evaluate((el) => el.classList.contains('open')),
    expanded: await page.locator('#menuToggle').getAttribute('aria-expanded'),
    label: await page.locator('#menuToggle').getAttribute('aria-label'),
    text: (await page.locator('#menuLabel').textContent()).trim(),
    icon: await page.locator('#menuToggle use').getAttribute('href')
  });

  await page.keyboard.press('Escape');
  console.log('menuAfterEsc', await page.locator('#navLinks').evaluate((el) => el.classList.contains('open')));

  await page.click('#menuToggle');
  await page.click('.nav-login');
  console.log('dialog', {
    open: await page.locator('#demoDialog').evaluate((el) => el.open),
    title: await page.locator('#dialogTitle').textContent(),
    icon: await page.locator('#demoDialog .icon-tile use').getAttribute('href')
  });
  await page.locator('#demoDialog .button').click();
  console.log('dialogClosed', !(await page.locator('#demoDialog').evaluate((el) => el.open)));

  // Tabs: activate asistencia and wait for bars + counters.
  await page.locator('#asi-se-ve').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.click('#tab-asistencia');
  await page.waitForTimeout(1200);
  console.log('tabs', {
    selected: await page.locator('#tab-asistencia').getAttribute('aria-selected'),
    visible: await page.locator('#panel-asistencia').isVisible(),
    hiddenNotas: await page.locator('#panel-notas').isHidden(),
    counters: await page.locator('#panel-asistencia [data-count]').allTextContents(),
    firstBar: await page.locator('#panel-asistencia .bar > span').first().evaluate((el) => getComputedStyle(el).width),
    barTrack: await page.locator('#panel-asistencia .bar').first().evaluate((el) => getComputedStyle(el).width)
  });

  // Keyboard tabs
  await page.locator('#tab-asistencia').focus();
  await page.keyboard.press('ArrowRight');
  console.log('tabsKeyboard', {
    focused: await page.evaluate(() => document.activeElement.id),
    selected: await page.evaluate(() => document.querySelector('[role="tab"][aria-selected="true"]').id)
  });

  // Desktop interaction pass
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  desktop.on('pageerror', (error) => errors.push(`desktop pageerror: ${error.message}`));
  await desktop.goto(url, { waitUntil: 'load' });
  await desktop.locator('#asi-se-ve').scrollIntoViewIfNeeded();
  await desktop.waitForTimeout(400);
  await desktop.click('#tab-notas');
  await desktop.waitForTimeout(1100);
  console.log('desktopTabs', {
    active: await desktop.locator('[role="tab"][aria-selected="true"]').textContent(),
    counters: await desktop.locator('#panel-notas [data-count]').allTextContents(),
    panelHeight: Math.round(await desktop.locator('#panel-notas').evaluate((el) => el.getBoundingClientRect().height))
  });

  console.log('errors', errors);
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
