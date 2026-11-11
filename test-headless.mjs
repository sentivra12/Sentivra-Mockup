import { chromium } from 'playwright';

async function testApp() {
  console.log('🚀 Starting headless browser test...\n');
  
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Collect console messages
  const consoleMessages = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push({ type: msg.type(), text });
    console.log(`[CONSOLE ${msg.type().toUpperCase()}]`, text);
  });

  // Collect page errors
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error.message);
    console.error('❌ [PAGE ERROR]', error.message);
  });

  // Collect unhandled rejections
  const rejections = [];
  page.on('console', msg => {
    if (msg.type() === 'error' && msg.text().includes('unhandled')) {
      rejections.push(msg.text());
    }
  });

  // Collect failed network requests
  const failedRequests = [];
  page.on('response', response => {
    if (!response.ok() && response.url().includes('localhost')) {
      failedRequests.push({ url: response.url(), status: response.status() });
      console.warn(`⚠️  [HTTP ${response.status()}]`, response.url());
    }
  });

  try {
    console.log('📍 Navigating to http://localhost:5174/\n');
    await page.goto('http://localhost:5174/', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });

    // Wait a moment for React to render
    await page.waitForTimeout(2000);

    // Check if app mounted
    const appMounted = await page.evaluate(() => window.__APP_MOUNTED__);
    console.log(`\n✅ window.__APP_MOUNTED__: ${appMounted}`);

    // Get #root state
    const rootState = await page.evaluate(() => {
      const root = document.getElementById('root');
      return {
        exists: !!root,
        childrenCount: root?.children?.length || 0,
        innerHTML: root?.innerHTML?.substring(0, 500) || '',
        innerHTMLLength: root?.innerHTML?.length || 0
      };
    });

    console.log(`\n📦 #root state:`);
    console.log(`  - Exists: ${rootState.exists}`);
    console.log(`  - Children count: ${rootState.childrenCount}`);
    console.log(`  - innerHTML length: ${rootState.innerHTMLLength} chars`);
    console.log(`  - First 500 chars: ${rootState.innerHTML}`);

    // Get body/root computed styles
    const styles = await page.evaluate(() => {
      const body = document.body;
      const root = document.getElementById('root');
      const bodyStyles = window.getComputedStyle(body);
      const rootStyles = root ? window.getComputedStyle(root) : null;
      
      return {
        body: {
          display: bodyStyles.display,
          visibility: bodyStyles.visibility,
          opacity: bodyStyles.opacity,
          height: bodyStyles.height,
          backgroundColor: bodyStyles.backgroundColor
        },
        root: rootStyles ? {
          display: rootStyles.display,
          visibility: rootStyles.visibility,
          opacity: rootStyles.opacity,
          height: rootStyles.height,
          color: rootStyles.color
        } : null
      };
    });

    console.log(`\n🎨 Computed styles:`);
    console.log('  body:', JSON.stringify(styles.body, null, 2));
    console.log('  #root:', JSON.stringify(styles.root, null, 2));

    // Check for error boundary
    const hasErrorBoundary = await page.evaluate(() => {
      return !!window.__LAST_ERROR__;
    });
    
    if (hasErrorBoundary) {
      const lastError = await page.evaluate(() => window.__LAST_ERROR__);
      console.log('\n❌ ErrorBoundary caught error:');
      console.log(JSON.stringify(lastError, null, 2));
    } else {
      console.log('\n✅ No ErrorBoundary errors');
    }

    // Take screenshot
    await page.screenshot({ path: 'screenshot-headless.png', fullPage: true });
    console.log('\n📸 Screenshot saved to screenshot-headless.png');

    // Summary
    console.log(`\n📊 SUMMARY:`);
    console.log(`  - Console messages: ${consoleMessages.length}`);
    console.log(`  - Page errors: ${pageErrors.length}`);
    console.log(`  - Failed requests: ${failedRequests.length}`);
    console.log(`  - App mounted: ${appMounted}`);
    console.log(`  - Root has content: ${rootState.innerHTMLLength > 1000}`);

    if (pageErrors.length > 0) {
      console.log('\n❌ PAGE ERRORS:');
      pageErrors.forEach(err => console.log('  -', err));
    }

    if (failedRequests.length > 0) {
      console.log('\n⚠️  FAILED REQUESTS:');
      failedRequests.forEach(req => console.log(`  - ${req.status} ${req.url}`));
    }

  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    await page.screenshot({ path: 'screenshot-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testApp().catch(console.error);
