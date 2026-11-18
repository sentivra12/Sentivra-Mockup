import { test } from '@playwright/test';

const BASE = 'http://localhost:4173';

for (const [lang, label] of [['en','EN'],['ar','AR']]) {
  test(`screenshot 390x844 dark ${label}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript((l) => {
      localStorage.setItem('theme', 'dark');
      localStorage.setItem('language', l);
    }, lang);
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-hero-mobile="true"]', { timeout: 12000 });
    await page.waitForTimeout(1200);
    await page.screenshot({
      path: `test-results/NEW-390x844-dark-${label}.png`,
      clip: { x: 0, y: 0, width: 390, height: 844 },
    });
  });
}
