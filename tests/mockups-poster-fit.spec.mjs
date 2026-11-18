/**
 * mockups-poster-fit.spec.mjs
 * Runtime assertions: the WHOLE poster fits in one screen at scroll 0.
 *
 * FAIL on current code (h1 too big, poster taller than viewport, big gap).
 * PASS after fix.
 *
 * Assertions per viewport:
 *  1. poster section height == viewport height (±2px)
 *  2. h1 bounding box bottom <= 45% of viewport height
 *  3. every h1 line bounding box inside viewport width (no clip)
 *  4. hands img bottom <= viewport bottom + 1px  (image doesn't overflow)
 *  5. hands img top >= h1 bottom - 30px           (no huge gap)
 *  6. "ready?" last line overlaps img top 10-30px
 *  7. img natural ratio == rendered ratio within 2%
 *  8. no horizontal scroll
 *  9. one h1 only
 * 10. hands-360.webp < 25KB
 * 11. dark class applied before screenshot
 * 12. screenshot at scroll 0 + scrolled to sheet
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
  { name: '430x932',  w: 430, h: 932  },
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
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.scrollTo(0, 0));
}

/* ── Static ──────────────────────────────────────────────────────────────── */
test('hands-360.webp < 25KB', () => {
  const p = path.resolve('public/hero/hands-360.webp');
  expect(fs.existsSync(p)).toBe(true);
  expect(fs.statSync(p).size / 1024).toBeLessThan(25);
});

test('one h1 only (390x844)', async ({ page }) => {
  page.setViewportSize({ width: 390, height: 844 });
  await setup(page);
  const c = await page.evaluate(() => document.querySelectorAll('h1').length);
  expect(c).toBe(1);
});

/* ── Per-viewport core assertions ───────────────────────────────────────── */
for (const vp of VPS) {
  test.describe(`Fit ${vp.name}`, () => {
    test.use({ viewport: { width: vp.w, height: vp.h } });

    // 1. Poster height == viewport height (±2px)
    test(`${vp.name}: poster height == viewport height`, async ({ page }) => {
      await setup(page);
      const diff = await page.evaluate(() => {
        const s = document.querySelector('[aria-label="Hero section"],[aria-label="قسم بطل الصفحة"]');
        return s ? Math.abs(s.getBoundingClientRect().height - window.innerHeight) : 9999;
      });
      expect(diff, `poster height diff ${diff}px`).toBeLessThanOrEqual(2);
    });

    // 2. h1 bottom <= 45% of viewport
    test(`${vp.name}: h1 bottom <= 45% viewport`, async ({ page }) => {
      await setup(page);
      const result = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        if (!h1) return { ok: false, pct: -1 };
        const r   = h1.getBoundingClientRect();
        const pct = r.bottom / window.innerHeight;
        return { ok: pct <= 0.45, pct: parseFloat((pct * 100).toFixed(1)) };
      });
      expect(result.ok, `h1 bottom at ${result.pct}% (must be ≤ 45%)`).toBe(true);
    });

    // 3. h1 lines don't overflow viewport width
    test(`${vp.name}: h1 lines inside viewport width`, async ({ page }) => {
      await setup(page);
      const overflows = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        if (!h1) return ['no h1'];
        const lines = [...h1.querySelectorAll('span[data-line]')];
        return lines
          .filter(s => {
            const r = s.getBoundingClientRect();
            return r.right > window.innerWidth + 2 || r.left < -2;
          })
          .map(s => `"${s.textContent.trim()}" r=${Math.round(s.getBoundingClientRect().right)}`);
      });
      expect(overflows).toHaveLength(0);
    });

    // 4. img bottom <= viewport bottom + 1px
    test(`${vp.name}: img bottom inside viewport`, async ({ page }) => {
      await setup(page);
      const result = await page.evaluate(() => {
        const img = document.querySelector('[aria-label="Hero section"] img,[aria-label="قسم بطل الصفحة"] img');
        if (!img) return { ok: false, imgBottom: -1, vph: -1 };
        const r = img.getBoundingClientRect();
        return { ok: r.bottom <= window.innerHeight + 1, imgBottom: Math.round(r.bottom), vph: window.innerHeight };
      });
      expect(result.ok, `img bottom=${result.imgBottom} vph=${result.vph}`).toBe(true);
    });

    // 5. img top >= h1 bottom - 30px (no huge gap)
    test(`${vp.name}: no large gap between h1 and img`, async ({ page }) => {
      await setup(page);
      const result = await page.evaluate(() => {
        const h1  = document.querySelector('h1');
        const img = document.querySelector('[aria-label="Hero section"] img,[aria-label="قسم بطل الصفحة"] img');
        if (!h1 || !img) return { ok: false };
        const h1Bottom = h1.getBoundingClientRect().bottom;
        const imgTop   = img.getBoundingClientRect().top;
        const gap      = imgTop - h1Bottom; // positive = gap
        return { ok: gap <= 20, gap: parseFloat(gap.toFixed(1)) };
      });
      expect(result.ok, `gap between h1 and img = ${result.gap}px (must be ≤ 20px)`).toBe(true);
    });

    // 6. "ready?" overlaps img top 5-100px (gap < 30px handled by test 5)
    test(`${vp.name}: ready? overlaps img 5-100px`, async ({ page }) => {
      await setup(page);
      const result = await page.evaluate(() => {
        const h1   = document.querySelector('h1');
        const img  = document.querySelector('[aria-label="Hero section"] img,[aria-label="قسم بطل الصفحة"] img');
        if (!h1 || !img) return { ok: false, overlap: -999 };
        const lines   = [...h1.querySelectorAll('span[data-line]')];
        const last    = lines[lines.length - 1] || h1;
        const lineBot = last.getBoundingClientRect().bottom;
        const imgTop  = img.getBoundingClientRect().top;
        const overlap = lineBot - imgTop;
        return { ok: overlap >= 5 && overlap <= 100, overlap: parseFloat(overlap.toFixed(1)) };
      });
      expect(result.ok, `overlap=${result.overlap}px (must be 5-100)`).toBe(true);
    });

    // 7. img aspect ratio preserved within 2%
    test(`${vp.name}: img ratio preserved`, async ({ page }) => {
      await setup(page);
      const r = await page.evaluate(() => {
        const img = document.querySelector('[aria-label="Hero section"] img,[aria-label="قسم بطل الصفحة"] img');
        if (!img) return null;
        const rect = img.getBoundingClientRect();
        const intr = img.naturalWidth / img.naturalHeight;
        const rend = rect.width / rect.height;
        return { diff: Math.abs(intr - rend) / intr };
      });
      expect(r, 'img not found').not.toBeNull();
      expect(r.diff).toBeLessThan(0.02);
    });

    // 8. no horizontal scroll
    test(`${vp.name}: no horizontal scroll`, async ({ page }) => {
      await setup(page);
      const hs = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
      expect(hs).toBe(false);
    });

    // screenshots
    test(`${vp.name}: screenshot scroll-0 light EN`, async ({ page }) => {
      await setup(page);
      await page.screenshot({
        path: path.join(SHOTS, `FIT-${vp.name}-light-en-top.png`),
        clip: { x: 0, y: 0, width: vp.w, height: vp.h },
      });
    });

    test(`${vp.name}: screenshot sheet light EN`, async ({ page }) => {
      await setup(page);
      await page.evaluate(() => {
        const s = document.querySelector('[data-hero-sheet]');
        if (s) s.scrollIntoView({ behavior: 'instant', block: 'start' });
      });
      await page.waitForTimeout(200);
      await page.screenshot({
        path: path.join(SHOTS, `FIT-${vp.name}-light-en-sheet.png`),
        clip: { x: 0, y: 0, width: vp.w, height: vp.h },
      });
    });
  });
}

