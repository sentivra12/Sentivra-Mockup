// @ts-check
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4173';

test.describe('Real 3-Minute Soak Test', () => {
  
  test('3min soak with random Supabase failures + chunk 404s', async ({ page }) => {
    test.setTimeout(240000); // 4 min timeout
    
    const routes = [
      '/',
      '/services',
      '/mockups',
      '/about',
      '/contact'
    ];
    
    const mockupSlugs = ['healthcare-admin', 'e-commerce-platform', 'educational-portal'];
    routes.push(...mockupSlugs.map(slug => `/mockups/${slug}`));
    
    let navigationCount = 0;
    let boundaryHits = 0;
    let pageErrors = [];
    let consoleErrors = [];
    let chunkFailures = 0;
    let supabaseFailures = 0;
    
    // Track errors
    page.on('pageerror', err => {
      pageErrors.push(`[${Date.now()}] ${err.message}`);
      console.log(`[SOAK] Page error: ${err.message.substring(0, 100)}`);
    });
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Random Supabase failures
    await page.route('**/rest/v1/**', (route) => {
      const url = route.request().url();
      const random = Math.random();
      
      if (random < 0.15) { // 15% chance of failure
        supabaseFailures++;
        const failureType = Math.random();
        
        if (failureType < 0.3) {
          // 500 error
          console.log(`[SOAK] Supabase 500 on ${url.substring(0, 60)}`);
          route.fulfill({ status: 500, body: JSON.stringify({ error: 'Internal error' }) });
        } else if (failureType < 0.5) {
          // 404 PGRST205
          console.log(`[SOAK] Supabase 404 PGRST205`);
          route.fulfill({ status: 404, body: JSON.stringify({ code: 'PGRST205', message: 'Not found' }) });
        } else if (failureType < 0.7) {
          // Empty array
          console.log(`[SOAK] Supabase empty []`);
          route.fulfill({ status: 200, body: JSON.stringify([]) });
        } else if (failureType < 0.85) {
          // Abort
          console.log(`[SOAK] Supabase abort`);
          route.abort('failed');
        } else {
          // 3s delay
          console.log(`[SOAK] Supabase 3s delay`);
          setTimeout(() => route.continue(), 3000);
          return;
        }
      } else {
        route.continue();
      }
    });
    
    // Occasional chunk 404
    await page.route('**/assets/*.js', (route) => {
      const url = route.request().url();
      const random = Math.random();
      
      if (random < 0.05 && url.includes('Page')) { // 5% chunk failure
        chunkFailures++;
        console.log(`[SOAK] Chunk 404 on ${url.substring(url.lastIndexOf('/'))}`);
        route.abort('failed');
      } else {
        route.continue();
      }
    });
    
    // Navigate to home
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    
    const startTime = Date.now();
    const duration = 3 * 60 * 1000; // 3 minutes
    
    console.log('[SOAK] Starting 3-minute test with random failures...');
    
    while (Date.now() - startTime < duration) {
      // Random route
      const route = routes[Math.floor(Math.random() * routes.length)];
      
      try {
        await page.goto(`${BASE_URL}${route}`, { timeout: 10000, waitUntil: 'domcontentloaded' });
        navigationCount++;
        
        // Wait random time
        await page.waitForTimeout(1000 + Math.random() * 2000);
        
        // Check for error boundary
        const errorBoundary = page.locator('text=/Something went wrong|حدث خطأ ما/i');
        const hasError = await errorBoundary.isVisible().catch(() => false);
        
        if (hasError) {
          boundaryHits++;
          console.log(`[SOAK] ⚠️  ErrorBoundary at nav ${navigationCount} (route: ${route})`);
        }
        
        // Progress every 30s
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        if (elapsed % 30 === 0 && elapsed > 0 && navigationCount % 10 === 0) {
          console.log(`[SOAK] ${elapsed}s: ${navigationCount} navs, ${boundaryHits} boundaries, ${pageErrors.length} errors`);
        }
        
      } catch (error) {
        console.log(`[SOAK] Nav error at ${navigationCount}: ${error.message.substring(0, 80)}`);
      }
    }
    
    const totalSeconds = Math.floor((Date.now() - startTime) / 1000);
    
    console.log('\n[SOAK] ========== FINAL REPORT ==========');
    console.log(`[SOAK] Duration: ${totalSeconds}s`);
    console.log(`[SOAK] Total navigations: ${navigationCount}`);
    console.log(`[SOAK] Supabase failures injected: ${supabaseFailures}`);
    console.log(`[SOAK] Chunk 404s injected: ${chunkFailures}`);
    console.log(`[SOAK] ErrorBoundary hits: ${boundaryHits}`);
    console.log(`[SOAK] Page errors: ${pageErrors.length}`);
    console.log(`[SOAK] Console errors: ${consoleErrors.length}`);
    console.log('[SOAK] ====================================\n');
    
    // Assertions
    expect(navigationCount).toBeGreaterThan(40);
    expect(boundaryHits).toBeLessThan(10); // Max 10 boundary hits in 3min
    expect(pageErrors.length).toBeLessThan(15); // Max 15 page errors
  });
  
});
