import { chromium } from 'playwright';

console.log('\n🔍 SERVICE CARDS VISIBILITY DIAGNOSIS\n');

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.addInitScript(() => {
  localStorage.setItem('theme', 'light');
});

await page.goto('http://localhost:4173/services', { waitUntil: 'networkidle' });

// Check service cards rendering
const cardsAnalysis = await page.evaluate(() => {
  const cards = document.querySelectorAll('a[href*="/services/"]');
  const results = [];
  
  cards.forEach((card, i) => {
    const rect = card.getBoundingClientRect();
    const computed = window.getComputedStyle(card);
    const parent = card.parentElement;
    const parentComputed = window.getComputedStyle(parent);
    
    // Get title
    const h3 = card.querySelector('h3');
    const title = h3 ? h3.textContent.trim() : 'NO TITLE';
    
    results.push({
      index: i,
      title,
      visible: rect.width > 0 && rect.height > 0,
      dimensions: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
      position: `top: ${Math.round(rect.top)}, left: ${Math.round(rect.left)}`,
      display: computed.display,
      visibility: computed.visibility,
      opacity: computed.opacity,
      parentDisplay: parentComputed.display,
      parentClasses: parent.className
    });
  });
  
  return results;
});

console.log(`Found ${cardsAnalysis.length} service cards:\n`);

cardsAnalysis.slice(0, 5).forEach(card => {
  console.log(`━━━━ CARD #${card.index + 1}: ${card.title} ━━━━`);
  console.log(`  Visible: ${card.visible ? '✅ YES' : '❌ NO'}`);
  console.log(`  Size: ${card.dimensions}`);
  console.log(`  Position: ${card.position}`);
  console.log(`  Display: ${card.display}`);
  console.log(`  Visibility: ${card.visibility}`);
  console.log(`  Opacity: ${card.opacity}`);
  console.log(`  Parent display: ${card.parentDisplay}`);
  console.log();
});

// Check if grid container exists
const gridInfo = await page.evaluate(() => {
  const grid = document.querySelector('[class*="grid"]');
  if (!grid) return { exists: false };
  
  const computed = window.getComputedStyle(grid);
  const rect = grid.getBoundingClientRect();
  
  return {
    exists: true,
    classes: grid.className,
    display: computed.display,
    gridTemplateColumns: computed.gridTemplateColumns,
    dimensions: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
    childCount: grid.children.length
  };
});

console.log('📦 Grid Container:');
if (gridInfo.exists) {
  console.log(`  Classes: ${gridInfo.classes}`);
  console.log(`  Display: ${gridInfo.display}`);
  console.log(`  Grid columns: ${gridInfo.gridTemplateColumns}`);
  console.log(`  Size: ${gridInfo.dimensions}`);
  console.log(`  Children: ${gridInfo.childCount}`);
} else {
  console.log('  ❌ Grid container NOT found');
}

await page.screenshot({ path: 'service-cards-visibility.png', fullPage: true });
console.log('\n📸 Screenshot: service-cards-visibility.png\n');

await browser.close();
console.log('✅ Diagnosis complete\n');
