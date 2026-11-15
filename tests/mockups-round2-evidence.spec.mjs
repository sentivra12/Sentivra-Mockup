/**
 * Mockups Round 2 - Evidence Collection
 * Diagnose bugs in REAL browser before fixing
 */

import { test, expect } from '@playwright/test';

test('Evidence 1: View Details button - invisible/white', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:4173/mockups');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('\n=== BUG 1: VIEW DETAILS BUTTON ===');
  
  // Find first "View Details" button (or where it should be)
  const firstCard = page.locator('article').first();
  const primaryButton = firstCard.locator('button').first();
  
  if (await primaryButton.count() > 0) {
    const styles = await primaryButton.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        color: computed.color,
        backgroundColor: computed.backgroundColor,
        backgroundImage: computed.backgroundImage,
        opacity: computed.opacity,
        webkitTextFillColor: computed.webkitTextFillColor || computed.color,
        border: computed.border,
        width: computed.width,
        height: computed.height,
        visibility: computed.visibility,
        display: computed.display
      };
    });
    
    console.log('Primary button computed styles:', JSON.stringify(styles, null, 2));
    
    // Get text content
    const text = await primaryButton.textContent();
    console.log('Button text:', text);
    
    // Check for gradient classes
    const classes = await primaryButton.getAttribute('class');
    console.log('Button classes:', classes);
    
    // Take screenshot of just the button
    await primaryButton.screenshot({ path: 'test-results/evidence-button-invisible.png' });
  } else {
    console.log('⚠️  No button found in first card');
  }
  
  // Full page screenshot
  await page.screenshot({ path: 'test-results/evidence-page-light-en.png', fullPage: true });
});

test('Evidence 2: Card window bar - near-black background', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:4173/mockups');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('\n=== BUG 2: WINDOW BAR BACKGROUND ===');
  
  const firstCard = page.locator('article').first();
  const windowBar = firstCard.locator('[class*="bg-brand-950"], [class*="bg-slate"], div').first();
  
  if (await windowBar.count() > 0) {
    const bgColor = await windowBar.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        backgroundColor: computed.backgroundColor,
        background: computed.background
      };
    });
    
    console.log('Window bar background:', JSON.stringify(bgColor, null, 2));
    
    const classes = await windowBar.getAttribute('class');
    console.log('Window bar classes:', classes);
  }
});

test('Evidence 3: Badges - "New" on every card', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:4173/mockups');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('\n=== BUG 3: BADGES ===');
  
  // Count "New" badges
  const newBadges = await page.locator('text=/New|جديد/i').count();
  console.log(`Found ${newBadges} "New" badges`);
  
  // Check first card badges
  const firstCard = page.locator('article').first();
  const badges = firstCard.locator('[class*="badge"], [class*="rounded-full"]');
  const badgeCount = await badges.count();
  
  console.log(`First card has ${badgeCount} badges`);
  
  for (let i = 0; i < Math.min(badgeCount, 5); i++) {
    const badge = badges.nth(i);
    const text = await badge.textContent();
    const position = await badge.boundingBox();
    console.log(`Badge ${i + 1}: "${text}" at`, position);
  }
});

test('Evidence 4: Data source - check mockups', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:4173/mockups');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('\n=== BUG 4: DATA SOURCE ===');
  
  // Get all card titles
  const cards = page.locator('article');
  const cardCount = await cards.count();
  console.log(`Total cards: ${cardCount}`);
  
  for (let i = 0; i < Math.min(cardCount, 5); i++) {
    const card = cards.nth(i);
    const title = await card.locator('h3').first().textContent();
    const desc = await card.locator('p').first().textContent();
    console.log(`Card ${i + 1}:`);
    console.log(`  Title: ${title?.substring(0, 50)}`);
    console.log(`  Desc: ${desc?.substring(0, 50)}`);
  }
  
  // Check for "Demo" or "Fallback" text
  const demoText = await page.locator('text=/demo|fallback|mock/i').count();
  console.log(`Found ${demoText} instances of demo/fallback/mock text`);
});

