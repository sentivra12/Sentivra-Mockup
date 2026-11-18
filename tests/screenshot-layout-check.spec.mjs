import { test } from '@playwright/test';
const BASE = 'http://localhost:4173';
const VPs = [
  { w:360, h:640, name:'360x640' },
  { w:390, h:844, name:'390x844' },
  { w:412, h:915, name:'412x915' },
];
for (const vp of VPs) {
  for (const [lang, label] of [['en','EN'],['ar','AR']]) {
    test(`${vp.name} dark ${label}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await page.addInitScript((l) => {
        localStorage.setItem('theme', 'dark');
        localStorage.setItem('language', l);
      }, lang);
      await page.goto(BASE, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('[data-hero-mobile="true"]', { timeout: 12000 });
      await page.waitForTimeout(800);
      await page.screenshot({
        path: `test-results/layout-${vp.name}-dark-${label}.png`,
        clip: { x:0, y:0, width: vp.w, height: vp.h },
      });
    });
  }
}
