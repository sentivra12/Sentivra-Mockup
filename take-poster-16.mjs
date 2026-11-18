/**
 * 16 screenshots: 4 viewports × 2 themes × 2 scroll positions (top + sheet)
 * Also AR at 390×844 (light + dark, top + sheet) = 4 extra
 */
import { chromium } from '@playwright/test';
import path from 'path';
import fs   from 'fs';

const SHOTS = path.resolve('tests/screenshots');
fs.mkdirSync(SHOTS, { recursive: true });
const browser = await chromium.launch({ headless: true });

const VPS    = [[360,640],[360,740],[390,844],[412,915]];
const THEMES = ['light','dark'];

async function shot(browser, w, h, theme, lang, scroll) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    colorScheme: theme === 'dark' ? 'dark' : 'light',
  });
  const page = await ctx.newPage();
  if (theme === 'dark') await page.addInitScript(() => { localStorage.setItem('theme','dark'); });
  if (lang === 'ar')    await page.addInitScript(() => { localStorage.setItem('language','ar'); });
  await page.goto('http://localhost:4173/mockups', { waitUntil: 'domcontentloaded', timeout: 25000 });
  await page.waitForSelector('h1', { timeout: 12000 });
  if (theme === 'dark') {
    await page.waitForFunction(
      () => document.documentElement.classList.contains('dark') ||
            document.documentElement.getAttribute('data-theme') === 'dark',
      { timeout: 5000 }
    ).catch(() => null);
  }
  await page.waitForTimeout(1800);

  if (scroll === 'top') {
    await page.evaluate(() => window.scrollTo(0, 0));
  } else {
    await page.evaluate(() => {
      const sheet = document.querySelector('[data-hero-sheet]');
      if (sheet) sheet.scrollIntoView({ behavior: 'instant', block: 'start' });
      else window.scrollBy(0, 600);
    });
  }
  await page.waitForTimeout(300);

  const label = `P16-${w}x${h}-${theme}-${lang}-${scroll}`;
  await page.screenshot({
    path: path.join(SHOTS, `${label}.png`),
    clip: { x: 0, y: 0, width: w, height: h },
  });
  console.log(`✓ ${label}`);
  await ctx.close();
}

// 4 viewports × 2 themes, EN only, top + sheet = 16
for (const [w, h] of VPS) {
  for (const theme of THEMES) {
    await shot(browser, w, h, theme, 'en', 'top');
    await shot(browser, w, h, theme, 'en', 'sheet');
  }
}

// AR at 390×844 (light + dark, top + sheet) = 4 extra
for (const theme of THEMES) {
  await shot(browser, 390, 844, theme, 'ar', 'top');
  await shot(browser, 390, 844, theme, 'ar', 'sheet');
}

await browser.close();
console.log('Done.');
