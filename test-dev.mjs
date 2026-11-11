import { chromium } from 'playwright';

(async () => {
  console.log('\n🔍 DEV ERROR DETECTION\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Collect ALL console messages
  page.on('console', msg => {
    console.log(`[${msg.type()}] ${msg.text()}`);
  });

  // Collect page errors
  page.on('pageerror', error => {
    console.log(`\n❌ PAGE ERROR:\n${error.toString()}\n${error.stack}\n`);
  });

  try {
    await page.goto(`http://localhost:5173/`, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(5000);
    
    console.log('\n✅ Page loaded, check console output above for hook errors\n');
  } catch (error) {
    console.log(`\n❌ Navigation failed: ${error.message}\n`);
  }

  // Keep browser open for manual inspection
  console.log('Browser will close in 30 seconds...\n');
  await page.waitForTimeout(30000);
  await browser.close();
})();
