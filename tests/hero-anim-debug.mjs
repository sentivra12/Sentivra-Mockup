import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 360, height: 740 } });

test('debug: list all infinite animations', async ({ page }) => {
  await page.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  const anims = await page.evaluate(() => {
    const hero = document.querySelector('[aria-label="Hero section"], [aria-label="القسم الرئيسي"]');
    if (!hero) return [];
    const found = [];
    const walk = (el) => {
      const s = window.getComputedStyle(el);
      const names = s.animationName?.split(',').map(n => n.trim()).filter(n => n && n !== 'none') || [];
      const iters = s.animationIterationCount?.split(',').map(n => n.trim()) || [];
      names.forEach((name, i) => {
        const count = iters[i] || iters[0] || '1';
        if (count === 'infinite') {
          found.push({ name, tag: el.tagName, cls: el.className?.substring(0,60), txt: el.textContent?.substring(0,30) });
        }
      });
      for (const child of el.children) walk(child);
    };
    walk(hero);
    return found;
  });

  console.log('INFINITE ANIMATIONS:', JSON.stringify(anims, null, 2));
  expect(anims.length).toBeLessThanOrEqual(2);
});
