import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:4180';
const ADMIN_EMAIL = 'admin@sentivra.com';
const ADMIN_PASSWORD = 'admin123';

async function quickTest() {
  console.log('Starting quick diagnostic...\n');
  
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  
  // Test with reduced motion first
  console.log('=== TEST 1: REDUCED MOTION (reduce) ===\n');
  const context1 = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    reducedMotion: 'reduce'
  });
  const page1 = await context1.newPage();
  
  try {
    // Login
    console.log('Logging in...');
    await page1.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' });
    await page1.fill('input[type="email"]', ADMIN_EMAIL);
    await page1.fill('input[type="password"]', ADMIN_PASSWORD);
    await page1.click('button[type="submit"]');
    await page1.waitForURL('**/admin/**', { timeout: 10000 });
    console.log('✅ Logged in\n');
    
    // Test Settings page
    console.log('📋 Testing Site Settings Page...');
    await page1.goto(`${BASE_URL}/admin/settings`, { waitUntil: 'networkidle' });
    await page1.waitForTimeout(1000);
    
    // Edit a field
    const field = await page1.$('input[name="site_name"]');
    if (field) {
      await field.fill('Test Value');
      console.log('  ✓ Field edited');
      await page1.waitForTimeout(500);
    }
    
    // Look for save button
    const saveButton = await page1.$('button[type="submit"]');
    if (saveButton) {
      console.log('  ✓ Save button found in DOM');
      
      const isVisible = await saveButton.isVisible();
      console.log(`  ✓ Visible: ${isVisible}`);
      
      const box = await saveButton.boundingBox();
      if (box) {
        console.log(`  ✓ Position: x=${Math.round(box.x)}, y=${Math.round(box.y)}, w=${Math.round(box.width)}, h=${Math.round(box.height)}`);
        console.log(`  ✓ Viewport height: ${page1.viewportSize().height}`);
        console.log(`  ✓ Button bottom edge: ${Math.round(box.y + box.height)}`);
        if (box.y + box.height > page1.viewportSize().height) {
          console.log('  ⚠️  BUTTON IS BELOW VIEWPORT!');
        }
      }
      
      const styles = await saveButton.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          opacity: computed.opacity,
          display: computed.display,
          visibility: computed.visibility,
          transform: computed.transform,
          zIndex: computed.zIndex
        };
      });
      console.log('  ✓ Computed styles:', JSON.stringify(styles));
      
      if (styles.opacity === '0') {
        console.log('  ⚠️  OPACITY IS 0!');
      }
      if (styles.display === 'none') {
        console.log('  ⚠️  DISPLAY IS NONE!');
      }
    } else {
      console.log('  ❌ Save button NOT FOUND in DOM');
    }
    
    await page1.screenshot({ path: 'settings-reduced-motion.png', fullPage: true });
    console.log('  📸 Screenshot: settings-reduced-motion.png\n');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await context1.close();
  }
  
  // Test with animations
  console.log('\n=== TEST 2: NO REDUCED MOTION (no-preference) ===\n');
  const context2 = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    reducedMotion: 'no-preference'
  });
  const page2 = await context2.newPage();
  
  try {
    await page2.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' });
    await page2.fill('input[type="email"]', ADMIN_EMAIL);
    await page2.fill('input[type="password"]', ADMIN_PASSWORD);
    await page2.click('button[type="submit"]');
    await page2.waitForURL('**/admin/**');
    
    console.log('📋 Testing Site Settings Page...');
    await page2.goto(`${BASE_URL}/admin/settings`, { waitUntil: 'networkidle' });
    await page2.waitForTimeout(1000);
    
    const field = await page2.$('input[name="site_name"]');
    if (field) {
      await field.fill('Test Value 2');
      console.log('  ✓ Field edited');
      await page2.waitForTimeout(500);
    }
    
    const saveButton = await page2.$('button[type="submit"]');
    if (saveButton) {
      console.log('  ✓ Save button found');
      const isVisible = await saveButton.isVisible();
      console.log(`  ✓ Visible: ${isVisible}`);
      
      const styles = await saveButton.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          opacity: computed.opacity,
          transform: computed.transform
        };
      });
      console.log('  ✓ Styles:', JSON.stringify(styles));
    }
    
    await page2.screenshot({ path: 'settings-no-motion.png', fullPage: true });
    console.log('  📸 Screenshot: settings-no-motion.png\n');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await context2.close();
  }
  
  await browser.close();
  console.log('\n✅ Diagnosis complete. Check screenshots.');
}

quickTest().catch(console.error);
