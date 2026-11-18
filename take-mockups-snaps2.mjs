import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const SHOTS = path.resolve('tests/screenshots');
fs.mkdirSync(SHOTS, { recursive: true });
const URL = 'http://localhost:4173/mockups';

const browser = await chromium.launch({ headless: true });

for (const [w, h, label, dark] of [
  [390,  844, 'mob-390-light',   false],
  [390,  844, 'mob-390-dark',    true ],
  [360,  640, 'mob-360-light',   false],
  [1440, 900, 'desk-1440-light', false],
  [1440, 900, 'desk-1440-dark',  true ],
]) {
  const ctx  = await browser.newContext({ viewport: { width:w, height:h } });
  const page = await ctx.newPage();
  if (dark) await page.addInitScript(() => { localStorage.setItem('theme','dark'); });
  await page.goto(URL, { waitUntil:'domcontentloaded', timeout:25000 });
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
