import { chromium } from '@playwright/test';
const br = await chromium.launch({ headless: true });
for (const [w, h] of [[360,640],[390,844],[412,915]]) {
  const ctx = await br.newContext({ viewport: { width: w, height: h } });
  const p   = await ctx.newPage();
  await p.goto('http://localhost:4173/mockups', { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('h1'); await p.waitForTimeout(1500);
  const r = await p.evaluate(() => {
    const sec  = document.querySelector('[aria-label="Hero section"]');
    const img  = sec?.querySelector('img');
    const h1   = sec?.querySelector('h1');
    const row2 = sec?.children[1]; // second grid row (visual area div)
    return {
      secH:    Math.round(sec?.getBoundingClientRect().height),
      secTop:  Math.round(sec?.getBoundingClientRect().top),
      row2Top: Math.round(row2?.getBoundingClientRect().top),
      row2H:   Math.round(row2?.getBoundingClientRect().height),
      h1Bot:   Math.round(h1?.getBoundingClientRect().bottom),
      imgTop:  Math.round(img?.getBoundingClientRect().top),
      imgBot:  Math.round(img?.getBoundingClientRect().bottom),
      imgW:    Math.round(img?.getBoundingClientRect().width),
      imgH:    Math.round(img?.getBoundingClientRect().height),
      imgNatW: img?.naturalWidth,
      imgNatH: img?.naturalHeight,
      gap:     Math.round((img?.getBoundingClientRect().top||0) - (h1?.getBoundingClientRect().bottom||0)),
    };
  });
  console.log(`${w}x${h}: secH=${r.secH} row2Top=${r.row2Top} row2H=${r.row2H} h1Bot=${r.h1Bot} imgTop=${r.imgTop} imgBot=${r.imgBot} imgW=${r.imgW} imgH=${r.imgH} gap=${r.gap}`);
  await ctx.close();
}
await br.close();
