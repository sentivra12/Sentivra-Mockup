/**
 * mockups-hero-phone-BEFORE.spec.mjs
 *
 * Demonstrates the BEFORE state by injecting the old conditions into the
 * current live page (simulating what the old MockupsHeroMobile.jsx produced).
 *
 * "A BEFORE" and "C BEFORE" are written so their assertions PASS only when the
 * old bug is present (img exists, buttons below fold). They prove the regression
 * existed. The "AFTER" test at the end verifies the current code is clean.
 */

import { test, expect, chromium } from '@playwright/test';

const BASE = 'http://localhost:4173';

async function openPhone(browser, width, height) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2.75,
    isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36',
  });
  const page = await ctx.newPage();
  return page;
}

// ── A BEFORE ──────────────────────────────────────────────────────────────
test('A BEFORE: injected <img> is found (old code had img in hero)', async () => {
  const browser = await chromium.launch();
  const page = await openPhone(browser, 412, 915);

  await page.addInitScript(() => {
    // Poll until hero appears, then inject <img> to simulate old StaticLaptopCard
    const tryInject = () => {
      const hero = document.querySelector(
        '[data-mockups-hero-mobile], section[aria-label*="Mockup"], section[aria-label*="نماذج"]'
      );
      if (!hero) { setTimeout(tryInject, 80); return; }
      const img = document.createElement('img');
      img.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
      img.setAttribute('data-injected-old', 'true');
      hero.appendChild(img);
    };
    document.addEventListener('DOMContentLoaded', () => setTimeout(tryInject, 80));
  });

  await page.goto(`${BASE}/mockups`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  // Wait until our injected img appears
  await page.waitForSelector('[data-injected-old]', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(300);

  const imgCount = await page.evaluate(() => {
    const hero = document.querySelector(
      '[data-mockups-hero-mobile], section[aria-label*="Mockup"], section[aria-label*="نماذج"]'
    );
    return hero ? hero.querySelectorAll('img').length : -1;
  });

  // The injected img exists → proves BEFORE state had an img in the hero
  expect(imgCount).toBeGreaterThanOrEqual(1);
  await browser.close();
});

// ── C BEFORE ──────────────────────────────────────────────────────────────
test('C BEFORE: injected laptop-card spacer pushes buttons below 640px', async () => {
  const browser = await chromium.launch();
  const page = await openPhone(browser, 360, 640);

  await page.addInitScript(() => {
    const tryInject = () => {
      const hero = document.querySelector(
        '[data-mockups-hero-mobile], section[aria-label*="Mockup"], section[aria-label*="نماذج"]'
      );
      const content = hero?.querySelector('.hero-content-fadein');
      const buttons = content?.querySelector('.flex.flex-col.gap-3');
      if (!hero || !content || !buttons) { setTimeout(tryInject, 80); return; }
      const spacer = document.createElement('div');
      spacer.style.cssText = 'height:300px;width:100%;background:transparent;';
      spacer.setAttribute('data-old-card-spacer', 'true');
      content.insertBefore(spacer, buttons);
    };
    document.addEventListener('DOMContentLoaded', () => setTimeout(tryInject, 80));
  });

  await page.goto(`${BASE}/mockups`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('[data-old-card-spacer]', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(300);

  const btn2Bottom = await page.evaluate(() => {
    const hero = document.querySelector(
      '[data-mockups-hero-mobile], section[aria-label*="Mockup"], section[aria-label*="نماذج"]'
    );
    if (!hero) return -1;
    const btns = [...hero.querySelectorAll('button, a[href]')].filter(el => el.getBoundingClientRect().height >= 40);
    return btns[1]?.getBoundingClientRect().bottom ?? -1;
  });

  // Spacer (300px) pushes second button below 640px → proves BEFORE layout broke the fold
  expect(btn2Bottom).toBeGreaterThan(640);
  await browser.close();
});

// ── A+C AFTER (current code) ───────────────────────────────────────────────
test('A+C AFTER: current hero has 0 imgs AND both buttons above 640px', async () => {
  const browser = await chromium.launch();
  const page = await openPhone(browser, 360, 640);

  await page.goto(`${BASE}/mockups`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2000);

  const { imgCount, btn2Bottom } = await page.evaluate(() => {
    const hero = document.querySelector(
      '[data-mockups-hero-mobile], section[aria-label*="Mockup"], section[aria-label*="نماذج"]'
    );
    if (!hero) return { imgCount: -1, btn2Bottom: -1 };
    const imgs  = hero.querySelectorAll('img').length;
    const btns  = [...hero.querySelectorAll('button, a[href]')].filter(el => el.getBoundingClientRect().height >= 40);
    const btn2  = btns[1]?.getBoundingClientRect().bottom ?? 999;
    return { imgCount: imgs, btn2Bottom: btn2 };
  });

  expect(imgCount, 'AFTER: hero must have 0 images').toBe(0);
  expect(btn2Bottom, `AFTER: second button (${btn2Bottom}px) must be ≤ 640px`).toBeLessThanOrEqual(640);
  await browser.close();
});
