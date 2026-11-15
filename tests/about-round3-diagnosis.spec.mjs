import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4173';

test.describe('About Page Round 3 - Diagnosis', () => {
  
  test('01 - Capture full page text for "undefined" detection', async ({ page }) => {
    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for animations
    
    const bodyText = await page.locator('body').textContent();
    
    // Check for bad text patterns
    const patterns = ['undefined', 'null', 'NaN', '[object Object]', '{{', '}}'];
    const found = [];
    
    for (const pattern of patterns) {
      if (bodyText.includes(pattern)) {
        // Find context
        const index = bodyText.indexOf(pattern);
        const context = bodyText.slice(Math.max(0, index - 50), index + 50);
        found.push({ pattern, context });
      }
    }
    
    console.log('Bad text patterns found:', JSON.stringify(found, null, 2));
    
    // Look specifically for the "Our Presence" section
    const presenceSection = page.locator('text=/Our Presence|حضورنا/').locator('..').locator('..');
    if (await presenceSection.count() > 0) {
      const presenceText = await presenceSection.textContent();
      console.log('Our Presence section text:', presenceText?.slice(0, 300));
    }
    
    // Look for "Our Story" section
    const storySection = page.locator('text=/Our Story|قصتنا/').locator('..').locator('..');
    if (await storySection.count() > 0) {
      const storyText = await storySection.textContent();
      console.log('Our Story section text:', storyText?.slice(0, 300));
    }
  });
  
  test('02 - Countries data and cards', async ({ page }) => {
    // Intercept countries request to see what data is returned
    const countriesData = [];
    page.on('response', async response => {
      if (response.url().includes('/rest/v1/countries')) {
        const data = await response.json();
        countriesData.push(...data);
      }
    });
    
    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    console.log('Countries received from API:', JSON.stringify(countriesData, null, 2));
    
    // Count country cards
    const cards = page.locator('[class*="CountryCard"]').or(
      page.locator('article').filter({ hasText: /Egypt|مصر|Emirates|الإمارات|Oman|عمان|United States|United Kingdom/ })
    );
    const cardCount = await cards.count();
    
    console.log(`Country cards rendered: ${cardCount}`);
    
    // Get text from first few cards
    for (let i = 0; i < Math.min(cardCount, 5); i++) {
      const cardText = await cards.nth(i).textContent();
      console.log(`Card ${i}: ${cardText?.slice(0, 100)}`);
    }
  });
  
  test('03 - Button targets', async ({ page }) => {
    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState('networkidle');
    
    // Find all buttons/links with specific text
    const buttons = {
      'Our Work': null,
      'Join Our Team': null,
      'Our Journey': null,
      'Explore Mockups': null,
      'View Projects': null,
      'Contact Us': null
    };
    
    for (const label of Object.keys(buttons)) {
      const link = page.locator(`a, button`).filter({ hasText: new RegExp(label, 'i') }).first();
      if (await link.count() > 0) {
        const href = await link.getAttribute('href');
        buttons[label] = href;
      }
    }
    
    console.log('Button targets:', JSON.stringify(buttons, null, 2));
  });
  
  test('04 - Stats bar source', async ({ page }) => {
    const statsData = [];
    page.on('response', async response => {
      if (response.url().includes('/rest/v1/stats')) {
        const data = await response.json();
        statsData.push(...data);
      }
    });
    
    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    console.log('Stats from API:', JSON.stringify(statsData, null, 2));
    
    // Find stats on page
    const statElements = page.locator('[class*="StatItem"], [class*="stat"]').filter({
      has: page.locator('text=/\\d+[+%]?/')
    });
    const count = await statElements.count();
    console.log(`Stat elements found: ${count}`);
  });
  
  test('05 - Timeline structure at 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Find timeline section
    const timeline = page.locator('text=/Our Story|Our Journey|Timeline|قصتنا/').locator('..').locator('..');
    if (await timeline.count() > 0) {
      const timelineItems = timeline.locator('[class*="timeline"], [class*="milestone"]').or(
        timeline.locator('article, li, div').filter({ hasText: /20\d{2}/ })
      );
      const itemCount = await timelineItems.count();
      console.log(`Timeline items: ${itemCount}`);
      
      // Check first item text size
      if (itemCount > 0) {
        const firstItem = timelineItems.first();
        const fontSize = await firstItem.evaluate(el => {
          const allText = el.querySelectorAll('p, span, h3, h4');
          const sizes = Array.from(allText).map(t => parseFloat(window.getComputedStyle(t).fontSize));
          return { min: Math.min(...sizes), max: Math.max(...sizes), count: sizes.length };
        });
        console.log('Timeline text sizes:', fontSize);
      }
    }
  });
  
  test('06 - Timeline structure at 1440px', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const timeline = page.locator('text=/Our Story|Our Journey|Timeline|قصتنا/').locator('..').locator('..');
    if (await timeline.count() > 0) {
      const box = await timeline.boundingBox();
      console.log('Timeline bounding box:', box);
      
      // Check for grid/flex layout
      const layout = await timeline.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          display: style.display,
          gridTemplateColumns: style.gridTemplateColumns,
          flexDirection: style.flexDirection,
          gap: style.gap
        };
      });
      console.log('Timeline layout:', layout);
    }
  });
  
  test('07 - Team image source', async ({ page }) => {
    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState('networkidle');
    
    // Find team section
    const teamSection = page.locator('text=/Meet Our Team|فريقنا/').locator('..').locator('..');
    if (await teamSection.count() > 0) {
      const images = teamSection.locator('img');
      const imageCount = await images.count();
      console.log(`Team images found: ${imageCount}`);
      
      for (let i = 0; i < imageCount; i++) {
        const src = await images.nth(i).getAttribute('src');
        const alt = await images.nth(i).getAttribute('alt');
        console.log(`Image ${i}: src="${src}", alt="${alt}"`);
      }
    }
  });
  
  test('08 - Map card inspection', async ({ page }) => {
    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState('networkidle');
    
    // Look for map or region-related elements
    const mapElements = page.locator('[class*="map"], [class*="Map"], [class*="region"], [class*="Region"]');
    const count = await mapElements.count();
    console.log(`Map elements found: ${count}`);
    
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        const elem = mapElements.nth(i);
        const box = await elem.boundingBox();
        const content = await elem.textContent();
        console.log(`Map element ${i}: box=${JSON.stringify(box)}, content="${content?.slice(0, 50)}"`);
      }
    }
  });
  
  test('09 - Console errors', async ({ page }) => {
    const errors = [];
    const warnings = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
      if (msg.type() === 'warning') warnings.push(msg.text());
    });
    
    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('Console errors:', errors);
    console.log('Console warnings:', warnings);
  });
  
  test('10 - Failed network requests', async ({ page }) => {
    const failedRequests = [];
    
    page.on('response', response => {
      if (!response.ok() && response.url().includes(BASE_URL.replace('http://localhost:4173', ''))) {
        failedRequests.push({ url: response.url(), status: response.status() });
      }
    });
    
    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState('networkidle');
    
    console.log('Failed requests:', JSON.stringify(failedRequests, null, 2));
  });
  
  test('11 - Dark theme check', async ({ page }) => {
    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState('networkidle');
    
    // Toggle to dark theme
    const themeButton = page.locator('button[aria-label*="theme"], button[aria-label*="mode"]').first();
    if (await themeButton.count() > 0) {
      await themeButton.click();
      await page.waitForTimeout(1000);
      
      const htmlClass = await page.locator('html').getAttribute('class');
      console.log('HTML class after theme toggle:', htmlClass);
      
      // Check if dark class is applied
      const isDark = htmlClass?.includes('dark');
      console.log('Dark theme active:', isDark);
    } else {
      console.log('Theme toggle button not found');
    }
  });
  
  test('12 - Screenshot capture - Light EN 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'test-results/about-r3-light-en-390.png', fullPage: true });
    console.log('Screenshot saved: about-r3-light-en-390.png');
  });
  
  test('13 - Screenshot capture - Dark EN 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState('networkidle');
    
    const themeButton = page.locator('button[aria-label*="theme"]').first();
    if (await themeButton.count() > 0) {
      await themeButton.click();
      await page.waitForTimeout(1000);
    }
    
    await page.screenshot({ path: 'test-results/about-r3-dark-en-390.png', fullPage: true });
    console.log('Screenshot saved: about-r3-dark-en-390.png');
  });
});
