import { chromium } from 'playwright';

async function diagnose() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  console.log('🔍 Loading /services page...\n');
  await page.goto('http://localhost:4173/services', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);
  
  // Check loading state details
  const loadingDetails = await page.evaluate(() => {
    const spinners = document.querySelectorAll('[role="status"], .animate-spin');
    return Array.from(spinners).map(el => ({
      text: el.textContent?.substring(0, 50),
      parent: el.parentElement?.className,
      visible: el.offsetParent !== null
    }));
  });
  
  console.log('Loading Spinners:', loadingDetails.length);
  loadingDetails.forEach((s, i) => {
    console.log(`  ${i + 1}. Text: "${s.text}", Visible: ${s.visible}`);
  });
  
  // Check if services section exists
  const sections = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('section')).map(s => ({
      id: s.id,
      class: s.className.substring(0, 50),
      hasContent: s.textContent.length > 50
    }));
  });
  
  console.log(`\n📄 Sections found: ${sections.length}`);
  sections.slice(0, 10).forEach((s, i) => {
    console.log(`  ${i + 1}. ID: "${s.id}", Has content: ${s.hasContent}`);
  });
  
  // Check for services data
  const servicesData = await page.evaluate(() => {
    const cards = document.querySelectorAll('[class*="service"] [class*="card"], [class*="Service"] [class*="Card"]');
    const grid = document.querySelector('[id*="service"], [class*="service"][class*="grid"]');
    
    return {
      cardsCount: cards.length,
      gridExists: !!grid,
      gridClass: grid?.className.substring(0, 100),
      gridHTML: grid?.innerHTML.substring(0, 200)
    };
  });
  
  console.log(`\n📦 Services:`);
  console.log(`  Cards: ${servicesData.cardsCount}`);
  console.log(`  Grid exists: ${servicesData.gridExists}`);
  if (servicesData.gridClass) {
    console.log(`  Grid class: ${servicesData.gridClass}`);
  }
  
  // Check constellation
  const constellation = await page.evaluate(() => {
    const container = document.querySelector('[class*="constellation"], [class*="Constellation"]');
    return {
      exists: !!container,
      className: container?.className.substring(0, 100),
      nodesCount: container?.querySelectorAll('[class*="node"]').length || 0,
      linesCount: container?.querySelectorAll('line').length || 0
    };
  });
  
  console.log(`\n⭐ Constellation:`);
  console.log(`  Exists: ${constellation.exists}`);
  console.log(`  Nodes: ${constellation.nodesCount}`);
  console.log(`  Lines: ${constellation.linesCount}`);
  
  // Screenshot
  await page.screenshot({ path: 'diagnosis-detailed.png', fullPage: true });
  console.log(`\n📸 Screenshot: diagnosis-detailed.png`);
  
  await browser.close();
}

diagnose().catch(console.error);
