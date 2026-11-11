import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('\n🔍 Quick check for CTA and Footer...\n');

  await page.goto('http://localhost:4174/services', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Scroll to bottom
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1500);

  // Check what sections exist
  const sections = await page.evaluate(() => {
    const allSections = Array.from(document.querySelectorAll('section'));
    return allSections.map((s, i) => ({
      index: i,
      classes: s.className,
      text: s.textContent.slice(0, 100).trim(),
      hasInverseClass: s.classList.contains('inverse-surface'),
      children: s.children.length
    }));
  });

  console.log('All sections found:');
  sections.forEach(s => {
    console.log(`\nSection ${s.index}:`);
    console.log(`  Classes: ${s.classes.slice(0, 100)}`);
    console.log(`  Has inverse-surface: ${s.hasInverseClass}`);
    console.log(`  Text preview: ${s.text.slice(0, 60)}...`);
    console.log(`  Children: ${s.children}`);
  });

  // Check footer
  const footer = await page.evaluate(() => {
    const footer = document.querySelector('footer');
    if (!footer) return null;
    return {
      classes: footer.className,
      text: footer.textContent.slice(0, 100),
      hasInverseClass: footer.classList.contains('inverse-surface'),
      bg: window.getComputedStyle(footer).backgroundColor
    };
  });

  console.log('\n\nFooter:');
  if (footer) {
    console.log(`  Classes: ${footer.classes}`);
    console.log(`  Has inverse-surface: ${footer.hasInverseClass}`);
    console.log(`  Background: ${footer.bg}`);
  } else {
    console.log('  ❌ Footer not found');
  }

  await page.screenshot({ path: 'quick-check.png', fullPage: true });
  console.log('\n📸 Screenshot: quick-check.png\n');

  console.log('Press Ctrl+C to close...\n');
  await page.waitForTimeout(300000);
  await browser.close();
})();
