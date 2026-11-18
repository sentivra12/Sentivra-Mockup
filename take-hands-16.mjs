/**
 * Takes 16 screenshots: 4 viewports × 2 themes × 2 languages.
 * For each: captures the FULL hero (scrolled so the bottom/image is visible).
 * Uses colorScheme:'dark' + localStorage so dark actually applies.
 */
import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const SHOTS = path.resolve('tests/screenshots');
fs.mkdirSync(SHOTS, { recursive: true });
const browser = await chromium.launch({ headless: true });

const VPS  = [[360,640],[360,740],[390,844],[412,915]];
const THEMES = ['light','dark'];
const LANGS  = ['en','ar'];

for (const [w,h] of VPS) {
  for (const theme of THEMES) {
    for (const lang of LANGS) {
      const ctx = await browser.newContext({
        viewport: { width: w, height: h },
        colorScheme: theme === 'dark' ? 'dark' : 'light',
      });
      const page = await ctx.newPage();
      if (theme === 'dark') {
        await page.addInitScript(() => { localStorage.setItem('theme', 'dark'); });
      }
      if (lang === 'ar') {
        await page.addInitScript(() => { localStorage.setItem('language', 'ar'); });
      }

      await page.goto('http://localhost:4173/mockups', { waitUntil:'domcontentloaded', timeout:25000 });
      await page.waitForSelector('h1', { timeout:12000 });

      // For dark, wait for dark class to apply
      if (theme === 'dark') {
        await page.waitForFunction(
          () => document.documentElement.classList.contains('dark') ||
                document.documentElement.getAttribute('data-theme') === 'dark',
          { timeout: 5000 }
        ).catch(() => null);
      }

      await page.waitForTimeout(1800);

      // Get total hero height and scroll so bottom is visible
      const heroH = await page.evaluate(() => {
        const hero = document.querySelector('[aria-label="Hero section"],[aria-label="قسم بطل الصفحة"]');
        return hero ? hero.getBoundingClientRect().height : 0;
      });

      // Take two screenshots: top (text) and bottom (image)
      // Top: scroll to 0
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(200);
      await page.screenshot({
        path: path.join(SHOTS, `H16-${w}x${h}-${theme}-${lang}-top.png`),
        clip: { x:0, y:0, width:w, height:h },
      });

      // Bottom: scroll so hero bottom is at viewport bottom
      const scrollY = Math.max(0, heroH - h);
      await page.evaluate(sy => window.scrollTo(0, sy), scrollY);
      await page.waitForTimeout(200);
      await page.screenshot({
        path: path.join(SHOTS, `H16-${w}x${h}-${theme}-${lang}-bot.png`),
        clip: { x:0, y:0, width:w, height:h },
      });

      console.log(`✓ ${w}x${h}-${theme}-${lang}  heroH=${Math.round(heroH)}`);
      await ctx.close();
    }
  }
}
await browser.close();
console.log('Done.');
