import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:4180';

async function diagnose() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'light',
    reducedMotion: 'reduce'
  });
  
  const page = await context.newPage();

  // Capture console
  const consoleMessages = [];
  page.on('console', msg => consoleMessages.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', error => consoleMessages.push(`[ERROR] ${error.message}`));

  try {
    console.log('1. Loading admin/page-content...');
    await page.goto(`${BASE_URL}/admin/page-content`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'screenshots/admin-pagecontent-light.png', fullPage: true });
    console.log('   ✓ Screenshot saved');

    // Check for error messages
    const errorText = await page.textContent('body').catch(() => '');
    if (errorText.includes('404') || errorText.includes('PGRST') || errorText.includes('not found')) {
      console.log('   ✗ Found database error in page');
    }

    // Print console
    console.log('\n2. Console messages:');
    consoleMessages.forEach(msg => console.log('  ', msg));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

diagnose().catch(console.error);
