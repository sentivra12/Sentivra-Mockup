/**
 * home-hero-carousel.spec.mjs
 * Runtime assertions for the mobile-only home hero carousel.
 *
 * FAIL on current code (HomeHeroMobile, no carousel, no data-hero-carousel).
 * PASS after HomeHeroCarousel is live.
 *
 * Viewports: 360x640, 390x844, 412x915, 430x932
 * Themes: light / dark (assert dark class before screenshot)
 * Locales: EN / AR
 * reducedMotion: on / off (slide must NOT auto-advance under reduced-motion)
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import fs   from 'fs';

const BASE  = 'http://localhost:4173';
const SHOTS = path.resolve('tests/screenshots');
fs.mkdirSync(SHOTS, { recursive: true });

const VPS = [
  { name: '360x640', w: 360, h: 640 },
  { name: '390x844', w: 390, h: 844 },
  { name: '412x915', w: 412, h: 915 },
  { name: '430x932', w: 430, h: 932 },
];

/* ── helpers ─────────────────────────────────────────────────────────────── */
async function setup(page, { dark = false, lang = 'en', reducedMotion = false } = {}) {
  await page.addInitScript(({ dark, lang, rm }) => {
    if (dark)         localStorage.setItem('sentivra-theme', 'dark');
    if (lang === 'ar') localStorage.setItem('language', 'ar');
    if (rm)           localStorage.setItem('sentivra-motion-preference', 'reduced');
  }, { dark, lang, rm: reducedMotion });

  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-hero-carousel]', { timeout: 15000 });

  if (dark) {
    await page.waitForFunction(
      () => document.documentElement.classList.contains('dark') ||
            document.documentElement.getAttribute('data-theme') === 'dark',
      { timeout: 6000 }
    ).catch(() => null);
  }
  await page.waitForTimeout(1800);
  await page.evaluate(() => window.scrollTo(0, 0));
}

function carouselSelector() {
  return '[data-hero-carousel]';
}

/* ── Static checks ───────────────────────────────────────────────────────── */
test('Mobile component present in DOM on 390x844', async ({ page }) => {
  page.setViewportSize({ width: 390, height: 844 });
  await setup(page);
  const count = await page.evaluate(() =>
    document.querySelectorAll('[data-hero-carousel]').length
  );
  expect(count).toBe(1);
});

test('Desktop hero NOT in DOM on 390x844', async ({ page }) => {
  page.setViewportSize({ width: 390, height: 844 });
  await setup(page);
  // The DesktopHero wrapper (HeroVisual) should not be rendered on phones
  const desktopPresent = await page.evaluate(() =>
    !!document.querySelector('[data-hero-desktop]')
  );
  expect(desktopPresent).toBe(false);
});

test('Mobile carousel NOT in DOM on 1440x900', async ({ page }) => {
  page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const mobilePresent = await page.evaluate(() =>
    !!document.querySelector('[data-hero-carousel]')
  );
  expect(mobilePresent).toBe(false);
});

test('Hero requests 0 images', async ({ page }) => {
  page.setViewportSize({ width: 390, height: 844 });
  await setup(page);
  // Check that the carousel DOM contains no <img> tags with external src
  const imgCount = await page.evaluate(() => {
    const c = document.querySelector('[data-hero-carousel]');
    return [...(c?.querySelectorAll('img') || [])].filter(i =>
      i.src && !i.src.startsWith('data:') && !i.src.includes('favicon')
    ).length;
  });
  expect(imgCount, 'Carousel DOM must contain 0 external images').toBe(0);
});

