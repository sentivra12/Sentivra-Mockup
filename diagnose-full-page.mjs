import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

async function diagnose() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  console.log('🔍 Full Page Analysis...\n');
  await page.goto('http://localhost:4173/services', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  const analysis = await page.evaluate(() => {
    // 1. Hero Section
    const h1 = document.querySelector('h1');
    const heroSection = document.querySelector('section');
    
    // 2. Services Grid
    const servicesGrid = document.querySelector('#services-grid');
    const serviceLinks = servicesGrid?.querySelectorAll('a[href^="/services/"]') || [];
    
    // 3. Constellation
    const constellation = document.querySelector('[class*="constellation"]');
    const constNodes = constellation?.querySelectorAll('[class*="node"]') || [];
    const constLines = constellation?.querySelectorAll('line') || [];
    
    // 4. How We Work
    const howWeWork = Array.from(document.querySelectorAll('section')).find(s => 
      s.textContent.includes('How We Work') || s.textContent.includes('Design & Develop')
    );
    const timelineItems = howWeWork?.querySelectorAll('[class*="step"], [class*="card"], li') || [];
    
    // 5. Why Choose Us
    const whyChoose = Array.from(document.querySelectorAll('section')).find(s =>
      s.textContent.includes('Why Choose') || s.textContent.includes('Understand Your Needs')
    );
    const whyCards = whyChoose?.querySelectorAll('[class*="card"], [class*="tile"]') || [];
    
    // 6. FAQ
    const faq = Array.from(document.querySelectorAll('section')).find(s =>
      s.textContent.includes('FAQ') || s.textContent.includes('Frequently')
    );
    
    // 7. Final CTA
    const sections = document.querySelectorAll('section');
    const lastSection = sections[sections.length - 1];
    const hasCTA = lastSection?.textContent.includes('Get Started') || 
                   lastSection?.textContent.includes('Contact') ||
                   lastSection?.textContent.includes('Ready');
    
    // Check for mini visuals
    let miniVisuals = { total: 0, empty: 0 };
    serviceLinks.forEach(link => {
      const visual = link.querySelector('[class*="visual"], [class*="Visual"]');
      if (visual) {
        miniVisuals.total++;
        if (visual.children.length === 0 && visual.textContent.trim() === '') {
          miniVisuals.empty++;
        }
      }
    });
    
    return {
      hero: {
        exists: !!h1,
        text: h1?.textContent.substring(0, 50),
        color: h1 ? window.getComputedStyle(h1).color : 'N/A',
        lines: h1 ? Math.round(h1.offsetHeight / parseFloat(window.getComputedStyle(h1).lineHeight)) : 0
      },
      servicesGrid: {
        exists: !!servicesGrid,
        cardsCount: serviceLinks.length,
        titles: Array.from(serviceLinks).slice(0, 5).map(a => {
          const h2 = a.querySelector('h2, h3');
          return h2?.textContent.trim();
        })
      },
      constellation: {
        exists: !!constellation,
        nodesCount: constNodes.length,
        linesCount: constLines.length
      },
      howWeWork: {
        exists: !!howWeWork,
        itemsCount: timelineItems.length
      },
      whyChoose: {
        exists: !!whyChoose,
        cardsCount: whyCards.length
      },
      faq: {
        exists: !!faq
      },
      finalCTA: {
        exists: hasCTA,
        section: lastSection?.className.substring(0, 100)
      },
      miniVisuals: miniVisuals
    };
  });
  
  console.log('✅ HERO:');
  console.log(`  Exists: ${analysis.hero.exists}`);
  console.log(`  Text: "${analysis.hero.text}"`);
  console.log(`  Color: ${analysis.hero.color}`);
  console.log(`  Lines: ${analysis.hero.lines}`);
  
  console.log('\n✅ SERVICES GRID:');
  console.log(`  Exists: ${analysis.servicesGrid.exists}`);
  console.log(`  Cards: ${analysis.servicesGrid.cardsCount}`);
  console.log(`  Titles:`, analysis.servicesGrid.titles);
  
  console.log('\n⭐ CONSTELLATION:');
  console.log(`  Exists: ${analysis.constellation.exists}`);
  console.log(`  Nodes: ${analysis.constellation.nodesCount}`);
  console.log(`  Lines: ${analysis.constellation.linesCount}`);
  
  console.log('\n📋 HOW WE WORK:');
  console.log(`  Exists: ${analysis.howWeWork.exists}`);
  console.log(`  Items: ${analysis.howWeWork.itemsCount}`);
  
  console.log('\n💎 WHY CHOOSE US:');
  console.log(`  Exists: ${analysis.whyChoose.exists}`);
  console.log(`  Cards: ${analysis.whyChoose.cardsCount}`);
  
  console.log('\n❓ FAQ:');
  console.log(`  Exists: ${analysis.faq.exists}`);
  
  console.log('\n🎯 FINAL CTA:');
  console.log(`  Exists: ${analysis.finalCTA.exists}`);
  
  console.log('\n🎨 MINI VISUALS:');
  console.log(`  Total: ${analysis.miniVisuals.total}`);
  console.log(`  Empty: ${analysis.miniVisuals.empty}`);
  
  // Take screenshot
  await page.screenshot({ path: 'diagnosis-final.png', fullPage: true });
  console.log('\n📸 Screenshot: diagnosis-final.png');
  
  // Write report
  writeFileSync('diagnosis-final-report.json', JSON.stringify(analysis, null, 2));
  console.log('📄 Report: diagnosis-final-report.json');
  
  await browser.close();
  
  return analysis;
}

diagnose().then(analysis => {
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY:');
  console.log('='.repeat(50));
  
  const checks = [
    { name: 'Hero renders', pass: analysis.hero.exists },
    { name: 'Hero text dark', pass: analysis.hero.color.includes('15, 23, 42') },
    { name: 'Hero max 3 lines', pass: analysis.hero.lines <= 3 },
    { name: 'Services grid renders', pass: analysis.servicesGrid.cardsCount >= 6 },
    { name: 'Constellation exists', pass: analysis.constellation.exists },
    { name: 'Constellation has lines', pass: analysis.constellation.linesCount > 0 },
    { name: 'How We Work renders', pass: analysis.howWeWork.exists },
    { name: 'Why Choose renders', pass: analysis.whyChoose.exists },
    { name: 'Mini visuals present', pass: analysis.miniVisuals.empty === 0 }
  ];
  
  checks.forEach(check => {
    const icon = check.pass ? '✅' : '❌';
    console.log(`${icon} ${check.name}`);
  });
  
  const passedCount = checks.filter(c => c.pass).length;
  console.log(`\n${passedCount}/${checks.length} checks passed`);
}).catch(console.error);
