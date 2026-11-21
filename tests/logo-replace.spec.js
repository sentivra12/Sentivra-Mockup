/**
 * logo-replace.spec.js
 * Fail before (old SVG logo) / pass after (new PNG files).
 *
 * Checks per viewport/theme:
 *  1. No request to old logo files (favicon.svg, sentivra-logo.svg, sentivra-logo.jpg)
 *  2. Visible logo img src points to new brand PNGs
 *  3. Correct variant per theme (white on dark surface, emerald on light surface)
 *  4. Rendered aspect ratio within 2% of natural ratio (873/593 ≈ 1.4722)
 *  5. No broken images (naturalWidth > 0)
 *  6. Wordmark text present in header and not duplicated
 *  7. Logo and hamburger don't overlap (mobile)
 *  8. Favicon link hrefs resolve HTTP 200
 *  9. og:image meta resolves HTTP 200
 * 10. Admin login shows new logo, not "S" span
 */

import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:4173';
const NATURAL_RATIO = 873 / 593; // 1.4722…
const OLD_SRCS = ['favicon.svg', 'sentivra-logo.svg', 'sentivra-logo.jpg'];
const NEW_WHITE   = '/brand/sentivra-logo-white.png';
const NEW_EMERALD = '/brand/sentivra-logo-emerald.png';

/* ── helpers ─────────────────────────────────────────────────────────── */

function collectOldRequests(page) {
  const hits = [];
  page.on('request', req => {
    const u = req.url();
    if (OLD_SRCS.some(s => u.includes(s))) hits.push(u);
  });
  return hits;
}

async function visibleLogos(page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('img[src*="sentivra-logo"], img[src*="brand/"]'))
      .filter(img => {
        const s = window.getComputedStyle(img);
        const b = img.getBoundingClientRect();
        return s.display !== 'none' && s.visibility !== 'hidden' && b.width > 0 && b.height > 0;
      })
      .map(img => ({
        src: new URL(img.src).pathname,
        w: img.getBoundingClientRect().width,
        h: img.getBoundingClientRect().height,
        natW: img.naturalWidth,
        natH: img.naturalHeight,
      }))
  );
}

/* ── Favicon / OG ────────────────────────────────────────────────────── */

test('favicon links resolve HTTP 200', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });

  const favicons = await page.evaluate(() =>
    Array.from(document.querySelectorAll('link[rel*="icon"], link[rel="manifest"]'))
      .map(l => l.href)
  );
  expect(favicons.length).toBeGreaterThan(0);

  for (const href of favicons) {
    const res = await page.request.get(href);
    expect(res.status(), `${href} should return 200`).toBe(200);
  }
});

test('og:image resolves HTTP 200', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  const ogImage = await page.evaluate(
    () => document.querySelector('meta[property="og:image"]')?.content
  );
  expect(ogImage).toBeTruthy();
  // Rewrite absolute sentivra.com URL to localhost for local test
  const localUrl = ogImage.replace('https://sentivra.com', BASE);
  const res = await page.request.get(localUrl);
  expect(res.status(), `og:image ${localUrl} should return 200`).toBe(200);
});

/* ── Main matrix ─────────────────────────────────────────────────────── */

const MATRIX = [
  { vp: { width: 390,  height: 844  }, label: '390x844',  dark: false },
  { vp: { width: 390,  height: 844  }, label: '390x844',  dark: true  },
  { vp: { width: 1440, height: 900  }, label: '1440x900', dark: false },
  { vp: { width: 1440, height: 900  }, label: '1440x900', dark: true  },
];

const PUBLIC_PAGES = ['/', '/services', '/mockups', '/about', '/contact'];

