import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4173';

test.describe('About Page Round 3 - Verification', () => {

  test.describe('Text integrity checks', () => {
    
    test('should not contain "undefined", "null", "NaN", or broken interpolation', async ({ page }) => {
      await page.goto(`${BASE_URL}/about`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const bodyText = await page.locator('body').textContent();
      
      // Check for bad patterns
      expect(bodyText).not.toContain('undefined');
      expect(bodyText).not.toContain('null');
      expect(bodyText).not.toContain('NaN');
      expect(bodyText).not.toContain('[object Object]');
      expect(bodyText).not.toContain('{{');
      expect(bodyText).not.toContain('}}');
    });
  });

  test.describe('Countries section', () => {
    
    test('should show only published countries', async ({ page }) => {
      const countriesData = [];
      page.on('response', async response => {
        if (response.url().includes('/rest/v1/countries') && response.ok()) {
          try {
            const data = await response.json();
            countriesData.push(...data);
          } catch (e) {}
        }
      });
      
      await page.goto(`${BASE_URL}/about`);
      await page.waitForLoadState('networkidle');
      
      console.log('Countries from API:', countriesData.length);
      
      // Countries should be is_active=true only
      const inactiveCountries = countriesData.filter(c => c.is_active === false);
      expect(inactiveCountries.length).toBe(0);
    });
    
    test('should hide section when no published countries', async ({ page }) => {
      // Mock empty response
      await page.route('**/rest/v1/countries*', route => {
        route.fulfill({ status: 200, body: JSON.stringify([]) });
      });
      
      await page.goto(`${BASE_URL}/about`);
      await page.waitForLoadState('networkidle');
      
      // Check if presence section exists
      const presenceSection = page.locator('text=/Our Presence|تواجدنا/');
      const count = await presenceSection.count();
      
      // Section should be hidden (or show generic text without countries)
      if (count > 0) {
        const text = await presenceSection.locator('..').locator('..').textContent();
        expect(text).not.toContain('undefined');
        expect(text).not.toContain('null');
      }
    });
  });

  test.describe('Button targets', () => {
    
    test('should have correct "Our Work" button target', async ({ page }) => {
      await page.goto(`${BASE_URL}/about`);
      await page.waitForLoadState('networkidle');
      
      const button = page.locator('a').filter({ hasText: /Our Work|أعمالنا/i }).first();
      if (await button.count() > 0) {
        const href = await button.getAttribute('href');
        expect(href).toBe('/mockups');
      }
    });
    
    test('should have correct "Join Our Team" target', async ({ page }) => {
      await page.goto(`${BASE_URL}/about`);
      await page.waitForLoadState('networkidle');
      
      const button = page.locator('a, button').filter({ hasText: /Join Our Team|انضم/i }).first();
      if (await button.count() > 0) {
        const href = await button.getAttribute('href');
        // Should go to /contact or /#contact
        expect(href).toMatch(/\/(#)?contact/);
      }
    });
  });

  test.describe('Stats display', () => {
    
    test('should display stats from Admin', async ({ page }) => {
      const statsData = [];
      page.on('response', async response => {
        if (response.url().includes('/rest/v1/stats') && response.ok()) {
          try {
            const data = await response.json();
            statsData.push(...data);
          } catch (e) {}
        }
      });
      
      await page.goto(`${BASE_URL}/about`);
      await page.waitForLoadState('networkidle');
      
      console.log('Stats from Admin:', statsData.length);
      expect(statsData.length).toBeGreaterThan(0);
      
      // All stats should have values
      for (const stat of statsData) {
        expect(stat.value).toBeDefined();
        expect(stat.label).toBeDefined();
      }
    });
  });

  test.describe('Timeline structure', () => {
    
    test('should have readable text at 390px', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${BASE_URL}/about`);
      await page.waitForLoadState('networkidle');
      
      // Find timeline elements
      const timelineTexts = page.locator('p, span, h3, h4').filter({ hasText: /20\d{2}/ }).or(
        page.locator('text=/Our Story|قصتنا/').locator('..').locator('..').locator('p, span, h3, h4')
      );
      
      const count = await timelineTexts.count();
      if (count > 0) {
        for (let i = 0; i < Math.min(count, 5); i++) {
          const fontSize = await timelineTexts.nth(i).evaluate(el => 
            parseFloat(window.getComputedStyle(el).fontSize)
          );
          expect(fontSize).toBeGreaterThanOrEqual(14);
        }
      }
    });
  });

  test.describe('Team section', () => {
    
    test('should not use stock images', async ({ page }) => {
      await page.goto(`${BASE_URL}/about`);
      await page.waitForLoadState('networkidle');
      
      // Find team section
      const teamSection = page.locator('text=/Meet Our Team|فريقنا/').locator('..').locator('..');
      if (await teamSection.count() > 0) {
        const images = teamSection.locator('img');
        const imageCount = await images.count();
        
        for (let i = 0; i < imageCount; i++) {
          const src = await images.nth(i).getAttribute('src');
          // Should not be unsplash or pravatar stock images
          expect(src).not.toContain('unsplash.com');
          expect(src).not.toContain('pravatar.cc');
        }
      }
    });
  });

  test.describe('Console and errors', () => {
    
    test('should have no console errors (except known 404s)', async ({ page }) => {
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          const text = msg.text();
          // Filter out known marquee_items 404 (table not created yet)
          if (!text.includes('marquee_items')) {
            errors.push(text);
          }
        }
      });
      
      await page.goto(`${BASE_URL}/about`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      console.log('Filtered console errors:', errors);
      expect(errors.length).toBe(0);
    });
  });

  test.describe('Dark theme', () => {
    
    test('should render correctly in dark mode', async ({ page, context }) => {
      // Set dark theme via localStorage
      await context.addInitScript(() => {
        localStorage.setItem('theme', 'dark');
      });
      
      await page.goto(`${BASE_URL}/about`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      const htmlClass = await page.locator('html').getAttribute('class');
      expect(htmlClass).toContain('dark');
      
      // No ErrorBoundary should be shown
      const errorBoundary = page.locator('text=/Something went wrong|خطأ/i');
      expect(await errorBoundary.count()).toBe(0);
    });
  });

  test.describe('Responsive layout', () => {
    
    test('should have no horizontal scroll at 390px', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${BASE_URL}/about`);
      await page.waitForLoadState('networkidle');
      
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // Allow 1px tolerance
    });
    
    test('should have readable breadcrumbs at 390px', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${BASE_URL}/about`);
      await page.waitForLoadState('networkidle');
      
      const breadcrumbs = page.locator('nav[aria-label*="breadcrumb"], nav[aria-label*="Breadcrumb"]').first();
      if (await breadcrumbs.count() > 0) {
        const fontSize = await breadcrumbs.evaluate(el => {
          const textElements = el.querySelectorAll('a, span');
          const sizes = Array.from(textElements).map(t => parseFloat(window.getComputedStyle(t).fontSize));
          return Math.min(...sizes);
        });
        expect(fontSize).toBeGreaterThanOrEqual(14);
      }
    });
  });

  test.describe('RTL support', () => {
    
    test('should work in Arabic/RTL', async ({ page, context }) => {
      // Set Arabic language
      await context.addInitScript(() => {
        localStorage.setItem('language', 'ar');
      });
      
      await page.goto(`${BASE_URL}/about`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      const htmlDir = await page.locator('html').getAttribute('dir');
      expect(htmlDir).toBe('rtl');
      
      // No undefined text in Arabic
      const bodyText = await page.locator('body').textContent();
      expect(bodyText).not.toContain('undefined');
      expect(bodyText).not.toContain('null');
    });
  });
});
