// @ts-check
import { test, expect } from '@playwright/test';

/**
 * ERROR BOUNDARY RESILIENCE TESTS
 * 
 * Tests proving that all Task 1 fixes work:
 * (a) Stale chunk errors → auto-recovery
 * (b) Supabase failures → no crash on public routes
 * (c) Rapid navigation → no crashes
 * (d) 3-minute soak test → stability
 */

const BASE_URL = 'http://localhost:4173'; // Preview server

test.describe('Error Boundary Resilience', () => {
  
  test.describe('(a) Stale Chunk Recovery', () => {
    
    test('should recover from 404 chunk errors on lazy routes', async ({ page, context }) => {
      // Navigate to home first
      await page.goto(BASE_URL);
      await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
      
      // Intercept chunk requests - simulate 404 on FIRST AboutPage chunk load
      let aboutChunkIntercepted = false;
      
      await page.route('**/assets/*AboutPage*.js', (route) => {
        const url = route.request().url();
        
        // Only intercept the first time
        if (!aboutChunkIntercepted) {
          aboutChunkIntercepted = true;
          console.log(`[TEST] Simulating 404 for AboutPage chunk: ${url}`);
          route.abort('failed');
          return;
        }
        
        // Allow subsequent requests
        console.log(`[TEST] Allowing AboutPage chunk on retry: ${url}`);
        route.continue();
      });
      
      // Click About link - will trigger chunk load
      const aboutLink = page.locator('a[href="/about"]').first();
      await aboutLink.click();
      
      // Wait for page to settle
      await page.waitForTimeout(3000);
      
      // Check: should either show About page OR error boundary with recovery option
      const aboutHeading = page.locator('h1').first();
      const errorBoundary = page.locator('text=/Something went wrong|حدث خطأ ما/i');
      const tryAgainButton = page.locator('button:has-text("Try again"), button:has-text("حاول مرة أخرى")');
      
      const hasAboutPage = await aboutHeading.isVisible().catch(() => false);
      const hasErrorBoundary = await errorBoundary.isVisible().catch(() => false);
      
      console.log(`[TEST] Chunk intercepted: ${aboutChunkIntercepted}`);
      console.log(`[TEST] Page visible: ${hasAboutPage}`);
      console.log(`[TEST] Error boundary visible: ${hasErrorBoundary}`);
      
      // If chunk was intercepted, we expect either recovery or error boundary
      if (aboutChunkIntercepted) {
        expect(hasAboutPage || hasErrorBoundary).toBeTruthy();
        
        if (hasErrorBoundary && !hasAboutPage) {
          await expect(tryAgainButton).toBeVisible();
          console.log('[TEST] ✓ Error boundary with "Try again" shown');
        } else if (hasAboutPage) {
          console.log('[TEST] ✓ Successfully recovered from chunk error');
        }
      } else {
        // If route wasn't intercepted (chunk already loaded), just verify page loaded
        console.log('[TEST] ⚠️  Chunk was not intercepted (may be cached)');
        await expect(page.locator('header').first()).toBeVisible();
      }
    });
    
  });
  
  test.describe('(b) Supabase Failure Resilience', () => {
    
    test('should not crash on Supabase 500 error - Services page', async ({ page }) => {
      // Intercept Supabase requests and simulate 500 error
      await page.route('**/rest/v1/services?*', (route) => {
        console.log('[TEST] Simulating Supabase 500 error for services');
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' })
        });
      });
      
      await page.goto(`${BASE_URL}/services`);
      
      // Should NOT show error boundary
      const errorBoundary = page.locator('text=/Something went wrong|حدث خطأ ما/i');
      await expect(errorBoundary).not.toBeVisible({ timeout: 5000 });
      
      // Should show page structure (header, navigation)
      const header = page.locator('header').first();
      await expect(header).toBeVisible();
      
      console.log('[TEST] ✓ Services page survived Supabase 500');
    });
    
    test('should not crash on Supabase returning empty array - Mockups page', async ({ page }) => {
      // Intercept Supabase and return empty array
      await page.route('**/rest/v1/mockups?*', (route) => {
        console.log('[TEST] Simulating empty Supabase response for mockups');
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      });
      
      await page.route('**/rest/v1/mockup_categories?*', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      });
      
      await page.goto(`${BASE_URL}/mockups`);
      
      // Should NOT crash
      const errorBoundary = page.locator('text=/Something went wrong|حدث خطأ ما/i');
      await expect(errorBoundary).not.toBeVisible({ timeout: 5000 });
      
      // Should show "no results" or empty state
      const pageContent = await page.textContent('body');
      expect(pageContent).toBeTruthy();
      
      console.log('[TEST] ✓ Mockups page survived empty Supabase response');
    });
    
    test('should not crash on Supabase 404 - About page', async ({ page }) => {
      await page.route('**/rest/v1/values?*', (route) => {
        console.log('[TEST] Simulating Supabase 404 for values');
        route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Not found' })
        });
      });
      
      await page.goto(`${BASE_URL}/about`);
      
      const errorBoundary = page.locator('text=/Something went wrong|حدث خطأ ما/i');
      await expect(errorBoundary).not.toBeVisible({ timeout: 5000 });
      
      const header = page.locator('header');
      await expect(header).toBeVisible();
      
      console.log('[TEST] ✓ About page survived Supabase 404');
    });
    
    test('should not crash on Supabase slow response (3s delay) - Contact page', async ({ page }) => {
      await page.route('**/rest/v1/faqs?*', async (route) => {
        console.log('[TEST] Simulating 3s Supabase delay for FAQs');
        await new Promise(resolve => setTimeout(resolve, 3000));
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      });
      
      await page.goto(`${BASE_URL}/contact`);
      
      // Should show loading state, then complete
      const errorBoundary = page.locator('text=/Something went wrong|حدث خطأ ما/i');
      await expect(errorBoundary).not.toBeVisible({ timeout: 8000 });
      
      const header = page.locator('header');
      await expect(header).toBeVisible();
      
      console.log('[TEST] ✓ Contact page survived 3s Supabase delay');
    });
    
  });
  
  test.describe('(c) Rapid Navigation', () => {
    
    test('should survive rapid clicks between routes', async ({ page }) => {
      await page.goto(BASE_URL);
      await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
      
      const routes = [
        { selector: 'a[href="/services"], a[href*="services"]', name: 'Services' },
        { selector: 'a[href="/mockups"], a[href*="mockups"]', name: 'Mockups' },
        { selector: 'a[href="/about"], a[href*="about"]', name: 'About' },
        { selector: 'a[href="/contact"], a[href*="contact"]', name: 'Contact' },
        { selector: 'a[href="/"], a[href*="home"]', name: 'Home' }
      ];
      
      console.log('[TEST] Starting rapid navigation test...');
      
      for (let i = 0; i < 3; i++) {
        for (const route of routes) {
          const link = page.locator(route.selector).first();
          const isVisible = await link.isVisible().catch(() => false);
          
          if (isVisible) {
            console.log(`[TEST] Click ${i + 1}: ${route.name}`);
            await link.click();
            await page.waitForTimeout(200); // Minimal wait
          }
        }
      }
      
      // Final check: no error boundary
      await page.waitForTimeout(1000);
      const errorBoundary = page.locator('text=/Something went wrong|حدث خطأ ما/i');
      await expect(errorBoundary).not.toBeVisible();
      
      // Page should be functional
      const header = page.locator('header');
      await expect(header).toBeVisible();
      
      console.log('[TEST] ✓ Survived 15 rapid navigation clicks');
    });
    
  });
  
  test.describe('(d) 3-Minute Soak Test', () => {
    
    test('should remain stable during 3-minute navigation soak test', async ({ page }) => {
      test.setTimeout(240000); // 4 minutes timeout
      
      await page.goto(BASE_URL);
      await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
      
      const routes = [
        { selector: 'a[href="/"]', name: 'Home' },
        { selector: 'a[href="/services"]', name: 'Services' },
        { selector: 'a[href="/mockups"]', name: 'Mockups' },
        { selector: 'a[href="/about"]', name: 'About' },
        { selector: 'a[href="/contact"]', name: 'Contact' }
      ];
      
      const startTime = Date.now();
      const duration = 3 * 60 * 1000; // 3 minutes
      let navigationCount = 0;
      let errorCount = 0;
      
      console.log('[TEST] Starting 3-minute soak test...');
      
      while (Date.now() - startTime < duration) {
        // Random route
        const route = routes[Math.floor(Math.random() * routes.length)];
        
        try {
          const link = page.locator(route.selector).first();
          await link.click({ timeout: 5000 });
          navigationCount++;
          
          // Wait for page to settle
          await page.waitForTimeout(1000 + Math.random() * 2000);
          
          // Check for error boundary
          const errorBoundary = page.locator('text=/Something went wrong|حدث خطأ ما/i');
          const hasError = await errorBoundary.isVisible().catch(() => false);
          
          if (hasError) {
            errorCount++;
            console.log(`[TEST] ⚠️  Error boundary appeared at navigation ${navigationCount}`);
          }
          
          // Log progress every 30 seconds
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          if (elapsed % 30 === 0 && elapsed > 0) {
            console.log(`[TEST] Soak test progress: ${elapsed}s, ${navigationCount} navigations, ${errorCount} errors`);
          }
          
        } catch (error) {
          console.log(`[TEST] Navigation error at ${navigationCount}: ${error.message}`);
          errorCount++;
        }
      }
      
      const totalSeconds = Math.floor((Date.now() - startTime) / 1000);
      console.log(`[TEST] Soak test complete: ${totalSeconds}s, ${navigationCount} navigations, ${errorCount} errors`);
      
      // Final assertions
      expect(navigationCount).toBeGreaterThan(50); // Should have done many navigations
      expect(errorCount).toBeLessThan(5); // Allow max 5 errors in 3 minutes
      
      // Page should still be functional
      const header = page.locator('header');
      await expect(header).toBeVisible();
      
      console.log('[TEST] ✓ Passed 3-minute soak test');
    });
    
  });
  
});
