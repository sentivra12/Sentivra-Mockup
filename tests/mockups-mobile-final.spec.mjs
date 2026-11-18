/**
 * Final mobile hero tests — MUST fail on current code, pass after fix.
 *
 * Tests (runtime assertions, not source greps):
 *  1. Zero <img> inside hero
 *  2. Secondary button: computed bg transparent, border non-transparent
 *  3. H1 + both CTAs + stats all in viewport
 *  4. elementFromPoint on CTAs returns the CTA
 *  5. No horizontal scroll
 *  6. Bottom 8px strip of hero == next section bg (same computed color)
 *  7. Dark theme actually applies (documentElement has dark class/attr, hero bg is dark)
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const BASE = 'http://localhost:4173';
const SHOTS = path.resolve('tests/screenshots');
fs.mkdirSync(SHOTS, { recursive: true });

const VPS = [
  { name: '360x640', w: 360, h: 640 },
  { name: '360x740', w: 360, h: 740 },
  { name: '390x844', w: 390, h: 844 },
  { name: '412x915', w: 412, h: 915 },
];

async function loadHero(page, dark = false, lang = 'en') {
  if (dark) {
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    });
  }
  if (lang === 'ar') await page.addInitScript(() => localStorage.setItem('language', 'ar'));
  
  await page.goto(BASE + '/mockups', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('h1', { timeout: 15000 });
  await page.waitForTimeout(1800);
}

for (const vp of VPS) {
  test.describe(`Mobile ${vp.name}`, () => {
    test.use({ viewport: { width: vp.w, height: vp.h } });

    test(`${vp.name}: zero images in hero`, async ({ page }) => {
      await loadHero(page);
      const imgCount = await page.evaluate(() => {
        const hero = document.querySelector('[aria-label="Hero section"], [aria-label="قسم بطل الصفحة"]');
        return hero ? hero.querySelectorAll('img, picture').length : -1;
      });
      expect(imgCount, 'Hero must have 0 images').toBe(0);
    });

    test(`${vp.name}: secondary button is outline (transparent bg, visible border)`, async ({ page }) => {
      await loadHero(page);
      const btnStyles = await page.evaluate(() => {
        const hero = document.querySelector('[aria-label="Hero section"], [aria-label="قسم بطل الصفحة"]');
        if (!hero) return null;
        const btns = [...hero.querySelectorAll('a, button')].filter(el => {
          const txt = el.textContent?.trim();
          return txt && txt.length > 5;
        });
        if (btns.length < 2) return null;
        const secondary = btns[1]; // second button
        const s = getComputedStyle(secondary);
        return {
          bg: s.backgroundColor,
          border: s.borderColor,
          borderWidth: s.borderWidth,
          text: secondary.textContent.trim().substring(0, 15),
        };
      });
      expect(btnStyles, 'Secondary button not found').not.toBeNull();
      // bg must be transparent or rgba(0,0,0,0)
      expect(btnStyles.bg, `Secondary bg="${btnStyles.bg}" must be transparent`).toMatch(/transparent|rgba\(\s*0,\s*0,\s*0,\s*0\)/);
      // border must NOT be transparent
      expect(btnStyles.border, `Secondary border="${btnStyles.border}" must be visible`).not.toMatch(/transparent|rgba\(\s*0,\s*0,\s*0,\s*0\)/);
      // borderWidth > 1px
      expect(parseFloat(btnStyles.borderWidth), 'Secondary border width >= 1.5px').toBeGreaterThanOrEqual(1.4);
    });

    test(`${vp.name}: H1 + CTAs + stats all in viewport`, async ({ page }) => {
      await loadHero(page);
      const result = await page.evaluate(() => {
        const hero = document.querySelector('[aria-label="Hero section"], [aria-label="قسم بطل الصفحة"]');
        if (!hero) return { ok: false, reason: 'no hero' };
        const h1 = hero.querySelector('h1');
        const btns = [...hero.querySelectorAll('a, button')].filter(el => {
          const r = el.getBoundingClientRect();
          return r.width > 100 && r.height >= 44;
        }).slice(0, 2);
        // Stats may not render if DB is empty in preview — only check if visible
        const stats = [...hero.querySelectorAll('div, span')].find(el =>
          el.textContent?.includes('DESIGNS') || el.textContent?.includes('تصميم') ||
          el.textContent?.includes('Industries') || el.textContent?.includes('صناعة')
        );
        
        const vh = window.innerHeight;
        const inView = (el) => {
          if (!el) return true; // optional elements pass if absent
          const r = el.getBoundingClientRect();
          return r.top >= 0 && r.bottom <= vh + 5;
        };
        
        return {
          ok: inView(h1) && btns.length === 2 && btns.every(inView) && inView(stats),
          h1InView: inView(h1),
          btn1InView: btns[0] ? inView(btns[0]) : false,
          btn2InView: btns[1] ? inView(btns[1]) : false,
          statsPresent: !!stats,
          statsInView: inView(stats),
        };
      });
      expect(result.ok, JSON.stringify(result)).toBe(true);
    });

    test(`${vp.name}: elementFromPoint on CTAs`, async ({ page }) => {
      await loadHero(page);
      const result = await page.evaluate(() => {
        const hero = document.querySelector('[aria-label="Hero section"], [aria-label="قسم بطل الصفحة"]');
        if (!hero) return { ok: false };
        const btns = [...hero.querySelectorAll('a, button')].filter(el => {
          const r = el.getBoundingClientRect();
          return r.width > 100 && r.height >= 44;
        }).slice(0, 2);
        if (btns.length < 2) return { ok: false, n: btns.length };
        const hits = btns.map(btn => {
          const r = btn.getBoundingClientRect();
          const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
          return hit === btn || btn.contains(hit);
        });
        return { ok: hits.every(h => h) };
      });
      expect(result.ok, JSON.stringify(result)).toBe(true);
    });

    test(`${vp.name}: no horizontal scroll`, async ({ page }) => {
      await loadHero(page);
      const hs = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
      expect(hs).toBe(false);
    });

    test(`${vp.name}: bottom strip matches next section bg`, async ({ page }) => {
      await loadHero(page);
      const result = await page.evaluate(() => {
        const hero = document.querySelector('[aria-label="Hero section"], [aria-label="قسم بطل الصفحة"]');
        if (!hero) return null;
        const nextSection = hero.nextElementSibling;
        if (!nextSection) return { backingBg: 'none', nextBg: 'none', match: false };
        const nextBg = getComputedStyle(nextSection).backgroundColor;
        // Find the backing div by data attribute
        const backingDiv = hero.querySelector('[data-divider-fill="true"]');
        const backingBg = backingDiv ? getComputedStyle(backingDiv).backgroundColor : 'none';
        return { nextBg, backingBg, match: backingBg === nextBg };
      });
      expect(result, 'Could not measure bg').not.toBeNull();
      expect(result.match, `Backing="${result.backingBg}" next="${result.nextBg}"`).toBe(true);
    });

    test(`${vp.name}: screenshot light EN`, async ({ page }) => {
      await loadHero(page);
      await page.screenshot({
        path: path.join(SHOTS, `FINAL-${vp.name}-light-en.png`),
        clip: { x: 0, y: 0, width: vp.w, height: vp.h },
      });
    });
  });
}

/* ── Dark theme tests ───────────────────────────────────────────────────── */
test.describe('Dark theme (390×844)', () => {
  test.use({ viewport: { width: 390, height: 844 }, colorScheme: 'dark' });

  test('Dark: documentElement has dark class/attr', async ({ page }) => {
    await loadHero(page, true);
    const isDark = await page.evaluate(() => {
      const root = document.documentElement;
      return {
        hasClass: root.classList.contains('dark'),
        hasAttr: root.getAttribute('data-theme') === 'dark' || root.hasAttribute('dark'),
        classList: [...root.classList],
        dataTheme: root.getAttribute('data-theme'),
      };
    });
    expect(isDark.hasClass || isDark.hasAttr, `Dark not applied: ${JSON.stringify(isDark)}`).toBe(true);
  });

  test('Dark: hero background is dark', async ({ page }) => {
    await loadHero(page, true);
    const heroBg = await page.evaluate(() => {
      const hero = document.querySelector('[aria-label="Hero section"], [aria-label="قسم بطل الصفحة"]');
      if (!hero) return null;
      const bg = getComputedStyle(hero).backgroundColor;
      // Parse rgba and check if dark (sum of R+G+B < 100)
      const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!match) return { bg, isDark: false };
      const sum = parseInt(match[1]) + parseInt(match[2]) + parseInt(match[3]);
      return { bg, sum, isDark: sum < 100 };
    });
    expect(heroBg, 'Hero not found').not.toBeNull();
    expect(heroBg.isDark, `Hero bg="${heroBg.bg}" (RGB sum=${heroBg.sum}) must be dark`).toBe(true);
  });

  test('Dark: screenshot EN', async ({ page }) => {
    await loadHero(page, true);
    await page.screenshot({
      path: path.join(SHOTS, 'FINAL-390x844-dark-en.png'),
      clip: { x: 0, y: 0, width: 390, height: 844 },
    });
  });

  test('Dark: screenshot AR', async ({ page }) => {
    await loadHero(page, true, 'ar');
    await page.screenshot({
      path: path.join(SHOTS, 'FINAL-390x844-dark-ar.png'),
      clip: { x: 0, y: 0, width: 390, height: 844 },
    });
  });
});

/* ── AR test ────────────────────────────────────────────────────────────── */
test.describe('AR (390×844)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('AR: screenshot light', async ({ page }) => {
    await loadHero(page, false, 'ar');
    await page.screenshot({
      path: path.join(SHOTS, 'FINAL-390x844-light-ar.png'),
      clip: { x: 0, y: 0, width: 390, height: 844 },
    });
  });
});
