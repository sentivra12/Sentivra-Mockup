import { chromium } from 'playwright';

async function diagnose() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:4173/services', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // Check services grid in detail
  const gridAnalysis = await page.evaluate(() => {
    const section = document.querySelector('#services-grid, [id*="service"]');
    if (!section) return { error: 'Section not found' };
    
    // Look for all possible card selectors
    const cardSelectors = [
      '[class*="service"] [class*="card"]',
      '[class*="Service"] [class*="Card"]',
      'section#services-grid article',
      'section#services-grid > div > div > div',
      '[class*="grid"] > *',
      '[class*="bento"]'
    ];
    
    const results = {};
    cardSelectors.forEach(selector => {
      const elements = section.querySelectorAll(selector);
      if (elements.length > 0) {
        results[selector] = {
          count: elements.length,
          firstHTML: elements[0]?.outerHTML.substring(0, 200)
        };
      }
    });
    
    // Check for RevealStagger
    const revealStagger = section.querySelector('[class*="Reveal"], [class*="reveal"]');
    
    // Check grid container
    const gridContainer = section.querySelector('[class*="grid"]');
    
    return {
      sectionHTML: section.innerHTML.substring(0, 500),
      cardsFound: results,
      hasRevealStagger: !!revealStagger,
      revealClass: revealStagger?.className,
      hasGrid: !!gridContainer,
      gridClass: gridContainer?.className.substring(0, 150),
      gridChildren: gridContainer?.children.length || 0,
      gridHTML: gridContainer?.innerHTML.substring(0, 300)
    };
  });
  
  console.log('🔍 Services Grid Analysis:\n');
  console.log('Has Grid:', gridAnalysis.hasGrid);
  console.log('Grid Class:', gridAnalysis.gridClass);
  console.log('Grid Children:', gridAnalysis.gridChildren);
  console.log('\nCards Found:');
  console.log(JSON.stringify(gridAnalysis.cardsFound, null, 2));
  console.log('\nGrid HTML Preview:');
  console.log(gridAnalysis.gridHTML);
  
  await browser.close();
}

diagnose().catch(console.error);
