import { chromium } from '@playwright/test';
const br = await chromium.launch({ headless: true });
for (const [w, h] of [[360,640],[360,740],[390,844],[412,915]]) {
  const ctx = await br.newContext({ viewport: { width: w, height: h } });
  const p   = await ctx.newPage();
  await p.goto('http://localhost:4173/mockups', { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('h1');
  await p.waitForTimeout(1200);
  const r = await p.evaluate(() => {
    const sec   = document.querySelector('[aria-label="Hero section"]');
    const img   = sec && sec.querySelector('img');
    const h1    = sec && sec.querySelector('h1');
    const lines = h1 ? [...h1.querySelectorAll('span[data-line]')] : [];
    const last  = lines[lines.length - 1];
    const imgT  = img ? img.getBoundingClientRect().top    : 0;
    const lastB = last ? last.getBoundingClientRect().bottom : 0;
    return {
      secH:       sec  ? Math.round(sec.getBoundingClientRect().height)   : 0,
      imgW:       img  ? Math.round(img.getBoundingClientRect().width)    : 0,
      imgH:       img  ? Math.round(img.getBoundingClientRect().height)   : 0,
      imgTop:     Math.round(imgT),
      lastBottom: Math.round(lastB),
      overlap:    parseFloat((lastB - imgT).toFixed(1)),
    };
  });
  console.log(`${w}x${h}: secH=${r.secH} imgW=${r.imgW} imgH=${r.imgH} imgTop=${r.imgTop} lastBottom=${r.lastBottom} overlap=${r.overlap}`);
  await ctx.close();
}
await br.close();
