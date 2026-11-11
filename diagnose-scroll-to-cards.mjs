import { chromium } from 'playwright';

console.log('\n🔍 SCROLL TO SERVICE CARDS\n');

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.addInitScript(() => {
  localStorage.setItem('theme', 'light');
});

await page.goto('http://localhost:4173/services', { waitUntil: 'networkidle' });

// Scroll to service grid section
await page.evaluate(() => {
  const section = document.getElementById('services-grid');
  if (section) {
    section.scrollIntoView({ block: 'start' });
  }
});

// Wait a moment for scroll
await page.waitForTimeout(500);

//Take screenshot
await page.screenshot({ path: 'services-cards-section.png', fullPage: false });
console.log('📸 Screenshot: services-cards-section.png\n');

// Also check what's visible
const visibleText = await page.evaluate(() => {
  const viewportHeight = window.innerHeight;
  const elements = [];
  
  document.querySelectorAll('h1, h2, h3').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top >= 0 && rect.top < viewportHeight) {
      elements.push({
        tag: el.tagName,
        text: el.textContent.trim().substring(0, 50),
        top: Math.round(rect.top)
      });
    }
  });
  
  return elements;
});

console.log('✅ Visible headings after scroll:\n');
visibleText.forEach(el => {
  console.log(`  ${el.tag} at ${el.top}px: "${el.text}"`);
});

await browser.close();
console.log('\n✅ Complete\n');
