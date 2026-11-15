#!/usr/bin/env node

/**
 * Diagnostic Script: Check Modal State in AdminMockupsPage
 */

import { chromium } from '@playwright/test';

async function diagnose() {
  console.log('🔍 Starting modal diagnostic...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen to console
  page.on('console', (msg) => {
    console.log(`[BROWSER ${msg.type()}]:`, msg.text());
  });

  // Listen to errors
  page.on('pageerror', (error) => {
    console.error(`[BROWSER ERROR]:`, error.message);
  });

  try {
    console.log('1. Opening admin mockups page...');
    await page.goto('http://localhost:5173/admin/mockups', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('\n2. Checking if Add New button exists...');
    const addButton = await page.locator('button:has-text("Add Mockup")').first();
    const buttonExists = await addButton.count() > 0;
    console.log(`   ✅ Button exists: ${buttonExists}`);

    if (buttonExists) {
      console.log('\n3. Checking button attributes...');
      const isDisabled = await addButton.isDisabled();
      const isVisible = await addButton.isVisible();
      console.log(`   Disabled: ${isDisabled}`);
      console.log(`   Visible: ${isVisible}`);

      console.log('\n4. Clicking Add New button...');
      await addButton.click();
      await page.waitForTimeout(1000);

      console.log('\n5. Checking if modal opened...');
      const modal = await page.locator('text=Add New Mockup').first();
      const modalExists = await modal.count() > 0;
      const modalVisible = modalExists ? await modal.isVisible() : false;
      
      console.log(`   ✅ Modal exists: ${modalExists}`);
      console.log(`   ✅ Modal visible: ${modalVisible}`);

      if (!modalVisible) {
        console.log('\n❌ ISSUE: Modal did not open!');
        console.log('\n6. Checking React state...');
        
        const reactState = await page.evaluate(() => {
          // Try to find React component state
          const appDiv = document.querySelector('#root');
          if (appDiv && appDiv._reactRootContainer) {
            return 'React root found';
          }
          return 'Cannot access React state directly';
        });
        console.log(`   ${reactState}`);

        console.log('\n7. Checking for JavaScript errors in console...');
        // Already listening via page.on('pageerror')
      } else {
        console.log('\n✅ SUCCESS: Modal opened correctly!');
      }
    }

    console.log('\n8. Taking screenshot...');
    await page.screenshot({ path: 'modal-diagnostic.png', fullPage: true });
    console.log('   Screenshot saved: modal-diagnostic.png');

    console.log('\n✅ Diagnostic complete. Press Enter to close...');
    await page.waitForTimeout(30000); // Wait 30 seconds to inspect

  } catch (error) {
    console.error('\n❌ Error during diagnostic:', error.message);
  } finally {
    await browser.close();
  }
}

diagnose();
