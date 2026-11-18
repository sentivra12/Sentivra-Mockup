import { chromium } from '@playwright/test';
const br = await chromium.launch({ headless: true });
for (const [w, h] of [[360,640],[390,844],[412,915],[430,932]]) {
  const ctx = await br.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  await p.goto('http://localhost:4173/mockups', { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('h1'); await p.waitForTimeout(2200);
  const r = await p.evaluate(() => {
    const sec  = document.querySelector('[aria-label="Hero section"]');
    const img  = sec?.querySelector('img');
    const h1   = sec?.querySelector('h1');
    const lines = [...(h1?.querySelectorAll('span[data-line]') || [])];
    const last  = lines[lines.length - 1];
    const imgT  = img ? img.getBoundingClientRect().top    : 0;
    const lastB = last ? last.getBoundingClientRect().bottom : (h1?.getBoundingClientRect().bottom || 0);
    return {
      secH:    Math.round(sec?.getBoundingClientRect().height),
      h1Bot:   Math.round(lastB),
      imgTop:  Math.round(imgT),
      imgBot:  Math.round(img?.getBoundingClientRect().bottom),
      imgW:    Math.round(img?.getBoundingClientRect().width),
      imgH:    Math.round(img?.getBoundingClientRect().height),
      overlap: parseFloat((lastB - imgT).toFixed(1)),
    };
  });
  console.log(`${w}x${h}: secH=${r.secH} h1Bot=${r.h1Bot} imgW=${r.imgW} imgH=${r.imgH} imgTop=${r.imgTop} imgBot=${r.imgBot} overlap=${r.overlap}`);
  await ctx.close();
}
await br.close();
