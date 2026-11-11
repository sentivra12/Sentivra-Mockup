import { chromium } from 'playwright';

async function diagnose() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  const errors = [];
  const warnings = [];
  const logs = [];
  
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      errors.push(text);
      console.log(`❌ ERROR: ${text}`);
    } else if (msg.type() === 'warning') {
      warnings.push(text);
      console.log(`⚠️  WARNING: ${text}`);
    } else if (text.includes('Loading') || text.includes('Error') || text.includes('Failed')) {
      logs.push(text);
      console.log(`📝 LOG: ${text}`);
    }
  });
  
  page.on('pageerror', error => {
    console.log(`💥 PAGE ERROR: ${error.message}`);
    errors.push(error.message);
  });
  
  console.log('🔍 Loading page and monitoring console...\n');
  await page.goto('http://localhost:4173/services', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  
  // Check React Query state
  const queryState = await page.evaluate(() => {
    // Try to access React Query devtools state
    return {
      hasReactQuery: typeof window.__REACT_QUERY_DEVTOOLS__ !== 'undefined',
      // Check if the page has any error text
      pageText: document.body.textContent.substring(0, 500)
    };
  });
  
  console.log('\n📊 Summary:');
  console.log(`Errors: ${errors.length}`);
  console.log(`Warnings: ${warnings.length}`);
  console.log(`Logs: ${logs.length}`);
  
  if (errors.length > 0) {
    console.log('\n❌ Errors found:');
    errors.forEach((e, i) => console.log(`  ${i + 1}. ${e}`));
  }
  
  console.log('\n💡 Page text snippet:');
  console.log(queryState.pageText.substring(0, 200));
  
  console.log('\n⏳ Keeping browser open for 10 seconds...');
  await page.waitForTimeout(10000);
  
  await browser.close();
}

diagnose().catch(console.error);
