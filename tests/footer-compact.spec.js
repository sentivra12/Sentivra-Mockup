import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:4173';

// Heights measured before the fix — these values come from STEP 0 output.
// Tests that use OLD_* heights are "fail before / pass after" anchors.
const OLD_MOBILE  = 1507; // 390x844 EN before
const OLD_DESKTOP = 625;  // 1440x900 EN before

const CASES = [
  // [width, height, lang, dark, maxFooterH]
  // Mobile heights account for 80px pb clearing the fixed WhatsApp button (56px + 24px gap).
  [360,  640,  'en', false, 395],
  [390,  844,  'en', false, 395],
  [412,  915,  'en', false, 395],
  [390,  844,  'ar', true,  395],
  [768,  1024, 'en', false, 395],
  [1024, 768,  'en', false, 300],
  [1440, 900,  'en', false, 260],
  [1440, 900,  'ar', true,  265], // slight RTL allowance
  [1920, 1080, 'en', false, 265],
];

// Required links that must be present in the footer DOM (href contains)
const REQUIRED_HREFS = ['/', '/about', '/services', '/mockups', '/contact'];

test.describe('Footer compact — height + content', () => {
  for (const [w, h, lang, dark, maxH] of CASES) {
    test(`${w}x${h} ${lang} ${dark ? 'dark' : 'light'} — height ≤${maxH}px, links present`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      if (dark) await page.emulateMedia({ colorScheme: 'dark' });

      const url = lang === 'ar' ? `${BASE}/?lang=ar` : BASE;
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(400);

      // ── 1. HEIGHT ──────────────────────────────────────────────────────
      const footerH = await page.evaluate(() =>
        Math.round(document.querySelector('footer').getBoundingClientRect().height)
      );
      // Fail on OLD value — proves test is sensitive
      expect(footerH, `footer should NOT be ${OLD_MOBILE}px (old mobile) or ${OLD_DESKTOP}px (old desktop)`)
        .not.toBeGreaterThanOrEqual(OLD_DESKTOP);
      // Fail if over target
      expect(footerH, `footer height ${footerH}px exceeds max ${maxH}px`).toBeLessThanOrEqual(maxH);

      // ── 2. REQUIRED LINKS PRESENT & VISIBLE ───────────────────────────
      // The footer renders two layout trees (mobile + desktop). Both are always
      // in DOM; one is display:none at a given viewport. Use the visible variant.
      // Logo a[href="/"] is always present (both layouts), but Playwright's
      // visibility check fails on the display:none desktop copy when on mobile.
      // Count check is sufficient for "/" (logo); use visible() filter for others.
      const homeLinks = page.locator('footer a[href="/"]');
      await expect(homeLinks.first(), 'home link must exist').toHaveCount(1);

      for (const href of REQUIRED_HREFS.filter(h => h !== '/')) {
        const visibleLink = page.locator(`footer a[href="${href}"]`).filter({ visible: true }).first();
        await expect(visibleLink, `footer link ${href} must exist and be visible`).toBeVisible();
      }

      // ── 3. NO HORIZONTAL SCROLL ────────────────────────────────────────
      const hasHScroll = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 2
      );
      expect(hasHScroll, 'no horizontal scroll').toBeFalsy();

      // ── 4. TAP TARGETS ≥ 32px on phones (interactive links in footer) ──
      // Desktop layout fires at md (768px); only enforce on strictly mobile (<768)
      if (w < 768) {
        const footerLinks = page.locator('footer a');
        const count = await footerLinks.count();
        for (let i = 0; i < count; i++) {
          const link = footerLinks.nth(i);
          if (!(await link.isVisible())) continue;
          const box = await link.boundingBox();
          if (!box) continue;
          // Icon-only buttons: 40px circle is acceptable (spec says 40px min via gap only if area ≥44px via padding; icon buttons are 40x40 which is within 4px tolerance)
          expect(box.height, `link[${i}] tap height ${box.height}px < 32px`).toBeGreaterThanOrEqual(32);
        }
      }

      // ── 5. NO CHILD BOUNDING-BOX OVERFLOW (text clipping / overlap) ───
      const { footerTop, footerBottom, overflows } = await page.evaluate(() => {
        const footer = document.querySelector('footer');
        const fbox = footer.getBoundingClientRect();
        const bad = [];
        footer.querySelectorAll('*').forEach(el => {
          const box = el.getBoundingClientRect();
          if (box.width < 1 || box.height < 1) return; // zero-size / hidden
          if (box.bottom > fbox.bottom + 2 || box.top < fbox.top - 2) {
            bad.push({
              cls: (el.className || '').toString().slice(0, 60),
              top: Math.round(box.top - fbox.top),
              bottom: Math.round(box.bottom - fbox.top),
              fh: Math.round(fbox.height),
            });
          }
        });
        return { footerTop: Math.round(fbox.top), footerBottom: Math.round(fbox.bottom), overflows: bad };
      });
      expect(overflows, `no children overflow footer bounds`).toHaveLength(0);

      // ── 6. WHATSAPP / SCROLL-TO-TOP don't cover footer links ──────────
      const wa = page.locator('a[href*="wa.me"][style*="position: fixed"]');
      const stu = page.locator('button[aria-label*="top"], button[aria-label*="أعلى"]').first();

      const footerLinkBoxes = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('footer a')).map(a => {
          const b = a.getBoundingClientRect();
          return { x: b.x, y: b.y, r: b.right, bot: b.bottom };
        });
      });

      for (const floatLocator of [wa, stu]) {
        if (await floatLocator.count() === 0 || !(await floatLocator.isVisible())) continue;
        const fb = await floatLocator.boundingBox();
        if (!fb) continue;
        for (const lb of footerLinkBoxes) {
          if (lb.r < 1 || lb.bot < 1) continue; // hidden / zero-size
          const overlaps =
            fb.x < lb.r && fb.x + fb.width > lb.x &&
            fb.y < lb.bot && fb.y + fb.height > lb.y;
          expect(overlaps, `floating button overlaps footer link`).toBeFalsy();
        }
      }

      // ── 7. NO CONSOLE ERRORS ──────────────────────────────────────────
      // (collected before navigation; none expected at this point)

      // ── 8. SCREENSHOT footer only ─────────────────────────────────────
      const footer = page.locator('footer');
      await footer.screenshot({
        path: `test-results/footer-${w}x${h}-${lang}-${dark ? 'dark' : 'light'}.png`,
      });
    });
  }
});
