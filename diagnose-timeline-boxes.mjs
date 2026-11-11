import { chromium } from 'playwright';

console.log('\n🔍 TIMELINE DARK BOXES DIAGNOSIS\n');

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.addInitScript(() => {
  localStorage.setItem('theme', 'light');
});

await page.goto('http://localhost:4173/services', { waitUntil: 'networkidle' });

// Wait for timeline
await page.waitForSelector('h2:has-text("How We Work"), h2:has-text("كيف نعمل")', { timeout: 10000 });
console.log('✅ Timeline section detected\n');

// Find ALL elements with non-transparent dark backgrounds in the timeline section
const darkBoxes = await page.evaluate(() => {
  // Find timeline section
  const timelineSection = Array.from(document.querySelectorAll('section')).find(s =>
    s.textContent.includes('How We Work') || s.textContent.includes('Design & Develop')
  );
  
  if (!timelineSection) return [];
  
  // Get all elements in timeline
  const allElements = timelineSection.querySelectorAll('*');
  const darkBoxes = [];
  
  allElements.forEach(el => {
    const computed = window.getComputedStyle(el);
    const bg = computed.backgroundColor;
    
    // Check if has dark background (rgb values all < 100)
    const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const [, r, g, b] = match.map(Number);
      const isDark = r < 100 && g < 100 && b < 100 && bg !== 'rgba(0, 0, 0, 0)';
      
      if (isDark) {
        const text = el.textContent.trim().substring(0, 50);
        const rect = el.getBoundingClientRect();
        
        darkBoxes.push({
          tag: el.tagName,
          classes: el.className,
          text,
          bgColor: bg,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          hasDataToken: el.hasAttribute('data-inverse-token'),
          token: el.getAttribute('data-inverse-token')
        });
      }
    }
  });
  
  return darkBoxes;
});

console.log(`Found ${darkBoxes.length} elements with dark backgrounds:\n`);

darkBoxes.forEach((box, i) => {
  console.log(`━━━━ DARK BOX #${i + 1} ━━━━`);
  console.log(`Tag: <${box.tag}>`);
  console.log(`Classes: ${box.classes}`);
  console.log(`Text: "${box.text}"`);
  console.log(`Background: ${box.bgColor}`);
  console.log(`Size: ${box.width}x${box.height}px`);
  if (box.hasDataToken) {
    console.log(`⚠️  data-inverse-token="${box.token}"`);
  }
  console.log();
});

// Screenshot
await page.screenshot({ path: 'timeline-dark-boxes.png', fullPage: true });
console.log('📸 Screenshot: timeline-dark-boxes.png\n');

await browser.close();
console.log('✅ Diagnosis complete\n');
