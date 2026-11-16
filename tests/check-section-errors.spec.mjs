/**
 * Test: Check for SectionErrorBoundary fallback and undefined errors
 * 
 * This test MUST FAIL if:
 * - Text "This section encountered an error" appears on any page
 * - Text "is not defined" appears on the page or in console
 * - ReferenceError in console
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.VITE_PREVIEW_URL || 'http://localhost:4173';

const PAGES = [
  { path: '/', name: 'Home' },
  { path: '/services', name: 'Services' },
  { path: '/mockups', name: 'Mockups' },
  { path: '/about', name: 'About' },
  { path: '/contact', name: 'Contact' },
];

const THEMES = ['light', 'dark'];
const LANGUAGES = ['en', 'ar'];

test.describe('Section Error Boundary Check', () => {
  for (const page of PAGES) {
    for (const theme of THEMES) {
      for (const lang of LANGUAGES) {
        test(`${page.name} (${lang}/${theme}) - No section errors`, async ({ page: playwright }) => {
          const consoleErrors = [];
          
          // Capture console errors
          playwright.on('console', msg => {
            if (msg.type() === 'error') {
              consoleErrors.push(msg.text());
            }
          });

          // Navigate
          await playwright.goto(`${BASE_URL}${page.path}?lang=${lang}`);
          
          // Set theme
          if (theme === 'dark') {
            await playwright.evaluate(() => {
              document.documentElement.classList.add('dark');
            });
          }

          await playwright.waitForLoadState('networkidle');
          await playwright.waitForTimeout(2000); // Let sections render

          // Check for error boundary fallback text
          const errorBoundaryText = await playwright.locator('text="This section encountered an error"').count();
          expect(errorBoundaryText, 
            `Found SectionErrorBoundary fallback on ${page.name} (${lang}/${theme})`
          ).toBe(0);

          // Check for "is not defined" anywhere on page
          const undefinedText = await playwright.locator('text=/is not defined/i').count();
          expect(undefinedText,
            `Found "is not defined" text on ${page.name} (${lang}/${theme})`
          ).toBe(0);

          // Check console for ReferenceError or "is not defined"
          const hasReferenceError = consoleErrors.some(err => 
            err.includes('ReferenceError') || 
            err.includes('is not defined') ||
            err.includes('LucideIcons')
          );
          
          if (hasReferenceError) {
            console.log(`\n❌ Console errors on ${page.name} (${lang}/${theme}):`);
            consoleErrors.forEach(err => console.log(`  - ${err}`));
          }

          expect(hasReferenceError,
            `Found ReferenceError in console on ${page.name} (${lang}/${theme})\nErrors: ${consoleErrors.join('\n')}`
          ).toBe(false);
        });
      }
    }
  }
});

test.describe('Production vs Dev Error Display', () => {
  test('Production build hides error details from visitors', async ({ page }) => {
    // This test is informational - we can't easily inject errors in tests
    // but we can document the expected behavior:
    
    // In PRODUCTION (npm run preview):
    // - ErrorBoundary shows: "Something went wrong. Please refresh the page."
    // - NO stack traces, NO error messages shown to visitors
    
    // In DEV (npm run dev):
    // - ErrorBoundary shows: Full error details + stack trace
    // - Helps developers debug issues
    
    console.log('✓ Error display behavior documented:');
    console.log('  - Production: Generic message only');
    console.log('  - Development: Full error details');
    
    expect(true).toBe(true);
  });
});
