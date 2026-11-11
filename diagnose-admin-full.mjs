import { chromium } from 'playwright';
import fs from 'fs';

const BASE_URL = 'http://localhost:4180';
const ADMIN_EMAIL = 'admin@sentivra.com';
const ADMIN_PASSWORD = 'admin123';

async function diagnose() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'light',
    reducedMotion: 'reduce'
  });
  
  const page = await context.newPage();

  // Capture all network errors
  const networkErrors = [];
  page.on('response', response => {
    if (response.status() >= 400) {
      networkErrors.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
    }
  });

  // Capture console
  const consoleMessages = [];
  page.on('console', msg => consoleMessages.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', error => consoleMessages.push(`[ERROR] ${error.message}`));

  try {
    console.log('1. Signing in...');
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' });
    
    // Check if already logged in
    const currentUrl = page.url();
    if (!currentUrl.includes('/login')) {
      console.log('   ✓ Already logged in');
    } else {
      await page.fill('input[type="email"]', ADMIN_EMAIL);
      await page.fill('input[type="password"]', ADMIN_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
      
      // Check if login succeeded
      const newUrl = page.url();
      if (newUrl.includes('/login')) {
        console.log('   ✗ Login failed - still on login page');
        await page.screenshot({ path: 'screenshots/admin-login-failed.png' });
        return;
      }
      console.log('   ✓ Logged in successfully');
    }

    console.log('\n2. Loading Page Content screen...');
    await page.goto(`${BASE_URL}/admin/page-content`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'screenshots/admin-pagecontent-full.png', fullPage: true });
    console.log('   ✓ Screenshot saved');

    // Check page text
    const pageText = await page.textContent('body');
    
    console.log('\n3. Checking page state:');
    if (pageText.includes('No content sections found')) {
      console.log('   ✗ Shows "No content sections found" - table is empty');
    }
    if (pageText.includes('Page Content Management')) {
      console.log('   ✓ Page loaded correctly');
    }
    if (pageText.includes('Select Page')) {
      console.log('   ✓ Page selector visible');
    }

    // Check network errors
    console.log('\n4. Network errors:');
    if (networkErrors.length === 0) {
      console.log('   ✓ No network errors');
    } else {
      networkErrors.forEach(err => {
        console.log(`   ✗ ${err.status} ${err.statusText} - ${err.url}`);
      });
    }

    // Check console
    console.log('\n5. Console messages:');
    const errors = consoleMessages.filter(msg => msg.includes('[error]'));
    if (errors.length > 0) {
      errors.forEach(msg => console.log('  ', msg));
    } else {
      console.log('   ✓ No console errors');
    }

    // Try to get computed styles of text elements
    console.log('\n6. Checking text contrast:');
    const titleColor = await page.$eval('h1, h2', el => window.getComputedStyle(el).color).catch(() => null);
    const selectPageColor = await page.$eval('label:has-text("Select Page")', el => window.getComputedStyle(el).color).catch(() => null);
    console.log('   Title color:', titleColor);
    console.log('   Select Page label color:', selectPageColor);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await page.screenshot({ path: 'screenshots/admin-error.png' });
  } finally {
    console.log('\n7. Keeping browser open for 5 seconds...');
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

diagnose().catch(console.error);
