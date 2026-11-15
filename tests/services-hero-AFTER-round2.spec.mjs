/**
 * Services Hero - AFTER Round 2 Fixes
 * Comprehensive verification of all fixes in real browser
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4173';

test.describe('Services Hero - AFTER Round 2 Fixes', () => {
  
  test('✅ GRADIENT TEXT: "Solutions" visible with painted gradient', async ({ page }) => {
    await page.goto(`${BASE_URL}/services`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('\n=== ✅ "Solutions" Gradient Text ===');
    
    const gradientSpan = page.locator('h1 span').filter({ hasText: /^Solutions$/i }).first();
    const exists = await gradientSpan.count() > 0;
    expect(exists).toBeTruthy();
    
    const box = await gradientSpan.boundingBox();
    expect(box).toBeTruthy();
    expect(box.width).toBeGreaterThan(0);
    
    const styles = await gradientSpan.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        color: computed.color,
        backgroundImage: computed.backgroundImage,
        opacity: computed.opacity,
        display: computed.display,
      };
    });
    
    console.log('Gradient span styles:', JSON.stringify(styles, null, 2));
    
    // Should have visible gradient (not "none")
    expect(styles.backgroundImage).toContain('linear-gradient');
    expect(styles.opacity).toBe('1');
    expect(styles.display).not.toBe('none');
    
    // Text should exist
    const text = await gradientSpan.textContent();
    expect(text?.trim()).toMatch(/^Solutions$/i);
  });
  
  test('✅ SERVICE COUNT: "6" visible with gradient', async ({ page }) => {
    await page.goto(`${BASE_URL}/services`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Wait for count-up animation
    
    console.log('\n=== ✅ Service Count "6" ===');
    
    const numberSpan = page.locator('span').filter({ hasText: /^6$/i }).first();
    const exists = await numberSpan.count() > 0;
    expect(exists).toBeTruthy();
    
    const text = await numberSpan.textContent();
    expect(text?.trim()).toBe('6');
    
    const styles = await numberSpan.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        backgroundImage: computed.backgroundImage,
        opacity: computed.opacity,
        display: computed.display,
      };
    });
    
    console.log('Count styles:', JSON.stringify(styles, null, 2));
    
    expect(styles.backgroundImage).toContain('linear-gradient');
    expect(styles.opacity).toBe('1');
  });
  
  test('✅ SVG UNDERLINE: Visible stroke', async ({ page }) => {
    await page.goto(`${BASE_URL}/services`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('\n=== ✅ SVG Underline ===');
    
    const svg = page.locator('h1 svg').first();
    const exists = await svg.count() > 0;
    expect(exists).toBeTruthy();
    
    const svgProps = await svg.evaluate((el) => {
      const path = el.querySelector('path');
      return {
        opacity: window.getComputedStyle(el).opacity,
        stroke: path?.getAttribute('stroke'),
        strokeWidth: path?.getAttribute('strokeWidth'),
      };
    });
    
    console.log('SVG underline:', JSON.stringify(svgProps, null, 2));
    
    expect(svgProps.opacity).toBe('1');
    expect(svgProps.stroke).toContain('rgba');
    expect(svgProps.stroke).not.toBe('currentColor');
  });
  
  test('✅ EYEBROW ICON: Sparkles visible', async ({ page }) => {
    await page.goto(`${BASE_URL}/services`);
    await page.waitForLoadState('networkidle');
    
    console.log('\n=== ✅ Eyebrow Icon ===');
    
    // Find eyebrow pill
    const eyebrow = page.locator('div').filter({ hasText: /PROFESSIONAL SOFTWARE SERVICES/i }).first();
    const exists = await eyebrow.count() > 0;
    expect(exists).toBeTruthy();
    
    // Check for Sparkles icon (should be first child SVG)
    const icon = eyebrow.locator('svg').first();
    const hasIcon = await icon.count() > 0;
    expect(hasIcon).toBeTruthy();
    
    const iconClass = await icon.getAttribute('class');
    console.log('Eyebrow icon class:', iconClass);
    
    // Should be visible
    const opacity = await icon.evaluate(el => window.getComputedStyle(el).opacity);
    expect(opacity).toBe('1');
  });
  
  test('✅ BUTTON CONTRAST: Explore Services with brand colors', async ({ page }) => {
    await page.goto(`${BASE_URL}/services`);
    await page.waitForLoadState('networkidle');
    
    console.log('\n=== ✅ Button Contrast ===');
    
    const btn = page.locator('button').filter({ hasText: /Explore Services/i }).first();
    const exists = await btn.count() > 0;
    expect(exists).toBeTruthy();
    
    const styles = await btn.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        color: computed.color,
        borderColor: computed.borderColor,
        borderWidth: computed.borderWidth,
        backgroundColor: computed.backgroundColor,
      };
    });
    
    console.log('Button styles:', JSON.stringify(styles, null, 2));
    
    // Should have brand accent border (not gray)
    expect(styles.borderColor).toContain('13, 158, 130'); // rgb(13, 158, 130)
    expect(styles.color).toContain('13, 158, 130');
    expect(styles.borderWidth).toBe('2px');
  });
  
  test('✅ CONTAINER ALIGNMENT: Logo and eyebrow left edges match', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/services?lang=en`); // Force EN to test LTR
    await page.waitForLoadState('networkidle');
    
    console.log('\n=== ✅ Container Alignment ===');
    
    // Get logo position (in navbar)
    const logo = page.locator('nav img, nav svg').first();
    const logoBox = await logo.boundingBox();
    
    // Get eyebrow position (in hero)
    const eyebrow = page.locator('section div').filter({ hasText: /PROFESSIONAL SOFTWARE SERVICES/i }).first();
    const eyebrowBox = await eyebrow.boundingBox();
    
    console.log('Logo left:', logoBox?.x);
    console.log('Eyebrow left:', eyebrowBox?.x);
    
    // Both should be on left side in LTR mode (x < 400)
    expect(logoBox?.x).toBeLessThan(400);
    expect(eyebrowBox?.x).toBeLessThan(400);
    
    // Should align closely in LTR
    const diff = Math.abs((logoBox?.x || 0) - (eyebrowBox?.x || 0));
    console.log('Difference:', diff, 'px');
    
    expect(diff).toBeLessThan(100); // Allow some tolerance for responsive padding
  });
  
  test('✅ CONSTELLATION TILES: Visible glass cards with background/border', async ({ page }) => {
    await page.goto(`${BASE_URL}/services`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Wait for animations
    
    console.log('\n=== ✅ Constellation Tiles ===');
    
    // Look for service nodes in constellation (16x16 = 64px tiles)
    const tiles = await page.evaluate(() => {
      const candidates = Array.from(document.querySelectorAll('div'))
        .filter(el => {
          const computed = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          // Look for 64px (w-16 h-16) rounded elements
          return rect.width >= 56 && rect.width <= 72 && 
                 rect.height >= 56 && rect.height <= 72 &&
                 computed.borderRadius !== '0px' &&
                 el.querySelector('svg'); // Has icon
        });
      
      return candidates.slice(0, 10).map(el => {
        const computed = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          size: { width: rect.width, height: rect.height },
          backgroundColor: computed.backgroundColor,
          borderColor: computed.borderColor,
          borderWidth: computed.borderWidth,
          opacity: computed.opacity,
          hasIcon: !!el.querySelector('svg'),
        };
      });
    });
    
    console.log('Tiles found:', tiles.length);
    console.log('Tile samples:', JSON.stringify(tiles.slice(0, 3), null, 2));
    
    // Should find at least 6 service tiles + 1 center tile = 7
    expect(tiles.length).toBeGreaterThanOrEqual(6);
    
    // Each tile should have visible background (not transparent)
    tiles.forEach((tile, idx) => {
      expect(tile.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
      expect(tile.opacity).toBe('1');
      expect(tile.hasIcon).toBeTruthy();
      
      // Should have brand-colored background
      if (tile.backgroundColor.includes('rgba')) {
        expect(tile.backgroundColor).toContain('13, 158, 130'); // brand-accent
      }
    });
  });
  
  test('✅ TYPEWRITER: Full service name visible', async ({ page }) => {
    await page.goto(`${BASE_URL}/services`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('\n=== ✅ Typewriter ===');
    
    // The typewriter structure is: <div><span>›</span><span>{typewriterText}</span></div>
    // Get the parent div that contains both the arrow and the text
    const typewriterContainer = page.locator('div.flex.items-center.gap-2').filter({ hasText: /›/ }).first();
    const exists = await typewriterContainer.count() > 0;
    expect(exists).toBeTruthy();
    
    const fullText = await typewriterContainer.textContent();
    console.log('Typewriter full text:', fullText);
    
    // Remove the arrow character to get just the service name
    const serviceText = fullText?.replace(/[›‹]/g, '').trim();
    console.log('Service name:', serviceText);
    
    // Should show full service name (not "ERP Sy")
    expect(serviceText).toBeTruthy();
    expect(serviceText.length).toBeGreaterThan(5);
    
    // Should be one of the valid service names
    const validNames = ['Web Development', 'Mobile Applications', 'ERP System', 'CRM System', 'Data Analysis', 'AI'];
    const hasValidName = validNames.some(name => serviceText?.includes(name));
    expect(hasValidName).toBeTruthy();
  });
  
  test('✅ DARK THEME: All fixes work in dark mode', async ({ page }) => {
    await page.goto(`${BASE_URL}/services`);
    
    // Enable dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('\n=== ✅ Dark Theme ===');
    
    // Check gradient text still visible
    const gradientSpan = page.locator('h1 span').filter({ hasText: /^Solutions$/i }).first();
    const gradientStyles = await gradientSpan.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        backgroundImage: computed.backgroundImage,
        opacity: computed.opacity,
      };
    });
    
    expect(gradientStyles.backgroundImage).toContain('linear-gradient');
    expect(gradientStyles.opacity).toBe('1');
    
    // Check tiles still visible
    const tiles = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('div'))
        .filter(el => {
          const rect = el.getBoundingClientRect();
          return rect.width >= 56 && rect.width <= 72 && el.querySelector('svg');
        }).length;
    });
    
    expect(tiles).toBeGreaterThanOrEqual(6);
    console.log('Dark mode tiles:', tiles);
  });
  
  test('✅ RTL (ARABIC): All fixes work in Arabic', async ({ page }) => {
    await page.goto(`${BASE_URL}/services?lang=ar`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('\n=== ✅ RTL Arabic ===');
    
    // Check gradient text (should be "برمجية")
    const gradientSpan = page.locator('h1 span').first();
    const exists = await gradientSpan.count() > 0;
    expect(exists).toBeTruthy();
    
    const text = await gradientSpan.textContent();
    console.log('AR gradient text:', text);
    
    const styles = await gradientSpan.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        backgroundImage: computed.backgroundImage,
        opacity: computed.opacity,
        direction: computed.direction,
      };
    });
    
    expect(styles.backgroundImage).toContain('linear-gradient');
    expect(styles.opacity).toBe('1');
    expect(styles.direction).toBe('rtl');
  });
  
  test('✅ REDUCED MOTION: All content visible in calm mode', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`${BASE_URL}/services`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    console.log('\n=== ✅ Reduced Motion ===');
    
    // Gradient text should still be visible
    const gradientSpan = page.locator('h1 span').filter({ hasText: /^Solutions$/i }).first();
    const opacity = await gradientSpan.evaluate(el => window.getComputedStyle(el).opacity);
    expect(opacity).toBe('1');
    
    // Service count should show final value immediately
    const count = page.locator('span').filter({ hasText: /^6$/i }).first();
    const countText = await count.textContent();
    expect(countText?.trim()).toBe('6');
    
    // Typewriter should show full first service name
    const typewriterContainer = page.locator('div.flex.items-center.gap-2').filter({ hasText: /›/ }).first();
    const fullText = await typewriterContainer.textContent();
    const serviceText = fullText?.replace(/[›‹]/g, '').trim();
    console.log('Reduced motion typewriter:', serviceText);
    expect(serviceText.length).toBeGreaterThan(5);
  });
  
  test('📸 SCREENSHOTS: Capture AFTER state for comparison', async ({ page }) => {
    const configs = [
      { theme: 'light', lang: 'en', width: 1440 },
      { theme: 'light', lang: 'ar', width: 1440 },
      { theme: 'dark', lang: 'en', width: 1440 },
      { theme: 'dark', lang: 'ar', width: 1440 },
      { theme: 'light', lang: 'en', width: 390 },
    ];
    
    for (const config of configs) {
      await page.setViewportSize({ width: config.width, height: 900 });
      await page.goto(`${BASE_URL}/services?lang=${config.lang}`);
      
      if (config.theme === 'dark') {
        await page.evaluate(() => {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
        });
        await page.reload();
      }
      
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      await page.screenshot({
        path: `tests/screenshots/hero-AFTER-round2-${config.theme}-${config.lang}-${config.width}.png`,
        fullPage: false,
        clip: { x: 0, y: 0, width: config.width, height: 800 },
      });
      
      console.log(`✓ ${config.theme}-${config.lang}-${config.width}`);
    }
  });
  
  test('✅ CONSOLE ERRORS: Zero errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto(`${BASE_URL}/services`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('\n=== ✅ Console Errors ===');
    console.log('Errors:', errors.length);
    
    if (errors.length > 0) {
      console.log('Error details:', errors);
    }
    
    expect(errors.length).toBe(0);
  });
});
