import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const BASE_URL = 'http://localhost:4180';

// Test credentials - adjust if needed
const ADMIN_EMAIL = 'admin@sentivra.com';
const ADMIN_PASSWORD = 'admin123';

async function diagnoseAdminSave() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    // Test with reduced motion
    reducedMotion: 'reduce'
  });
  const page = await context.newPage();

  const results = {
    reducedMotionMode: 'reduce',
    screens: [],
    timestamp: new Date().toISOString()
  };

  console.log('🔍 Starting Admin Save Button Diagnosis with Reduced Motion...\n');

  try {
    // Login
    console.log('1. Logging in to Admin...');
    await page.goto(`${BASE_URL}/admin/login`);
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/admin/**', { timeout: 10000 });
    console.log('✅ Logged in successfully\n');

    // Test screens
    const screens = [
      { name: 'Site Settings', url: '/admin/settings', field: 'input[name="site_name"]', value: 'Sentivra Test' },
      { name: 'Hero Section', url: '/admin/hero', field: 'input[name="title"]', value: 'Test Hero' },
      { name: 'Services', url: '/admin/services', field: 'button:has-text("Add Service")', modalField: 'input[name="title_en"]', modalValue: 'Test Service' },
      { name: 'FAQs', url: '/admin/faqs', field: 'button:has-text("Add FAQ")', modalField: 'input[name="question"]', modalValue: 'Test Question' }
    ];

    for (const screen of screens) {
      console.log(`\n📝 Testing: ${screen.name}`);
      console.log(`   URL: ${screen.url}`);
      
      const screenResult = {
        name: screen.name,
        url: screen.url,
        saveButtonFound: false,
        saveButtonVisible: false,
        saveButtonPosition: null,
        saveButtonStyles: {},
        blockedBy: [],
        networkRequests: [],
        error: null
      };

      try {
        await page.goto(`${BASE_URL}${screen.url}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000); // Wait for animations

        // Check if it's a modal-based screen
        if (screen.field.startsWith('button')) {
          console.log('   → Modal-based screen, opening modal...');
          await page.click(screen.field);
          await page.waitForTimeout(500);
          
          // Edit modal field
          await page.fill(screen.modalField, screen.modalValue);
          await page.waitForTimeout(300);
        } else {
          // Direct form screen
          console.log('   → Direct form screen, editing field...');
          await page.fill(screen.field, screen.value);
          await page.waitForTimeout(300);
        }

        // Look for Save button
        const saveButtonSelectors = [
          'button[type="submit"]:has-text("Save")',
          'button:has-text("Save Settings")',
          'button:has-text("Save Changes")',
          'button:has-text("Update")',
          'button:has-text("Create")',
          '[class*="save"]button',
          '[data-testid="save-button"]'
        ];

        let saveButton = null;
        for (const selector of saveButtonSelectors) {
          try {
            const btn = await page.$(selector);
            if (btn) {
              saveButton = btn;
              screenResult.saveButtonFound = true;
              console.log(`   ✅ Save button found: ${selector}`);
              break;
            }
          } catch (e) {
            // Continue
          }
        }

        if (!saveButton) {
          console.log('   ❌ No Save button found with any selector');
          screenResult.error = 'Save button not found in DOM';
        } else {
          // Check visibility
          const isVisible = await saveButton.isVisible();
          screenResult.saveButtonVisible = isVisible;
          console.log(`   → Visible: ${isVisible}`);

          // Get position
          const box = await saveButton.boundingBox();
          if (box) {
            screenResult.saveButtonPosition = box;
            console.log(`   → Position: x=${box.x}, y=${box.y}, width=${box.width}, height=${box.height}`);
            
            const viewport = page.viewportSize();
            if (box.y + box.height > viewport.height) {
              console.log(`   ⚠️ Button is below viewport! (viewport height: ${viewport.height})`);
              screenResult.blockedBy.push('Below viewport');
            }
          }

          // Get computed styles
          const styles = await saveButton.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
              opacity: computed.opacity,
              display: computed.display,
              visibility: computed.visibility,
              transform: computed.transform,
              zIndex: computed.zIndex,
              position: computed.position,
              pointerEvents: computed.pointerEvents
            };
          });
          screenResult.saveButtonStyles = styles;
          console.log(`   → Styles:`, JSON.stringify(styles, null, 2));

          // Check for covering elements
          if (isVisible && box) {
            const centerX = box.x + box.width / 2;
            const centerY = box.y + box.height / 2;
            
            const elementAtCenter = await page.evaluateHandle(
              ({ x, y }) => document.elementFromPoint(x, y),
              { x: centerX, y: centerY }
            );
            
            const isSaveButton = await elementAtCenter.evaluate(
              (el, btn) => el === btn || el.contains(btn) || btn.contains(el),
              saveButton
            );
            
            if (!isSaveButton) {
              const coveringTag = await elementAtCenter.evaluate(el => el.tagName);
              const coveringClass = await elementAtCenter.evaluate(el => el.className);
              console.log(`   ⚠️ Button is covered by: ${coveringTag}.${coveringClass}`);
              screenResult.blockedBy.push(`Covered by ${coveringTag}.${coveringClass}`);
            }
          }

          // Try to click and monitor network
          if (isVisible) {
            console.log('   → Attempting to click Save button...');
            
            // Setup request monitoring
            page.on('request', request => {
              if (request.url().includes('supabase')) {
                screenResult.networkRequests.push({
                  method: request.method(),
                  url: request.url(),
                  postData: request.postData()
                });
              }
            });

            await saveButton.click();
            await page.waitForTimeout(2000);
            
            console.log(`   → Network requests: ${screenResult.networkRequests.length}`);
            screenResult.networkRequests.forEach(req => {
              console.log(`      ${req.method} ${req.url}`);
            });
          }
        }

        // Take screenshot
        await page.screenshot({ path: `screenshot-${screen.name.replace(/\s+/g, '-')}.png`, fullPage: true });
        console.log(`   📸 Screenshot saved`);

      } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
        screenResult.error = error.message;
      }

      results.screens.push(screenResult);
    }

    // Test with no-preference motion
    console.log('\n\n🔄 Testing with reducedMotion: no-preference...\n');
    await context.close();
    
    const contextNoMotion = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      reducedMotion: 'no-preference'
    });
    const pageNoMotion = await contextNoMotion.newPage();
    
    // Quick test on Settings page
    console.log('Testing Settings page with animations enabled...');
    await pageNoMotion.goto(`${BASE_URL}/admin/login`);
    await pageNoMotion.fill('input[type="email"]', ADMIN_EMAIL);
    await pageNoMotion.fill('input[type="password"]', ADMIN_PASSWORD);
    await pageNoMotion.click('button[type="submit"]');
    await pageNoMotion.waitForURL('**/admin/**');
    
    await pageNoMotion.goto(`${BASE_URL}/admin/settings`);
    await pageNoMotion.waitForLoadState('networkidle');
    await pageNoMotion.fill('input[name="site_name"]', 'Test with animations');
    await pageNoMotion.waitForTimeout(500);
    
    const saveBtn = await pageNoMotion.$('button[type="submit"]:has-text("Save")');
    if (saveBtn) {
      const isVisible = await saveBtn.isVisible();
      const styles = await saveBtn.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          opacity: computed.opacity,
          transform: computed.transform,
          display: computed.display
        };
      });
      console.log(`   → With animations - Visible: ${isVisible}, Styles:`, styles);
      results.noMotionTest = { visible: isVisible, styles };
    }
    
    await pageNoMotion.screenshot({ path: 'screenshot-no-motion-settings.png', fullPage: true });
    await contextNoMotion.close();

  } catch (error) {
    console.error('Fatal error:', error);
    results.fatalError = error.message;
  } finally {
    await browser.close();
  }

  // Save results
  writeFileSync('admin-save-diagnosis.json', JSON.stringify(results, null, 2));
  console.log('\n\n📊 Results saved to admin-save-diagnosis.json');
  console.log('\n=== DIAGNOSIS SUMMARY ===');
  results.screens.forEach(screen => {
    console.log(`\n${screen.name}:`);
    console.log(`  - Save button found: ${screen.saveButtonFound}`);
    console.log(`  - Save button visible: ${screen.saveButtonVisible}`);
    console.log(`  - Blocked by: ${screen.blockedBy.length > 0 ? screen.blockedBy.join(', ') : 'Nothing'}`);
    console.log(`  - Error: ${screen.error || 'None'}`);
  });
}

diagnoseAdminSave().catch(console.error);
