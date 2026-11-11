import { chromium } from 'playwright';

async function quickScreenshot() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:4174/services', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Scroll to grid
  await page.evaluate(() => {
    document.querySelector('#services-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  
  await page.waitForTimeout(1000);
  
  // Light mode
  await page.screenshot({ 
    path: 'FINAL-light.png',
    clip: { x: 0, y: 300, width: 1440, height: 2000 } 
  });
  console.log('✅ FINAL-light.png');
  
  // Dark mode
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await page.waitForTimeout(500);
  
  await page.screenshot({ 
    path: 'FINAL-dark.png',
    clip: { x: 0, y: 300, width: 1440, height: 2000 } 
  });
  console.log('✅ FINAL-dark.png');
  
  // Mobile
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => document.documentElement.classList.remove('dark'));
  await page.waitForTimeout(500);
  
  await page.evaluate(() => {
    document.querySelector('#services-grid')?.scrollIntoView({ behavior: 'auto', block: 'start' });
  });
  await page.waitForTimeout(500);
  
  await page.screenshot({ 
    path: 'FINAL-mobile.png',
    fullPage: true
  });
  console.log('✅ FINAL-mobile.png');
  
  await browser.close();
  console.log('\n✅ All screenshots generated!');
}

quickScreenshot().catch(console.error);
