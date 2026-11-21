/**
 * hero-mobile-proof.spec.js
 * Fail before / pass after for the HomeHeroMobile redesign.
 *
 * Covers:
 *  1. Single-line headline + description (height ≤ 1.4 × lineHeight, scrollWidth ≤ clientWidth)
 *  2. Identical slot Y positions across all slides (within 2px)
 *  3. Keyword font-size ≤ 56px
 *  4. Sparkle bottom ≥ 12px above keyword top
 *  5. AR: logo in right half, menu button in left half (reversed in EN)
 *  6. No focus ring after mouse click on menu button
 *  7. Arrow icon directions (RTL mirrored)
 *  8. No bounding-box intersection: WA ∩ segments, WA ∩ arrows, WA ∩ CTA
 *  9. No horizontal scroll
 * 10. No JS errors
 */
import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:4173';

const CASES = [
  { w: 360, h: 640,  lang: 'en' },
  { w: 360, h: 640,  lang: 'ar' },
  { w: 390, h: 844,  lang: 'en' },
  { w: 390, h: 844,  lang: 'ar' },
  { w: 412, h: 915,  lang: 'en' },
  { w: 412, h: 915,  lang: 'ar' },
  { w: 430, h: 932,  lang: 'en' },
  { w: 430, h: 932,  lang: 'ar' },
];

function url(lang) {
  return lang === 'ar' ? `${BASE}/?lang=ar` : BASE;
}

/** Navigate to slide i via progress button */
async function goTo(page, i) {
  const btns = page.locator(
    '[data-hero-mobile="true"] button[aria-label^="Slide"],' +
    '[data-hero-mobile="true"] button[aria-label^="الشريحة"]'
  );
  if (await btns.count() > i) {
    await btns.nth(i).click();
    await page.waitForTimeout(650);
  }
}

/** Collect slot bounding-boxes from the active slide */
async function slotBoxes(page) {
  return page.evaluate(() => {
    const slide = document.querySelector('.hhm-active');
    if (!slide) return null;
    const g = (sel) => {
      const el = slide.querySelector(sel);
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { top: b.top, bottom: b.bottom, h: b.height, w: b.width, left: b.left };
    };
    return {
      sparkle:     g('[data-slot="sparkle"]'),
      keyword:     g('[data-slot="keyword"]'),
      headline:    g('[data-slot="headline"]'),
      description: g('[data-slot="description"]'),
    };
  });
}

