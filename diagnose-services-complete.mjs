import { chromium } from 'playwright';

console.log('\n🔍 COMPLETE /services PAGE DIAGNOSIS\n');

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.addInitScript(() => {
  localStorage.setItem('theme', 'light');
});

await page.goto('http://localhost:4173/services', { waitUntil: 'networkidle' });

// Wait for service cards
try {
  await page.waitForSelector('a[href*="/services/"] h3, h3:has-text("Web Development")', { timeout: 5000 });
  console.log('✅ Service cards detected');
} catch {
  console.log('⚠️  Service cards NOT detected');
}

// Count sections
const sections = await page.evaluate(() => {
  const allSections = document.querySelectorAll('section, [role="region"]');
  const timelineExists = Array.from(document.querySelectorAll('section')).some(s => 
    s.textContent.includes('How We Work') || s.textContent.includes('Design & Develop')
  );
  return {
    total: allSections.length,
    withServiceCards: document.querySelectorAll('a[href*="/services/"]').length,
    withTimeline: timelineExists ? 'YES' : 'NO'
  };
});

console.log('\n📊 Page Structure:');
console.log(`  Sections: ${sections.total}`);
console.log(`  Service cards: ${sections.withServiceCards}`);
console.log(`  Timeline: ${sections.withTimeline}`);

// Find all dark boxes
const darkBoxes = await page.evaluate(() => {
  const boxes = [];
  document.querySelectorAll('*').forEach(el => {
    const computed = window.getComputedStyle(el);
    const bg = computed.backgroundColor;
    const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const [, r, g, b] = match.map(Number);
      const isDark = r < 100 && g < 100 && b < 100 && bg !== 'rgba(0, 0, 0, 0)';
      if (isDark) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0 && rect.width < 400 && rect.height < 200) {
          const text = el.textContent.trim().substring(0, 40);
          boxes.push({
            tag: el.tagName,
            text,
            size: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
            classes: el.className.split(' ').filter(c => !c.startsWith('lucide')).join(' ')
          });
        }
      }
    }
  });
  return boxes;
});

console.log(`\n🔍 Found ${darkBoxes.length} dark boxes (excluding footer/CTA):\n`);
darkBoxes.slice(0, 10).forEach((box, i) => {
  console.log(`${i + 1}. <${box.tag}> ${box.size} "${box.text}"`);
  if (box.classes) console.log(`   Classes: ${box.classes}`);
});

// Screenshot
await page.screenshot({ path: 'services-complete-light.png', fullPage: true });
console.log('\n📸 Screenshot: services-complete-light.png\n');

await browser.close();
console.log('✅ Diagnosis complete\n');
