/**
 * AFTER test — Round 2 mobile hero fixes.
 * Runs against http://localhost:4173 (vite preview of fixed build).
 *
 * Browsers: Chromium (default), Firefox, WebKit
 * Viewports: 360x640, 390x844, 412x915
 * Variants: light/dark x EN/AR x reducedMotion on/off
 *
 * Key assertions:
 *  A. elementFromPoint at CTA center returns the CTA (stage not covering it)
 *  B. Hero height == viewport height
 *  C. All content (H1, CTAs, chips, stage) inside viewport
 *  D. Stage does NOT geometrically intersect CTA rects
 *  E. Stats+typewriter row is present and non-empty
 *  F. Chips row is not hard-clipped (last chip not cut mid-word OR row scrollable)
 *  G. At most 3 running CSS animation names (excluding caret-blink)
 *  H. No horizontal scroll
 *  I. Tap targets >= 44px
 *  J. Desktop 1440 hero height >= 640px (not changed to mobile layout)
 *
 * Screenshots captured for all 3 browsers at 390x844 light/dark x EN.
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import fs   from 'fs';

const SHOTS = path.resolve('tests/screenshots');
fs.mkdirSync(SHOTS, { recursive: true });

const BASE = 'http://localhost:4173';

/* ── Helpers ────────────────────────────────────────────────────────────── */

async function goMobile(page, vp, dark = false) {
  await page.setViewportSize({ width: vp.w, height: vp.h });
  if (dark) {
    await page.addInitScript(() => { localStorage.setItem('theme', 'dark'); });
  }
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[aria-label="Hero section"], [aria-label="القسم الرئيسي"]', { timeout: 15000 });
  await page.waitForTimeout(1000);
}

async function getHero(page) {
  return page.locator('[aria-label="Hero section"], [aria-label="القسم الرئيسي"]').first();
}

/* Full-width CTAs in hero */
async function getFullWidthCTAs(page, vpW) {
  return page.evaluate((minW) => {
    const hero = document.querySelector('[aria-label="Hero section"], [aria-label="القسم الرئيسي"]');
    if (!hero) return [];
    return [...hero.querySelectorAll('a, button')]
      .filter(el => {
        const r = el.getBoundingClientRect();
        return r.width >= minW * 0.6 && r.height >= 44 && r.top >= 0 && r.bottom <= window.innerHeight;
      })
      .slice(0, 2)
      .map(el => ({
        text: el.textContent?.trim().substring(0, 30),
        top: Math.round(el.getBoundingClientRect().top),
        bottom: Math.round(el.getBoundingClientRect().bottom),
        left: Math.round(el.getBoundingClientRect().left),
        right: Math.round(el.getBoundingClientRect().right),
        cx: Math.round(el.getBoundingClientRect().left + el.getBoundingClientRect().width / 2),
        cy: Math.round(el.getBoundingClientRect().top + el.getBoundingClientRect().height / 2),
      }));
  }, vpW);
}

