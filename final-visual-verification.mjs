import { chromium } from 'playwright';

async function finalVerification() {
  const browser = await chromium.launch({ headless: false }); // Show browser
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  console.log('🔍 FINAL VISUAL VERIFICATION\n');
  console.log('Opening browser to show fixed service cards...\n');
  
  await page.goto('http://localhost:4174/services', { waitUntil: 'networkidle' });
  
  console.log('✓ Page loaded');
  console.log('✓ Scroll to services grid...\n');
  
  // Scroll to services grid
  await page.evaluate(() => {
    document.querySelector('#services-grid')?.scrollIntoView({ behavior: 'smooth' });
  });
  
  await page.waitForTimeout(2000);
  
  // Hover over first card to show animations
  const firstCard = await page.$('#services-grid a');
  if (firstCard) {
    await firstCard.hover();
    console.log('✓ Hovering first card (Web Development)');
    await page.waitForTimeout(1500);
  }
  
  // Take full page screenshot
  await page.screenshot({ 
    path: 'FINAL-services-grid-light.png', 
    fullPage: true 
  });
  console.log('📸 Screenshot saved: FINAL-services-grid-light.png\n');
  
  // Switch to dark mode
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
  });
  
  await page.waitForTimeout(1000);
  
  // Hover second card
  const secondCard = await page.$('#services-grid a:nth-child(2)');
  if (secondCard) {
    await secondCard.hover();
    console.log('✓ Dark mode enabled');
    console.log('✓ Hovering second card (Web Application Development)');
    await page.waitForTimeout(1500);
  }
  
  await page.screenshot({ 
    path: 'FINAL-services-grid-dark.png', 
    fullPage: true 
  });
  console.log('📸 Screenshot saved: FINAL-services-grid-dark.png\n');
  
  // Test mobile view
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
  });
  
  await page.waitForTimeout(1000);
  
  await page.evaluate(() => {
    document.querySelector('#services-grid')?.scrollIntoView({ behavior: 'smooth' });
  });
  
  await page.waitForTimeout(1000);
  
  await page.screenshot({ 
    path: 'FINAL-services-grid-mobile.png', 
    fullPage: true 
  });
  console.log('📸 Screenshot saved: FINAL-services-grid-mobile.png\n');
  
  console.log('✅ VERIFICATION COMPLETE\n');
  console.log('Please review the screenshots:');
  console.log('  - FINAL-services-grid-light.png');
  console.log('  - FINAL-services-grid-dark.png');
  console.log('  - FINAL-services-grid-mobile.png');
  console.log('\nPress Ctrl+C to close browser...');
  
  // Keep browser open for manual inspection
  await page.waitForTimeout(30000);
  
  await browser.close();
}

finalVerification().catch(console.error);
