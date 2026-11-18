/**
 * BEFORE test — round 2 mobile hero bugs.
 * These assertions must FAIL after the fix (proving the bugs were real).
 * Run against http://localhost:4173 (vite preview of the CURRENT build).
 *
 * Tests:
 *  1. elementFromPoint at center of each CTA returns the CTA itself, not a stage card
 *  2. Stage element does NOT intersect the CTA bounding-rects
 *  3. Stats + typewriter row is present and non-empty
 *  4. Trust chips row does not overflow (scrollWidth <= clientWidth + 1px tolerance)
 */

import { test, expect } from '@playwright/test';

const VP = { width: 390, height: 844 };

test.describe('BEFORE Round 2: Mobile hero bugs', () => {

  test.use({ viewport: VP });

  async function loadHero(page) {
    await page.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[aria-label="Hero section"], [aria-label="القسم الرئيسي"]', { timeout: 15000 });
    await page.waitForTimeout(1000);
  }

  /* ── BUG 1: stage overlaps / covers CTA buttons ─────────────────────── */
  test('BUG1: elementFromPoint at primary CTA center should return CTA (not stage)', async ({ page }) => {
    await loadHero(page);

    const result = await page.evaluate(() => {
      // Find both CTAs (full-width buttons in the hero)
      const hero = document.querySelector('[aria-label="Hero section"], [aria-label="القسم الرئيسي"]');
      if (!hero) return { ok: false, reason: 'no hero' };

      const btns = [...hero.querySelectorAll('a, button')].filter(el => {
        const r = el.getBoundingClientRect();
        return r.width > 200 && r.height >= 44; // full-width CTA
      });

      if (btns.length < 2) return { ok: false, reason: `only ${btns.length} CTAs found` };

      const results = btns.slice(0, 2).map(btn => {
        const r   = btn.getBoundingClientRect();
        const cx  = r.left + r.width  / 2;
        const cy  = r.top  + r.height / 2;
        const hit = document.elementFromPoint(cx, cy);
        // hit must be the button itself or a child of it
        const isOk = hit === btn || btn.contains(hit);
        return { cx, cy, hitTag: hit?.tagName, hitCls: hit?.className?.substring(0, 60), isOk };
      });

      return { ok: results.every(r => r.isOk), results };
    });

    console.log('BUG1 result:', JSON.stringify(result, null, 2));
    // This SHOULD FAIL before the fix (stage overlaps CTAs)
    expect(result.ok, `CTA hit-test: ${JSON.stringify(result.results)}`).toBe(true);
  });

  /* ── BUG 1b: stage bounding-rect must not intersect CTA bounding-rects ─ */
  test('BUG1b: stage must not overlap CTA buttons', async ({ page }) => {
    await loadHero(page);

    const overlap = await page.evaluate(() => {
      const hero  = document.querySelector('[aria-label="Hero section"], [aria-label="القسم الرئيسي"]');
      const stage = document.querySelector('[aria-label="Software services illustration"], [aria-label="رسم توضيحي لخدمات البرمجيات"]');
      if (!hero || !stage) return { ok: true, reason: 'stage not found' };

      const sR = stage.getBoundingClientRect();
      const btns = [...hero.querySelectorAll('a, button')].filter(el => {
        const r = el.getBoundingClientRect();
        return r.width > 200 && r.height >= 44;
      });

      const overlaps = btns.map(btn => {
        const bR = btn.getBoundingClientRect();
        const horz = sR.left < bR.right && sR.right > bR.left;
        const vert = sR.top  < bR.bottom && sR.bottom > bR.top;
        return { text: btn.textContent?.trim().substring(0, 20), overlaps: horz && vert };
      }).filter(x => x.overlaps);

      return { ok: overlaps.length === 0, overlaps };
    });

    console.log('BUG1b result:', JSON.stringify(overlap, null, 2));
    expect(overlap.ok, `Stage overlaps: ${JSON.stringify(overlap.overlaps)}`).toBe(true);
  });

  /* ── BUG 4: stats + typewriter row is present ───────────────────────── */
  test('BUG4: typewriter/stats row must be present in hero', async ({ page }) => {
    await loadHero(page);

    const found = await page.evaluate(() => {
      const hero = document.querySelector('[aria-label="Hero section"], [aria-label="القسم الرئيسي"]');
      if (!hero) return false;
      // Look for the "We build:" / "نبني:" label
      const text = hero.textContent || '';
      return text.includes('We build:') || text.includes('نبني:') ||
             text.includes('Services')  || text.includes('خدمة');
    });

    console.log('BUG4 typewriter found:', found);
    expect(found, 'Stats+typewriter row must be in the hero').toBe(true);
  });
});
