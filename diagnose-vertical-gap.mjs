import { chromium } from 'playwright';

console.log('\n🔍 VERTICAL GAP DIAGNOSIS\n');

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.addInitScript(() => {
  localStorage.setItem('theme', 'light');
});

await page.goto('http://localhost:4173/services', { waitUntil: 'networkidle' });

// Get all sections and their vertical positions
const sections = await page.evaluate(() => {
  const allSections = document.querySelectorAll('section, main > div');
  const results = [];
  
  allSections.forEach((section, i) => {
    const rect = section.getBoundingClientRect();
    const computed = window.getComputedStyle(section);
    
    // Get first 50 chars of text content
    const text = section.textContent.trim().substring(0, 60).replace(/\s+/g, ' ');
    
    results.push({
      index: i,
      tag: section.tagName,
      id: section.id || '(no id)',
      text,
      top: Math.round(rect.top),
      height: Math.round(rect.height),
      bottom: Math.round(rect.bottom),
      paddingTop: computed.paddingTop,
      paddingBottom: computed.paddingBottom,
      marginTop: computed.marginTop,
      marginBottom: computed.marginBottom,
      minHeight: computed.minHeight
    });
  });
  
  return results;
});

console.log('📐 Sections and Vertical Layout:\n');

sections.forEach(s => {
  console.log(`━━━━ SECTION #${s.index + 1} ━━━━`);
  console.log(`  Tag: <${s.tag}> ${s.id !== '(no id)' ? `#${s.id}` : ''}`);
  console.log(`  Text: "${s.text}"`);
  console.log(`  Position: top=${s.top}, bottom=${s.bottom}, height=${s.height}`);
  console.log(`  Padding: ${s.paddingTop} / ${s.paddingBottom}`);
  console.log(`  Margin: ${s.marginTop} / ${s.marginBottom}`);
  console.log(`  Min-height: ${s.minHeight}`);
  console.log();
});

// Find the section with service cards
const serviceGridSection = await page.evaluate(() => {
  const sections = Array.from(document.querySelectorAll('section'));
  const gridSection = sections.find(s => s.querySelector('a[href*="/services/"]'));
  
  if (!gridSection) return null;
  
  const rect = gridSection.getBoundingClientRect();
  const computed = window.getComputedStyle(gridSection);
  
  return {
    id: gridSection.id || '(no id)',
    classes: gridSection.className,
    top: Math.round(rect.top),
    height: Math.round(rect.height),
    paddingTop: computed.paddingTop,
    minHeight: computed.minHeight
  };
});

if (serviceGridSection) {
  console.log('🎯 SERVICE GRID SECTION:');
  console.log(`  ID: ${serviceGridSection.id}`);
  console.log(`  Classes: ${serviceGridSection.classes}`);
  console.log(`  Top position: ${serviceGridSection.top}px`);
  console.log(`  Height: ${serviceGridSection.height}px`);
  console.log(`  Padding-top: ${serviceGridSection.paddingTop}`);
  console.log(`  Min-height: ${serviceGridSection.minHeight}`);
} else {
  console.log('❌ Service grid section NOT found');
}

await browser.close();
console.log('\n✅ Diagnosis complete\n');
