import { chromium } from '@playwright/test';
import path from 'path';
import fs   from 'fs';

const SHOTS = path.resolve('tests/screenshots');
fs.mkdirSync(SHOTS, { recursive: true });
const br = await chromium.launch({ headless: true });

// 4 viewports × 2 themes × 2 langs × 2 scroll positions = 32 total
// But we'll do: 5 vps × 2 themes EN (top+sheet) = 20, plus AR 390 dark+light top+sheet = 8
const VPS = [[360,640],[360,740],[390,844],[412,915],[430,932]];

async function snap(w, h, theme, lang, scroll) {
  const ctx = await br.newContext({
    viewport: { width: w, height: h },
    colorScheme: theme === 'dark' ? 'dark' : 'light',
  });
  const p = await ctx.newPage();
  if (theme === 'dark') await p.addInitScript(() => { localStorage.setItem('theme','dark'); });
  if (lang === 'ar')    await p.addInitScript(() => { localStorage.setItem('language','ar'); });
  await p.goto('http://localhost:4173/mockups', { waitUntil:'domcontentloaded', timeout:25000 });
  await p.waitForSelector('h1', { timeout:12000 });
  if (theme === 'dark') {
    await p.waitForFunction(
      () => document.documentElement.classList.contains('dark') ||
            document.documentElement.getAttribute('data-theme') === 'dark',
      { timeout: 5000 }
    ).catch(() => null);
  }
  await p.waitForTimeout(2500);
  if (scroll === 'sheet') {
    await p.evaluate(() => {
      const s = document.querySelector('[data-hero-sheet]');
      if (s) s.scrollIntoView({ behavior:'instant', block:'start' });
    });
    await p.waitForTimeout(200);
  } else {
    await p.evaluate(() => window.scrollTo(0,0));
  }
  const label = `FIT-${w}x${h}-${theme}-${lang}-${scroll}`;
  await p.screenshot({ path: path.join(SHOTS, `${label}.png`), clip:{x:0,y:0,width:w,height:h} });
  console.log(`✓ ${label}`);
  await ctx.close();
}

for (const [w,h] of VPS) {
  for (const theme of ['light','dark']) {
    await snap(w, h, theme, 'en', 'top');
    await snap(w, h, theme, 'en', 'sheet');
  }
}
// AR
for (const theme of ['light','dark']) {
  await snap(390, 844, theme, 'ar', 'top');
  await snap(390, 844, theme, 'ar', 'sheet');
}

await br.close();
console.log('Done.');