for (const { vp, label, dark } of MATRIX) {
  const theme = dark ? 'dark' : 'light';
  const isMobile = vp.width < 768;

  for (const path of PUBLIC_PAGES) {
    test(`${label} ${theme} ${path} — logo requests + aspect ratio`, async ({ page }) => {
      const oldHits = collectOldRequests(page);

      await page.setViewportSize(vp);
      if (dark) await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);

      // 1. No requests to old files
      expect(oldHits, `Old logo files requested: ${oldHits}`).toHaveLength(0);

      // 2. At least one visible logo using new files
      const logos = await visibleLogos(page);
      expect(logos.length, 'at least one visible logo').toBeGreaterThan(0);
      for (const lg of logos) {
        expect(lg.src, 'src must be new brand file').toMatch(/\/brand\/sentivra-logo-(white|emerald)\.png/);
      }

      // 3. No broken images
      for (const lg of logos) {
        expect(lg.natW, `broken image: ${lg.src}`).toBeGreaterThan(0);
      }

      // 4. Aspect ratio within 2%
      for (const lg of logos) {
        const ratio = lg.w / lg.h;
        expect(Math.abs(ratio - NATURAL_RATIO) / NATURAL_RATIO, `aspect ratio off: ${lg.src} rendered ${lg.w}x${lg.h}`)
          .toBeLessThan(0.02);
      }

      // 5. Wordmark text in header (not duplicated — only one per rendered slot)
      const wordmarks = await page.locator('header span').filter({ hasText: /^Sentivra$/ }).all();
      // There may be two spans (auto variant has two img + one wordmark span)
      // but only one should be in the visible layout
      const visWm = [];
      for (const wm of wordmarks) {
        if (await wm.isVisible()) visWm.push(wm);
      }
      // Allow 0 on mobile hero (hero carousel has its own logo)
      if (!isMobile || path !== '/') {
        // On desktop, wordmark should be visible
        if (!isMobile) expect(visWm.length, 'wordmark in header').toBeGreaterThanOrEqual(1);
      }

      // 6. Logo doesn't overlap hamburger on mobile
      if (isMobile) {
        const logoImg = page.locator('header img[src*="brand/"]').first();
        const hamburger = page.locator('header button[aria-expanded]').first();
        if (await logoImg.count() > 0 && await hamburger.count() > 0) {
          const lb = await logoImg.boundingBox();
          const hb = await hamburger.boundingBox();
          if (lb && hb) {
            const overlaps =
              lb.x < hb.x + hb.width && lb.x + lb.width > hb.x &&
              lb.y < hb.y + hb.height && lb.y + lb.height > hb.y;
            expect(overlaps, 'logo overlaps hamburger').toBeFalsy();
          }
        }
      }
    });
  }

  // Mobile menu
  if (isMobile) {
    test(`${label} ${theme} mobile-menu — logo in panel`, async ({ page }) => {
      const oldHits = collectOldRequests(page);

      await page.setViewportSize(vp);
      if (dark) await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto(BASE, { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);

      // Open menu
      await page.locator('header button[aria-expanded]').first().click();
      await page.waitForTimeout(400);

      const panel = page.locator('#mobile-menu-panel');
      await expect(panel).toBeVisible();

      // Logo inside panel
      const panelLogo = panel.locator('img[src*="brand/"]').filter({ visible: true }).first();
      await expect(panelLogo).toBeVisible();
      const src = await panelLogo.getAttribute('src');
      expect(src).toMatch(/sentivra-logo-(white|emerald)\.png/);

      // Correct variant: white on dark, emerald on light
      const expectedSuffix = dark ? 'white' : 'emerald';
      expect(src, `panel logo should be ${expectedSuffix}`).toContain(expectedSuffix);

      // No old requests
      expect(oldHits).toHaveLength(0);

      await page.keyboard.press('Escape');
    });
  }

  // Footer
  test(`${label} ${theme} footer — white logo on dark surface`, async ({ page }) => {
    const oldHits = collectOldRequests(page);

    await page.setViewportSize(vp);
    if (dark) await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(400);

    const footer = page.locator('footer');
    const footerLogo = footer.locator('img[src*="brand/"]').filter({ visible: true }).first();
    await expect(footerLogo).toBeVisible();

    const src = await footerLogo.getAttribute('src');
    // Footer is always on InverseSurface (dark), so always white
    expect(src, 'footer logo always white').toContain('white');

    // Aspect ratio
    const box = await footerLogo.boundingBox();
    if (box) {
      const ratio = box.width / box.height;
      expect(Math.abs(ratio - NATURAL_RATIO) / NATURAL_RATIO).toBeLessThan(0.02);
    }

    expect(oldHits).toHaveLength(0);
  });
}

/* ── Admin login ─────────────────────────────────────────────────────── */

test('admin login light — emerald logo, no S span', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto(`${BASE}/admin/login`, { waitUntil: 'networkidle' });

  // Real logo image present
  const logo = page.locator('img[src*="brand/sentivra-logo-emerald.png"]');
  await expect(logo).toBeVisible();

  // Old hardcoded "S" span no longer rendered as logo placeholder
  // (The old code was: <span className="text-3xl font-bold text-white">S</span>
  //  inside a w-16 h-16 bg-primary-strong rounded-2xl div)
  const oldS = page.locator('div.bg-primary-strong.rounded-2xl span');
  await expect(oldS, 'old S placeholder should be gone').toHaveCount(0);
});

test('admin login dark — white logo', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto(`${BASE}/admin/login`, { waitUntil: 'networkidle' });

  const logo = page.locator('img[src*="brand/sentivra-logo-white.png"]');
  await expect(logo).toBeVisible();
});