/* ── Per-viewport core assertions ────────────────────────────────────────── */
for (const vp of VPS) {
  test.describe(`Carousel ${vp.name}`, () => {
    test.use({ viewport: { width: vp.w, height: vp.h } });

    test(`${vp.name}: hero height == viewport (±2px)`, async ({ page }) => {
      await setup(page);
      const diff = await page.evaluate(sel => {
        const el = document.querySelector(sel);
        return el ? Math.abs(el.getBoundingClientRect().height - window.innerHeight) : 9999;
      }, carouselSelector());
      expect(diff, `hero height diff ${diff}px`).toBeLessThanOrEqual(2);
    });

    test(`${vp.name}: no vertical overflow inside hero`, async ({ page }) => {
      await setup(page);
      const overflow = await page.evaluate(sel => {
        const el = document.querySelector(sel);
        if (!el) return { ok: false };
        return {
          ok: el.scrollHeight <= el.clientHeight + 2,
          sh: el.scrollHeight, ch: el.clientHeight,
        };
      }, carouselSelector());
      expect(overflow.ok, `scrollH=${overflow.sh} clientH=${overflow.ch}`).toBe(true);
    });

    test(`${vp.name}: no horizontal scroll`, async ({ page }) => {
      await setup(page);
      const hs = await page.evaluate(() =>
        document.documentElement.scrollWidth > window.innerWidth + 2
      );
      expect(hs).toBe(false);
    });

    test(`${vp.name}: at least one slide visible (role=group)`, async ({ page }) => {
      await setup(page);
      const count = await page.evaluate(sel => {
        const c = document.querySelector(sel);
        return c ? c.querySelectorAll('[role="group"]').length : 0;
      }, carouselSelector());
      expect(count).toBeGreaterThanOrEqual(1);
    });

    test(`${vp.name}: CTA returns itself from elementFromPoint`, async ({ page }) => {
      await setup(page);
      const ok = await page.evaluate(sel => {
        const c = document.querySelector(sel);
        const cta = c?.querySelector('[data-cta-primary]');
        if (!cta) return { ok: false, reason: 'no cta' };
        const r   = cta.getBoundingClientRect();
        const hit = document.elementFromPoint(r.left + r.width/2, r.top + r.height/2);
        return { ok: hit === cta || cta.contains(hit), rect: { w: r.width, h: r.height } };
      }, carouselSelector());
      expect(ok.ok, JSON.stringify(ok)).toBe(true);
    });

    test(`${vp.name}: WhatsApp button returns itself from elementFromPoint`, async ({ page }) => {
      await setup(page);
      const ok = await page.evaluate(sel => {
        const c  = document.querySelector(sel);
        const btn = c?.querySelector('[data-whatsapp-btn]');
        if (!btn) return { ok: false, reason: 'no whatsapp btn' };
        const r   = btn.getBoundingClientRect();
        const hit = document.elementFromPoint(r.left + r.width/2, r.top + r.height/2);
        return { ok: hit === btn || btn.contains(hit) };
      }, carouselSelector());
      expect(ok.ok, JSON.stringify(ok)).toBe(true);
    });

    test(`${vp.name}: prev/next buttons return themselves from elementFromPoint`, async ({ page }) => {
      await setup(page);
      const result = await page.evaluate(sel => {
        const c    = document.querySelector(sel);
        const prev = c?.querySelector('[data-prev-btn]');
        const next = c?.querySelector('[data-next-btn]');
        if (!prev || !next) return { ok: false, reason: 'missing prev/next' };
        const hitPrev = document.elementFromPoint(
          prev.getBoundingClientRect().left + prev.getBoundingClientRect().width/2,
          prev.getBoundingClientRect().top  + prev.getBoundingClientRect().height/2
        );
        const hitNext = document.elementFromPoint(
          next.getBoundingClientRect().left + next.getBoundingClientRect().width/2,
          next.getBoundingClientRect().top  + next.getBoundingClientRect().height/2
        );
        return {
          ok: (hitPrev === prev || prev.contains(hitPrev)) &&
              (hitNext === next || next.contains(hitNext)),
        };
      }, carouselSelector());
      expect(result.ok, JSON.stringify(result)).toBe(true);
    });

    test(`${vp.name}: menu button returns itself from elementFromPoint`, async ({ page }) => {
      await setup(page);
      const ok = await page.evaluate(() => {
        // The menu button is the existing Header hamburger (aria-controls="mobile-menu")
        const btn = document.querySelector('[aria-controls="mobile-menu"]');
        if (!btn) return { ok: false, reason: 'no menu btn' };
        const r   = btn.getBoundingClientRect();
        const hit = document.elementFromPoint(r.left + r.width/2, r.top + r.height/2);
        return { ok: hit === btn || btn.contains(hit) };
      });
      expect(ok.ok, JSON.stringify(ok)).toBe(true);
    });

    test(`${vp.name}: CTA height >= 44px`, async ({ page }) => {
      await setup(page);
      const h = await page.evaluate(sel => {
        const c   = document.querySelector(sel);
        const cta = c?.querySelector('[data-cta-primary]');
        return cta ? cta.getBoundingClientRect().height : 0;
      }, carouselSelector());
      expect(h).toBeGreaterThanOrEqual(44);
    });

    test(`${vp.name}: slide auto-advances after 5.5s (motion on)`, async ({ page }) => {
      await setup(page, { reducedMotion: false });
      const slide0 = await page.evaluate(sel =>
        document.querySelector(sel)?.getAttribute('data-active-slide'),
        carouselSelector()
      );
      await page.waitForTimeout(5600);
      const slide1 = await page.evaluate(sel =>
        document.querySelector(sel)?.getAttribute('data-active-slide'),
        carouselSelector()
      );
      // If only 1 slide, skip the check
      const totalSlides = await page.evaluate(sel =>
        parseInt(document.querySelector(sel)?.getAttribute('data-slide-count') || '1'),
        carouselSelector()
      );
      if (totalSlides > 1) {
        expect(slide1).not.toBe(slide0);
      }
    });

    test(`${vp.name}: slide does NOT auto-advance under reduced-motion`, async ({ page }) => {
      await setup(page, { reducedMotion: true });
      const slide0 = await page.evaluate(sel =>
        document.querySelector(sel)?.getAttribute('data-active-slide'),
        carouselSelector()
      );
      await page.waitForTimeout(5600);
      const slide1 = await page.evaluate(sel =>
        document.querySelector(sel)?.getAttribute('data-active-slide'),
        carouselSelector()
      );
      expect(slide1).toBe(slide0);
    });

    test(`${vp.name}: next button advances slide`, async ({ page }) => {
      await setup(page, { reducedMotion: true }); // pause autoplay so we control it
      const totalSlides = await page.evaluate(sel =>
        parseInt(document.querySelector(sel)?.getAttribute('data-slide-count') || '1'),
        carouselSelector()
      );
      if (totalSlides < 2) return; // skip if single slide
      const slide0 = await page.evaluate(sel =>
        document.querySelector(sel)?.getAttribute('data-active-slide'),
        carouselSelector()
      );
      await page.evaluate(sel => {
        document.querySelector(sel)?.querySelector('[data-next-btn]')?.click();
      }, carouselSelector());
      await page.waitForTimeout(500);
      const slide1 = await page.evaluate(sel =>
        document.querySelector(sel)?.getAttribute('data-active-slide'),
        carouselSelector()
      );
      expect(slide1).not.toBe(slide0);
    });

    // screenshots
    test(`${vp.name}: screenshot light EN`, async ({ page }) => {
      await setup(page);
      await page.screenshot({
        path: path.join(SHOTS, `CAROUSEL-${vp.name}-light-en.png`),
        clip: { x: 0, y: 0, width: vp.w, height: vp.h },
      });
    });
  });
}

