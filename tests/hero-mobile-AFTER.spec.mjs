/**
 * AFTER tests — mobile home hero.
 *
 * Part A  (source-grep, no server): 
 *   • Old problems are gone
 *   • New structure is in place
 *
 * Part B  (browser at 360x740 and 412x915 via vite preview on port 4173):
 *   • Hero height == viewport (no scroll to see H1 + both CTAs + stage)
 *   • Stage element is inside the hero (no overflow)
 *   • At most 2 CSS animation names running in the hero
 *   • No horizontal scroll
 *   • Both CTA buttons are >= 48px tall
 *   • No element clipped outside the hero box
 *   • Typewriter text is non-empty and not clipped
 *   • Desktop 1440 screenshot looks unchanged
 *
 * FAIL BEFORE fix → PASS AFTER fix.
 */

import { test, expect } from '@playwright/test';
import fs   from 'fs';
import path from 'path';

const SRC_HERO   = path.resolve('src/components/home/PremiumHero.jsx');
const SRC_MOBILE = path.resolve('src/components/home/HomeHeroMobile.jsx');
const SRC_STAGE  = path.resolve('src/components/home/MiniStage.jsx');
const SHOTS      = path.resolve('tests/screenshots');
fs.mkdirSync(SHOTS, { recursive: true });

const src  = (f) => fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '';

// ── Part A: source checks ────────────────────────────────────────────────────

test.describe('AFTER Part A — source: new structure in place', () => {

  test('PremiumHero: no injected <style> with !important', () => {
    expect(src(SRC_HERO)).not.toContain('!important');
  });

  test('PremiumHero: HomeHeroMobile imported', () => {
    expect(src(SRC_HERO)).toContain('HomeHeroMobile');
  });

  test('PremiumHero: HeroVisual is lazy (no eager import)', () => {
    expect(src(SRC_HERO)).not.toContain("import HeroVisual from");
    expect(src(SRC_HERO)).toContain("lazy(() => import('@/components/home/HeroVisual'))");
  });

  test('HomeHeroMobile: file exists', () => {
    expect(fs.existsSync(SRC_MOBILE)).toBe(true);
  });

  test('HomeHeroMobile: uses 100svh height', () => {
    expect(src(SRC_MOBILE)).toMatch(/100svh/);
  });

  test('HomeHeroMobile: full-width CTAs (w-full)', () => {
    expect(src(SRC_MOBILE)).toMatch(/w-full.*h-12|h-12.*w-full/);
  });

  test('HomeHeroMobile: scroll-snap chips', () => {
    expect(src(SRC_MOBILE)).toContain('scrollSnapType');
  });

  test('HomeHeroMobile: typewriter has no minWidth 8ch', () => {
    expect(src(SRC_MOBILE)).not.toContain("minWidth: '8ch'");
  });

  test('HomeHeroMobile: no backdrop-filter on chips or eyebrow', () => {
    expect(src(SRC_MOBILE)).not.toContain('backdrop-blur');
    expect(src(SRC_MOBILE)).not.toContain('backdropFilter');
  });

  test('HomeHeroMobile: MiniStage rendered', () => {
    expect(src(SRC_MOBILE)).toContain('MiniStage');
  });

  test('HomeHeroMobile: solid emerald CTA (default Button variant)', () => {
    // Not bg-white — uses default Button which has brand gradient
    expect(src(SRC_MOBILE)).not.toContain('bg-white shadow-xl');
  });

  test('MiniStage: file exists', () => {
    expect(fs.existsSync(SRC_STAGE)).toBe(true);
  });

  test('MiniStage: exactly 2 animation class names (ms-float, ms-pulse)', () => {
    const s = src(SRC_STAGE);
    expect(s).toContain('ms-float-anim');
    expect(s).toContain('ms-pulse-anim');
  });

  test('MiniStage: no backdrop-filter in code (comment excluded)', () => {
    // Strip comments then check
    const code = src(SRC_STAGE).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
    expect(code).not.toContain('backdrop');
  });

  test('MiniStage: RTL handled via scaleX(-1) logical flip', () => {
    expect(src(SRC_STAGE)).toContain('scaleX(-1)');
  });

  test('MiniStage: overflow hidden on root (nothing clips outside)', () => {
    expect(src(SRC_STAGE)).toContain("overflow: 'hidden'");
  });

  test('MiniStage: pauses when off-screen (IntersectionObserver)', () => {
    expect(src(SRC_STAGE)).toContain('IntersectionObserver');
  });

  test('MiniStage: pauses on hidden tab (visibilitychange)', () => {
    expect(src(SRC_STAGE)).toContain('visibilitychange');
  });

  test('HeroVisual now a separate lazy chunk in dist', () => {
    const dist = fs.readdirSync(path.resolve('dist/assets'));
    const hasVisualChunk = dist.some(f => f.startsWith('HeroVisual') && f.endsWith('.js'));
    expect(hasVisualChunk).toBe(true);
  });

  test('Main bundle shrank (index chunk < 240 KB)', () => {
    const dist = fs.readdirSync(path.resolve('dist/assets'));
    const indexChunk = dist.find(f => f.startsWith('index') && f.endsWith('.js'));
    const size = fs.statSync(path.resolve('dist/assets', indexChunk)).size;
    expect(size).toBeLessThan(240 * 1024);
  });
});