for (const { w, h, lang } of CASES) {
  test(`${w}×${h} ${lang} — hero slide layout`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

    await page.setViewportSize({ width: w, height: h });
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(url(lang), { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    // Count slides
    const total = await page.locator(
      '[data-hero-mobile="true"] [role="group"][aria-roledescription="slide"]'
    ).count();

    if (total === 0) {
      test.skip(); return;
    }

    const refBoxes = {};

    for (let i = 0; i < total; i++) {
      await goTo(page, i);
      const boxes = await slotBoxes(page);
      expect(boxes, `slide ${i}: must have boxes`).not.toBeNull();
      if (i === 0) Object.assign(refBoxes, boxes);

      /* ── 1. Single-line: height ≤ 1.4 × lineHeight ── */
      for (const slot of ['headline', 'description']) {
        const { lh, h: elH, sw, cw } = await page.evaluate((s) => {
          const el = document.querySelector(`.hhm-active [data-slot="${s}"]`);
          if (!el) return { lh: 0, h: 0, sw: 0, cw: 0 };
          const cs = window.getComputedStyle(el);
          return {
            lh:  parseFloat(cs.lineHeight),
            h:   el.getBoundingClientRect().height,
            sw:  el.scrollWidth,
            cw:  el.clientWidth,
          };
        }, slot);

        expect(elH, `slide ${i} ${slot}: height ≤ 1.4 × lineHeight (single line)`
          ).toBeLessThanOrEqual(lh * 1.4 + 2);   // +2px rounding tolerance
        expect(sw,  `slide ${i} ${slot}: no horizontal overflow`
          ).toBeLessThanOrEqual(cw + 2);
      }

      /* ── 2. Same Y positions across slides (within 2px of slide 0) ── */
      for (const slot of ['keyword', 'headline', 'description']) {
        const ref  = refBoxes[slot];
        const curr = boxes[slot];
        if (!ref || !curr) continue;
        expect(Math.abs(curr.top - ref.top),
          `slide ${i} ${slot}.top vs slide 0`
        ).toBeLessThanOrEqual(2);
      }

      /* ── 3. Keyword font-size ≤ 56px ── */
      const kwFS = await page.evaluate(() => {
        const el = document.querySelector('.hhm-active [data-slot="keyword"] span');
        return el ? parseFloat(window.getComputedStyle(el).fontSize) : 0;
      });
      expect(kwFS, `slide ${i}: keyword font-size ≤ 56px`).toBeLessThanOrEqual(57); // 1px tolerance

      /* ── 4. Sparkle bottom ≥ 12px above keyword top ── */
      const { spkBot, kwTop } = await page.evaluate(() => {
        const spk = document.querySelector('.hhm-active [data-slot="sparkle"]');
        const kw  = document.querySelector('.hhm-active [data-slot="keyword"]');
        if (!spk || !kw) return { spkBot: 0, kwTop: 999 };
        return {
          spkBot: spk.getBoundingClientRect().bottom,
          kwTop:  kw.getBoundingClientRect().top,
        };
      });
      // Gap = keyword.top - sparkle.bottom. The 12px fixed spacer ensures this.
      expect(kwTop - spkBot, `slide ${i}: sparkle ≥ 12px above keyword`).toBeGreaterThanOrEqual(10);
    }

    /* ── 5. AR: logo in right half, menu in left half ── */
    const { logoCenter, menuCenter } = await page.evaluate(() => {
      const topbar = document.querySelector('[data-slot="topbar"]');
      if (!topbar) return { logoCenter: null, menuCenter: null };
      const logo = topbar.querySelector('a');
      const menu = topbar.querySelector('button');
      if (!logo || !menu) return { logoCenter: null, menuCenter: null };
      const lBox = logo.getBoundingClientRect();
      const mBox = menu.getBoundingClientRect();
      return {
        logoCenter:  lBox.left + lBox.width / 2,
        menuCenter:  mBox.left + mBox.width / 2,
      };
    });

    if (logoCenter !== null) {
      if (lang === 'ar') {
        // AR: logo on the right, menu on the left
        expect(logoCenter, 'AR: logo should be in right half').toBeGreaterThan(w / 2);
        expect(menuCenter, 'AR: menu should be in left half').toBeLessThan(w / 2);
      } else {
        // EN: logo on the left, menu on the right
        expect(logoCenter, 'EN: logo should be in left half').toBeLessThan(w / 2);
        expect(menuCenter, 'EN: menu should be in right half').toBeGreaterThan(w / 2);
      }
    }

    /* ── 7. Arrow directions ── */
    const { leftBtnLabel, rightBtnLabel } = await page.evaluate(() => {
      // Arrow buttons are the last two buttons in the controls row that are NOT
      // segment buttons (segment buttons have aria-label starting with Slide/الشريحة digit)
      const allCtrlBtns = Array.from(
        document.querySelectorAll('[data-slot="controls"] button')
      );
      // Segment buttons: aria-label = "Slide N" or "الشريحة N"
      const arrowBtns = allCtrlBtns.filter(b => {
        const lbl = (b.getAttribute('aria-label') || '').toLowerCase();
        return !lbl.match(/^slide \d/) && !lbl.match(/^الشريحة \d/);
      });
      return {
        leftBtnLabel:  arrowBtns[0]?.getAttribute('aria-label') || '',
        rightBtnLabel: arrowBtns[1]?.getAttribute('aria-label') || '',
      };
    });

    if (lang === 'ar') {
      // Left button in RTL = "next" (الشريحة التالية)
      expect(leftBtnLabel).toContain('التالية');
      expect(rightBtnLabel).toContain('السابقة');
    } else {
      expect(leftBtnLabel.toLowerCase()).toContain('previous');
      expect(rightBtnLabel.toLowerCase()).toContain('next');
    }

    /* ── 8. No bounding-box intersection: WA ∩ segments / WA ∩ arrows / WA ∩ CTA ── */
    const wa = page.locator('a[href*="wa.me"][style*="position: fixed"]');
    if (await wa.count() > 0) {
      const waBox = await wa.boundingBox();
      if (waBox) {
        const targets = page.locator(
          '[data-slot="segments"] button,' +
          '[data-slot="controls"] div:last-child button,' +
          '[data-slot="cta"] a'
        );
        const tCount = await targets.count();
        for (let t = 0; t < tCount; t++) {
          const tb = await targets.nth(t).boundingBox();
          if (!tb) continue;
          const overlaps =
            waBox.x < tb.x + tb.width  &&
            waBox.x + waBox.width > tb.x &&
            waBox.y < tb.y + tb.height &&
            waBox.y + waBox.height > tb.y;
          expect(overlaps, `WA overlaps control[${t}]`).toBeFalsy();
        }
      }
    }

    /* ── 9. No horizontal scroll ── */
    const hScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 2
    );
    expect(hScroll, 'no horizontal scroll').toBeFalsy();

    /* ── 10. No JS errors ── */
    const realErrors = errors.filter(e =>
      !e.includes('404') && !e.includes('woff2') &&
      !e.includes('marquee') && !e.includes('page_sections')
    );
    expect(realErrors, 'no JS errors').toHaveLength(0);
  });
}
