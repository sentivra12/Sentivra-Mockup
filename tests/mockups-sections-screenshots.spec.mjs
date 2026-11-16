/**
 * Screenshot-only spec — renders /mockups at 390 and 1440,
 * light and dark, EN only, waits properly for lazy sections.
 *
 * Uses the already-running dev server at http://localhost:5173
 */

import { test } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const SHOTS = path.resolve('tests/screenshots');
fs.mkdirSync(SHOTS, { recursive: true });

const configs = [
  { vp: { w: 390,  h: 844  }, dark: false, label: 'mobile-light'  },
  { vp: { w: 390,  h: 844  }, dark: true,  label: 'mobile-dark'   },
  { vp: { w: 1440, h: 900  }, dark: false, label: 'desktop-light' },
  { vp: { w: 1440, h: 900  }, dark: true,  label: 'desktop-dark'  },
];

for (const { vp, dark, label } of configs) {
  test(`screenshot ${label}`, async ({ page }) => {
    // Apply theme before page load
    await page.addInitScript((isDark) => {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      // also set class immediately so components that read it SSR-side get it
      document.documentElement.classList.toggle('dark', isDark);
    }, dark);

    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.goto('http://localhost:5173/mockups');

    // Wait for the initial JS to boot and React to hydrate
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2500); // let Suspense + DB queries settle

    // ── Scroll to + screenshot How It Works ──────────────────────────────
    // Try the section's aria-label first; fall back to eyebrow text
    const hiwSection = page.locator(
      'section[aria-label*="How It Works"], section[aria-label*="كيف نعمل"]'
    ).first();

    if (await hiwSection.count() > 0) {
      await hiwSection.scrollIntoViewIfNeeded();
    } else {
      // Fall back: scroll until we find the eyebrow text
      await page.evaluate(() => {
        const els = [...document.querySelectorAll('*')];
        const el = els.find(e =>
          e.textContent?.trim() === 'How It Works' ||
          e.textContent?.trim() === 'كيف نعمل'
        );
        el?.scrollIntoView({ block: 'center' });
      });
    }
    await page.waitForTimeout(900); // let reveal animation settle

    await page.screenshot({
      path: path.join(SHOTS, `SNAP-how-it-works-${label}.png`),
      fullPage: false,
    });

    // ── Scroll to + screenshot FAQ section ───────────────────────────────
    const faqSection = page.locator(
      'section[aria-label*="FAQ"], section[aria-label*="الأسئلة"]'
    ).first();

    if (await faqSection.count() > 0) {
      await faqSection.scrollIntoViewIfNeeded();
    } else {
      await page.evaluate(() => {
        const els = [...document.querySelectorAll('*')];
        const el = els.find(e =>
          e.textContent?.trim() === 'FAQ' ||
          e.textContent?.trim() === 'الأسئلة الشائعة'
        );
        el?.scrollIntoView({ block: 'center' });
      });
    }
    await page.waitForTimeout(900);

    await page.screenshot({
      path: path.join(SHOTS, `SNAP-faq-${label}.png`),
      fullPage: false,
    });

    // ── Scroll to + screenshot Contact card (bottom of FAQ column) ───────
    const contactCard = page.locator(
      'text=/Still have questions|لا تزال لديك أسئلة/i'
    ).first();
    if (await contactCard.count() > 0) {
      await contactCard.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
    }

    await page.screenshot({
      path: path.join(SHOTS, `SNAP-contact-card-${label}.png`),
      fullPage: false,
    });
  });
}
