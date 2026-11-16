// @ts-check
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4173';

test.describe('BEFORE fixes - Should FAIL', () => {
  
  test('(a) Stale chunk 404 - should trigger ErrorBoundary', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    
    // Intercept AboutPage chunk and return 404
    await page.route('**/assets/*AboutPage*.js', (route) => {
      console.log('[BEFORE] Blocking AboutPage chunk');
      route.abort('failed');
    });
    
    // Navigate to About
    const aboutLink = page.locator('a[href="/about"]').first();
    await aboutLink.click();
    await page.waitForTimeout(3000);
    
    // Check for ErrorBoundary
    const errorBoundary = page.locator('text=/Something went wrong|حدث خطأ ما/i');
    const hasError = await errorBoundary.isVisible().catch(() => false);
    
    console.log(`[BEFORE] ErrorBoundary visible: ${hasError}`);
    
    // BEFORE: Should see ErrorBoundary
    expect(hasError).toBeTruthy();
  });
  
  test('(b) Supabase 500 - should trigger error', async ({ page }) => {
    // Intercept and return 500
    await page.route('**/rest/v1/services?*', (route) => {
      console.log('[BEFORE] Returning Supabase 500');
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal error' })
      });
    });
    
    await page.goto(`${BASE_URL}/services`);
    await page.waitForTimeout(3000);
    
    // Check for any error indication
    const errorBoundary = page.locator('text=/Something went wrong|حدث خطأ ما/i');
    const hasError = await errorBoundary.isVisible().catch(() => false);
    
    const pageErrors = [];
    page.on('pageerror', err => pageErrors.push(err.message));
    
    await page.waitForTimeout(2000);
    
    console.log(`[BEFORE] ErrorBoundary: ${hasError}, PageErrors: ${pageErrors.length}`);
    
    // BEFORE: Might crash or show errors
    expect(hasError || pageErrors.length > 0).toBeTruthy();
  });
  
});
