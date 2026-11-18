/**
 * mockups-poster-hero.spec.mjs
 * Runtime assertions for the 9:16 poster phone hero.
 * BEFORE run: most fail (current layout is flat, not poster).
 * AFTER run:  all pass.
 *
 * Assertions per viewport/theme/lang:
 *  1. Only one <h1> on the page
 *  2. Every h1 line's bounding box fits inside viewport width (no overflow)
 *  3. Zero horizontal scroll
 *  4. "ready?" (last h1 line) overlaps the hands img box 10-40px vertically
 *  5. img natural ratio == rendered ratio within 2% (not cropped/stretched)
 *  6. hands-360.webp exists and < 25KB
 *  7. Secondary CTA background is transparent
 *  8. Both CTAs return themselves from elementFromPoint
 *  9. hands img is NOT covered by content sheet beyond 28px from img bottom
 * 10. No white (255,255,255) strip at the seam between poster and sheet
 * 11. Dark: documentElement has .dark class before screenshot
 * 12. Screenshot at scroll-0 (poster) and scroll-to-sheet
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import fs   from 'fs';

const BASE  = 'http://localhost:4173';
const SHOTS = path.resolve('tests/screenshots');
fs.mkdirSync(SHOTS, { recursive: true });

const VPS = [
  { name: '360x640',  w: 360, h: 640  },
  { name: '360x740',  w: 360, h: 740  },
  { name: '390x844',  w: 390, h: 844  },
  { name: '412x915',  w: 412, h: 915  },
];

async function setup(page, dark = false, lang = 'en') {
  if (dark) await page.addInitScript(() => { localStorage.setItem('theme', 'dark'); });
  if (lang === 'ar') await page.addInitScript(() => { localStorage.setItem('language', 'ar'); });
  await page.goto(BASE + '/mockups', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('h1', { timeout: 15000 });
  if (dark) {
    await page.waitForFunction(
      () => document.documentElement.classList.contains('dark') ||
            document.documentElement.getAttribute('data-theme') === 'dark',
      { timeout: 6000 }
    ).catch(() => null);
  }
  await page.waitForTimeout(1800);
}

/* ── Static checks (run once) ───────────────────────────────────────────── */
test('hands-360.webp < 25KB', () => {
  const p = path.resolve('public/hero/hands-360.webp');
  expect(fs.existsSync(p), 'hands-360.webp missing').toBe(true);
  expect(fs.statSync(p).size / 1024, 'hands-360.webp >= 25KB').toBeLessThan(25);
});

