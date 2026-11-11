import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:4180';
const ADMIN_EMAIL = 'admin@sentivra.com';
const ADMIN_PASSWORD = 'admin123';

async function testSaveBar() {
  console.log('🧪 Testing SaveBar Implementation\n');
  
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  
  // Test with reduced motion
  console.log('=== TEST WITH REDUCED MOTION ===\n');
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    reducedMotion: 'reduce'
  });
  const page = await context.newPage();
  
  try {
    // Login
    console.log('1. Logging in...');
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/**', { timeout: 10000 });
    console.log('   ✅ Logged in\n');
    
    // Test Settings page
    console.log('2. Testing Site Settings Page...');
    await page.goto(`${BASE_URL}/admin/settings`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Check for SaveBar before editing
    console.log('   → Checking SaveBar before edit...');
    let saveBar = await page.$('[class*="fixed bottom-0"]');
    if (saveBar) {
      console.log('   ✅ SaveBar found in DOM');
      const hasChangesText = await page.textContent('text=/Save bar will appear here/');
      if (hasChangesText) {
        console.log('   ✅ Shows "Save bar will appear here" (disabled state)');
      }
    } else {
      console.log('   ❌ SaveBar not found');
    }
    
    await page.screenshot({ path: 'savebar-before-edit.png', fullPage: true });
    
    // Edit a field
    console.log('\n3. Editing field...');
    const field = await page.$('input[name="site_name"]');
    if (field) {
      await field.fill('Test Value Changed');
      console.log('   ✅ Field edited');
      await page.waitForTimeout(1000); // Wait for dirty detection
    }
    
    // Check if SaveBar becomes active
    console.log('\n4. Checking SaveBar after edit...');
    const unsavedText = await page.textContent('text=/Unsaved changes/');
    if (unsavedText) {
      console.log('   ✅ Shows "Unsaved changes" indicator');
    } else {
      console.log('   ❌ No "Unsaved changes" indicator');
    }
    
    const saveButton = await page.$('button:has-text("Save changes")');
    if (saveButton) {
      console.log('   ✅ Save button visible in sticky bar');
      const isVisible = await saveButton.isVisible();
      console.log(`   ✅ Button isVisible: ${isVisible}`);
      
      const box = await saveButton.boundingBox();
      if (box) {
        console.log(`   ✅ Position: y=${Math.round(box.y)} (should be near bottom: ${page.viewportSize().height})`);
      }
    } else {
      console.log('   ❌ Save button not found in sticky bar');
    }
    
    await page.screenshot({ path: 'savebar-after-edit.png', fullPage: true });
    
    // Test Ctrl+S
    console.log('\n5. Testing Ctrl+S shortcut...');
    await page.keyboard.press('Control+KeyS');
    await page.waitForTimeout(2000);
    
    const savedToast = await page.$('text=/saved/i');
    if (savedToast) {
      console.log('   ✅ Save triggered by Ctrl+S');
    } else {
      console.log('   ⚠️  Save may have triggered (check manually)');
    }
    
    await page.screenshot({ path: 'savebar-after-save.png', fullPage: true });
    
    // Edit again and test discard
    console.log('\n6. Testing Discard button...');
    await page.fill('input[name="site_name"]', 'Another Change');
    await page.waitForTimeout(500);
    
    const discardButton = await page.$('button:has-text("Discard")');
    if (discardButton) {
      console.log('   ✅ Discard button found');
      await discardButton.click();
      await page.waitForTimeout(500);
      
      const fieldValue = await page.inputValue('input[name="site_name"]');
      console.log(`   ✅ Field value after discard: "${fieldValue}"`);
    }
    
    await page.screenshot({ path: 'savebar-after-discard.png', fullPage: true });
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await page.screenshot({ path: 'savebar-error.png', fullPage: true });
  } finally {
    await context.close();
  }
  
  await browser.close();
  console.log('\n✅ Test complete. Check screenshots.');
}

testSaveBar().catch(console.error);
