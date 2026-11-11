import { chromium } from 'playwright';
import fs from 'fs';

const BASE_URL = 'http://localhost:4180';
const ADMIN_EMAIL = 'admin@sentivra.com';
const ADMIN_PASSWORD = 'admin123';

async function getButtonStyles(page, selector, description) {
  const button = await page.locator(selector).first();
  const exists = await button.count() > 0;
  
  if (!exists) {
    return { description, exists: false, error: 'Button not found' };
  }

  const isVisible = await button.isVisible();
  const styles = await button.evaluate(el => {
    const computed = window.getComputedStyle(el);
    return {
      color: computed.color,
      backgroundColor: computed.backgroundColor,
      borderColor: computed.borderColor,
      opacity: computed.opacity,
      visibility: computed.visibility,
      display: computed.display,
      transform: computed.transform,
      classes: el.className
    };
  });

  // Get hover styles
  await button.hover();
  await page.waitForTimeout(200);
  const hoverStyles = await button.evaluate(el => {
    const computed = window.getComputedStyle(el);
    return {
      color: computed.color,
      backgroundColor: computed.backgroundColor,
      borderColor: computed.borderColor,
      opacity: computed.opacity,
      visibility: computed.visibility,
      display: computed.display,
      transform: computed.transform
    };
  });

  return {
    description,
    exists: true,
    isVisible,
    selector,
    normal: styles,
    hover: hoverStyles
  };
}

async function diagnose() {
  const report = [];
  
  for (const reducedMotion of ['reduce', 'no-preference']) {
    for (const colorScheme of ['light', 'dark']) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`Testing: ${colorScheme} mode, reducedMotion: ${reducedMotion}`);
      console.log('='.repeat(80));

      const browser = await chromium.launch({ 
        headless: false,
        args: ['--force-prefers-reduced-motion']
      });
      
      const context = await browser.newContext({ 
        viewport: { width: 1440, height: 900 },
        colorScheme: colorScheme,
        reducedMotion: reducedMotion
      });
      
      const page = await context.newPage();

      // Capture console
      page.on('console', msg => {
        const text = msg.text();
        if (text.includes('Reduced Motion') || text.includes('theme')) {
          console.log(`[BROWSER] ${text}`);
        }
      });

      try {
        // ===== LOGIN PAGE =====
        console.log('\n--- /admin/login ---');
        await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);

        const htmlClass = await page.evaluate(() => document.documentElement.className);
        const htmlDataTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
        console.log(`<html> class="${htmlClass}" data-theme="${htmlDataTheme}"`);

        const loginButton = await getButtonStyles(
          page, 
          'button[type="submit"]', 
          'Login button'
        );
        report.push({ page: '/admin/login', colorScheme, reducedMotion, ...loginButton });
        
        console.log('\nLogin Button:');
        console.log('  Exists:', loginButton.exists);
        console.log('  Visible:', loginButton.isVisible);
        console.log('  Classes:', loginButton.normal?.classes);
        console.log('  Normal state:');
        console.log('    color:', loginButton.normal?.color);
        console.log('    background:', loginButton.normal?.backgroundColor);
        console.log('    opacity:', loginButton.normal?.opacity);
        console.log('  Hover state:');
        console.log('    color:', loginButton.hover?.color);
        console.log('    background:', loginButton.hover?.backgroundColor);
        console.log('    opacity:', loginButton.hover?.opacity);

        await page.screenshot({ 
          path: `screenshots/login-${colorScheme}-${reducedMotion}.png`,
          fullPage: true 
        });

        // Login
        await page.fill('input[type="email"]', ADMIN_EMAIL);
        await page.fill('input[type="password"]', ADMIN_PASSWORD);
        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);

        // ===== SITE SETTINGS =====
        console.log('\n--- /admin/settings ---');
        await page.goto(`${BASE_URL}/admin/settings`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1500);

        const htmlClass2 = await page.evaluate(() => document.documentElement.className);
        console.log(`<html> class="${htmlClass2}"`);

        const saveButton = await getButtonStyles(
          page,
          'button:has-text("Save")',
          'Save changes button'
        );
        report.push({ page: '/admin/settings', colorScheme, reducedMotion, ...saveButton });

        console.log('\nSave Button:');
        console.log('  Exists:', saveButton.exists);
        console.log('  Visible:', saveButton.isVisible);
        console.log('  Classes:', saveButton.normal?.classes);
        console.log('  Normal state:');
        console.log('    color:', saveButton.normal?.color);
        console.log('    background:', saveButton.normal?.backgroundColor);
        console.log('    opacity:', saveButton.normal?.opacity);
        console.log('  Hover state:');
        console.log('    color:', saveButton.hover?.color);
        console.log('    background:', saveButton.hover?.backgroundColor);
        console.log('    opacity:', saveButton.hover?.opacity);

        await page.screenshot({ 
          path: `screenshots/settings-${colorScheme}-${reducedMotion}.png`,
          fullPage: true 
        });

        // ===== HERO =====
        console.log('\n--- /admin/hero ---');
        await page.goto(`${BASE_URL}/admin/hero`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1500);

        const heroSaveButton = await getButtonStyles(
          page,
          'button:has-text("Save")',
          'Hero Save button'
        );
        report.push({ page: '/admin/hero', colorScheme, reducedMotion, ...heroSaveButton });

        console.log('\nHero Save Button:');
        console.log('  Exists:', heroSaveButton.exists);
        console.log('  Visible:', heroSaveButton.isVisible);
        console.log('  Classes:', heroSaveButton.normal?.classes);
        console.log('  Normal state:');
        console.log('    color:', heroSaveButton.normal?.color);
        console.log('    background:', heroSaveButton.normal?.backgroundColor);
        console.log('    opacity:', heroSaveButton.normal?.opacity);

        await page.screenshot({ 
          path: `screenshots/hero-${colorScheme}-${reducedMotion}.png`,
          fullPage: true 
        });

        // ===== MOCKUPS =====
        console.log('\n--- /admin/mockups ---');
        await page.goto(`${BASE_URL}/admin/mockups`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1500);

        const addButton = await getButtonStyles(
          page,
          'button:has-text("Add")',
          'Add Mockup button'
        );
        report.push({ page: '/admin/mockups', colorScheme, reducedMotion, ...addButton });

        console.log('\nAdd Mockup Button:');
        console.log('  Exists:', addButton.exists);
        console.log('  Visible:', addButton.isVisible);
        console.log('  Classes:', addButton.normal?.classes);
        console.log('  Normal state:');
        console.log('    color:', addButton.normal?.color);
        console.log('    background:', addButton.normal?.backgroundColor);
        console.log('    opacity:', addButton.normal?.opacity);

        await page.screenshot({ 
          path: `screenshots/mockups-${colorScheme}-${reducedMotion}.png`,
          fullPage: true 
        });

      } catch (error) {
        console.error('Error:', error.message);
        report.push({ page: 'error', colorScheme, reducedMotion, error: error.message });
      } finally {
        await browser.close();
      }
    }
  }

  // Write report
  fs.writeFileSync('button-diagnosis.json', JSON.stringify(report, null, 2));
  console.log('\n\n✅ Report written to button-diagnosis.json');
  console.log('📸 Screenshots saved to screenshots/');
}

diagnose().catch(console.error);
