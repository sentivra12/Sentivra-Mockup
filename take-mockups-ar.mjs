import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const SHOTS = path.resolve('tests/screenshots');
const browser = await chromium.launch({ headless: true });

for (const [w, h, label] of [
  [390,  844, 'mob-390-ar'],
  [1440, 900, 'desk-1440-ar'],
]) {
  const ctx  = await browser.newContext({ viewport: { width:w, height:h } });
  const page = await ctx.newPage();
  // Set Arabic via localStorage before navigation
  await page.addInitScript(() => { localStorage.setItem('language', 'ar'); });
  await page.goto('http://localhost:4173/mockups', { waitUntil:'domcontentloaded', timeout:25000 });
  await page.waitForSelector('h1', { timeout:12000 });
  await page.waitForTimeout(1800);
  await page.screenshot({
    path: path.join(SHOTS, `MK-${label}.png`),
    clip: { x:0, y:0, width:w, height:h },
  });
  console.log(`✓ ${label}`);
  await ctx.close();
}

await browser.close();
console.log('Done.');
