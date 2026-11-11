import { chromium } from 'playwright';

const routes = [
  { path: '/', name: 'Home' },
  { path: '/services', name: 'Services' },
  { path: '/our-work', name: 'Our Work' },
  { path: '/mockups', name: 'Mockups' },
  { path: '/about', name: 'About' },
  { path: '/contact', name: 'Contact' },
];

(async () => {
  console.log('\n🚀 PRODUCTION BUILD SMOKE TEST\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const results = { passed: 0, failed: 0, errors: [] };

  // Collect console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Filter out React Error #310 - that's what we're testing for
      if (text.includes('Minified React error #310') || text.includes('rendered more hooks')) {
        consoleErrors.push({ route: currentRoute, error: text });
      }
    }
  });

  let currentRoute = '';

  for (const route of routes) {
    currentRoute = route.name;
    console.log(`\n📍 Testing: ${route.name} (${route.path})`);
    console.log('─'.repeat(50));

    try {
      await page.goto(`http://localhost:4173${route.path}`, { 
        waitUntil: 'networkidle',
        timeout: 15000 
      });
      
      await page.waitForTimeout(2000);

      // Check for ErrorBoundary fallback
      const errorBoundary = await page.locator('text=/Something went wrong|Error/i').first();
      const errorCount = await errorBoundary.count();

      if (errorCount > 0) {
        const errorText = await errorBoundary.textContent();
        console.log(`❌ FAILED: ErrorBoundary detected`);
        console.log(`   Message: ${errorText}`);
        results.failed++;
        results.errors.push(`${route.name}: ErrorBoundary fallback shown`);
      } else {
        console.log(`✅ PASSED: No ErrorBoundary fallback`);
        results.passed++;
      }

      // Take screenshot
      await page.screenshot({ 
        path: `test-${route.name.toLowerCase().replace(/\s/g, '-')}.png`,
        fullPage: false 
      });

    } catch (error) {
      console.log(`❌ FAILED: ${error.message}`);
      results.failed++;
      results.errors.push(`${route.name}: ${error.message}`);
    }
  }

  // Check for React #310 errors
  if (consoleErrors.length > 0) {
    console.log(`\n❌ CONSOLE ERRORS DETECTED:`);
    consoleErrors.forEach(({ route, error }) => {
      console.log(`   ${route}: ${error.slice(0, 300)}`); // Show more
    });
    });
    results.failed += consoleErrors.length;
    results.errors.push(...consoleErrors.map(e => `${e.route}: React error in console`));
  }

  await browser.close();

  // Summary
  console.log('\n\n═══════════════════════════════════════════════════');
  console.log('              SMOKE TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════\n');
  console.log(`✅ PASSED: ${results.passed} routes`);
  console.log(`❌ FAILED: ${results.failed} routes`);
  
  if (results.failed > 0) {
    console.log('\n⚠️  FAILED TESTS:');
    results.errors.forEach((error, i) => {
      console.log(`   ${i + 1}. ${error}`);
    });
  }

  console.log('\n═══════════════════════════════════════════════════\n');

  process.exit(results.failed > 0 ? 1 : 0);
})();
