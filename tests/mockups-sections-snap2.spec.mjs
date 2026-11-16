/**
 * Screenshot spec v2 — waits for actual content, not just networkidle.
 * Looks for the HowItWorks section heading text to confirm it's in the DOM,
 * then scrolls and shoots.
 */
import { test } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const SHOTS = path.resolve('tests/screenshots');
fs.mkdirSync(SHOTS, { recursive: true });

const configs = [
  { vp: { w: 390,  h: 844 },  dark: false, label: 'mobile-light'  },
  { vp: { w: 390,  h: 844 },  dark: true,  label: 'mobile-dark'   },
  { vp: { w: 1440, h: 900 },  dark: false, label: 'desktop-light' },
  { vp: { w: 1440, h: 900 },  dark: true,  label: 'desktop-dark'  },
];

for (const { vp, dark, label } of configs) {
  test(`snap2 ${label}`, async ({ page }) => {
    test.setTimeout(90_000);

    await page.addInitScript((isDark) => {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }, dark);

    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.goto('http://localhost:5173/mockups', { waitUntil: 'domcontentloaded' });

    // Wait up to 15s for the page body scroll height to exceed 2000px
    // (meaning the grid + below sections have rendered)
    await page.waitForFunction(() => document.body.scrollHeight > 2000, { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // Log the actual scroll height so we know what we're dealing with
    const info = await page.evaluate(() => ({
      scrollH: document.body.scrollHeight,
      sections: [...document.querySelectorAll('section')].map(s => ({
        label: s.getAttribute('aria-label') || '',
        top: Math.round(s.getBoundingClientRect().top + window.scrollY),
        h: Math.round(s.offsetHeight),
      })),
    }));
    console.log(`[${label}] scrollH=${info.scrollH} sections=${JSON.stringify(info.sections)}`);

    // ── How It Works ─────────────────────────────────────────────────────
    // Scroll by absolute Y if section found
    const hiwSec = info.sections.find(s =>
      s.label.includes('How It Works') || s.label.includes('كيف نعمل')
    );
    if (hiwSec) {
      await page.evaluate((y) => window.scrollTo({ top: y - 60, behavior: 'instant' }), hiwSec.top);
    } else {
      // Fallback: 60% of scroll height is usually past the grid
      await page.evaluate((h) => window.scrollTo({ top: h * 0.6, behavior: 'instant' }), info.scrollH);
    }
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(SHOTS, `SNAP2-how-it-works-${label}.png`) });

    // ── FAQ section ───────────────────────────────────────────────────────
    const faqSec = info.sections.find(s =>
      s.label.includes('FAQ') || s.label.includes('الأسئلة')
    );
    if (faqSec) {
      await page.evaluate((y) => window.scrollTo({ top: y - 60, behavior: 'instant' }), faqSec.top);
    } else {
      await page.evaluate((h) => window.scrollTo({ top: h * 0.75, behavior: 'instant' }), info.scrollH);
    }
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(SHOTS, `SNAP2-faq-${label}.png`) });

    // ── Contact card ──────────────────────────────────────────────────────
    const contactEl = page.locator('text=/Still have questions|لا تزال لديك أسئلة/i').first();
    if (await contactEl.count() > 0) {
      await contactEl.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
    } else {
      await page.evaluate((h) => window.scrollTo({ top: h * 0.85, behavior: 'instant' }), info.scrollH);
      await page.waitForTimeout(400);
    }
    await page.screenshot({ path: path.join(SHOTS, `SNAP2-contact-card-${label}.png`) });
  });
}
