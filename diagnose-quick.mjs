import { chromium } from 'playwright';

async function diagnose() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  // Log console messages
  page.on('console', msg => console.log(`🖥️  ${msg.type()}: ${msg.text()}`));
  
  console.log('Loading page...');
  await page.goto('http://localhost:4173/services', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // Check loading state
  const loadingCount = await page.locator('[role="status"], .animate-spin').count();
  console.log(`\n📊 Loading spinners: ${loadingCount}`);
  
  // Check if content rendered
  const servicesCount = await page.locator('[class*="service"] h2, [class*="service"] h3').count();
  console.log(`📦 Service cards: ${servicesCount}`);
  
  const constellationNodes = await page.locator('[class*="constellation"] [class*="node"]').count();
  console.log(`⭐ Constellation nodes: ${constellationNodes}`);
  
  // Check hero text color
  const h1 = await page.locator('h1').first();
  const color = await h1.evaluate(el => window.getComputedStyle(el).color);
  console.log(`🎨 H1 color: ${color}`);
  
  // Check text content
  const h1Text = await h1.textContent();
  console.log(`📝 H1 text: ${h1Text.substring(0, 50)}...`);
  
  // Screenshot
  await page.screenshot({ path: 'diagnosis-quick.png', fullPage: true });
  console.log(`\n📸 Screenshot saved: diagnosis-quick.png`);
  
  await browser.close();
}

diagnose().catch(console.error);
