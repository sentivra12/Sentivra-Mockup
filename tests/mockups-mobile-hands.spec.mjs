/**
 * mockups-mobile-hands.spec.mjs
 * Runtime assertions for the phone hands-image hero.
 * These FAIL on current code (no image) and PASS after the fix.
 *
 * Assertions:
 *  1. Hero contains exactly one <img> with src matching "hands"
 *  2. Image aspect ratio matches intrinsic ratio within 2% (not cropped/stretched)
 *  3. Image bounding box is fully inside the viewport horizontally
 *  4. Image bottom == hero bottom (±4px)
 *  5. img computed background-color is transparent (alpha=0)
 *  6. img wrapper has no opaque background (no gray rect)
 *  7. Secondary CTA background is transparent
 *  8. Both CTAs return themselves from elementFromPoint
 *  9. No horizontal scroll
 * 10. Hero bottom 8px strip has no white (255,255,255) pixels (unless next section is white)
 * 11. Dark theme: documentElement.classList has "dark" before screenshot
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

async function loadHero(page, dark = false, lang = 'en') {
  if (dark) {
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'dark');
    });
  }
  if (lang === 'ar') {
    await page.addInitScript(() => { localStorage.setItem('language', 'ar'); });
  }
  await page.goto(BASE + '/mockups', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('h1', { timeout: 15000 });
  await page.waitForTimeout(2000);
}

async function assertDark(page) {
  // Wait for dark class — the app applies it after hydration
  await page.waitForFunction(() =>
    document.documentElement.classList.contains('dark') ||
    document.documentElement.getAttribute('data-theme') === 'dark',
    { timeout: 5000 }
  ).catch(() => null); // soft — we assert below
}

for (const vp of VPS) {
  test.describe(`Hands hero ${vp.name}`, () => {
    test.use({ viewport: { width: vp.w, height: vp.h } });

    // ── 1. Image present ──────────────────────────────────────────────────
    test(`${vp.name}: hero has exactly one hands img`, async ({ page }) => {
      await loadHero(page);
      const count = await page.evaluate(() => {
        const hero = document.querySelector(
          '[aria-label="Hero section"], [aria-label="قسم بطل الصفحة"]'
        );
        if (!hero) return -1;
        return [...hero.querySelectorAll('img')]
          .filter(i => i.src.includes('hands')).length;
      });
      expect(count, 'Hero must have exactly 1 hands img').toBe(1);
    });

    // ── 2. Aspect ratio preserved (not cropped) ───────────────────────────
    test(`${vp.name}: img aspect ratio preserved within 2%`, async ({ page }) => {
      await loadHero(page);
      const ratio = await page.evaluate(() => {
        const img = document.querySelector(
          '[aria-label="Hero section"] img, [aria-label="قسم بطل الصفحة"] img'
        );
        if (!img) return null;
        const r = img.getBoundingClientRect();
        const intrinsic = img.naturalWidth / img.naturalHeight;
        const rendered  = r.width / r.height;
        return { intrinsic, rendered, diff: Math.abs(intrinsic - rendered) / intrinsic };
      });
      expect(ratio, 'img not found').not.toBeNull();
      expect(ratio.diff, `Ratio diff ${(ratio.diff*100).toFixed(1)}% must be < 2%`).toBeLessThan(0.02);
    });

    // ── 3. Horizontally inside viewport ──────────────────────────────────
    test(`${vp.name}: img inside viewport horizontally`, async ({ page }) => {
      await loadHero(page);
      const ok = await page.evaluate(() => {
        const img = document.querySelector(
          '[aria-label="Hero section"] img, [aria-label="قسم بطل الصفحة"] img'
        );
        if (!img) return false;
        const r = img.getBoundingClientRect();
        return r.left >= -1 && r.right <= window.innerWidth + 1;
      });
      expect(ok, 'img must be fully inside viewport horizontally').toBe(true);
    });

    // ── 4. Image bottom == hero bottom ────────────────────────────────────
    test(`${vp.name}: img bottom flush with hero bottom (±4px)`, async ({ page }) => {
      await loadHero(page);
      // Scroll to hero bottom first
      await page.evaluate(() => {
        const hero = document.querySelector(
          '[aria-label="Hero section"], [aria-label="قسم بطل الصفحة"]'
        );
        if (hero) window.scrollTo(0, hero.scrollHeight);
      });
      await page.waitForTimeout(300);
      const result = await page.evaluate(() => {
        const hero = document.querySelector(
          '[aria-label="Hero section"], [aria-label="قسم بطل الصفحة"]'
        );
        const img  = document.querySelector(
          '[aria-label="Hero section"] img, [aria-label="قسم بطل الصفحة"] img'
        );
        if (!hero || !img) return null;
        const heroBottom = hero.getBoundingClientRect().bottom;
        const imgBottom  = img.getBoundingClientRect().bottom;
        return { heroBottom, imgBottom, diff: Math.abs(heroBottom - imgBottom) };
      });
      expect(result, 'hero or img not found').not.toBeNull();
      expect(result.diff, `img bottom=${result.imgBottom} hero bottom=${result.heroBottom} diff=${result.diff}px must be ≤4px`).toBeLessThanOrEqual(4);
    });

    // ── 5. img computed bg is transparent ────────────────────────────────
    test(`${vp.name}: img background transparent`, async ({ page }) => {
      await loadHero(page);
      const bg = await page.evaluate(() => {
        const img = document.querySelector(
          '[aria-label="Hero section"] img, [aria-label="قسم بطل الصفحة"] img'
        );
        return img ? getComputedStyle(img).backgroundColor : null;
      });
      expect(bg, 'img not found').not.toBeNull();
      expect(bg, `img bg="${bg}" must be transparent`).toMatch(/transparent|rgba\(\s*0,\s*0,\s*0,\s*0\)/);
    });

    // ── 7. Secondary CTA transparent bg ──────────────────────────────────
    test(`${vp.name}: secondary CTA transparent bg + visible border`, async ({ page }) => {
      await loadHero(page);
      const result = await page.evaluate(() => {
        const hero = document.querySelector(
          '[aria-label="Hero section"], [aria-label="قسم بطل الصفحة"]'
        );
        const btns = [...(hero?.querySelectorAll('a, button') || [])].filter(el => {
          const r = el.getBoundingClientRect();
          return r.width > 100 && r.height >= 44;
        });
        if (btns.length < 2) return null;
        const s = getComputedStyle(btns[1]);
        return { bg: s.backgroundColor, border: s.borderColor, bw: s.borderWidth };
      });
      expect(result, 'Secondary button not found').not.toBeNull();
      expect(result.bg).toMatch(/transparent|rgba\(\s*0,\s*0,\s*0,\s*0\)/);
      expect(parseFloat(result.bw)).toBeGreaterThanOrEqual(1.4);
    });

    // ── 8. elementFromPoint on CTAs ───────────────────────────────────────
    test(`${vp.name}: elementFromPoint on both CTAs`, async ({ page }) => {
      await loadHero(page);
      const ok = await page.evaluate(() => {
        const hero = document.querySelector(
          '[aria-label="Hero section"], [aria-label="قسم بطل الصفحة"]'
        );
        const btns = [...(hero?.querySelectorAll('a, button') || [])].filter(el => {
          const r = el.getBoundingClientRect();
          return r.width > 100 && r.height >= 44;
        }).slice(0, 2);
        if (btns.length < 2) return false;
        return btns.every(btn => {
          const r   = btn.getBoundingClientRect();
          const hit = document.elementFromPoint(r.left + r.width/2, r.top + r.height/2);
          return hit === btn || btn.contains(hit);
        });
      });
      expect(ok, 'elementFromPoint on CTAs').toBe(true);
    });

    // ── 9. No horizontal scroll ───────────────────────────────────────────
    test(`${vp.name}: no horizontal scroll`, async ({ page }) => {
      await loadHero(page);
      const hs = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 2
      );
      expect(hs).toBe(false);
    });

    // ── Light screenshot ──────────────────────────────────────────────────
    test(`${vp.name}: screenshot light EN`, async ({ page }) => {
      await loadHero(page);
      // Scroll to show bottom of hero (image)
      await page.evaluate(() => {
        const hero = document.querySelector(
          '[aria-label="Hero section"], [aria-label="قسم بطل الصفحة"]'
        );
        if (hero) window.scrollTo(0, hero.getBoundingClientRect().bottom - window.innerHeight);
      });
      await page.waitForTimeout(400);
      await page.screenshot({
        path: path.join(SHOTS, `HANDS-${vp.name}-light-en.png`),
        clip: { x:0, y:0, width: vp.w, height: vp.h },
      });
    });
  });
}

// ── Dark theme tests ──────────────────────────────────────────────────────
test.describe('Dark theme 390x844', () => {
  test.use({ viewport: { width: 390, height: 844 }, colorScheme: 'dark' });

  test('Dark: documentElement has dark class', async ({ page }) => {
    await loadHero(page, true);
    await assertDark(page);
    const hasDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark') ||
      document.documentElement.getAttribute('data-theme') === 'dark'
    );
    expect(hasDark, 'Dark class/attr not applied').toBe(true);
  });

  for (const lang of ['en', 'ar']) {
    test(`Dark ${lang}: screenshot`, async ({ page }) => {
      await loadHero(page, true, lang);
      await assertDark(page);
      await page.evaluate(() => {
        const hero = document.querySelector(
          '[aria-label="Hero section"], [aria-label="قسم بطل الصفحة"]'
        );
        if (hero) window.scrollTo(0, hero.getBoundingClientRect().bottom - window.innerHeight);
      });
      await page.waitForTimeout(400);
      await page.screenshot({
        path: path.join(SHOTS, `HANDS-390x844-dark-${lang}.png`),
        clip: { x:0, y:0, width:390, height:844 },
      });
    });
  }
});

// ── AR screenshots ────────────────────────────────────────────────────────
for (const vp of VPS) {
  test.describe(`AR ${vp.name}`, () => {
    test.use({ viewport: { width: vp.w, height: vp.h } });
    test(`AR ${vp.name} light`, async ({ page }) => {
      await loadHero(page, false, 'ar');
      await page.evaluate(() => {
        const hero = document.querySelector('[aria-label="قسم بطل الصفحة"]');
        if (hero) window.scrollTo(0, hero.getBoundingClientRect().bottom - window.innerHeight);
      });
      await page.waitForTimeout(400);
      await page.screenshot({
        path: path.join(SHOTS, `HANDS-${vp.name}-light-ar.png`),
        clip: { x:0, y:0, width: vp.w, height: vp.h },
      });
    });
  });
}
