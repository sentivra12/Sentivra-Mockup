import { chromium } from 'playwright';

async function diagnose() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:4173/services', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  const visualsAnalysis = await page.evaluate(() => {
    const serviceLinks = document.querySelectorAll('a[href^="/services/"]');
    
    return Array.from(serviceLinks).map((link, idx) => {
      const card = link.closest('[class*="card"]') || link;
      const h2 = link.querySelector('h2, h3');
      const title = h2?.textContent.trim();
      
      // Look for visual elements
      const visualSelectors = [
        '[class*="visual"]',
        '[class*="Visual"]',
        '[class*="mini"]',
        '[class*="animated"]',
        'svg:not([class*="icon"])',
        'canvas',
        '[class*="progress"]',
        '[class*="bar"]'
      ];
      
      let foundVisuals = [];
      visualSelectors.forEach(selector => {
        const elements = card.querySelectorAll(selector);
        if (elements.length > 0) {
          foundVisuals.push({
            selector,
            count: elements.length,
            classes: Array.from(elements).map(el => el.className).join(', ')
          });
        }
      });
      
      return {
        index: idx,
        title,
        href: link.getAttribute('href'),
        cardClass: card.className.substring(0, 100),
        hasVisual: foundVisuals.length > 0,
        visuals: foundVisuals,
        cardHTML: card.innerHTML.substring(0, 300)
      };
    });
  });
  
  console.log('🎨 Mini Visuals Analysis:\n');
  visualsAnalysis.forEach(card => {
    console.log(`${card.index + 1}. ${card.title}`);
    console.log(`   Has visual: ${card.hasVisual}`);
    if (card.hasVisual) {
      console.log(`   Visuals:`, card.visuals);
    }
    console.log('');
  });
  
  // Check if ServiceBentoCard component renders visuals
  const hasAnyVisual = visualsAnalysis.some(c => c.hasVisual);
  console.log(`\n📊 Summary: ${hasAnyVisual ? 'Visuals found!' : 'No visuals found'}`);
  
  await browser.close();
}

diagnose().catch(console.error);
