import { chromium, firefox, webkit } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const SHOTS = path.resolve('tests/screenshots');
fs.mkdirSync(SHOTS, { recursive: true });

const URL = 'http://localhost:4173/mockups';

const configs = [
  { browser: 'chromium', w: 390,  h: 844,  label: 'mob-390-light',  dark: false },
  { browser: 'chromium', w: 390,  h: 844,  label: 'mob-390-dark',   dark: true  },
  { browser: 'chromium', w: 360,  h: 640,  label: 'mob-360-light',  dark: false },
  { browser: 'chromium', w: 1440, h: 900,  label: 'desk-1440-light',dark: false },
  { browser: 'chromium', w: 1440, h: 900,  label: 'desk-1440-dark', dark: true  },
  { browser: 'firefox',  w: 390,  h: 844,  label: 'ff-mob-390',     dark: false },
  { browser: 'webkit',   w: 390,  h: 844,  label: 'wk-mob-390',     dark: false },
];

for (const { browser: brName, w, h, label, dark } of configs) {
  const BrowserType = brName === 'chromium' ? chromium : brName === 'firefox' ? firefox : webkit;
  const browser = await BrowserType.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  if (dark) await page.addInitScript(() => { localStorage.setItem('theme', 'dark'); });

  try {
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('[aria-label="Hero section"], [aria-label="قسم بطل الصفحة"]', { timeout: 15000 });
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(SHOTS, `MOCKUPS-hero-${label}.png`),
      clip: { x: 0, y: 0, width: w, height: h },
    });
    console.log(`✓ ${label} (${brName})`);
  } catch(e) {
    console.error(`✗ ${label}: ${e.message.split('\n')[0]}`);
  }
  await ctx.close();
  await browser.close();
}
console.log('Done.');
