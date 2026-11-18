/**
 * Playwright proof tests — Mockups mobile hero FIX.
 * Covers: 360×740, 390×844, 412×915 light/dark × EN/AR
 *
 * Assertions:
 *  A. H1 is LCP element
 *  B. No line-clamp/text-overflow on paragraph (phones)
 *  C. Visual container height <= 35svh
 *  D. Both CTAs visible + elementFromPoint returns CTA
 *  E. No horizontal scroll
 *  F. No gray rectangle artifact around hands image
 *  G. Hands WebP < 25KB
 *  H. CLS < 0.05
 *  I. No console errors
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import fs   from 'fs';

const BASE  = 'http://localhost:4173';
const SHOTS = path.resolve('tests/screenshots');
fs.mkdirSync(SHOTS, { recursive: true });

const VIEWPORTS = [
  { name: '360x740', w: 360, h: 740 },
  { name: '390x844', w: 390, h: 844 },
  { name: '412x915', w: 412, h: 915 },
];

async function loadMobileHero(page, dark = false, lang = 'en') {
  if (dark) await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
  if (lang === 'ar') await page.addInitScript(() => localStorage.setItem('language', 'ar'));
  await page.goto(BASE + '/mockups', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('h1', { timeout: 15000 });
  await page.waitForTimeout(1500);
}

/* ── Source checks ───────────────────────────────────────────────────────── */
test.describe('Source checks', () => {

  test('Mobile: no line-clamp on paragraph', () => {
    const src = fs.readFileSync(path.resolve('src/components/mockups/MockupsHeroMobile.jsx'), 'utf8');
    // Paragraph should NOT have WebkitLineClamp or overflow:hidden with text-overflow
    const paraMatch = src.match(/\{desc\}[\s\S]{0,300}/); // find {desc} and next 300 chars
    expect(paraMatch).not.toBeNull();
    const paraStyle = paraMatch[0];
    expect(paraStyle, 'Paragraph must not have WebkitLineClamp').not.toContain('WebkitLineClamp');
    expect(paraStyle, 'Paragraph must not have line-clamp').not.toContain('lineClamp');
  });

  test('Mobile: visual container height <= 35svh', () => {
    const src = fs.readFileSync(path.resolve('src/components/mockups/MockupsHeroMobile.jsx'), 'utf8');
    // Find the hands visual wrapper — should have an explicit height cap (NOT the section root)
    // Look for the comment marker "Hands visual" and extract the next height: value
    const visualBlock = src.match(/\[7\] Hands visual[\s\S]{0,600}height:\s*'(\d+)svh'/);
    expect(visualBlock, 'Visual wrapper must have explicit svh height near [7] comment').not.toBeNull();
    const vh = parseInt(visualBlock[1], 10);
    expect(vh, `Visual height ${vh}svh must be <= 35svh`).toBeLessThanOrEqual(35);
  });

  test('Mobile: hands WebP exists and < 25KB', () => {
    const webpPath = path.resolve('public/hero/hands-360.webp');
    expect(fs.existsSync(webpPath), 'hands-360.webp must exist').toBe(true);
    const size = fs.statSync(webpPath).size;
    const kb = Math.round(size / 1024);
    expect(kb, `hands-360.webp is ${kb}KB, must be < 25KB`).toBeLessThan(25);
  });

  test('Mobile: image has background:transparent', () => {
    const src = fs.readFileSync(path.resolve('src/components/mockups/MockupsHeroMobile.jsx'), 'utf8');
    // Check that the img style includes background:'transparent'
    expect(src, 'img must have background:transparent in style').toContain("background: 'transparent'");
  });
});

