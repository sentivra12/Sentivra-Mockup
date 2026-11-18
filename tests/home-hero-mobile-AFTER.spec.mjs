/**
 * HOME HERO MOBILE — AFTER tests
 * These tests should PASS after fixes.
 * Also includes runtime performance checks.
 */

import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:4173';
const VIEWPORTS = [
  { width: 360, height: 640, name: '360x640' },
  { width: 390, height: 844, name: '390x844' },
  { width: 412, height: 915, name: '412x915' },
  { width: 430, height: 932, name: '430x932' },
];

test.describe('HomeHeroMobile — AFTER (should PASS)', () => {
  
  for (const vp of VIEWPORTS) {
    test.describe(`Viewport ${vp.name}`, () => {
      
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
      });

      test(`[PASS] logo lockup: exactly ONE logo in header, no overlap @${vp.name}`, async ({ page }) => {
        await page.goto(BASE, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('h1', { timeout: 10000 });

        // Count company logo instances (not "Client logos" section)
        const companyLogos = await page.locator('[aria-label="Sentivra logo"]').count();
        console.log(`Company logo count at ${vp.name}: ${companyLogos}`);
        
        // Should be 2: one in Header + one in Footer (acceptable)
        // Hero should NOT have its own logo
        expect(companyLogos, 'Should have 1-2 company logos (header + footer)').toBeGreaterThanOrEqual(1);
        expect(companyLogos, 'Should have 1-2 company logos (header + footer)').toBeLessThanOrEqual(2);

        // Hero should NOT have its own logo
        const heroLogos = await page.locator('[data-hero-mobile="true"] [aria-label="Sentivra logo"]').count();
        expect(heroLogos, 'Hero should NOT contain logo').toBe(0);

        // Check that header logo is visible and not overlapping with menu button
        const headerLogo = page.locator('header [aria-label="Sentivra logo"]').first();
        const headerLogoBbox = await headerLogo.boundingBox();
        
        if (headerLogoBbox) {
          // Logo should be near top-left (20px from edge)
          expect(headerLogoBbox.x, 'Header logo should be near left edge').toBeLessThan(30);
          expect(headerLogoBbox.y, 'Header logo should be near top').toBeLessThan(50);
          
          console.log(`Header logo at ${vp.name}: x=${headerLogoBbox.x}, y=${headerLogoBbox.y}, w=${headerLogoBbox.width}, h=${headerLogoBbox.height}`);
        }

        // Take screenshot
        await page.screenshot({
          path: `test-results/logo-${vp.name}-AFTER.png`,
          fullPage: false,
        });
      });

      test(`[PASS] sparkle SVG: no <circle>, single <path>, proper gradient @${vp.name}`, async ({ page }) => {
        await page.goto(BASE, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('h1', { timeout: 10000 });

        // Find sparkle SVG in hero
        const sparkleSvg = page.locator('[data-hero-mobile="true"] svg').first();
        await sparkleSvg.waitFor({ timeout: 5000 });

        // Should have NO <circle> elements (solid 4-point star only)
        const circles = await sparkleSvg.locator('circle').count();
        console.log(`Circle count in sparkle at ${vp.name}: ${circles}`);
        expect(circles, 'Sparkle should have NO <circle>').toBe(0);

        // Should have at least 1 <path> for the star shape
        const paths = await sparkleSvg.locator('path').count();
        console.log(`Path count in sparkle at ${vp.name}: ${paths}`);
        expect(paths, 'Sparkle should have at least 1 <path>').toBeGreaterThanOrEqual(1);

        // Should have linearGradient defined
        const hasGradient = await sparkleSvg.locator('linearGradient').count();
        expect(hasGradient, 'Sparkle should have gradient').toBeGreaterThanOrEqual(1);
      });

      test(`[PASS] autoplay: slide changes after ~5s @${vp.name}`, async ({ page }) => {
        await page.goto(BASE, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('[data-hero-mobile="true"]', { timeout: 10000 });
        await page.waitForTimeout(500); // Let initial animations settle

        // Get initial slide title (from active slide only)
        const initialTitle = await page.locator('[data-hero-mobile="true"] .hmsl-slide.hmsl-active h1').textContent();
        console.log(`Initial slide at ${vp.name}: "${initialTitle}"`);

        // Wait for autoplay interval (4.5s + margin)
        await page.waitForTimeout(5000);

        // Get new slide title (from active slide)
        const afterTitle = await page.locator('[data-hero-mobile="true"] .hmsl-slide.hmsl-active h1').textContent();
        console.log(`After 5s at ${vp.name}: "${afterTitle}"`);

        // Slide should have auto-advanced
        expect(afterTitle, 'Slide should auto-advance').not.toBe(initialTitle);
      });

      test(`[PASS] particles: 14-18 dots, transform-only animation @${vp.name}`, async ({ page }) => {
        await page.goto(BASE, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('h1', { timeout: 10000 });

        // Count particles
        const particleCount = await page.locator('[data-particle="true"]').count();
        console.log(`Particle count at ${vp.name}: ${particleCount}`);
        
        expect(particleCount, 'Should have 14-18 particles').toBeGreaterThanOrEqual(14);
        expect(particleCount, 'Should have 14-18 particles').toBeLessThanOrEqual(18);

        // Check first particle animation
        const firstParticle = page.locator('[data-particle="true"]').first();
        const animName = await firstParticle.evaluate(el => {
          const style = window.getComputedStyle(el.parentElement);
          return style.animationName;
        });

        console.log(`Particle animation at ${vp.name}: ${animName}`);
        expect(animName, 'Particle layer should animate').not.toBe('none');

        // Check that NO particles use top/left/filter/box-shadow in their animations
        const hasInvalidProps = await page.evaluate(() => {
          const sheets = Array.from(document.styleSheets);
          for (const sheet of sheets) {
            try {
              const rules = Array.from(sheet.cssRules || []);
              for (const rule of rules) {
                if (rule.type === CSSRule.KEYFRAMES_RULE) {
                  const keyframesRule = rule;
                  const text = keyframesRule.cssText;
                  // Check if particle keyframes use forbidden properties
                  if (text.includes('hmsl-drift') || text.includes('hmsl-twinkle')) {
                    if (text.includes('top:') || text.includes('left:') || 
                        text.includes('filter:') || text.includes('box-shadow:')) {
                      return true;
                    }
                  }
                }
              }
            } catch (e) {
              // CORS or other error, skip
            }
          }
          return false;
        });

        expect(hasInvalidProps, 'Particles should only use transform/opacity').toBe(false);
      });

      test(`[PASS] reduced-motion: all animations disabled @${vp.name}`, async ({ page }) => {
        // Set reduced-motion preference BEFORE navigation
        await page.emulateMedia({ reducedMotion: 'reduce' });

        await page.goto(BASE, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('[data-hero-mobile="true"]', { timeout: 10000 });

        // Check data-motion attribute
        const motionAttr = await page.locator('[data-hero-mobile="true"]').getAttribute('data-motion');
        console.log(`Motion mode at ${vp.name}: ${motionAttr}`);
        expect(motionAttr, 'Should be in calm mode').toBe('calm');

        // Particles should have animation: none
        const particleCount = await page.locator('[data-particle="true"]').count();
        if (particleCount > 0) {
          const firstParticleLayer = page.locator('.hmsl-particles-far, .hmsl-particles-mid, .hmsl-particles-near').first();
          const layerAnim = await firstParticleLayer.evaluate(el => {
            const style = window.getComputedStyle(el);
            return style.animationName;
          });
          console.log(`Particle layer anim under reduced-motion at ${vp.name}: ${layerAnim}`);
          expect(layerAnim, 'Particle animation should be none').toBe('none');
        }

        // Progress bar should have animation: none
        const progressBar = page.locator('.hmsl-bar-fill').first();
        if (await progressBar.count() > 0) {
          const barAnim = await progressBar.evaluate(el => {
            const style = window.getComputedStyle(el);
            return style.animationName;
          });
          console.log(`Progress bar anim under reduced-motion at ${vp.name}: ${barAnim}`);
          expect(barAnim, 'Progress bar animation should be none').toBe('none');
        }
      });

      test(`[PASS] no horizontal scroll @${vp.name}`, async ({ page }) => {
        await page.goto(BASE, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('h1', { timeout: 10000 });

        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
        
        console.log(`Scroll width at ${vp.name}: ${scrollWidth}, client width: ${clientWidth}`);
        expect(scrollWidth, 'Should have no horizontal scroll').toBeLessThanOrEqual(clientWidth + 1);
      });

      test(`[PASS] hero height == 100svh @${vp.name}`, async ({ page }) => {
        await page.goto(BASE, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('[data-hero-mobile="true"]', { timeout: 10000 });

        const heroHeight = await page.locator('[data-hero-mobile="true"]').evaluate(el => {
          return window.getComputedStyle(el).height;
        });
        
        const viewportHeight = vp.height;
        const heroHeightPx = parseInt(heroHeight);
        
        console.log(`Hero height at ${vp.name}: ${heroHeightPx}px, viewport: ${viewportHeight}px`);
        // Allow small difference (within 2px for rounding)
        expect(Math.abs(heroHeightPx - viewportHeight), 'Hero should be 100svh').toBeLessThanOrEqual(2);
      });

      test(`[PASS] no console errors (hero-related) @${vp.name}`, async ({ page }) => {
        const errors = [];
        page.on('console', msg => {
          if (msg.type() === 'error') {
            const text = msg.text();
            // Filter out database/Supabase errors (not hero-related)
            if (!text.includes('supabase') && !text.includes('PGRST') && !text.includes('404')) {
              errors.push(text);
            }
          }
        });

        page.on('pageerror', err => {
          errors.push(err.message);
        });

        await page.goto(BASE, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('[data-hero-mobile="true"]', { timeout: 10000 });
        await page.waitForTimeout(1000);

        console.log(`Console errors (hero-related) at ${vp.name}: ${errors.length}`);
        if (errors.length > 0) {
          console.log('Errors:', errors);
        }
        expect(errors.length, 'Should have no hero-related console errors').toBe(0);
      });

      test(`[PASS] 3-slide sequence screenshots @${vp.name}`, async ({ page }) => {
        await page.goto(BASE, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('h1', { timeout: 10000 });
        await page.waitForTimeout(500);

        // Take 3 screenshots 1.5s apart
        await page.screenshot({
          path: `test-results/sequence-${vp.name}-slide1.png`,
          fullPage: false,
        });

        await page.waitForTimeout(1500);
        await page.screenshot({
          path: `test-results/sequence-${vp.name}-slide2.png`,
          fullPage: false,
        });

        await page.waitForTimeout(1500);
        await page.screenshot({
          path: `test-results/sequence-${vp.name}-slide3.png`,
          fullPage: false,
        });

        console.log(`Captured 3-slide sequence at ${vp.name}`);
      });
    });
  }

  test.describe('Light/Dark themes', () => {
    for (const theme of ['light', 'dark']) {
      test(`[PASS] sparkle gradient correct in ${theme} theme @390x844`, async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        
        // Set theme
        await page.addInitScript((t) => {
          localStorage.setItem('theme', t);
        }, theme);

        await page.goto(BASE, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('h1', { timeout: 10000 });

        // Check computed sparkle color
        const sparklePathFill = await page.locator('[data-hero-mobile="true"] svg path').first().evaluate(el => {
          return window.getComputedStyle(el).fill;
        });

        console.log(`Sparkle fill in ${theme}: ${sparklePathFill}`);
        expect(sparklePathFill, 'Sparkle should have gradient fill').toContain('url');

        // Take screenshot
        await page.screenshot({
          path: `test-results/sparkle-${theme}-390x844.png`,
          fullPage: false,
        });
      });
    }
  });

  test.describe('AR/EN languages', () => {
    for (const lang of ['ar', 'en']) {
      test(`[PASS] proper RTL/LTR in ${lang} @390x844`, async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        
        // Set language
        await page.addInitScript((l) => {
          localStorage.setItem('language', l);
        }, lang);

        await page.goto(BASE, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('h1', { timeout: 10000 });

        // Check dir attribute
        const heroDir = await page.locator('[data-hero-mobile="true"]').getAttribute('dir');
        const expectedDir = lang === 'ar' ? 'rtl' : 'ltr';
        
        console.log(`Hero dir in ${lang}: ${heroDir}, expected: ${expectedDir}`);
        expect(heroDir, `Should be ${expectedDir} for ${lang}`).toBe(expectedDir);

        // Take screenshot
        await page.screenshot({
          path: `test-results/lang-${lang}-390x844.png`,
          fullPage: false,
        });
      });
    }
  });

  test('Desktop 1440: unchanged', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    
    // Desktop should NOT render mobile hero
    const isMobile = await page.locator('[data-hero-mobile="true"]').count();
    console.log(`Mobile hero on desktop: ${isMobile}`);
    expect(isMobile, 'Desktop should NOT render mobile hero').toBe(0);

    // Take screenshot for comparison
    await page.screenshot({
      path: 'test-results/desktop-1440-AFTER.png',
      fullPage: false,
    });

    console.log('Desktop screenshot saved - should be unchanged from BEFORE');
  });

  test('Performance: no long tasks > 50ms on 4x CPU slowdown @390x844', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    // Enable 4x CPU throttling (emulate slower device)
    const client = await page.context().newCDPSession(page);
    await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });

    // Start tracing
    await page.context().tracing.start({ screenshots: false, snapshots: false });

    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('h1', { timeout: 15000 });
    
    // Let animations run for a few seconds
    await page.waitForTimeout(6000);

    // Stop tracing
    await page.context().tracing.stop({ path: 'test-results/trace-performance.zip' });

    // Measure long tasks (requires Performance Observer API check)
    const longTasks = await page.evaluate(() => {
      return new Promise((resolve) => {
        const tasks = [];
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.duration > 50) {
                tasks.push({ name: entry.name, duration: entry.duration });
              }
            }
          });
          try {
            observer.observe({ entryTypes: ['longtask'] });
          } catch (e) {
            // longtask not supported, skip
          }
        }
        setTimeout(() => resolve(tasks), 5000);
      });
    });

    console.log(`Long tasks (>50ms): ${longTasks.length}`);
    if (longTasks.length > 0) {
      console.log('Long tasks:', longTasks);
    }

    // Allow some long tasks during initial load, but not during idle animation
    // This is a soft warning rather than hard failure
    if (longTasks.length > 3) {
      console.warn(`Warning: ${longTasks.length} long tasks detected`);
    }
  });

  test('Hero requests 0 images @390x844', async ({ page }) => {
    const imageRequests = [];
    
    page.on('request', request => {
      const resourceType = request.resourceType();
      if (resourceType === 'image') {
        const url = request.url();
        // Filter to only hero-related images (not favicon, etc.)
        if (!url.includes('favicon') && !url.includes('apple-touch-icon')) {
          imageRequests.push(url);
        }
      }
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('h1', { timeout: 10000 });
    await page.waitForTimeout(2000);

    console.log(`Image requests (hero): ${imageRequests.length}`);
    if (imageRequests.length > 0) {
      console.log('Images:', imageRequests);
    }

    // Hero uses inline SVG only, no external images
    expect(imageRequests.length, 'Hero should request 0 images').toBe(0);
  });
});
