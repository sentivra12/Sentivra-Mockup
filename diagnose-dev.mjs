import { chromium } from 'playwright';

async function diagnose() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  console.log('Loading DEV server...');
  await page.goto('http://localhost:5173/services', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  const loadingCount = await page.locator('[role="status"], .animate-spin').count();
  console.log(`Loading spinners: ${loadingCount}`);
  
  const servicesCount = await page.locator('[class*="service"] h2, [class*="service"] h3, [class*="Service"] h2, [class*="Service"] h3').count();
  console.log(`Service cards: ${servicesCount}`);
  
  const h1Color = await page.locator('h1').first().evaluate(el => window.getComputedStyle(el).color);
  console.log(`H1 color: ${h1Color}`);
  
  await page.screenshot({ path: 'diagnosis-dev.png', fullPage: true });
  console.log(`Screenshot: diagnosis-dev.png`);
  
  await browser.close();
}

diagnose().catch(console.error);
