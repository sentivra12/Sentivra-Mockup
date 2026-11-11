import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

async function diagnoseServicesPage() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:4174/services', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  console.log('🔍 ANALYZING /services PAGE STRUCTURE\n');
  
  // Get page structure
  const pageStructure = await page.evaluate(() => {
    const main = document.querySelector('main');
    const sections = Array.from(document.querySelectorAll('section'));
    
    return {
      mainFound: !!main,
      sectionCount: sections.length,
      sections: sections.map((section, idx) => {
        const id = section.id;
        const heading = section.querySelector('h1, h2, h3')?.textContent?.trim();
        const cards = section.querySelectorAll('[class*="card"], article, [class*="Card"]').length;
        
        return {
          index: idx + 1,
          id: id || 'no-id',
          heading: heading || 'no-heading',
          cardCount: cards,
          className: section.className
        };
      })
    };
  });
  
  console.log(`Main element: ${pageStructure.mainFound ? 'Found' : 'Not found'}`);
  console.log(`Sections: ${pageStructure.sectionCount}\n`);
  
  pageStructure.sections.forEach(section => {
    console.log(`Section ${section.index}:`);
    console.log(`  ID: ${section.id}`);
    console.log(`  Heading: ${section.heading}`);
    console.log(`  Cards: ${section.cardCount}`);
    console.log(`  Classes: ${section.className || 'none'}\n`);
  });
  
  // Find services grid specifically
  const servicesGrid = await page.evaluate(() => {
    const gridSection = document.querySelector('#services-grid, [id*="services"]');
    if (!gridSection) return null;
    
    const grid = gridSection.querySelector('[class*="grid"]');
    const allDivs = Array.from(gridSection.querySelectorAll('div'));
    
    return {
      sectionFound: true,
      sectionId: gridSection.id,
      gridFound: !!grid,
      gridClasses: grid?.className,
      totalDivs: allDivs.length,
      innerHTML: gridSection.innerHTML.substring(0, 1000)
    };
  });
  
  if (servicesGrid) {
    console.log('\n🎯 SERVICES GRID SECTION:');
    console.log(`  Section ID: ${servicesGrid.sectionId}`);
    console.log(`  Grid element: ${servicesGrid.gridFound ? 'Found' : 'Not found'}`);
    console.log(`  Grid classes: ${servicesGrid.gridClasses || 'N/A'}`);
    console.log(`  Total divs: ${servicesGrid.totalDivs}`);
    console.log(`\n  HTML Preview (first 1000 chars):`);
    console.log(`  ${servicesGrid.innerHTML}\n`);
  } else {
    console.log('\n❌ No services grid section found\n');
  }
  
  // Save full HTML
  const html = await page.content();
  writeFileSync('services-page-debug.html', html);
  console.log('📄 Full HTML saved: services-page-debug.html\n');
  
  await page.screenshot({ path: 'services-page-screenshot.png', fullPage: true });
  console.log('📸 Screenshot saved: services-page-screenshot.png');
  
  await browser.close();
}

diagnoseServicesPage().catch(console.error);