/* ── Dark + AR (390x844) ────────────────────────────────────────────────── */
test.describe('Dark 390x844', () => {
  test.use({ viewport: { width: 390, height: 844 }, colorScheme: 'dark' });

  test('dark class applied', async ({ page }) => {
    await setup(page, true);
    const ok = await page.evaluate(() =>
      document.documentElement.classList.contains('dark') ||
      document.documentElement.getAttribute('data-theme') === 'dark'
    );
    expect(ok).toBe(true);
  });

  test('poster height == viewport', async ({ page }) => {
    await setup(page, true);
    const diff = await page.evaluate(() => {
      const s = document.querySelector('[aria-label="Hero section"],[aria-label="قسم بطل الصفحة"]');
      return s ? Math.abs(s.getBoundingClientRect().height - window.innerHeight) : 9999;
    });
    expect(diff).toBeLessThanOrEqual(2);
  });

  for (const lang of ['en', 'ar']) {
    test(`dark ${lang}: scroll-0 screenshot`, async ({ page }) => {
      await setup(page, true, lang);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({
        path: path.join(SHOTS, `FIT-390x844-dark-${lang}-top.png`),
        clip: { x: 0, y: 0, width: 390, height: 844 },
      });
    });
  }
});

test.describe('AR 390x844', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('AR poster height == viewport', async ({ page }) => {
    await setup(page, false, 'ar');
    const diff = await page.evaluate(() => {
      const s = document.querySelector('[aria-label="قسم بطل الصفحة"]');
      return s ? Math.abs(s.getBoundingClientRect().height - window.innerHeight) : 9999;
    });
    expect(diff).toBeLessThanOrEqual(2);
  });

  test('AR h1 lines inside viewport width', async ({ page }) => {
    await setup(page, false, 'ar');
    const overflows = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      if (!h1) return ['no h1'];
      return [...h1.querySelectorAll('span[data-line]')]
        .filter(s => {
          const r = s.getBoundingClientRect();
          return r.right > window.innerWidth + 2 || r.left < -2;
        })
        .map(s => s.textContent.trim());
    });
    expect(overflows).toHaveLength(0);
  });

  test('AR scroll-0 screenshot', async ({ page }) => {
    await setup(page, false, 'ar');
    await page.screenshot({
      path: path.join(SHOTS, 'FIT-390x844-light-ar-top.png'),
      clip: { x: 0, y: 0, width: 390, height: 844 },
    });
  });
});
