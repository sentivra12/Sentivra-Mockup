import { chromium } from '@playwright/test';
const br = await chromium.launch({ headless: true });
const ctx = await br.newContext({ viewport: { width: 390, height: 844 } });
const p = await ctx.newPage();
await p.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
await p.waitForSelector('[data-hero-carousel]', { timeout: 12000 });
await p.waitForTimeout(2000);

const info = await p.evaluate(() => {
  const c = document.querySelector('[data-hero-carousel]');
  const wa   = c?.querySelector('[data-whatsapp-btn]');
  const prev = c?.querySelector('[data-prev-btn]');
  const next = c?.querySelector('[data-next-btn]');
  const menu = c?.querySelector('[data-menu-btn]');
  const imgs = [...document.querySelectorAll('img')].filter(i => i.src.includes('supabase'));
  
  function hitInfo(el) {
    if (!el) return { found: false };
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width/2, r.top + r.height/2);
    return {
      found: true,
      rect: { t: Math.round(r.top), b: Math.round(r.bottom), l: Math.round(r.left), r: Math.round(r.right) },
      hit: hit ? (hit.tagName + ' ' + String(hit.dataset?.whatsappBtn||hit.dataset?.prevBtn||hit.dataset?.nextBtn||hit.dataset?.menuBtn||hit.getAttribute?.('data-cta-primary')||hit.className||'').substring(0,40)) : 'null',
      isMatch: hit === el || el.contains(hit),
    };
  }
  
  return {
    wa:   hitInfo(wa),
    prev: hitInfo(prev),
    next: hitInfo(next),
    menu: hitInfo(menu),
    supabaseImgs: imgs.map(i => i.src),
    heroH: c ? Math.round(c.getBoundingClientRect().height) : 0,
    vpH: window.innerHeight,
  };
});
console.log(JSON.stringify(info, null, 2));
await br.close();
