import { chromium } from 'playwright';

async function diagnose() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:4173/services', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  const whyChooseAnalysis = await page.evaluate(() => {
    // Find Why Choose section
    const sections = Array.from(document.querySelectorAll('section'));
    const whySection = sections.find(s => 
      s.textContent.includes('Why Choose') ||
      s.textContent.includes('Understand Your Needs') ||
      s.textContent.includes('Design & Develop')
    );
    
    if (!whySection) return { error: 'Section not found' };
    
    // Find all cards/tiles
    const cards = whySection.querySelectorAll('[class*="card"], [class*="tile"], [class*="grid"] > div');
    
    return {
      sectionFound: true,
      cardsCount: cards.length,
      cards: Array.from(cards).slice(0, 6).map((card, idx) => {
        const computed = window.getComputedStyle(card);
        const text = card.textContent.trim().substring(0, 100);
        
        return {
          index: idx,
          text: text,
          height: computed.height,
          maxHeight: computed.maxHeight,
          overflow: computed.overflow,
          overflowY: computed.overflowY,
          clipPath: computed.clipPath,
          borderRadius: computed.borderRadius,
          scrollHeight: card.scrollHeight,
          offsetHeight: card.offsetHeight,
          isClipped: card.scrollHeight > card.offsetHeight,
          className: card.className.substring(0, 150)
        };
      })
    };
  });
  
  if (whyChooseAnalysis.error) {
    console.log('❌ Why Choose section not found');
    return;
  }
  
  console.log('💎 Why Choose Us Analysis:\n');
  console.log(`Total cards: ${whyChooseAnalysis.cardsCount}\n`);
  
  whyChooseAnalysis.cards.forEach(card => {
    const clipped = card.isClipped ? '⚠️  CLIPPED' : '✓ OK';
    console.log(`${card.index + 1}. ${clipped}`);
    console.log(`   Text: "${card.text}"`);
    console.log(`   Height: ${card.height} (scroll: ${card.scrollHeight}px, offset: ${card.offsetHeight}px)`);
    console.log(`   Overflow: ${card.overflow}`);
    if (card.clipPath !== 'none') {
      console.log(`   Clip-path: ${card.clipPath}`);
    }
    console.log('');
  });
  
  const clippedCount = whyChooseAnalysis.cards.filter(c => c.isClipped).length;
  console.log(`\n📊 Summary: ${clippedCount}/${whyChooseAnalysis.cards.length} cards clipped`);
  
  await browser.close();
}

diagnose().catch(console.error);
