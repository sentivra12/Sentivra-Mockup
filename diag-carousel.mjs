import { chromium } from '@playwright/test';
const br  = await chromium.launch({ headless: true });
const ctx = await br.newContext({ viewport: { width: 390, height: 844 } });
const p   = await ctx.newPage();
const errors = [];
p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
p.on('pageerror', e => errors.push(e.message));
await p.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(3000);
const html = await p.evaluate(() => {
  const main = document.querySelector('main') || document.body;
  // Check what's in the first 1000 chars
  const carousel = !!document.querySelector('[data-hero-carousel]');
  const heroMob  = !!document.querySelector('[aria-label="القسم الرئيسي"],[aria-label="Hero section"]');
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const bodyText = document.body.innerHTML.substring(0,300);
  return { carousel, heroMob, isMobile, errors: window.__errors, bodyText };
});
console.log('carousel:', html.carousel);
console.log('heroMob:', html.heroMob);
console.log('isMobile:', html.isMobile);
console.log('body snippet:', html.bodyText.replace(/<[^>]+>/g,'').substring(0,150));
console.log('JS errors:', errors.slice(0,5));
await br.close();