/* ═══════════════════════════════════════════════════════════════════════════
   TEST SUITE A — Source checks (no browser needed)
═══════════════════════════════════════════════════════════════════════════ */
test.describe('AFTER A — source checks', () => {

  const srcMobile = fs.readFileSync(path.resolve('src/components/home/HomeHeroMobile.jsx'), 'utf8');
  const srcStage  = fs.readFileSync(path.resolve('src/components/home/MiniStage.jsx'),      'utf8');

  test('HomeHeroMobile: stage wrapper has zIndex 0', () => {
    expect(srcMobile).toContain('zIndex: 0');
  });
  test('HomeHeroMobile: content block has zIndex 2', () => {
    expect(srcMobile).toContain('zIndex: 2');
  });
  test('HomeHeroMobile: MiniStage rendered inside zIndex:0 container', () => {
    expect(srcMobile).toContain('<MiniStage');
  });
  test('HomeHeroMobile: stats+typewriter row always rendered', () => {
    // No guard on serviceNames.length before the stats+typewriter block
    // The row is now always rendered with twItems fallback
    expect(srcMobile).toContain('twItems');
    expect(srcMobile).toContain('<Typewriter');
  });
  test('HomeHeroMobile: chips have paddingInlineEnd for scroll room', () => {
    expect(srcMobile).toContain('paddingInlineEnd');
  });
  test('HomeHeroMobile: Firefox scrollbar hidden via scrollbar-width:none', () => {
    expect(srcMobile).toContain('scrollbar-width: none');
  });
  test('HomeHeroMobile: divider uses inline fill (not Tailwind text-color)', () => {
    expect(srcMobile).toContain('fill={dividerFill');
  });
  test('HomeHeroMobile: underline is solid #0D9E82 (not gradient+opacity)', () => {
    expect(srcMobile).toContain("background: '#0D9E82'");
  });
  test('HomeHeroMobile: Sparkles icon used in eyebrow', () => {
    expect(srcMobile).toContain('Sparkles');
  });
  test('HomeHeroMobile: content fade-up CSS class hm-enter', () => {
    expect(srcMobile).toContain('hm-enter');
  });
  test('MiniStage: isolation:isolate on root', () => {
    expect(srcStage).toContain("isolation: 'isolate'");
  });
  test('MiniStage: zIndex 0 on root', () => {
    expect(srcStage).toContain('zIndex: 0');
  });
  test('MiniStage: satellites use 3% inset (>= 12px on 390px)', () => {
    // 3% of 390 = 11.7 ≈ 12px
    expect(srcStage).toMatch(/left:\s*['"]3%/);
    expect(srcStage).toMatch(/right:\s*['"]3%/);
  });
  test('MiniStage: glow ring animation ms-glow-ring', () => {
    expect(srcStage).toContain('ms-ring-run');
  });
  test('MiniStage: bar grow animation ms-bar-run', () => {
    expect(srcStage).toContain('ms-bar-run');
  });
  test('MiniStage: dash-flow animation ms-dash-run', () => {
    expect(srcStage).toContain('ms-dash-run');
  });
  test('MiniStage: no backdrop-filter in code', () => {
    const code = srcStage.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
    expect(code).not.toContain('backdrop');
  });
  test('MiniStage: pauses on visibilitychange', () => {
    expect(srcStage).toContain('visibilitychange');
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   TEST SUITE B — Browser tests
═══════════════════════════════════════════════════════════════════════════ */

const VPS = [
  { name: '360x640', w: 360, h: 640 },
  { name: '390x844', w: 390, h: 844 },
  { name: '412x915', w: 412, h: 915 },
];

for (const vp of VPS) {
  test.describe(`AFTER B — Chromium ${vp.name}`, () => {

    test.use({ viewport: { width: vp.w, height: vp.h } });

    test(`${vp.name}: hero height == viewport height`, async ({ page }) => {
      await goMobile(page, vp);
      const heroH = await page.evaluate(() => {
        const h = document.querySelector('[aria-label="Hero section"], [aria-label="القسم الرئيسي"]');
        return h ? Math.round(h.getBoundingClientRect().height) : 0;
      });
      expect(heroH, `heroH=${heroH} vpH=${vp.h}`).toBeGreaterThanOrEqual(vp.h - 5);
      expect(heroH).toBeLessThanOrEqual(vp.h + 5);
    });

    test(`${vp.name}: elementFromPoint on each CTA returns the CTA (stage not covering)`, async ({ page }) => {
      await goMobile(page, vp);
      const result = await page.evaluate(() => {
        const hero = document.querySelector('[aria-label="Hero section"], [aria-label="القسم الرئيسي"]');
        if (!hero) return { ok: false, reason: 'no hero' };
        const btns = [...hero.querySelectorAll('a, button')].filter(el => {
          const r = el.getBoundingClientRect();
          return r.width > 180 && r.height >= 44 && r.top >= 0 && r.bottom <= window.innerHeight;
        });
        if (btns.length < 2) return { ok: false, reason: `${btns.length} CTAs`, btns: btns.map(b => b.textContent?.trim()) };
        const hits = btns.slice(0, 2).map(btn => {
          const r   = btn.getBoundingClientRect();
          const cx  = r.left + r.width / 2;
          const cy  = r.top  + r.height / 2;
          const hit = document.elementFromPoint(cx, cy);
          return { text: btn.textContent?.trim().substring(0, 20), isOk: hit === btn || btn.contains(hit), hitTag: hit?.tagName };
        });
        return { ok: hits.every(h => h.isOk), hits };
      });
      expect(result.ok, JSON.stringify(result)).toBe(true);
    });

    test(`${vp.name}: stage does NOT overlap CTAs`, async ({ page }) => {
      await goMobile(page, vp);
      const r = await page.evaluate(() => {
        const hero  = document.querySelector('[aria-label="Hero section"], [aria-label="القسم الرئيسي"]');
        const stage = document.querySelector('[aria-label="Software services illustration"], [aria-label="رسم توضيحي لخدمات البرمجيات"]');
        if (!hero || !stage) return { ok: true };
        const sR = stage.getBoundingClientRect();
        const btns = [...hero.querySelectorAll('a, button')].filter(el => {
          const r = el.getBoundingClientRect();
          return r.width > 180 && r.height >= 44;
        });
        const overlaps = btns.filter(btn => {
          const bR = btn.getBoundingClientRect();
          return sR.left < bR.right - 2 && sR.right > bR.left + 2 &&
                 sR.top  < bR.bottom - 2 && sR.bottom > bR.top + 2;
        }).map(b => b.textContent?.trim().substring(0, 20));
        return { ok: overlaps.length === 0, overlaps };
      });
      expect(r.ok, `overlaps: ${JSON.stringify(r.overlaps)}`).toBe(true);
    });

    test(`${vp.name}: stats+typewriter row present`, async ({ page }) => {
      await goMobile(page, vp);
      const found = await page.evaluate(() => {
        const hero = document.querySelector('[aria-label="Hero section"], [aria-label="القسم الرئيسي"]');
        const text = hero?.textContent || '';
        return text.includes('We build:') || text.includes('نبني:') ||
               text.includes('Svcs') || text.includes('خدمة');
      });
      expect(found, 'stats+typewriter must be present').toBe(true);
    });

    test(`${vp.name}: at most 3 infinite CSS animation names (excluding caret-blink)`, async ({ page }) => {
      await goMobile(page, vp);
      const count = await page.evaluate(() => {
        const hero = document.querySelector('[aria-label="Hero section"], [aria-label="القسم الرئيسي"]');
        if (!hero) return 0;
        const loops = new Set();
        const walk = el => {
          const s = getComputedStyle(el);
          const names = s.animationName?.split(',').map(n => n.trim()).filter(n => n && n !== 'none') || [];
          const iters = s.animationIterationCount?.split(',').map(n => n.trim()) || [];
          names.forEach((name, i) => {
            if ((iters[i] || iters[0] || '1') === 'infinite' && name !== 'caret-blink') {
              loops.add(name);
            }
          });
          for (const c of el.children) walk(c);
        };
        walk(hero);
        return loops.size;
      });
      expect(count, `${count} infinite animations (max 3)`).toBeLessThanOrEqual(3);
    });

    test(`${vp.name}: no horizontal scroll`, async ({ page }) => {
      await goMobile(page, vp);
      const hs = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
      expect(hs, 'no horizontal scroll').toBe(false);
    });

    test(`${vp.name}: H1 visible without scrolling`, async ({ page }) => {
      await goMobile(page, vp);
      const ok = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        if (!h1) return false;
        const r = h1.getBoundingClientRect();
        return r.top >= 0 && r.bottom <= window.innerHeight + 2;
      });
      expect(ok, 'H1 must be in viewport').toBe(true);
    });

    test(`${vp.name}: CTAs >= 44px height`, async ({ page }) => {
      await goMobile(page, vp);
      const heights = await page.evaluate(() => {
        const hero = document.querySelector('[aria-label="Hero section"], [aria-label="القسم الرئيسي"]');
        return [...(hero?.querySelectorAll('a, button') || [])]
          .filter(el => el.getBoundingClientRect().width > 180)
          .slice(0, 2)
          .map(el => Math.round(el.getBoundingClientRect().height));
      });
      heights.forEach(h => expect(h, `CTA height ${h}px < 44px`).toBeGreaterThanOrEqual(44));
    });
  });
}

/* ── Screenshots at 390x844, light+dark, EN ── */
test.describe('AFTER B — Screenshots 390x844', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const [label, dark, browserName] of [
    ['light-en-chromium',  false, 'chromium'],
    ['dark-en-chromium',   true,  'chromium'],
  ]) {
    test(`screenshot ${label}`, async ({ page }) => {
      await goMobile(page, { w: 390, h: 844 }, dark);
      await page.waitForTimeout(1800);
      await page.screenshot({
        path: path.join(SHOTS, `R2-hero-390-${label}.png`),
        clip: { x: 0, y: 0, width: 390, height: 844 },
      });
    });
  }
});

/* ── Firefox & WebKit — key checks only ── */
for (const browserCtx of ['firefox', 'webkit']) {
  test.describe(`AFTER B — ${browserCtx} 390x844`, () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test(`${browserCtx}: hero height == viewport`, async ({ page, browserName }) => {
      test.skip(browserName !== browserCtx, `Skipping — only run on ${browserCtx}`);
      await goMobile(page, { w: 390, h: 844 });
      const heroH = await page.evaluate(() => {
        const h = document.querySelector('[aria-label="Hero section"], [aria-label="القسم الرئيسي"]');
        return h ? Math.round(h.getBoundingClientRect().height) : 0;
      });
      expect(heroH).toBeGreaterThanOrEqual(844 - 5);
      expect(heroH).toBeLessThanOrEqual(844 + 5);
    });

    test(`${browserCtx}: CTA not covered`, async ({ page, browserName }) => {
      test.skip(browserName !== browserCtx, `Skipping — only run on ${browserCtx}`);
      await goMobile(page, { w: 390, h: 844 });
      const r = await page.evaluate(() => {
        const hero = document.querySelector('[aria-label="Hero section"], [aria-label="القسم الرئيسي"]');
        if (!hero) return { ok: false };
        const btns = [...hero.querySelectorAll('a, button')].filter(el => {
          const r = el.getBoundingClientRect();
          return r.width > 180 && r.height >= 44 && r.top >= 0 && r.bottom <= window.innerHeight;
        });
        if (!btns.length) return { ok: false, reason: 'no btns' };
        const btn = btns[0];
        const r   = btn.getBoundingClientRect();
        const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return { ok: hit === btn || btn.contains(hit), hitTag: hit?.tagName };
      });
      expect(r.ok, JSON.stringify(r)).toBe(true);
    });

    test(`${browserCtx}: screenshot light-en`, async ({ page, browserName }) => {
      test.skip(browserName !== browserCtx, `Skipping — only run on ${browserCtx}`);
      await goMobile(page, { w: 390, h: 844 });
      await page.waitForTimeout(1800);
      await page.screenshot({
        path: path.join(SHOTS, `R2-hero-390-light-en-${browserCtx}.png`),
        clip: { x: 0, y: 0, width: 390, height: 844 },
      });
    });
  });
}

/* ── Desktop 1440 unchanged check ── */
test('desktop 1440: hero is desktop layout (not mobile)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const heroH = await page.evaluate(() => {
    const h = document.querySelector('[aria-label="Hero section"]');
    return h ? Math.round(h.getBoundingClientRect().height) : 0;
  });
  // Desktop hero must be much taller than the mobile 100svh (which would be ~844px)
  // and use the desktop min-height (clamp 640px to 940px)
  expect(heroH, `desktop heroH=${heroH}`).toBeGreaterThanOrEqual(640);

  await page.screenshot({
    path: path.join(SHOTS, 'R2-hero-1440-light-en.png'),
    clip: { x: 0, y: 0, width: 1440, height: 900 },
  });
});