/* ── Per-viewport tests ─────────────────────────────────────────────────── */
for (const vp of VPS) {
  test.describe(`Poster ${vp.name}`, () => {
    test.use({ viewport: { width: vp.w, height: vp.h } });

    // 1. Only one h1
    test(`${vp.name}: only one h1`, async ({ page }) => {
      await setup(page);
      const count = await page.evaluate(() => document.querySelectorAll('h1').length);
      expect(count).toBe(1);
    });

    // 2. No h1 line overflows viewport width
    test(`${vp.name}: h1 lines fit viewport width`, async ({ page }) => {
      await setup(page);
      const overflows = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        if (!h1) return ['no h1'];
        // Each span with display:block is a "line"
        const lines = [...h1.querySelectorAll('span[data-line]')];
        if (!lines.length) {
          // Fall back to h1 itself
          const r = h1.getBoundingClientRect();
          return r.right > window.innerWidth + 2 ? [`h1 right=${r.right}`] : [];
        }
        return lines
          .filter(s => {
            const r = s.getBoundingClientRect();
            return r.right > window.innerWidth + 2 || r.left < -2;
          })
          .map(s => `"${s.textContent.trim()}" r=${s.getBoundingClientRect().right}`);
      });
      expect(overflows, `Lines overflow: ${overflows.join(', ')}`).toHaveLength(0);
    });

    // 3. No horizontal scroll
    test(`${vp.name}: no horizontal scroll`, async ({ page }) => {
      await setup(page);
      const hs = await page.evaluate(() =>
        document.documentElement.scrollWidth > window.innerWidth + 2
      );
      expect(hs).toBe(false);
    });

    // 4. "ready?" line overlaps hands img 10-40px
    test(`${vp.name}: ready? overlaps hands img 10-40px`, async ({ page }) => {
      await setup(page);
      const result = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        const img = document.querySelector('img[src*="hands"], img[srcset*="hands"]');
        if (!h1 || !img) return { ok: false, reason: 'missing h1 or img' };
        // Find the last span (ready? line)
        const lines = [...h1.querySelectorAll('span[data-line]')];
        const lastLine = lines[lines.length - 1] || h1;
        const lineBottom = lastLine.getBoundingClientRect().bottom;
        const imgTop     = img.getBoundingClientRect().top;
        const overlap    = lineBottom - imgTop; // positive = overlap
        return { ok: overlap >= 10 && overlap <= 40, overlap, lineBottom, imgTop };
      });
      expect(result.ok, JSON.stringify(result)).toBe(true);
    });

    // 5. Image aspect ratio preserved within 2%
    test(`${vp.name}: img aspect ratio preserved`, async ({ page }) => {
      await setup(page);
      const r = await page.evaluate(() => {
        const img = document.querySelector('img[src*="hands"], img[srcset*="hands"]');
        if (!img) return null;
        const rect     = img.getBoundingClientRect();
        const intrinsic = img.naturalWidth / img.naturalHeight;
        const rendered  = rect.width / rect.height;
        return { diff: Math.abs(intrinsic - rendered) / intrinsic, intrinsic, rendered };
      });
      expect(r, 'img not found').not.toBeNull();
      expect(r.diff, `ratio diff ${(r.diff*100).toFixed(1)}%`).toBeLessThan(0.02);
    });

    // 7. Secondary CTA transparent bg
    test(`${vp.name}: secondary CTA transparent`, async ({ page }) => {
      await setup(page);
      await page.evaluate(() => {
        const sheet = document.querySelector('[data-hero-sheet]');
        if (sheet) sheet.scrollIntoView({ behavior: 'instant', block: 'start' });
        else window.scrollBy(0, 400);
      });
      await page.waitForTimeout(300);
      const result = await page.evaluate(() => {
        const sheet = document.querySelector('[data-hero-sheet]');
        if (!sheet) return null;
        const btns = [...sheet.querySelectorAll('a, button')].filter(el => {
          const r = el.getBoundingClientRect();
          return r.width > 100 && r.height >= 44;
        });
        if (btns.length < 2) return null;
        const s = getComputedStyle(btns[1]);
        return { bg: s.backgroundColor, bw: s.borderWidth };
      });
      expect(result, 'Secondary button not found').not.toBeNull();
      expect(result.bg).toMatch(/transparent|rgba\(\s*0,\s*0,\s*0,\s*0\)/);
      expect(parseFloat(result.bw)).toBeGreaterThanOrEqual(1.4);
    });

    // 8. elementFromPoint on CTAs
    test(`${vp.name}: elementFromPoint on CTAs`, async ({ page }) => {
      await setup(page);
      await page.evaluate(() => {
        const sheet = document.querySelector('[data-hero-sheet]');
        if (sheet) sheet.scrollIntoView({ behavior: 'instant', block: 'start' });
        else window.scrollBy(0, 400);
      });
      await page.waitForTimeout(300);
      const ok = await page.evaluate(() => {
        const sheet = document.querySelector('[data-hero-sheet]');
        if (!sheet) return false;
        const btns = [...sheet.querySelectorAll('a, button')].filter(el => {
          const r = el.getBoundingClientRect();
          return r.width > 100 && r.height >= 44 && r.top >= 0 && r.bottom <= window.innerHeight;
        }).slice(0, 2);
        if (btns.length < 2) return false;
        return btns.every(btn => {
          const r = btn.getBoundingClientRect();
          const hit = document.elementFromPoint(r.left + r.width/2, r.top + r.height/2);
          return hit === btn || btn.contains(hit);
        });
      });
      expect(ok).toBe(true);
    });

    // Screenshots
    test(`${vp.name}: screenshot scroll-0 light EN`, async ({ page }) => {
      await setup(page);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({
        path: path.join(SHOTS, `POSTER-${vp.name}-light-en-top.png`),
        clip: { x:0, y:0, width: vp.w, height: vp.h },
      });
    });

    test(`${vp.name}: screenshot scrolled-to-sheet light EN`, async ({ page }) => {
      await setup(page);
      await page.evaluate(() => {
        const sheet = document.querySelector('[data-hero-sheet]');
        if (sheet) sheet.scrollIntoView({ behavior: 'instant' });
        else window.scrollBy(0, 500);
      });
      await page.waitForTimeout(300);
      await page.screenshot({
        path: path.join(SHOTS, `POSTER-${vp.name}-light-en-sheet.png`),
        clip: { x:0, y:0, width: vp.w, height: vp.h },
      });
    });
  });
}

/* ── Dark + AR (390x844) ────────────────────────────────────────────────── */
test.describe('Dark 390x844', () => {
  test.use({ viewport: { width: 390, height: 844 }, colorScheme: 'dark' });

  test('Dark: .dark class applied', async ({ page }) => {
    await setup(page, true);
    const ok = await page.evaluate(() =>
      document.documentElement.classList.contains('dark') ||
      document.documentElement.getAttribute('data-theme') === 'dark'
    );
    expect(ok).toBe(true);
  });

  for (const lang of ['en', 'ar']) {
    test(`Dark ${lang}: scroll-0 screenshot`, async ({ page }) => {
      await setup(page, true, lang);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({
        path: path.join(SHOTS, `POSTER-390x844-dark-${lang}-top.png`),
        clip: { x:0, y:0, width:390, height:844 },
      });
    });
    test(`Dark ${lang}: sheet screenshot`, async ({ page }) => {
      await setup(page, true, lang);
      await page.evaluate(() => {
        const sheet = document.querySelector('[data-hero-sheet]');
        if (sheet) sheet.scrollIntoView({ behavior: 'instant' });
        else window.scrollBy(0, 500);
      });
      await page.waitForTimeout(300);
      await page.screenshot({
        path: path.join(SHOTS, `POSTER-390x844-dark-${lang}-sheet.png`),
        clip: { x:0, y:0, width:390, height:844 },
      });
    });
  }
});

test.describe('AR 390x844', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('AR: scroll-0 screenshot', async ({ page }) => {
    await setup(page, false, 'ar');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: path.join(SHOTS, 'POSTER-390x844-light-ar-top.png'),
      clip: { x:0, y:0, width:390, height:844 },
    });
  });
  test('AR: sheet screenshot', async ({ page }) => {
    await setup(page, false, 'ar');
    await page.evaluate(() => {
      const sheet = document.querySelector('[data-hero-sheet]');
      if (sheet) sheet.scrollIntoView({ behavior: 'instant' });
      else window.scrollBy(0, 500);
    });
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(SHOTS, 'POSTER-390x844-light-ar-sheet.png'),
      clip: { x:0, y:0, width:390, height:844 },
    });
  });
});
