/**
 * About Page Diagnosis - Step 1: Find Root Cause
 * BEFORE any code changes - reproduce the exact failure
 */

import { test, expect } from '@playwright/test';

const scenarios = [
  { width: 390, height: 844, name: 'mobile', theme: 'light', lang: 'en' },
  { width: 390, height: 844, name: 'mobile', theme: 'dark', lang: 'ar' },
  { width: 1440, height: 900, name: 'desktop', theme: 'light', lang: 'en' },
  { width: 1440, height: 900, name: 'desktop', theme: 'dark', lang: 'ar' },
];

test('About page - route check', async ({ page }) => {
  console.log('\n=== ROUTE CHECK ===');
  
  await page.goto('http://localhost:4173/about');
  await page.waitForTimeout(3000); // Wait for any redirects/loading
  
  const url = page.url();
  console.log('Final URL:', url);
  
  const title = await page.title();
  console.log('Page title:', title);
  
  // Check if it's a 404
  const notFoundText = await page.locator('text=/404|not found|page not found/i').count();
  console.log('404 indicators:', notFoundText);
  
  await page.screenshot({ path: 'test-results/about-diagnosis-route.png', fullPage: true });
});

for (const scenario of scenarios) {
  test(`About page - ${scenario.name}/${scenario.theme}/${scenario.lang} diagnosis`, async ({ page }) => {
    // Set reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    const errors = [];
    const failedRequests = [];
    const consoleMessages = [];
    
    page.on('console', msg => {
      consoleMessages.push({ type: msg.type(), text: msg.text() });
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('requestfailed', request => {
      failedRequests.push({
        url: request.url(),
        status: request.failure()?.errorText,
        method: request.method()
      });
    });
    
    page.on('response', async response => {
      if (!response.ok()) {
        const url = response.url();
        const status = response.status();
        console.log(`Failed response: ${status} ${url}`);
        
        // Try to get response body for Supabase errors
        if (url.includes('supabase') || url.includes('/rest/')) {
          try {
            const body = await response.text();
            console.log(`Response body: ${body.substring(0, 200)}`);
          } catch (e) {
            // ignore
          }
        }
      }
    });
    
    console.log(`\n=== TESTING: ${scenario.name}/${scenario.theme}/${scenario.lang} ===`);
    
    await page.setViewportSize({ width: scenario.width, height: scenario.height });
    
    // Apply theme
    if (scenario.theme === 'dark') {
      await page.evaluate(() => {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      });
    }
    
    // Apply language
    if (scenario.lang === 'ar') {
      await page.evaluate(() => {
        localStorage.setItem('language', 'ar');
        document.documentElement.setAttribute('lang', 'ar');
        document.documentElement.setAttribute('dir', 'rtl');
      });
    }
    
    // Navigate
    await page.goto('http://localhost:4173/about');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Let everything settle
    
    console.log('\n--- PAGE STATE ---');
    
    // Check for ErrorBoundary
    const errorBoundary = await page.locator('text=/error|something went wrong|try again/i').count();
    console.log(`ErrorBoundary indicators: ${errorBoundary}`);
    
    if (errorBoundary > 0) {
      const errorText = await page.locator('text=/error|something went wrong/i').first().textContent();
      console.log(`ErrorBoundary text: ${errorText}`);
    }
    
    // Check for blank page
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log(`Body text length: ${bodyText.length} characters`);
    console.log(`First 200 chars: ${bodyText.substring(0, 200)}`);
    
    // Check for h1
    const h1Count = await page.locator('h1').count();
    console.log(`H1 count: ${h1Count}`);
    
    if (h1Count > 0) {
      const h1Text = await page.locator('h1').first().textContent();
      console.log(`H1 text: ${h1Text}`);
    }
    
    // Check for visible sections
    const sections = await page.locator('section').count();
    console.log(`Section count: ${sections}`);
    
    // Check for loading states
    const skeletons = await page.locator('[class*="skeleton"], [class*="loading"], [class*="spinner"]').count();
    console.log(`Loading indicators: ${skeletons}`);
    
    // Check for stuck opacity
    const hiddenElements = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      return elements.filter(el => {
        const style = window.getComputedStyle(el);
        return parseFloat(style.opacity) < 0.1 && el.offsetHeight > 50;
      }).length;
    });
    console.log(`Elements stuck at opacity ~0: ${hiddenElements}`);
    
    // Check for horizontal scroll
    const hasHScroll = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
    console.log(`Horizontal scroll: ${hasHScroll}`);
    
    console.log('\n--- CONSOLE ERRORS ---');
    console.log(`Total console errors: ${errors.length}`);
    errors.slice(0, 10).forEach((err, i) => {
      console.log(`  ${i + 1}. ${err}`);
    });
    
    console.log('\n--- FAILED REQUESTS ---');
    console.log(`Total failed requests: ${failedRequests.length}`);
    failedRequests.forEach((req, i) => {
      console.log(`  ${i + 1}. ${req.method} ${req.url}`);
      console.log(`      Status: ${req.status}`);
    });
    
    console.log('\n--- CONSOLE WARNINGS ---');
    const warnings = consoleMessages.filter(m => m.type === 'warning');
    console.log(`Total warnings: ${warnings.length}`);
    warnings.slice(0, 5).forEach((w, i) => {
      console.log(`  ${i + 1}. ${w.text}`);
    });
    
    // Screenshot
    await page.screenshot({
      path: `test-results/about-diagnosis-${scenario.name}-${scenario.theme}-${scenario.lang}.png`,
      fullPage: true
    });
    
    console.log(`\nScreenshot saved: about-diagnosis-${scenario.name}-${scenario.theme}-${scenario.lang}.png`);
  });
}

