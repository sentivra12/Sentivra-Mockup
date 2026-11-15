#!/usr/bin/env node
/**
 * Quick Modal Test - Opens browser for manual verification
 */

import { chromium } from '@playwright/test';

async function test() {
  console.log('🚀 Opening browser for manual modal test...\n');
  console.log('📋 Test Steps:');
  console.log('1. Login at http://localhost:5174/admin/login');
  console.log('2. Go to Admin > Mockups');
  console.log('3. Click "Add Mockup" button');
  console.log('4. ✅ Modal should appear (with or without animation)');
  console.log('5. ❌ If nothing happens, the fix failed\n');

  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized'],
  });
  
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  
  const page = await context.newPage();

  // Navigate to mockups page
  await page.goto('http://localhost:5174/admin/mockups');
  
  console.log('✅ Browser opened');
  console.log('⏳ Waiting for you to test...');
  console.log('   Press Ctrl+C when done\n');

  // Keep browser open
  await page.waitForTimeout(300000); // 5 minutes

  await browser.close();
}

test().catch(console.error);
