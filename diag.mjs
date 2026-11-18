import { chromium } from '@playwright/test';
const br  = await chromium.launch({ headless: true });
const ctx = await br.newContext({ viewport: { width: 390, height: 844 } });
const p   = await ctx.newPage();
await p.goto('http://localhost:4173/mockups', { waitUntil: 'domcontentloaded' });
await p.waitForSelector('h1'); await p.waitForTimeout(1800);
const info = await p.evaluate(() => {
  const sec  = document.querySelector('[aria-label="Hero section"]');
  const img  = sec?.querySelector('img');
  const h1   = sec?.querySelector('h1');
  const lines = h1 ? [...h1.querySelectorAll('span[data-line]')] : [];
  const last  = lines.at(-1);
  const imgWrap = img?.parentElement?.parentElement; // <div> containing <picture>
  return {
    secTop:    sec?.getBoundingClientRect().top,
    secBottom: sec?.getBoundingClientRect().bottom,
    secH:      sec?.getBoundingClientRect().height,
    secComputedMinH: sec ? getComputedStyle(sec).minHeight : null,
    imgTop:    img?.getBoundingClientRect().top,
    imgBottom: img?.getBoundingClientRect().bottom,
    imgH:      img?.getBoundingClientRect().height,
    imgW:      img?.getBoundingClientRect().width,
    imgNatW:   img?.naturalWidth,
    imgNatH:   img?.naturalHeight,
    lastLineBottom: last?.getBoundingClientRect().bottom,
    lastLineText:   last?.textContent,
    imgWrapBottom:  imgWrap?.getBoundingClientRect().bottom,
    imgWrapTop:     imgWrap?.getBoundingClientRect().top,
    imgWrapStyle:   imgWrap ? JSON.parse(JSON.stringify({
      position: getComputedStyle(imgWrap).position,
      bottom: getComputedStyle(imgWrap).bottom,
      left: getComputedStyle(imgWrap).left,
      transform: getComputedStyle(imgWrap).transform,
    })) : null,
  };
});
console.log(JSON.stringify(info, null, 2));
await br.close();
