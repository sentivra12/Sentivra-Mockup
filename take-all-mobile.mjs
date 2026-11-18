import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const SHOTS = path.resolve('tests/screenshots');
fs.mkdirSync(SHOTS, { recursive: true });
const browser = await chromium.launch({ headless: true });

const configs = [
  [360, 640,  'light', 'en'],
  [360, 640,  'dark',  'en'],
  [360, 740,  'light', 'en'],
  [360, 740,  'dark',  'en'],
  [390, 844,  'light', 'en'],
  [390, 844,  'dark',  'en'],
  [412, 915,  'light', 'en'],
  [412, 915,  'dark',  'en'],
  [360, 640,  'light', 'ar'],
  [360, 640,  'dark',  'ar'],
  [360, 740,  'light', 'ar'],
  [360, 740,  'dark',  'ar'],
  [390, 844,  'light', 'ar'],
  [390, 844,  'dark',  'ar'],
  [412, 915,  'light', 'ar'],
  [412, 915,  'dark',  'ar'],
];

for (const [w, h, theme, lang] of configs) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    colorScheme: theme === 'dark' ? 'dark' : 'light',
  });
  const page = await ctx.newPage();
  if (theme === 'dark') {
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'dark');
    });
  }
  if (lang === 'ar') {
    await page.addInitScript(() => { localStorage.setItem('language', 'ar'); });
  }
  await page.goto('http://localhost:4173/mockups', { waitUntil: 'domcontentloaded', timeout: 25000 });
  await page.waitForSelector('h1', { timeout: 12000 });
  await page.waitForTimeout(2000);
  const label = `ALL-${w}x${h}-${theme}-${lang}`;
  await page.screenshot({ path: path.join(SHOTS, `${label}.png`), clip: { x:0, y:0, width:w, height:h } });
  console.log(`✓ ${label}`);
  await ctx.close();
}

await browser.close();
console.log('Done.');