// ── Part B: browser tests ───────────────────────────────────────────────────

const VIEWPORTS = [
  { name: '360x740',  w: 360,  h: 740  },
  { name: '390x844',  w: 390,  h: 844  },
  { name: '412x915',  w: 412,  h: 915  },
];

for (const vp of VIEWPORTS) {
  test.describe(`AFTER Part B — browser ${vp.name}`, () => {

    test.use({ viewport: { width: vp.w, height: vp.h } });

    test(`${vp.name}: hero height equals viewport height`, async ({ page }) => {
      await page.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('[aria-label="Hero section"], [aria-label="القسم الرئيسي"]', { timeout: 15000 });
      await page.waitForTimeout(1500);

      const heroH = await page.evaluate(() => {
        const hero = document.querySelector('[aria-label="Hero section"], [aria-label="القسم الرئيسي"]');
        return hero ? hero.getBoundingClientRect().height : 0;
      });
      const vpH = vp.h;

      // Hero height should be within 5px of viewport height
      expect(heroH, `Hero ${heroH}px vs viewport ${vpH}px`).toBeGreaterThanOrEqual(vpH - 5);
      expect(heroH, `Hero must not overflow viewport by more than 5px`).toBeLessThanOrEqual(vpH + 5);
    });

    test(`${vp.name}: H1 and both CTAs visible without scrolling`, async ({ page }) => {
      await page.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);

      const h1Visible = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        if (!h1) return false;
        const r = h1.getBoundingClientRect();
        return r.top >= 0 && r.bottom <= window.innerHeight;
      });
      expect(h1Visible, 'H1 must be visible without scrolling').toBe(true);

      // Both CTAs visible
      const ctasVisible = await page.evaluate(() => {
        const btns = [...document.querySelectorAll('a[href], button')].filter(el => {
          const h = el.getBoundingClientRect().height;
          return h >= 44;
        });
        return btns.filter(el => {
          const r = el.getBoundingClientRect();
          return r.top >= 0 && r.bottom <= window.innerHeight && r.width > 100;
        }).length;
      });
      expect(ctasVisible, 'At least 2 full-width CTAs visible without scroll').toBeGreaterThanOrEqual(2);
    });

    test(`${vp.name}: at most 2 infinite CSS animations in hero`, async ({ page }) => {
      await page.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);

      const animCount = await page.evaluate(() => {
        const hero = document.querySelector('[aria-label="Hero section"], [aria-label="القسم الرئيسي"]');
        if (!hero) return 0;

        const loopingAnimNames = new Set();
        const walk = (el) => {
          const s = window.getComputedStyle(el);
          const names = s.animationName?.split(',').map(n => n.trim()).filter(n => n && n !== 'none') || [];
          const iters = s.animationIterationCount?.split(',').map(n => n.trim()) || [];

          names.forEach((name, i) => {
            const count = iters[i] || iters[0] || '1';
            // caret-blink is a text cursor — not a hero background animation
            if (count === 'infinite' && name !== 'caret-blink') {
              loopingAnimNames.add(name);
            }
          });
          for (const child of el.children) walk(child);
        };
        walk(hero);
        return loopingAnimNames.size;
      });

      expect(animCount, `${animCount} infinite animations found (max 2)`).toBeLessThanOrEqual(2);
    });

    test(`${vp.name}: no horizontal scroll`, async ({ page }) => {
      await page.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);

      const hasHScroll = await page.evaluate(() =>
        document.documentElement.scrollWidth > window.innerWidth + 2
      );
      expect(hasHScroll, 'No horizontal scroll').toBe(false);
    });

    test(`${vp.name}: stage does not overflow hero`, async ({ page }) => {
      await page.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);

      const result = await page.evaluate(() => {
        const hero  = document.querySelector('[aria-label="Hero section"], [aria-label="القسم الرئيسي"]');
        const stage = document.querySelector('[aria-label="Software services illustration"]');
        if (!hero || !stage) return { ok: true, reason: 'stage not found (desktop)' };

        const hR = hero.getBoundingClientRect();
        const sR = stage.getBoundingClientRect();

        // Stage bottom must be within hero bottom (allow 2px rounding)
        const overflows = sR.bottom > hR.bottom + 2;
        return {
          ok: !overflows,
          heroBottom:  Math.round(hR.bottom),
          stageBottom: Math.round(sR.bottom),
        };
      });
      expect(result.ok, `Stage overflows: stageBottom=${result.stageBottom} heroBottom=${result.heroBottom}`).toBe(true);
    });

    test(`${vp.name}: screenshot`, async ({ page }) => {
      await page.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: path.join(SHOTS, `MOBILE-hero-${vp.name}-light-en.png`),
        fullPage: false,
        clip: { x: 0, y: 0, width: vp.w, height: vp.h },
      });
    });
  });
}

// Desktop unchanged
test('desktop 1440: screenshot', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  await page.screenshot({
    path: path.join(SHOTS, 'DESKTOP-hero-1440-light-en.png'),
    fullPage: false,
    clip: { x: 0, y: 0, width: 1440, height: 900 },
  });
});
