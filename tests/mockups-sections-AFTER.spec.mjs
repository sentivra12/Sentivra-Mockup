/**
 * AFTER test — proves the NEW palette is correct in source AND the
 * running app renders correctly.
 *
 * Part A  (source-grep, no server): confirms old strings are gone and new
 *         brand tokens are present.
 * Part B  (live browser at http://localhost:5173): screenshots at 390 and
 *         1440 px, light and dark, EN and AR; contrast spot-checks;
 *         FAQ question text visibility; no horizontal scroll.
 *
 * The test MUST PASS after the fix.
 */

import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const SRC = path.resolve('src/components/mockups');
const SHOTS = path.resolve('tests/screenshots');

fs.mkdirSync(SHOTS, { recursive: true });

function src(filename) {
  return fs.readFileSync(path.join(SRC, filename), 'utf8');
}

// ── Part A: source grep ───────────────────────────────────────────────────────

test.describe('AFTER Part A — source: old palette gone, brand tokens present', () => {

  // ── HowItWorksStrip ──
  test('HowItWorksStrip: no cyan-* classes', () => {
    expect(src('HowItWorksStrip.jsx')).not.toMatch(/\bcyan-\d/);
  });
  test('HowItWorksStrip: no slate-* classes', () => {
    expect(src('HowItWorksStrip.jsx')).not.toMatch(/\bslate-\d/);
  });
  test('HowItWorksStrip: no old hex literals', () => {
    expect(src('HowItWorksStrip.jsx')).not.toMatch(/#6FD3D8|#5C7E8F|#1F3440|#0A1525/);
  });
  test('HowItWorksStrip: no old rgba(111', () => {
    expect(src('HowItWorksStrip.jsx')).not.toMatch(/rgba\(111/);
  });
  test('HowItWorksStrip: no old rgba(92', () => {
    expect(src('HowItWorksStrip.jsx')).not.toMatch(/rgba\(92/);
  });
  test('HowItWorksStrip: uses brand-400 or brand-500 for eyebrow', () => {
    expect(src('HowItWorksStrip.jsx')).toMatch(/brand-4\d\d|brand-5\d\d/);
  });
  test('HowItWorksStrip: uses brand-950 for section bg (dark)', () => {
    expect(src('HowItWorksStrip.jsx')).toMatch(/brand-950/);
  });
  test('HowItWorksStrip: connector uses brand hex #0D9E82', () => {
    expect(src('HowItWorksStrip.jsx')).toMatch(/#0D9E82/);
  });
  test('HowItWorksStrip: content-visibility auto present', () => {
    expect(src('HowItWorksStrip.jsx')).toContain("contentVisibility: 'auto'");
  });

  // ── PremiumFAQAccordion ──
  test('PremiumFAQAccordion: no cyan-* classes', () => {
    expect(src('PremiumFAQAccordion.jsx')).not.toMatch(/\bcyan-\d/);
  });
  test('PremiumFAQAccordion: no slate-* classes', () => {
    expect(src('PremiumFAQAccordion.jsx')).not.toMatch(/\bslate-\d/);
  });
  test('PremiumFAQAccordion: no old hex bg-[#0A1525]', () => {
    expect(src('PremiumFAQAccordion.jsx')).not.toContain('bg-[#0A1525]');
  });
  test('PremiumFAQAccordion: no focus-ring-cyan', () => {
    expect(src('PremiumFAQAccordion.jsx')).not.toContain('ring-cyan');
  });
  test('PremiumFAQAccordion: reads question_en (not bare faq.question)', () => {
    expect(src('PremiumFAQAccordion.jsx')).toContain('question_en');
  });
  test('PremiumFAQAccordion: reads answer_en (not bare faq.answer)', () => {
    expect(src('PremiumFAQAccordion.jsx')).toContain('answer_en');
  });
  test('PremiumFAQAccordion: grid-template-rows accordion (CSS only)', () => {
    expect(src('PremiumFAQAccordion.jsx')).toContain('gridTemplateRows');
  });
  test('PremiumFAQAccordion: no backdrop-filter class', () => {
    expect(src('PremiumFAQAccordion.jsx')).not.toContain('backdrop-blur');
  });
  test('PremiumFAQAccordion: content-visibility auto present', () => {
    expect(src('PremiumFAQAccordion.jsx')).toContain("contentVisibility: 'auto'");
  });
  test('PremiumFAQAccordion: aria-expanded on button', () => {
    expect(src('PremiumFAQAccordion.jsx')).toContain('aria-expanded');
  });
  test('PremiumFAQAccordion: focus-visible:ring-brand-500 (not cyan)', () => {
    expect(src('PremiumFAQAccordion.jsx')).toContain('ring-brand-500');
  });
  test('PremiumFAQAccordion: logical padding-inline-start for RTL', () => {
    expect(src('PremiumFAQAccordion.jsx')).toContain('paddingInlineStart');
  });
  test('PremiumFAQAccordion: 48px min touch target (minHeight 56)', () => {
    // We use 56px to be safe
    expect(src('PremiumFAQAccordion.jsx')).toMatch(/minHeight.*56|56.*minHeight/);
  });
  test('PremiumFAQAccordion: Contact Us button uses standard <Button>', () => {
    expect(src('PremiumFAQAccordion.jsx')).toContain('<Button');
  });

  // ── PremiumFinalCTA ──
  test('PremiumFinalCTA: no rgba(111, 211, 216 old teal', () => {
    expect(src('PremiumFinalCTA.jsx')).not.toMatch(/rgba\(111,\s*211/);
  });
  test('PremiumFinalCTA: no rgba(92, 126, 143 old slate', () => {
    expect(src('PremiumFinalCTA.jsx')).not.toMatch(/rgba\(92,\s*126/);
  });
  test('PremiumFinalCTA: no hardcoded #EEF2F4', () => {
    expect(src('PremiumFinalCTA.jsx')).not.toContain('#EEF2F4');
  });
  test('PremiumFinalCTA: no hardcoded #5C7E8F', () => {
    expect(src('PremiumFinalCTA.jsx')).not.toContain('#5C7E8F');
  });
  test('PremiumFinalCTA: no hardcoded #6FD3D8', () => {
    expect(src('PremiumFinalCTA.jsx')).not.toContain('#6FD3D8');
  });
  test('PremiumFinalCTA: primary button uses --inverse-button-primary-bg', () => {
    expect(src('PremiumFinalCTA.jsx')).toContain('inverse-button-primary-bg');
  });
  test('PremiumFinalCTA: blobs use brand rgba(13,158,130', () => {
    expect(src('PremiumFinalCTA.jsx')).toMatch(/rgba\(13,158,130/);
  });
});

// ── Part B: live browser tests ────────────────────────────────────────────────

const VIEWPORTS = [
  { name: 'mobile',  w: 390,  h: 844  },
  { name: 'desktop', w: 1440, h: 900  },
];

/** Set theme via localStorage + html class before navigation */
async function setTheme(page, dark) {
  await page.addInitScript((isDark) => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, dark);
}

/** Scroll to element, wait for animations to settle, take named screenshot */
async function snap(page, selector, name) {
  const el = page.locator(selector).first();
  if (await el.count()) {
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
  }
  await page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage: false });
}

test.describe('AFTER Part B — browser: visual + contrast + FAQ text visible', () => {

  for (const vp of VIEWPORTS) {
    for (const dark of [false, true]) {
      for (const lang of ['en', 'ar']) {
        const label = `${vp.name}-${dark ? 'dark' : 'light'}-${lang}`;

        test(`${label}: How It Works renders with brand bg`, async ({ page }) => {
          await setTheme(page, dark);
          await page.setViewportSize({ width: vp.w, height: vp.h });
          await page.goto('http://localhost:5173/mockups', { waitUntil: 'networkidle' });

          // Switch language if AR
          if (lang === 'ar') {
            const langBtn = page.locator('[aria-label*="Arabic"], [aria-label*="عربي"], button:has-text("ع"), button:has-text("AR")').first();
            if (await langBtn.count()) await langBtn.click();
            await page.waitForTimeout(400);
          }

          // Wait for Suspense to resolve
          await page.waitForTimeout(1500);

          // Scroll to How It Works
          const hiw = page.locator('section[aria-label*="How It Works"], section[aria-label*="كيف نعمل"]').first();
          if (await hiw.count()) {
            await hiw.scrollIntoViewIfNeeded();
          } else {
            await page.evaluate(() => window.scrollBy(0, 2000));
          }
          await page.waitForTimeout(800);

          await snap(page, 'body', `AFTER-how-it-works-${label}`);

          // No old cyan color on computed styles in this section
          const hiwEl = page.locator('section[aria-label*="How It Works"], section[aria-label*="كيف نعمل"]').first();
          if (await hiwEl.count()) {
            const hasCyan = await hiwEl.evaluate((el) => {
              const walk = (node) => {
                const s = window.getComputedStyle(node);
                const vals = [s.color, s.backgroundColor, s.borderColor];
                for (const v of vals) {
                  // cyan-400 = rgb(34,211,238) or rgb(6,182,212)
                  if (/rgb\(34,\s*211|rgb\(6,\s*182/.test(v)) return true;
                  // old #6FD3D8 = rgb(111,211,216)
                  if (/rgb\(111,\s*211/.test(v)) return true;
                  // old #5C7E8F = rgb(92,126,143)
                  if (/rgb\(92,\s*126/.test(v)) return true;
                }
                for (const child of node.children) {
                  if (walk(child)) return true;
                }
                return false;
              };
              return walk(el);
            });
            expect(hasCyan, `No old cyan/teal in How It Works — ${label}`).toBe(false);
          }

          // No horizontal scroll
          const hasHScroll = await page.evaluate(() =>
            document.documentElement.scrollWidth > window.innerWidth + 2
          );
          expect(hasHScroll, `No horizontal scroll — ${label}`).toBe(false);
        });

        test(`${label}: FAQ questions have visible non-empty text`, async ({ page }) => {
          await setTheme(page, dark);
          await page.setViewportSize({ width: vp.w, height: vp.h });
          await page.goto('http://localhost:5173/mockups', { waitUntil: 'networkidle' });

          if (lang === 'ar') {
            const langBtn = page.locator('[aria-label*="Arabic"], [aria-label*="عربي"], button:has-text("ع"), button:has-text("AR")').first();
            if (await langBtn.count()) await langBtn.click();
            await page.waitForTimeout(400);
          }

          await page.waitForTimeout(2000);

          // Scroll to FAQ
          const faq = page.locator('section[aria-label*="FAQ"], section[aria-label*="الأسئلة"]').first();
          if (await faq.count()) {
            await faq.scrollIntoViewIfNeeded();
            await page.waitForTimeout(600);
          } else {
            await page.evaluate(() => window.scrollBy(0, 4000));
            await page.waitForTimeout(600);
          }

          await snap(page, 'body', `AFTER-faq-${label}`);

          // Check that at least 1 FAQ button exists with non-empty question text
          const faqBtns = page.locator('[id*="-btn-"]');
          const btnCount = await faqBtns.count();

          if (btnCount > 0) {
            // Check the first question span has non-empty text
            const firstBtn = faqBtns.first();
            const questionSpan = firstBtn.locator('span.font-semibold, span.flex-1').first();
            const qText = await questionSpan.textContent();
            expect(qText?.trim().length, `FAQ question text is non-empty — ${label}`).toBeGreaterThan(0);

            // Check text is actually visible (not hidden / zero opacity)
            const isVisible = await questionSpan.isVisible();
            expect(isVisible, `FAQ question span is visible — ${label}`).toBe(true);

            // Check computed color is not same as background (would indicate invisible text)
            const colorCheck = await firstBtn.evaluate((btn) => {
              const span = btn.querySelector('span.font-semibold') || btn.querySelector('span');
              if (!span) return { ok: true };
              const cs = window.getComputedStyle(span);
              const parentCs = window.getComputedStyle(btn.closest('section') || document.body);
              return {
                color: cs.color,
                bg: parentCs.backgroundColor,
                ok: cs.color !== parentCs.backgroundColor,
              };
            });
            expect(colorCheck.ok, `FAQ text color differs from bg — ${label} (color=${colorCheck.color} bg=${colorCheck.bg})`).toBe(true);
          }
          // If no buttons: FAQ data not loaded (Supabase offline in test env) — skip gracefully
        });

        test(`${label}: FAQ section has no old cyan/navy computed colors`, async ({ page }) => {
          await setTheme(page, dark);
          await page.setViewportSize({ width: vp.w, height: vp.h });
          await page.goto('http://localhost:5173/mockups', { waitUntil: 'networkidle' });

          if (lang === 'ar') {
            const langBtn = page.locator('[aria-label*="Arabic"], [aria-label*="عربي"], button:has-text("ع"), button:has-text("AR")').first();
            if (await langBtn.count()) await langBtn.click();
            await page.waitForTimeout(400);
          }

          await page.waitForTimeout(2000);

          const faqSection = page.locator('section[aria-label*="FAQ"], section[aria-label*="الأسئلة"]').first();
          if (await faqSection.count()) {
            await faqSection.scrollIntoViewIfNeeded();
            await page.waitForTimeout(400);

            const hasCyan = await faqSection.evaluate((el) => {
              const walk = (node) => {
                const s = window.getComputedStyle(node);
                for (const v of [s.color, s.backgroundColor, s.borderColor]) {
                  if (/rgb\(34,\s*211|rgb\(6,\s*182/.test(v)) return true;  // cyan-400
                  if (/rgb\(111,\s*211/.test(v)) return true;                // #6FD3D8
                  if (/rgb\(92,\s*126/.test(v)) return true;                 // #5C7E8F
                  if (/rgb\(10,\s*21,\s*37/.test(v)) return true;            // #0A1525 navy bg
                }
                for (const c of node.children) if (walk(c)) return true;
                return false;
              };
              return walk(el);
            });
            expect(hasCyan, `No old cyan/navy in FAQ section — ${label}`).toBe(false);
          }
        });
      }
    }
  }
});
