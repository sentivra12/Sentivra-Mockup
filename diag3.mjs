import { chromium } from '@playwright/test';
const br  = await chromium.launch({ headless: true });
const ctx = await br.newContext({ viewport: { width: 390, height: 844 } });
const p   = await ctx.newPage();
await p.goto('http://localhost:4173/mockups', { waitUntil: 'domcontentloaded' });
await p.waitForSelector('h1'); await p.waitForTimeout(1800);
await p.evaluate(() => window.scrollBy(0, 500));
await p.waitForTimeout(300);
const r = await p.evaluate(() => {
  const btns = [...document.querySelectorAll('a, button')].filter(el => {
    const r = el.getBoundingClientRect();
    return r.width > 100 && r.height >= 44;
  });
  return btns.map(b => {
    const s = getComputedStyle(b);
    return {
      text: b.textContent.trim().substring(0, 20),
      tag: b.tagName,
      bg: s.backgroundColor,
      border: s.borderColor,
      bw: s.borderWidth,
      bwTop: s.borderTopWidth,
      cls: b.className.substring(0, 80),
    };
  });
});
console.log(JSON.stringify(r, null, 2));
await br.close();
