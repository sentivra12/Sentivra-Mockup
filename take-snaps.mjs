/**
 * Standalone screenshot script.  Run:  node take-snaps.mjs
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
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    storageState: undefined,
  });
  const page = await ctx.newPage();

  // Set theme before navigation via init script
  await page.addInitScript((isDark) => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (isDark) document.documentElement.classList.add('dark');
  }, dark);

  try {
    // Vite dev serves everything via /index.html (SPA)
    await page.goto('http://localhost:4173/mockups', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Wait for React to boot — look for any <section> to appear
    await page.waitForSelector('section', { timeout: 20000 });
    // Extra settle time for data fetching + Suspense
    await page.waitForTimeout(4000);

    // Report
    const info = await page.evaluate(() => ({
      scrollH: document.body.scrollHeight,
      title: document.title,
      sections: [...document.querySelectorAll('section[aria-label]')].map(s => ({
        label: s.getAttribute('aria-label'),
        offsetTop: Math.round(s.getBoundingClientRect().top + window.scrollY),
      })),
    }));
    console.log(`  title="${info.title}" scrollH=${info.scrollH}`);
    info.sections.forEach(s => console.log(`  section[${s.label}] @ y=${s.offsetTop}`));

    // ── How It Works ─────────────────────────────────────────
    const hiwY = info.sections.find(s =>
      s.label?.includes('How It Works') || s.label?.includes('كيف نعمل')
    )?.offsetTop ?? Math.round(info.scrollH * 0.55);

    await page.evaluate((y) => window.scrollTo({ top: Math.max(0, y - 80), behavior: 'instant' }), hiwY);
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SHOTS, `SNAP3-how-it-works-${label}.png`) });
    console.log(`  ✓ how-it-works`);

    // ── FAQ ───────────────────────────────────────────────────
    const faqY = info.sections.find(s =>
      s.label?.includes('FAQ') || s.label?.includes('الأسئلة')
    )?.offsetTop ?? Math.round(info.scrollH * 0.72);

    await page.evaluate((y) => window.scrollTo({ top: Math.max(0, y - 80), behavior: 'instant' }), faqY);
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SHOTS, `SNAP3-faq-${label}.png`) });
    console.log(`  ✓ faq`);

    // ── Contact card ──────────────────────────────────────────
    // Scroll to roughly 85% of page height
    await page.evaluate((h) => window.scrollTo({ top: Math.round(h * 0.82), behavior: 'instant' }), info.scrollH);
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(SHOTS, `SNAP3-contact-card-${label}.png`) });
    console.log(`  ✓ contact-card`);

  } catch (err) {
    console.error(`  ERROR: ${err.message}`);
  } finally {
    await ctx.close();
  }
}

await browser.close();
console.log('\nDone.');
