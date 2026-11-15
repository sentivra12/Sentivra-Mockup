import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const ADMIN_EMAIL = 'sentivra.tech@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'test123'; // Set via env

/**
 * STEP 1: Root Cause Diagnosis for "Add New" button bug
 * 
 * This test diagnoses why clicking "Add New" on Admin > Mockups does nothing:
 * 1. Does click handler fire?
 * 2. Any console errors?
 * 3. Does modal mount in DOM?
 * 4. Is modal visible or hidden (opacity, display, z-index)?
 * 5. Reduced motion impact?
 */

test.describe('Admin "Add New" Button Diagnosis', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('http://localhost:4173/admin/login');
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/dashboard', { timeout: 5000 });
  });

  test('STEP 1.1: Check if Add New button exists and click handler fires (Mockups)', async ({ page }) => {
    console.log('\n=== STEP 1.1: Mockups Add New Button ===\n');
    
    // Collect console messages
    const consoleMessages = [];
    const errors = [];
    
    page.on('console', msg => {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
      console.log(`[BROWSER ${msg.type()}]`, msg.text());
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
      console.error('[BROWSER ERROR]', error.message);
    });

    // Go to Mockups page
    await page.goto('http://localhost:4173/admin/mockups');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Take screenshot BEFORE clicking
    await page.screenshot({ path: 'screenshots/mockups-before-click.png', fullPage: true });
    console.log('📸 Screenshot saved: mockups-before-click.png');

    // Check if button exists
    const addNewButton = page.locator('button:has-text("Add Mockup"), button:has-text("Add New")').first();
    const buttonExists = await addNewButton.count() > 0;
    console.log(`✓ Add New button exists: ${buttonExists}`);
    expect(buttonExists).toBe(true);

    if (buttonExists) {
      // Check button properties
      const isVisible = await addNewButton.isVisible();
      const isEnabled = await addNewButton.isEnabled();
      const buttonText = await addNewButton.textContent();
      
      console.log(`  - Visible: ${isVisible}`);
      console.log(`  - Enabled: ${isEnabled}`);
      console.log(`  - Text: "${buttonText}"`);

      // Get computed styles
      const buttonStyles = await addNewButton.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          opacity: computed.opacity,
          display: computed.display,
          pointerEvents: computed.pointerEvents,
          cursor: computed.cursor,
          color: computed.color,
          backgroundColor: computed.backgroundColor,
        };
      });
      console.log('  - Computed styles:', buttonStyles);

      // Click the button
      console.log('\n🖱️  Clicking "Add New" button...');
      await addNewButton.click();
      await page.waitForTimeout(1500);

      // Take screenshot AFTER clicking
      await page.screenshot({ path: 'screenshots/mockups-after-click.png', fullPage: true });
      console.log('📸 Screenshot saved: mockups-after-click.png');

      // Check if modal/dialog appeared
      const modalSelectors = [
        '[role="dialog"]',
        '[role="alertdialog"]',
        'div:has-text("Add New Mockup")',
        'div:has-text("Add Mockup")',
        'form:has(input[name="title_en"])',
        '.modal',
        '[data-state="open"]',
      ];

      let modalFound = false;
      let modalSelector = '';
      
      for (const selector of modalSelectors) {
        const count = await page.locator(selector).count();
        if (count > 0) {
          modalFound = true;
          modalSelector = selector;
          console.log(`✓ Modal found with selector: ${selector}`);
          break;
        }
      }

      if (!modalFound) {
        console.log('❌ ISSUE: No modal/dialog found in DOM after click!');
      }

      // Check if modal is visible
      if (modalFound) {
        const modal = page.locator(modalSelector).first();
        const modalVisible = await modal.isVisible();
        console.log(`  - Modal visible: ${modalVisible}`);

        if (!modalVisible) {
          // Get computed styles to see why it's hidden
          const modalStyles = await modal.evaluate(el => {
            const computed = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            return {
              opacity: computed.opacity,
              visibility: computed.visibility,
              display: computed.display,
              transform: computed.transform,
              zIndex: computed.zIndex,
              position: computed.position,
              width: rect.width,
              height: rect.height,
              top: rect.top,
              left: rect.left,
              background: computed.background,
            };
          });
          console.log('  - Modal computed styles:', modalStyles);
          console.log('❌ ISSUE: Modal exists in DOM but is NOT visible!');
        }
      }

      // Check for errors
      if (errors.length > 0) {
        console.log('\n❌ JavaScript Errors:');
        errors.forEach(err => console.log(`  - ${err}`));
      } else {
        console.log('\n✓ No JavaScript errors');
      }

      // Check console for relevant messages
      const relevantMessages = consoleMessages.filter(msg => 
        msg.includes('error') || msg.includes('warning') || msg.includes('modal') || msg.includes('click')
      );
      if (relevantMessages.length > 0) {
        console.log('\n📋 Relevant console messages:');
        relevantMessages.forEach(msg => console.log(`  ${msg}`));
      }
    }
  });

  test('STEP 1.2: Check reduced motion impact', async ({ page, context }) => {
    console.log('\n=== STEP 1.2: Reduced Motion Test ===\n');
    
    // Test with reduced motion
    await context.addInitScript(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => {},
        }),
      });
    });

    await page.goto('http://localhost:4173/admin/mockups');
    await page.waitForLoadState('networkidle');

    console.log('🎬 Testing with prefers-reduced-motion: reduce');
    
    const addButton = page.locator('button:has-text("Add Mockup"), button:has-text("Add New")').first();
    await addButton.click();
    await page.waitForTimeout(1500);

    const modalExists = await page.locator('[role="dialog"]').count() > 0;
    const modalVisible = modalExists ? await page.locator('[role="dialog"]').first().isVisible() : false;
    
    console.log(`  - Modal exists: ${modalExists}`);
    console.log(`  - Modal visible: ${modalVisible}`);
    
    await page.screenshot({ path: 'screenshots/mockups-reduced-motion.png', fullPage: true });
  });

  test('STEP 1.3: Compare Edit button behavior', async ({ page }) => {
    console.log('\n=== STEP 1.3: Compare Edit vs Add New ===\n');
    
    await page.goto('http://localhost:4173/admin/mockups');
    await page.waitForLoadState('networkidle');

    // Check if Edit button exists (needs existing mockup)
    const editButton = page.locator('button:has-text("Edit")').first();
    const editExists = await editButton.count() > 0;
    
    console.log(`Edit button exists: ${editExists}`);
    
    if (editExists) {
      console.log('🖱️  Clicking "Edit" button...');
      await editButton.click();
      await page.waitForTimeout(1000);
      
      const modalAfterEdit = await page.locator('[role="dialog"]').count() > 0;
      const modalVisible = modalAfterEdit ? await page.locator('[role="dialog"]').first().isVisible() : false;
      
      console.log(`  - Modal after Edit click: ${modalAfterEdit}`);
      console.log(`  - Modal visible: ${modalVisible}`);
      
      await page.screenshot({ path: 'screenshots/mockups-after-edit-click.png', fullPage: true });
      
      if (modalVisible && !modalAfterEdit) {
        console.log('⚠️  Edit works but Add New doesn\'t - comparing code paths needed');
      }
    } else {
      console.log('ℹ️  No mockups exist, cannot test Edit button');
    }
  });

  test('STEP 1.4: Check other Admin screens with Add New', async ({ page }) => {
    console.log('\n=== STEP 1.4: Test Add New on Other Screens ===\n');
    
    const screensToTest = [
      { path: '/admin/services', name: 'Services', buttonText: 'Add Service' },
      { path: '/admin/faqs', name: 'FAQs', buttonText: 'Add FAQ' },
      { path: '/admin/testimonials', name: 'Testimonials', buttonText: 'Add Testimonial' },
      { path: '/admin/client-logos', name: 'Client Logos', buttonText: 'Add Logo' },
      { path: '/admin/projects', name: 'Projects', buttonText: 'Add Project' },
    ];

    for (const screen of screensToTest) {
      console.log(`\n--- Testing ${screen.name} ---`);
      
      await page.goto(`http://localhost:4173${screen.path}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      const addButton = page.locator(`button:has-text("${screen.buttonText}"), button:has-text("Add New")`).first();
      const buttonExists = await addButton.count() > 0;
      
      if (!buttonExists) {
        console.log(`  ❌ Add button not found on ${screen.name}`);
        continue;
      }

      await addButton.click();
      await page.waitForTimeout(1000);

      const modalExists = await page.locator('[role="dialog"], form').count() > 0;
      const modalVisible = modalExists ? await page.locator('[role="dialog"], form').first().isVisible() : false;

      console.log(`  ${screen.name}: Modal exists=${modalExists}, visible=${modalVisible}`);
      
      if (!modalVisible) {
        console.log(`  ❌ ${screen.name} has the same bug!`);
      }
    }
  });

  test('STEP 1.5: Check sidebar clipping', async ({ page }) => {
    console.log('\n=== STEP 1.5: Sidebar Clipping Diagnosis ===\n');
    
    await page.goto('http://localhost:4173/admin/mockups');
    await page.waitForLoadState('networkidle');

    // Find sidebar element
    const sidebar = page.locator('aside, nav, [class*="sidebar"]').first();
    const sidebarExists = await sidebar.count() > 0;
    
    if (sidebarExists) {
      const sidebarStyles = await sidebar.evaluate(el => {
        const computed = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          width: rect.width,
          left: rect.left,
          transform: computed.transform,
          overflow: computed.overflow,
          marginLeft: computed.marginLeft,
          paddingLeft: computed.paddingLeft,
        };
      });
      
      console.log('Sidebar styles:', sidebarStyles);
      
      if (sidebarStyles.left < 0) {
        console.log('❌ ISSUE: Sidebar is clipped (left < 0)');
      }
    }

    // Check email display
    const emailElement = page.locator('text=/.*@gmail\\.com/').first();
    const emailExists = await emailElement.count() > 0;
    
    if (emailExists) {
      const emailText = await emailElement.textContent();
      console.log(`Email shown: "${emailText}"`);
      
      if (!emailText.includes('sentivra')) {
        console.log('❌ ISSUE: Email is truncated/clipped');
      }
    }
  });
});

test.describe('Visual regression tests', () => {
  test('Capture Add New button appearance', async ({ page }) => {
    await page.goto('http://localhost:4173/admin/login');
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/dashboard');
    
    await page.goto('http://localhost:4173/admin/mockups');
    await page.waitForLoadState('networkidle');
    
    const addButton = page.locator('button:has-text("Add Mockup"), button:has-text("Add New")').first();
    
    // Capture button with double ring
    await addButton.screenshot({ path: 'screenshots/add-new-button-close-up.png' });
    console.log('📸 Button close-up saved');
  });
});
