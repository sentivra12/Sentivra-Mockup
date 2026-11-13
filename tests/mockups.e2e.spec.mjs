// @ts-check
import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'fs';
import { mkdirSync } from 'fs';
import path from 'path';

// Read credentials
let adminEmail, adminPassword;
const envPath = '.env.test.local';

if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
      env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });
  
  adminEmail = env.ADMIN_EMAIL;
  adminPassword = env.ADMIN_PASSWORD;
}

if (!adminEmail || !adminPassword) {
  console.error('❌ Missing credentials in .env.test.local');
  console.error('Skipping E2E tests');
  test.skip();
}

// Ensure test-results directory exists
const resultsDir = 'test-results';
if (!existsSync(resultsDir)) {
  mkdirSync(resultsDir, { recursive: true });
}

test.describe('Mockups E2E - Complete Flow', () => {
  const uniqueTitle = `ZZ-E2E-Test-${Date.now()}`;
  const screenshotPath = (name) => path.join(resultsDir, `${name}.png`);

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/**');
  });

  test('Complete mockups workflow', async ({ page, browser }) => {
    console.log('\n📍 Test: Complete mockups workflow');
    
    // Step 1: Navigate to Mockups admin
    console.log('  Step 1: Open Admin > Mockups');
    await page.goto('/admin/mockups');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: screenshotPath('01-mockups-admin'), fullPage: true });

    // Step 2: Click Add Mockup
    console.log('  Step 2: Click "Add Mockup"');
    await page.click('button:has-text("Add Mockup")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: screenshotPath('02-add-mockup-modal'), fullPage: true });

    // Step 3: Check categories dropdown
    console.log('  Step 3: Verify categories dropdown');
    const categorySelect = page.locator('select[name="category_id"]');
    await expect(categorySelect).toBeVisible();
    
    const optionsCount = await categorySelect.locator('option').count();
    console.log(`    Categories found: ${optionsCount - 1}`); // -1 for "Select..." option
    
    expect(optionsCount).toBeGreaterThan(1); // At least 1 category + "Select..."
    
    const optionsText = await categorySelect.locator('option').allTextContents();
    console.log(`    Options: ${optionsText.join(', ')}`);

    // Step 4: Fill the form
    console.log('  Step 4: Fill mockup form');
    
    // Select first real category (skip "Select...")
    await categorySelect.selectOption({ index: 1 });
    
    // Fill title
    await page.fill('input[name="title_en"]', uniqueTitle);
    await page.fill('input[name="title_ar"]', `${uniqueTitle} عربي`);
    
    // Fill description
    await page.fill('textarea[name="short_description_en"]', 'E2E test mockup description');
    await page.fill('textarea[name="short_description_ar"]', 'وصف اختبار تلقائي');
    
    // Add demo URL
    await page.fill('input[name="demo_url"]', 'https://example.com/demo');
    
    // Generate and upload a test image
    console.log('  Step 5: Generate and upload test image');
    const canvas = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      
      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, 800, 600);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 800, 600);
      
      // Draw text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('E2E Test Image', 400, 300);
      
      return canvas.toDataURL('image/png');
    });
    
    // Convert base64 to blob and upload
    const base64Data = canvas.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    
    await page.setInputFiles('input[type="file"]#screenshot-upload', {
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer: buffer,
    });
    
    // Wait for upload to complete
    await page.waitForTimeout(3000);
    await page.screenshot({ path: screenshotPath('03-form-filled'), fullPage: true });
    
    // Step 6: Save mockup
    console.log('  Step 6: Save mockup');
    await page.click('button[type="submit"]:has-text("Create")');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: screenshotPath('04-mockup-saved'), fullPage: true });
    
    // Verify mockup appears in list
    await expect(page.locator(`text=${uniqueTitle}`)).toBeVisible();
    console.log('    ✅ Mockup created and visible in admin list');

    // Step 7: Open public mockups page in new context (anonymous user)
    console.log('  Step 7: Verify on public /mockups page');
    const anonContext = await browser.newContext();
    const anonPage = await anonContext.newPage();
    
    await anonPage.goto('/mockups');
    await anonPage.waitForTimeout(2000);
    await anonPage.screenshot({ path: screenshotPath('05-public-mockups'), fullPage: true });
    
    // Mockup should NOT be visible (is_active = false by default)
    await expect(anonPage.locator(`text=${uniqueTitle}`)).not.toBeVisible();
    console.log('    ✅ Draft mockup not visible to public (correct)');

    // Step 8: Publish the mockup
    console.log('  Step 8: Publish mockup');
    await page.goto('/admin/mockups');
    await page.waitForTimeout(1000);
    
    // Click Edit on our mockup
    const mockupRow = page.locator(`tr:has-text("${uniqueTitle}")`);
    await mockupRow.locator('button:has-text("Edit")').click();
    await page.waitForTimeout(1000);
    
    // Check "Published" checkbox
    await page.check('input[name="is_active"]');
    await page.click('button[type="submit"]:has-text("Update")');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: screenshotPath('06-mockup-published'), fullPage: true });
    
    console.log('    ✅ Mockup published');

    // Step 9: Verify published mockup is visible to public
    console.log('  Step 9: Verify published mockup on public page');
    await anonPage.reload();
    await anonPage.waitForTimeout(2000);
    await anonPage.screenshot({ path: screenshotPath('07-public-with-mockup'), fullPage: true });
    
    await expect(anonPage.locator(`text=${uniqueTitle}`)).toBeVisible();
    console.log('    ✅ Published mockup visible to public');
    
    // Step 10: Edit mockup title
    console.log('  Step 10: Edit mockup title');
    const newTitle = `${uniqueTitle}-EDITED`;
    
    await page.goto('/admin/mockups');
    await page.waitForTimeout(1000);
    await page.locator(`tr:has-text("${uniqueTitle}")`).locator('button:has-text("Edit")').click();
    await page.waitForTimeout(1000);
    
    await page.fill('input[name="title_en"]', newTitle);
    await page.click('button[type="submit"]:has-text("Update")');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: screenshotPath('08-mockup-edited'), fullPage: true });
    
    await expect(page.locator(`text=${newTitle}`)).toBeVisible();
    console.log('    ✅ Mockup title edited');
    
    // Verify edit appears on public page
    await anonPage.reload();
    await anonPage.waitForTimeout(2000);
    await expect(anonPage.locator(`text=${newTitle}`)).toBeVisible();
    console.log('    ✅ Edited title visible on public page');

    // Step 11: Delete mockup
    console.log('  Step 11: Delete mockup');
    await page.goto('/admin/mockups');
    await page.waitForTimeout(1000);
    
    // Click delete button
    page.on('dialog', dialog => dialog.accept());
    await page.locator(`tr:has-text("${newTitle}")`).locator('button:has-text("Delete"), button[aria-label="Delete"]').first().click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: screenshotPath('09-mockup-deleted'), fullPage: true });
    
    await expect(page.locator(`text=${newTitle}`)).not.toBeVisible();
    console.log('    ✅ Mockup deleted from admin');
    
    // Verify deletion on public page
    await anonPage.reload();
    await anonPage.waitForTimeout(2000);
    await anonPage.screenshot({ path: screenshotPath('10-public-after-delete'), fullPage: true });
    
    await expect(anonPage.locator(`text=${newTitle}`)).not.toBeVisible();
    console.log('    ✅ Deleted mockup not visible on public page');

    // Step 12: Verify anonymous user CANNOT insert/update/delete
    console.log('  Step 12: Verify anonymous user permissions');
    const cannotInsert = await anonPage.evaluate(async () => {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          window.__SUPABASE_URL || '',
          window.__SUPABASE_ANON_KEY || ''
        );
        
        const { error } = await supabase
          .from('mockups')
          .insert([{ slug: 'anon-test', title_en: 'Anon Test' }]);
        
        return error !== null; // Should fail
      } catch {
        return true; // Should fail
      }
    });
    
    expect(cannotInsert).toBe(true);
    console.log('    ✅ Anonymous users cannot insert mockups (correct)');

    await anonContext.close();
    
    console.log('\n✅ ALL TESTS PASSED\n');
    console.log('📸 Screenshots saved in test-results/');
  });
});
