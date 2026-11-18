import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const SHOTS = path.resolve('tests/screenshots');
fs.mkdirSync(SHOTS, { recursive: true });

const configs = [
  { w: 390, h: 844, label: 'mobile-390-light' },
  { w: 390, h: 844, label: 'mobile-390-dark',  dark: true },
  { w: 360, h: 640, label: 'mobile-360-light' },
];

const browser = await chromium.launch({ headless: true });

for (const { w, h, label, dark } of configs) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  if (dark) await page.addInitScript(() => { localStorage.setItem('theme', 'dark'); });

  await page.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[aria-label="Hero section"], [aria-label="القسم الرئيسي"]', { timeout: 15000 });
  await page.waitForTimeout(2000);

  await page.screenshot({
    path: path.join(SHOTS, `R2-final-${label}.png`),
    clip: { x: 0, y: 0, width: w, height: h },
  });
  console.log(`✓ ${label}`);
  await ctx.close();
}

await browser.close();
console.log('Done.');
