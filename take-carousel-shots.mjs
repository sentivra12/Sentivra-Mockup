import { chromium } from '@playwright/test';
import path from 'path';
import fs   from 'fs';

const SHOTS = path.resolve('tests/screenshots');
fs.mkdirSync(SHOTS, { recursive: true });
const br = await chromium.launch({ headless: true });

const configs = [
  // 390x844: all 4 combos (reference viewport) × slide 0 and slide 1
  [390, 844, 'light', 'en'],
  [390, 844, 'dark',  'en'],
  [390, 844, 'light', 'ar'],
  [390, 844, 'dark',  'ar'],
  // Other viewports light EN only
  [360, 640,  'light', 'en'],
  [360, 640,  'dark',  'en'],
  [360, 740,  'light', 'en'],
  [412, 915,  'light', 'en'],
  [430, 932,  'light', 'en'],
  // 1440 desktop — must NOT show carousel
  [1440, 900, 'light', 'en'],
  [1440, 900, 'dark',  'en'],
];

for (const [w, h, theme, lang] of configs) {
  const ctx = await br.newContext({
    viewport: { width: w, height: h },
    colorScheme: theme === 'dark' ? 'dark' : 'light',
  });
  const p = await ctx.newPage();
  if (theme === 'dark') await p.addInitScript(() => { localStorage.setItem('sentivra-theme', 'dark'); });
  if (lang === 'ar')    await p.addInitScript(() => { localStorage.setItem('language', 'ar'); });

  await p.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded', timeout: 25000 });

  const isMobile = w <= 768;
  if (isMobile) {
    await p.waitForSelector('[data-hero-carousel]', { timeout: 12000 });
  } else {
    await p.waitForSelector('[data-hero-desktop]', { timeout: 12000 });
  }

  if (theme === 'dark') {
    await p.waitForFunction(
      () => document.documentElement.classList.contains('dark') ||
            document.documentElement.getAttribute('data-theme') === 'dark',
      { timeout: 5000 }
    ).catch(() => null);
  }
  await p.waitForTimeout(2000);
  await p.evaluate(() => window.scrollTo(0, 0));

  // Slide 0 screenshot
  const label0 = `CAR-${w}x${h}-${theme}-${lang}-slide0`;
  await p.screenshot({ path: path.join(SHOTS, `${label0}.png`), clip:{x:0,y:0,width:w,height:Math.min(h,900)} });
  console.log(`✓ ${label0}`);

  // For mobile: advance to slide 1 and screenshot
  if (isMobile && w === 390 && lang === 'en') {
    await p.evaluate(() => {
      document.querySelector('[data-next-btn]')?.click();
    });
    await p.waitForTimeout(600);
    const label1 = `CAR-${w}x${h}-${theme}-${lang}-slide1`;
    await p.screenshot({ path: path.join(SHOTS, `${label1}.png`), clip:{x:0,y:0,width:w,height:h} });
    console.log(`✓ ${label1}`);
  }

  await ctx.close();
}

await br.close();
console.log('Done.');
