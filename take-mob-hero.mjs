import { chromium } from '@playwright/test';
import path from 'path';
import fs   from 'fs';

const SHOTS  = path.resolve('tests/screenshots');
fs.mkdirSync(SHOTS, { recursive: true });
const browser = await chromium.launch({ headless: true });

for (const [w, h, label, dark, lang] of [
  [390, 844, 'mob-390-light-en', false, 'en'],
  [390, 844, 'mob-390-dark-en',  true,  'en'],
  [360, 740, 'mob-360-light-en', false, 'en'],
  [412, 915, 'mob-412-light-en', false, 'en'],
  [390, 844, 'mob-390-light-ar', false, 'ar'],
  [390, 844, 'mob-390-dark-ar',  true,  'ar'],
]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  if (dark) await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
  if (lang === 'ar') await page.addInitScript(() => localStorage.setItem('language', 'ar'));
  await page.goto('http://localhost:4173/mockups', { waitUntil: 'domcontentloaded', timeout: 25000 });
  await page.waitForSelector('h1', { timeout: 12000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SHOTS, `MOBFIX-${label}.png`), clip: { x:0,y:0,width:w,height:h } });
  console.log(`✓ ${label}`);
  await ctx.close();
}

await browser.close();
console.log('Done.');