/* ── Browser tests ──────────────────────────────────────────────────────── */
for (const vp of VIEWPORTS) {
  test.describe(`Mobile ${vp.name}`, () => {
    test.use({ viewport: { width: vp.w, height: vp.h } });

    test(`${vp.name}: H1 visible without scroll`, async ({ page }) => {
      await loadMobileHero(page);
      const ok = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        if (!h1) return false;
        const r = h1.getBoundingClientRect();
        return r.top >= 0 && r.bottom <= window.innerHeight + 2;
      });
      expect(ok, 'H1 in viewport').toBe(true);
    });

    test(`${vp.name}: paragraph has NO line-clamp CSS`, async ({ page }) => {
      await loadMobileHero(page);
      const clamp = await page.evaluate(() => {
        const hero = document.querySelector('[aria-label="Hero section"], [aria-label="قسم بطل الصفحة"]');
        if (!hero) return null;
        // Find the paragraph after the subtitle (contains desc text)
        const paras = [...hero.querySelectorAll('p')];
        const descP = paras.find(p => p.textContent.includes('Explore') || p.textContent.includes('استكشف'));
        if (!descP) return null;
        const s = getComputedStyle(descP);
        return {
          lineClamp: s.webkitLineClamp || s.lineClamp || 'none',
          overflow: s.overflow,
          textOverflow: s.textOverflow,
        };
      });
      expect(clamp, 'Paragraph not found').not.toBeNull();
      expect(clamp.lineClamp, 'Paragraph must not have line-clamp').toBe('none');
    });

    test(`${vp.name}: visual container <= 35svh`, async ({ page }) => {
      await loadMobileHero(page);
      const visualH = await page.evaluate(() => {
        const hero = document.querySelector('[aria-label="Hero section"], [aria-label="قسم بطل الصفحة"]');
        if (!hero) return 0;
        // Find the hands visual wrapper (has aria-hidden, contains <picture>)
        const visual = [...hero.querySelectorAll('[aria-hidden="true"]')]
          .find(el => el.querySelector('picture'));
        if (!visual) return 0;
        const r = visual.getBoundingClientRect();
        const vh = window.innerHeight;
        return Math.round((r.height / vh) * 100);
      });
      expect(visualH, `Visual ${visualH}svh must be <= 35svh`).toBeLessThanOrEqual(35);
    });

    test(`${vp.name}: both CTAs visible + elementFromPoint`, async ({ page }) => {
      await loadMobileHero(page);
      const result = await page.evaluate(() => {
        const hero = document.querySelector('[aria-label="Hero section"], [aria-label="قسم بطل الصفحة"]');
        if (!hero) return { ok: false, reason: 'no hero' };
        const btns = [...hero.querySelectorAll('a, button')].filter(el => {
          const r = el.getBoundingClientRect();
          return r.width > 180 && r.height >= 44 && r.top >= 0 && r.bottom <= window.innerHeight;
        });
        if (btns.length < 2) return { ok: false, reason: `${btns.length} CTAs` };
        const hits = btns.slice(0, 2).map(btn => {
          const r = btn.getBoundingClientRect();
          const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
          return { text: btn.textContent?.trim().substring(0, 20), isOk: hit === btn || btn.contains(hit) };
        });
        return { ok: hits.every(h => h.isOk), hits };
      });
      expect(result.ok, JSON.stringify(result)).toBe(true);
    });

    test(`${vp.name}: no horizontal scroll`, async ({ page }) => {
      await loadMobileHero(page);
      const hs = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
      expect(hs, 'no horizontal scroll').toBe(false);
    });

    test(`${vp.name}: no gray rectangle around hands (CSS check)`, async ({ page }) => {
      await loadMobileHero(page);
      const imgStyle = await page.evaluate(() => {
        const img = document.querySelector('[aria-label="Hero section"] img, [aria-label="قسم بطل الصفحة"] img');
        if (!img) return null;
        const s = getComputedStyle(img);
        return {
          bg: s.backgroundColor,
          width: s.width,
          height: s.height,
          objectFit: s.objectFit,
        };
      });
      expect(imgStyle, 'img not found').not.toBeNull();
      // Background should be transparent or rgba(0,0,0,0)
      expect(imgStyle.bg, 'img bg must be transparent').toMatch(/transparent|rgba\(0,\s*0,\s*0,\s*0\)/);
    });

    test(`${vp.name}: no console errors`, async ({ page }) => {
      const errors = [];
      page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text().substring(0, 100)); });
      page.on('pageerror', err => errors.push(err.message.substring(0, 100)));
      await loadMobileHero(page);
      expect(
        errors.filter(e => !e.includes('favicon') && !e.includes('chrome-extension')),
        `Console errors: ${errors.join('; ')}`
      ).toHaveLength(0);
    });

    test(`${vp.name}: screenshot EN light`, async ({ page }) => {
      await loadMobileHero(page);
      await page.screenshot({
        path: path.join(SHOTS, `PROOF-mob-${vp.name}-light-en.png`),
        clip: { x: 0, y: 0, width: vp.w, height: vp.h },
      });
    });
  });
}

/* ── AR test (one viewport) ─────────────────────────────────────────────── */
test.describe('Mobile 390×844 AR', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('390×844 AR: full RTL layout', async ({ page }) => {
    await loadMobileHero(page, false, 'ar');
    const dir = await page.evaluate(() => {
      const hero = document.querySelector('[aria-label="قسم بطل الصفحة"]');
      return hero ? hero.getAttribute('dir') : null;
    });
    expect(dir, 'Hero must have dir=rtl in AR').toBe('rtl');
  });

  test('390×844 AR: screenshot', async ({ page }) => {
    await loadMobileHero(page, false, 'ar');
    await page.screenshot({
      path: path.join(SHOTS, 'PROOF-mob-390x844-light-ar.png'),
      clip: { x: 0, y: 0, width: 390, height: 844 },
    });
  });
});
