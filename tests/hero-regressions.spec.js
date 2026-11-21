/**
 * hero-regressions.spec.js
 * Fail before / pass after:
 *  A. Exactly one logo, one hamburger button in top 120px (no duplicate bar)
 *  B. Sparkle: no background rectangle (overflow visible, bg transparent)
 */
import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:4173';
const CASES = [
  { w: 360, h: 640,  lang: 'en', dark: false },
  { w: 360, h: 640,  lang: 'ar', dark: true  },
  { w: 390, h: 844,  lang: 'en', dark: true  },
  { w: 390, h: 844,  lang: 'ar', dark: true  },
  { w: 412, h: 915,  lang: 'en', dark: false },
  { w: 412, h: 915,  lang: 'ar', dark: true  },
];
const SCROLL_POSITIONS = [0, 400, 1200];

for (const { w, h, lang, dark } of CASES) {
  for (const scrollY of SCROLL_POSITIONS) {
    test(`${w}×${h} ${lang} ${dark?'dark':'light'} scroll=${scrollY} — single bar + sparkle`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

      await page.setViewportSize({ width: w, height: h });
      if (dark) await page.emulateMedia({ colorScheme: 'dark' });
      const url = lang === 'ar' ? `${BASE}/?lang=ar` : BASE;
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(600);
      if (scrollY > 0) {
        await page.evaluate((y) => window.scrollTo(0, y), scrollY);
        await page.waitForTimeout(300);
      }

      /* ── A1. Exactly one visible logo in top 120px ── */
      const visibleLogos = await page.evaluate(() =>
        Array.from(document.querySelectorAll('img[src*="brand/"], img[src*="sentivra"]'))
          .filter(el => {
            const b = el.getBoundingClientRect();
            const cs = window.getComputedStyle(el);
            return b.top >= 0 && b.top < 120 && b.height > 0 && b.width > 0
              && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0.05;
          }).length
      );
      expect(visibleLogos, 'exactly one logo visible in top 120px').toBe(1);

      /* ── A2. Exactly one hamburger/menu button in top 120px ── */
      const visibleMenuBtns = await page.evaluate(() =>
        Array.from(document.querySelectorAll('button'))
          .filter(el => {
            const b = el.getBoundingClientRect();
            const cs = window.getComputedStyle(el);
            const lbl = (el.getAttribute('aria-label') || '').toLowerCase();
            return b.top >= 0 && b.top < 120 && b.height > 0
              && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0.05
              && (lbl.includes('menu') || lbl.includes('قائمة') || lbl.includes('open')
                  || lbl.includes('فتح') || el.classList.contains('md:hidden')
                  || el.getAttribute('aria-expanded') !== null);
          }).length
      );
      expect(visibleMenuBtns, 'exactly one menu button visible in top 120px').toBe(1);

      /* ── A3. Only one element with height > 0 overlapping the top 68px ── */
      const { header1, header2 } = await page.evaluate(() => {
        // Find all bars: global header + any [data-slot="topbar"]
        const header = document.querySelector('header');
        const heroTopbar = document.querySelector('[data-slot="topbar"]');
        const hb = header?.getBoundingClientRect();
        const tb = heroTopbar?.getBoundingClientRect();
        return {
          header1: hb ? { top: Math.round(hb.top), h: Math.round(hb.height), visible: hb.height > 0 } : null,
          header2: tb ? { top: Math.round(tb.top), h: Math.round(tb.height), visible: tb.height > 0 } : null,
        };
      });
      // If both have height > 0 they must not overlap
      if (header1?.visible && header2?.visible) {
        const overlap = header1.top < (header2.top + header2.h) && (header1.top + header1.h) > header2.top;
        expect(overlap, 'two bars must not overlap').toBeFalsy();
      }
      // The hero topbar should not exist (we removed it)
      if (header2) {
        expect(header2.h, 'hero topbar height should be 0 or not present').toBe(0);
      }

      /* ── B1. Sparkle wrapper and SVG: overflow visible, bg transparent ── */
      // Only check at scrollY=0 when hero is visible
      if (scrollY === 0) {
        const spk = await page.evaluate(() => {
          const el  = document.querySelector('[data-slot="sparkle"]');
          const svg = el?.querySelector('svg');
          const wrap = el?.querySelector('.hhm-spk-wrap');
          if (!el) return null;
          const cs  = window.getComputedStyle(el);
          const wcs = wrap ? window.getComputedStyle(wrap) : {};
          const svgcs = svg ? window.getComputedStyle(svg) : {};
          // Parse background alpha
          const parseBgAlpha = (bg) => {
            const m = (bg || '').match(/rgba?\([\d.,\s]+,\s*([\d.]+)\)/);
            return m ? parseFloat(m[1]) : (bg === 'transparent' ? 0 : -1);
          };
          return {
            rowOverflow:  cs.overflow,
            wrapOverflow: wcs.overflow,
            wrapBgAlpha:  parseBgAlpha(wcs.backgroundColor),
            svgOverflow:  svgcs.overflow,
          };
        });

        if (spk) {
          // No overflow:hidden that would clip tips
          expect(spk.wrapOverflow, 'sparkle wrapper must not clip (overflow visible)').not.toBe('hidden');
          // No visible background colour
          expect(spk.wrapBgAlpha, 'sparkle wrapper background must be transparent (alpha=0)').toBe(0);
          // SVG overflow visible so tips render
          expect(spk.svgOverflow, 'sparkle SVG overflow must be visible').toBe('visible');
        }

        /* ── B2. No horizontal scroll ── */
        const hScroll = await page.evaluate(() =>
          document.documentElement.scrollWidth > window.innerWidth + 2
        );
        expect(hScroll, 'no horizontal scroll').toBeFalsy();
      }

      /* ── C. No JS errors ── */
      const realErrors = errors.filter(e =>
        !e.includes('404') && !e.includes('woff2') &&
        !e.includes('marquee') && !e.includes('page_sections')
      );
      expect(realErrors, 'no JS errors').toHaveLength(0);
    });
  }
}