test('About page - check route definition in App.jsx', async ({ page }) => {
  // This is a diagnostic test - we'll check the source
  console.log('\n=== CHECKING ROUTE DEFINITION ===');
  console.log('Need to check App.jsx for /about route');
});

test('About page - detect missing tables', async ({ page }) => {
  console.log('\n=== DETECTING MISSING TABLES ===');
  
  const errors = [];
  const pgrst404s = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('response', async response => {
    const url = response.url();
    const status = response.status();
    
    // Check for PGRST404 (table doesn't exist) or PGRST205 (missing column)
    if (url.includes('/rest/') && (status === 404 || status === 400)) {
      try {
        const body = await response.text();
        if (body.includes('PGRST') || body.includes('relation') || body.includes('does not exist')) {
          pgrst404s.push({
            url,
            status,
            body: body.substring(0, 300)
          });
        }
      } catch (e) {
        // ignore
      }
    }
  });
  
  await page.goto('http://localhost:4173/about');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  console.log('\n--- MISSING TABLES / PGRST ERRORS ---');
  console.log(`Found ${pgrst404s.length} Supabase errors:`);
  pgrst404s.forEach((err, i) => {
    console.log(`\n${i + 1}. ${err.url}`);
    console.log(`   Status: ${err.status}`);
    console.log(`   Body: ${err.body}`);
  });
  
  console.log('\n--- REACT ERRORS ---');
  const reactErrors = errors.filter(e => e.includes('React') || e.includes('hook') || e.includes('#310'));
  console.log(`Found ${reactErrors.length} React errors:`);
  reactErrors.forEach((err, i) => {
    console.log(`\n${i + 1}. ${err}`);
  });
});

test('About page - no-preference motion', async ({ page }) => {
  // Test with normal motion (not reduced)
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:4173/about');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(4000); // Let animations complete
  
  console.log('\n=== MOTION: no-preference ===');
  console.log(`Errors: ${errors.length}`);
  
  // Check if elements reached final state
  const stuckElements = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('[data-motion], [class*="motion"]'));
    return elements.filter(el => {
      const style = window.getComputedStyle(el);
      const opacity = parseFloat(style.opacity);
      const transform = style.transform;
      return opacity < 1 || (transform !== 'none' && !transform.includes('matrix(1, 0, 0, 1, 0, 0)'));
    }).length;
  });
  
  console.log(`Elements not at final state (opacity 1, transform none): ${stuckElements}`);
  
  await page.screenshot({
    path: 'test-results/about-diagnosis-no-preference.png',
    fullPage: true
  });
});