test('Evidence 5: Card layout inconsistencies', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:4173/mockups');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('\n=== BUG 5: CARD LAYOUT ===');
  
  const cards = page.locator('article');
  const cardCount = await cards.count();
  
  for (let i = 0; i < Math.min(cardCount, 3); i++) {
    const card = cards.nth(i);
    const box = await card.boundingBox();
    
    // Check for URL in window bar
    const urlText = card.locator('text=/https|http|www/i');
    const hasUrl = await urlText.count() > 0;
    
    console.log(`Card ${i + 1}:`);
    console.log(`  Height: ${box?.height}px`);
    console.log(`  Has URL in bar: ${hasUrl}`);
    
    // Check description alignment
    const desc = card.locator('p').first();
    if (await desc.count() > 0) {
      const dir = await desc.getAttribute('dir');
      const textAlign = await desc.evaluate(el => window.getComputedStyle(el).textAlign);
      const text = await desc.textContent();
      console.log(`  Description dir="${dir}" align="${textAlign}"`);
      console.log(`  First 30 chars: ${text?.substring(0, 30)}`);
    }
  }
});

test('Evidence 6: Search input and page layout', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:4173/mockups');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('\n=== BUG 6: SEARCH & PAGE LAYOUT ===');
  
  // Search input
  const searchInput = page.locator('input[type="search"]').first();
  if (await searchInput.count() > 0) {
    const searchBox = await searchInput.boundingBox();
    console.log(`Search input position: x=${searchBox?.x}, y=${searchBox?.y}`);
    
    // Check for icon
    const searchIcon = searchInput.locator('xpath=preceding-sibling::*[1]');
    console.log(`Search icon exists: ${await searchIcon.count() > 0}`);
  }
  
  // Page heading position
  const heading = page.locator('h1').first();
  if (await heading.count() > 0) {
    const headingBox = await heading.boundingBox();
    console.log(`Heading position: x=${headingBox?.x}`);
  }
  
  // Navbar logo position for comparison
  const logo = page.locator('nav a[href="/"]').first();
  if (await logo.count() > 0) {
    const logoBox = await logo.boundingBox();
    console.log(`Navbar logo position: x=${logoBox?.x}`);
  }
  
  // Eyebrow text
  const eyebrow = page.locator('text=/DESIGN GALLERY|معرض التصاميم/i').first();
  if (await eyebrow.count() > 0) {
    const eyebrowText = await eyebrow.textContent();
    console.log(`Eyebrow: "${eyebrowText}"`);
  }
});

test('Evidence 7: Dark theme bugs', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:4173/mockups');
  
  // Enable dark mode
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  });
  
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('\n=== DARK THEME CHECK ===');
  
  // Check primary button in dark mode
  const firstCard = page.locator('article').first();
  const primaryButton = firstCard.locator('button').first();
  
  if (await primaryButton.count() > 0) {
    const styles = await primaryButton.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        color: computed.color,
        backgroundColor: computed.backgroundColor,
        backgroundImage: computed.backgroundImage,
        opacity: computed.opacity
      };
    });
    
    console.log('Primary button in dark mode:', JSON.stringify(styles, null, 2));
  }
  
  await page.screenshot({ path: 'test-results/evidence-page-dark-en.png', fullPage: true });
});

test('Evidence 8: Console errors and failed requests', async ({ page }) => {
  const errors = [];
  const failedRequests = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('requestfailed', request => {
    failedRequests.push({
      url: request.url(),
      failure: request.failure()?.errorText
    });
  });
  
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:4173/mockups');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('\n=== CONSOLE ERRORS & FAILED REQUESTS ===');
  console.log(`Console errors: ${errors.length}`);
  errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
  
  console.log(`Failed requests: ${failedRequests.length}`);
  failedRequests.forEach((req, i) => console.log(`  ${i + 1}. ${req.url} - ${req.failure}`));
});

test('Evidence 9: Motion preference check', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:4173/mockups');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('\n=== REDUCED MOTION CHECK ===');
  
  const firstCard = page.locator('article').first();
  const primaryButton = firstCard.locator('button').first();
  
  if (await primaryButton.count() > 0) {
    const opacity = await primaryButton.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        opacity: computed.opacity,
        filter: computed.filter,
        transform: computed.transform
      };
    });
    
    console.log('Button with reduced motion:', JSON.stringify(opacity, null, 2));
  }
  
  await page.screenshot({ path: 'test-results/evidence-page-reduced-motion.png', fullPage: true });
});
