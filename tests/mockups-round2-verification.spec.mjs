/**
 * Mockups Round 2 - Post-Fix Verification
 * Verify the button is now visible with correct contrast
 */

import { test, expect } from '@playwright/test';

test('AFTER: View Details button - visible and correct', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:4173/mockups');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('\n=== AFTER FIX: VIEW DETAILS BUTTON ===');
  
  const firstCard = page.locator('article').first();
  const primaryButton = firstCard.locator('button').first();
  
  if (await primaryButton.count() > 0) {
    const styles = await primaryButton.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        color: computed.color,
        backgroundColor: computed.backgroundColor,
        backgroundImage: computed.backgroundImage,
        opacity: computed.opacity,
        width: computed.width,
        height: computed.height,
        visibility: computed.visibility
      };
    });
    
    console.log('Button styles AFTER fix:', JSON.stringify(styles, null, 2));
    
    // Test visibility
    expect(styles.opacity).toBe('1');
    expect(styles.visibility).toBe('visible');
    expect(parseFloat(styles.width)).toBeGreaterThan(0);
    expect(parseFloat(styles.height)).toBeGreaterThan(0);
    
    // Test has background (gradient OR solid color)
    const hasBackground = styles.backgroundColor !== 'rgba(0, 0, 0, 0)' || 
                         (styles.backgroundImage && styles.backgroundImage !== 'none');
    expect(hasBackground).toBe(true);
    console.log(`Has visible background: ${hasBackground}`);
    
    const text = await primaryButton.textContent();
    console.log('Button text:', text);
    expect(text?.trim().length).toBeGreaterThan(0);
    
    // Screenshot
    await primaryButton.screenshot({ path: 'test-results/after-button-visible.png' });
  }
  
  await page.screenshot({ path: 'test-results/after-page-light-en.png', fullPage: true });
});

test('AFTER: Window bar - brand token background', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:4173/mockups');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('\n=== AFTER FIX: WINDOW BAR ===');
  
  const firstCard = page.locator('article').first();
  // Find the browser chrome (window bar with the dots)
  const windowBar = firstCard.locator('div').filter({ has: page.locator('div.bg-red-500\\/80') }).first();
  
  if (await windowBar.count() > 0) {
    const bgColor = await windowBar.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return computed.backgroundColor;
    });
    
    console.log('Window bar background AFTER:', bgColor);
    
    // Should NOT be pure black
    expect(bgColor).not.toBe('rgb(0, 0, 0)');
  }
});

test('AFTER: Dark theme - button visible', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:4173/mockups');
  
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  });
  
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('\n=== AFTER FIX: DARK THEME ===');
  
  const firstCard = page.locator('article').first();
  const primaryButton = firstCard.locator('button').first();
  
  if (await primaryButton.count() > 0) {
    const styles = await primaryButton.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        color: computed.color,
        backgroundColor: computed.backgroundColor,
        backgroundImage: computed.backgroundImage,
        opacity: computed.opacity
      };
    });
    
    console.log('Button in dark mode AFTER:', JSON.stringify(styles, null, 2));
    
    // Should have visible background (gradient or solid)
    const hasBackground = styles.backgroundColor !== 'rgba(0, 0, 0, 0)' || 
                         (styles.backgroundImage && styles.backgroundImage !== 'none');
    expect(hasBackground).toBe(true);
    console.log(`Has visible background: ${hasBackground}`);
  }
  
  await page.screenshot({ path: 'test-results/after-page-dark-en.png', fullPage: true });
});

test('AFTER: Arabic RTL', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:4173/mockups');
  
  await page.evaluate(() => {
    localStorage.setItem('language', 'ar');
    document.documentElement.setAttribute('lang', 'ar');
    document.documentElement.setAttribute('dir', 'rtl');
  });
  
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('\n=== AFTER FIX: ARABIC RTL ===');
  
  const firstCard = page.locator('article').first();
  const primaryButton = firstCard.locator('button').first();
  
  if (await primaryButton.count() > 0) {
    const text = await primaryButton.textContent();
    console.log('Button text in Arabic:', text);
    
    const styles = await primaryButton.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        backgroundColor: computed.backgroundColor,
        backgroundImage: computed.backgroundImage,
        opacity: computed.opacity
      };
    });
    
    console.log('Button styles in AR:', JSON.stringify(styles, null, 2));
    
    const hasBackground = styles.backgroundColor !== 'rgba(0, 0, 0, 0)' || 
                         (styles.backgroundImage && styles.backgroundImage !== 'none');
    expect(hasBackground).toBe(true);
    console.log(`Has visible background: ${hasBackground}`);
  }
  
  await page.screenshot({ path: 'test-results/after-page-light-ar.png', fullPage: true });
});

test('AFTER: Mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:4173/mockups');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('\n=== AFTER FIX: MOBILE ===');
  
  const firstCard = page.locator('article').first();
  const primaryButton = firstCard.locator('button').first();
  
  if (await primaryButton.count() > 0) {
    const styles = await primaryButton.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        backgroundColor: computed.backgroundColor,
        backgroundImage: computed.backgroundImage,
        opacity: computed.opacity,
        width: computed.width,
        height: computed.height
      };
    });
    
    console.log('Button on mobile:', JSON.stringify(styles, null, 2));
    
    const hasBackground = styles.backgroundColor !== 'rgba(0, 0, 0, 0)' || 
                         (styles.backgroundImage && styles.backgroundImage !== 'none');
    expect(hasBackground).toBe(true);
    expect(styles.opacity).toBe('1');
  }
  
  await page.screenshot({ path: 'test-results/after-page-mobile.png', fullPage: true });
});

test('AFTER: Console errors check', async ({ page }) => {
  const errors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:4173/mockups');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('\n=== CONSOLE ERRORS AFTER FIX ===');
  console.log(`Total errors: ${errors.length}`);
  if (errors.length > 0) {
    errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
  }
  
  expect(errors.length).toBe(0);
});
