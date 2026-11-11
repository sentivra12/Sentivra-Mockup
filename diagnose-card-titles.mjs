import { chromium } from 'playwright';

console.log('\n🔍 SERVICE CARD TITLE DIAGNOSIS\n');

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

// Set light theme
await page.addInitScript(() => {
  localStorage.setItem('theme', 'light');
});

await page.goto('http://localhost:4173/services', { waitUntil: 'networkidle' });

// Wait for service cards
await page.waitForSelector('h3:has-text("Web Development"), h3:has-text("تطوير الويب")', { timeout: 10000 });

console.log('✅ Service cards detected\n');

// Inspect first service card title
const cardTitle = page.locator('a[href*="/services/"] h3').first();

const analysis = await cardTitle.evaluate((h3) => {
  const computed = window.getComputedStyle(h3);
  
  // Get all ancestors
  const ancestors = [];
  let el = h3;
  while (el && el !== document.body) {
    const styles = window.getComputedStyle(el);
    const hasBg = styles.backgroundColor !== 'rgba(0, 0, 0, 0)';
    ancestors.push({
      tag: el.tagName,
      classes: el.className || '',
      bgColor: styles.backgroundColor,
      hasBg,
      hasDataToken: el.hasAttribute('data-inverse-token')
    });
    el = el.parentElement;
  }
  
  return {
    text: h3.textContent.trim(),
    styles: {
      backgroundColor: computed.backgroundColor,
      color: computed.color,
      position: computed.position,
      zIndex: computed.zIndex
    },
    ancestors
  };
});

console.log('━━━━ FIRST SERVICE CARD TITLE ━━━━');
console.log(`Text: "${analysis.text}"`);
console.log('\nDirect styles:');
console.log(`  backgroundColor: ${analysis.styles.backgroundColor}`);
console.log(`  color: ${analysis.styles.color}`);
console.log(`  position: ${analysis.styles.position}`);
console.log(`  zIndex: ${analysis.styles.zIndex}`);

console.log('\n📊 Ancestor chain (bottom to top):');
analysis.ancestors.forEach((a, i) => {
  const marker = a.hasBg ? '🟥 HAS BACKGROUND' : '';
  const tokenMarker = a.hasDataToken ? '⚠️  HAS data-inverse-token' : '';
  console.log(`  ${i}. <${a.tag}> ${a.classes}`);
  if (marker) console.log(`     ${marker}: ${a.bgColor}`);
  if (tokenMarker) console.log(`     ${tokenMarker}`);
});

// Screenshot
await page.screenshot({ path: 'services-card-titles.png', fullPage: true });
console.log('\n📸 Screenshot: services-card-titles.png');

await browser.close();
console.log('\n✅ Diagnosis complete\n');
