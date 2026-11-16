/**
 * Targeted screenshot script — clips each section precisely.
 */
import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const SHOTS = path.resolve('tests/screenshots');
fs.mkdirSync(SHOTS, { recursive: true });

const configs = [
  { w: 390,  h: 844,  dark: false, label: 'mobile-light'  },
  { w: 390,  h: 844,  dark: true,  label: 'mobile-dark'   },
  { w: 1440, h: 900,  dark: false, label: 'desktop-light' },
  { w: 1440, h: 900,  dark: true,  label: 'desktop-dark'  },
];

const browser = await chromium.launch({ headless: true });

for (const { w, h, dark, label } of configs) {
  console.log(`\n── ${label} ──`);
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();

  // Force dark via both localStorage AND html class before any JS runs
  await page.addInitScript((isDark) => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    // The app reads this on mount — also set the class so Tailwind picks it up immediately
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, dark);

  try {
    await page.goto('http://localhost:4173/mockups', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('section', { timeout: 20000 });
    await page.waitForTimeout(4000);

    // Get section bounding boxes
    const sections = await page.evaluate(() =>
      [...document.querySelectorAll('section[aria-label]')].map(s => {
        const r = s.getBoundingClientRect();
        return {
          label: s.getAttribute('aria-label'),
          top: Math.round(r.top + window.scrollY),
          height: Math.round(s.scrollHeight),
        };
      })
    );
    sections.forEach(s => console.log(`  [${s.label}] y=${s.top} h=${s.height}`));

    // ── How It Works — full section clip ─────────────────────────────────
    const hiw = sections.find(s => s.label?.includes('How It Works') || s.label?.includes('كيف نعمل'));
    if (hiw) {
      await page.evaluate((y) => window.scrollTo({ top: Math.max(0, y - 10), behavior: 'instant' }), hiw.top);
      await page.waitForTimeout(400);
      await page.screenshot({
        path: path.join(SHOTS, `FINAL-how-it-works-${label}.png`),
        clip: { x: 0, y: 0, width: w, height: Math.min(h, hiw.height + 20) },
      });
      console.log(`  ✓ how-it-works (h=${hiw.height})`);
    }

    // ── FAQ — full section clip (may be tall, cap at viewport height) ─────
    const faq = sections.find(s => s.label?.includes('FAQ') || s.label?.includes('الأسئلة') || s.label?.includes('Frequently'));
    if (faq) {
      await page.evaluate((y) => window.scrollTo({ top: Math.max(0, y - 10), behavior: 'instant' }), faq.top);
      await page.waitForTimeout(400);
      // Shoot the top part (header + first few items)
      await page.screenshot({
        path: path.join(SHOTS, `FINAL-faq-top-${label}.png`),
        clip: { x: 0, y: 0, width: w, height: Math.min(h, 700) },
      });
      // Scroll to bottom of FAQ to show "Still have questions?" contact card
      await page.evaluate(({ y, fh, vh }) => window.scrollTo({
        top: Math.max(0, y + fh - vh + 20),
        behavior: 'instant'
      }), { y: faq.top, fh: faq.height, vh: h });
      await page.waitForTimeout(400);
      await page.screenshot({
        path: path.join(SHOTS, `FINAL-contact-card-${label}.png`),
        clip: { x: 0, y: 0, width: w, height: h },
      });
      console.log(`  ✓ faq + contact-card (section h=${faq.height})`);
    } else {
      console.log(`  ⚠ FAQ section not found (data not loaded?) — taking fallback shot`);
      await page.evaluate((sh) => window.scrollTo({ top: sh * 0.65, behavior: 'instant' }), await page.evaluate(() => document.body.scrollHeight));
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(SHOTS, `FINAL-faq-fallback-${label}.png`) });
    }

  } catch (err) {
    console.error(`  ERROR: ${err.message}`);
  } finally {
    await ctx.close();
  }
}

await browser.close();
console.log('\nDone.');