/* ── Dark + AR (390x844 only) ────────────────────────────────────────────── */
test.describe('Carousel 390x844 dark+AR', () => {
  test.use({ viewport: { width: 390, height: 844 }, colorScheme: 'dark' });

  test('dark: documentElement has .dark before screenshot', async ({ page }) => {
    await setup(page, { dark: true });
    const ok = await page.evaluate(() =>
      document.documentElement.classList.contains('dark') ||
      document.documentElement.getAttribute('data-theme') === 'dark'
    );
    expect(ok, 'dark class not applied').toBe(true);
  });

  test('dark: hero height == viewport', async ({ page }) => {
    await setup(page, { dark: true });
    const diff = await page.evaluate(sel => {
      const el = document.querySelector(sel);
      return el ? Math.abs(el.getBoundingClientRect().height - window.innerHeight) : 9999;
    }, carouselSelector());
    expect(diff).toBeLessThanOrEqual(2);
  });

  for (const lang of ['en', 'ar']) {
    for (const theme of ['light', 'dark']) {
      test(`${theme} ${lang}: screenshot 390x844`, async ({ page }) => {
        await setup(page, { dark: theme === 'dark', lang });
        await page.screenshot({
          path: path.join(SHOTS, `CAROUSEL-390x844-${theme}-${lang}.png`),
          clip: { x: 0, y: 0, width: 390, height: 844 },
        });
      });
    }
  }
});

/* ── No console errors ───────────────────────────────────────────────────── */
test('390x844: no console errors on load', async ({ page }) => {
  page.setViewportSize({ width: 390, height: 844 });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text().substring(0, 120)); });
  page.on('pageerror', e => errors.push(e.message.substring(0, 120)));
  await setup(page);
  const filtered = errors.filter(e =>
    !e.includes('favicon') &&
    !e.includes('chrome-extension') &&
    !e.includes('[i18n]') &&
    !e.includes('supabase') &&
    !e.includes('Supabase') &&
    !e.includes('PGRST') &&
    !e.includes('404') &&
    !e.includes('Failed to load resource') &&
    !e.includes('Fetch error')
  );
  expect(filtered, filtered.join('\n')).toHaveLength(0);
});
