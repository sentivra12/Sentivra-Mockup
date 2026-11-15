/**
 * ABOUT PAGE ROUND 2 - COMPREHENSIVE DIAGNOSIS
 * 
 * Captures evidence for all reported issues:
 * 1. Country cards with broken images (US/UK/UAE vs claimed Egypt/UAE/Oman)
 * 2. Empty map card
 * 3. "Our Work" link target
 * 4. Stats data source and values
 * 5. Hero contrast and image source
 * 6. Marquee showing only "Sentivra" repeated
 * 7. Timeline layout issues
 * 8. Team section dark band and stock photo
 * 9. Font sizes and section seams
 * 10. Dark theme and RTL issues
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4173';

test.describe('About Page Round 2 - Evidence Collection', () => {

  test('STEP 1.1 - Countries section: broken images and data source', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      localStorage.setItem('language', 'en');
    });

    // Listen for network requests
    const requests = [];
    const responses = [];
    page.on('request', req => {
      if (req.url().includes('countries') || req.url().includes('storage')) {
        requests.push({ url: req.url(), method: req.method() });
      }
    });
    page.on('response', resp => {
      if (resp.url().includes('countries') || resp.url().includes('storage')) {
        responses.push({ 
          url: resp.url(), 
          status: resp.status(), 
          statusText: resp.statusText() 
        });
      }
    });

    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check for "Our Presence" section
    const presenceSection = page.locator('text=Building Solutions Across the Region');
    await expect(presenceSection).toBeVisible();

    // Find all images in the countries section
    const images = page.locator('img[alt*="flag"], img[alt*="Flag"], img[alt*="country"], img[alt*="Country"]');
    const imageCount = await images.count();

    console.log('\n=== COUNTRIES SECTION ===');
    console.log(`Found ${imageCount} country images`);

    // Check each image's status
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const src = await img.getAttribute('src');
      const naturalWidth = await img.evaluate(el => el.naturalWidth);
      const visible = await img.isVisible();
      
      console.log(`\nImage ${i + 1}:`);
      console.log(`  Alt: ${alt}`);
      console.log(`  Src: ${src}`);
      console.log(`  Natural Width: ${naturalWidth}`);
      console.log(`  Visible: ${visible}`);
      console.log(`  Status: ${naturalWidth === 0 ? '❌ BROKEN' : '✅ Loaded'}`);
    }

    // Check what countries are shown in the text
    const bodyText = await page.textContent('body');
    const mentionsEgypt = bodyText.includes('Egypt');
    const mentionsUAE = bodyText.includes('UAE') || bodyText.includes('United Arab Emirates');
    const mentionsOman = bodyText.includes('Oman');
    const mentionsUS = bodyText.includes('United States');
    const mentionsUK = bodyText.includes('United Kingdom');

    console.log('\n=== TEXT MENTIONS ===');
    console.log(`Egypt: ${mentionsEgypt}`);
    console.log(`UAE: ${mentionsUAE}`);
    console.log(`Oman: ${mentionsOman}`);
    console.log(`United States: ${mentionsUS}`);
    console.log(`United Kingdom: ${mentionsUK}`);

    // Log network requests
    console.log('\n=== NETWORK REQUESTS ===');
    console.log('Countries/Storage Requests:', JSON.stringify(requests, null, 2));
    console.log('Countries/Storage Responses:', JSON.stringify(responses, null, 2));

    await page.screenshot({ 
      path: 'tests/screenshots/about-r2-countries-mobile-light.png',
      fullPage: false
    });
  });

  test('STEP 1.2 - Map card status', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      localStorage.setItem('language', 'en');
    });

    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState('networkidle');

    // Check for RegionMap on desktop
    const regionMapSvg = page.locator('svg[viewBox="0 0 400 400"]');
    const isVisible = await regionMapSvg.isVisible();
    
    if (isVisible) {
      const svgHtml = await regionMapSvg.innerHTML();
      const hasCountryPins = svgHtml.includes('circle');
      const hasText = svgHtml.includes('<text');
      
      console.log('\n=== MAP CARD ===');
      console.log(`Visible: ${isVisible}`);
      console.log(`Has pins (circles): ${hasCountryPins}`);
      console.log(`Has text labels: ${hasText}`);
      console.log(`SVG content length: ${svgHtml.length}`);
    } else {
      console.log('\n=== MAP CARD ===');
      console.log('Not visible on desktop');
    }

    await page.screenshot({ 
      path: 'tests/screenshots/about-r2-map-desktop-light.png',
      fullPage: false
    });
  });

  test('STEP 1.3 - Our Work button link', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      localStorage.setItem('language', 'en');
    });

    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState('networkidle');

    // Find "Our Work" button
    const ourWorkButton = page.locator('a:has-text("Our Work"), button:has-text("Our Work")').first();
    const exists = await ourWorkButton.count() > 0;
    
    if (exists) {
      const href = await ourWorkButton.getAttribute('href');
      const tag = await ourWorkButton.evaluate(el => el.tagName);
      
      console.log('\n=== OUR WORK BUTTON ===');
      console.log(`Tag: ${tag}`);
      console.log(`Href: ${href}`);
      
      if (href) {
        // Check if target page exists
        const targetResponse = await page.goto(`${BASE_URL}${href}`);
        const targetStatus = targetResponse.status();
        console.log(`Target status: ${targetStatus} (${targetStatus === 404 ? '❌ NOT FOUND' : '✅ EXISTS'})`);
        
        // Go back to about page
        await page.goto(`${BASE_URL}/about`);
      }
    } else {
      console.log('\n=== OUR WORK BUTTON ===');
      console.log('Button not found');
    }
  });

  test('STEP 1.4 - Stats bar data source', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      localStorage.setItem('language', 'en');
    });

    // Listen for stats requests
    const statsRequests = [];
    page.on('response', async (resp) => {
      if (resp.url().includes('stats')) {
        try {
          const data = await resp.json();
          statsRequests.push({ url: resp.url(), status: resp.status(), data });
        } catch (e) {}
      }
    });

    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Find stats text
    const stats = await page.locator('text=/\\d+\\+?[^\\d]*(?:Projects?|Clients?|Countries?|Team|Satisfaction)/i').allTextContents();
    
    console.log('\n=== STATS BAR ===');
    console.log('Stats found:', stats);
    console.log('Stats requests:', JSON.stringify(statsRequests, null, 2));

    await page.screenshot({ 
      path: 'tests/screenshots/about-r2-stats-mobile.png',
      fullPage: false
    });
  });

  test('STEP 1.5 - Hero contrast and background', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      localStorage.setItem('language', 'en');
    });

    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState('networkidle');

    // Check hero section
    const heroText = page.locator('text="We are a full-service software company"').first();
    
    if (await heroText.count() > 0) {
      const computedStyle = await heroText.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          color: style.color,
          backgroundColor: style.backgroundColor,
          fontSize: style.fontSize,
          opacity: style.opacity
        };
      });
      
      console.log('\n=== HERO TEXT ===');
      console.log('Computed style:', JSON.stringify(computedStyle, null, 2));
    }

    // Check for background image
    const heroSection = page.locator('[class*="hero"]').first();
    if (await heroSection.count() > 0) {
      const bgImage = await heroSection.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.backgroundImage;
      });
      
      console.log('\n=== HERO BACKGROUND ===');
      console.log('Background image:', bgImage);
    }

    // Check breadcrumb
    const breadcrumb = page.locator('nav[aria-label*="readcrumb"], [class*="readcrumb"]').first();
    if (await breadcrumb.count() > 0) {
      const fontSize = await breadcrumb.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.fontSize;
      });
      
      console.log('\n=== BREADCRUMB ===');
      console.log('Font size:', fontSize);
    }

    await page.screenshot({ 
      path: 'tests/screenshots/about-r2-hero-mobile.png',
      fullPage: false
    });
  });

  test('STEP 1.6 - Marquee band content', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      localStorage.setItem('language', 'en');
    });

    // Listen for marquee requests
    page.on('response', async (resp) => {
      if (resp.url().includes('marquee')) {
        console.log('\n=== MARQUEE REQUEST ===');
        console.log('URL:', resp.url());
        console.log('Status:', resp.status());
        try {
          const data = await resp.json();
          console.log('Data:', JSON.stringify(data, null, 2));
        } catch (e) {}
      }
    });

    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Find marquee content
    const marqueeTexts = await page.locator('[class*="marquee"], [class*="brand-band"]').allTextContents();
    
    console.log('\n=== MARQUEE CONTENT ===');
    console.log('Texts found:', marqueeTexts);
    
    const bodyText = await page.textContent('body');
    const sentivraCount = (bodyText.match(/Sentivra/g) || []).length;
    console.log(`"Sentivra" appears ${sentivraCount} times in body`);

    await page.screenshot({ 
      path: 'tests/screenshots/about-r2-marquee-mobile.png',
      fullPage: false
    });
  });

  test('STEP 1.7 - Timeline layout', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      localStorage.setItem('language', 'en');
    });

    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState('networkidle');

    // Scroll to timeline section
    await page.locator('text="Our Story"').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // Check timeline structure
    const timelineSection = page.locator('text="From an Idea to a Growing Team"');
    if (await timelineSection.count() > 0) {
      console.log('\n=== TIMELINE SECTION ===');
      console.log('Section found: ✅');
    }

    // Check "Our Journey" button
    const journeyButton = page.locator('button:has-text("Our Journey"), a:has-text("Our Journey")').first();
    if (await journeyButton.count() > 0) {
      const tag = await journeyButton.evaluate(el => el.tagName);
      console.log(`"Our Journey" button/link found (${tag})`);
    }

    await page.screenshot({ 
      path: 'tests/screenshots/about-r2-timeline-mobile.png',
      fullPage: false
    });
  });

  test('STEP 1.8 - Team section', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      localStorage.setItem('language', 'en');
    });

    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState('networkidle');

    // Scroll to team section
    await page.locator('text="A Diverse Team of Talented Professionals"').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    const teamSection = page.locator('text="A Diverse Team of Talented Professionals"').locator('..').locator('..');
    
    if (await teamSection.count() > 0) {
      const bgColor = await teamSection.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.backgroundColor;
      });
      
      console.log('\n=== TEAM SECTION ===');
      console.log('Background color:', bgColor);
    }

    // Check for team image
    const teamImages = page.locator('img[src*="unsplash"]').filter({ hasText: /team|people|office/i });
    const teamImageCount = await teamImages.count();
    console.log(`Team images found: ${teamImageCount}`);

    // Check "Join Our Team" link
    const joinButton = page.locator('a:has-text("Join Our Team"), button:has-text("Join Our Team")').first();
    if (await joinButton.count() > 0) {
      const href = await joinButton.getAttribute('href');
      console.log(`"Join Our Team" href: ${href}`);
    }

    await page.screenshot({ 
      path: 'tests/screenshots/about-r2-team-mobile.png',
      fullPage: false
    });
  });

  test('STEP 1.9 - Font sizes and measurements', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      localStorage.setItem('language', 'en');
    });

    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState('networkidle');

    // Check body text font sizes
    const paragraphs = page.locator('p');
    const pCount = await paragraphs.count();
    
    console.log('\n=== FONT SIZES AT 390px ===');
    
    for (let i = 0; i < Math.min(pCount, 5); i++) {
      const p = paragraphs.nth(i);
      const text = await p.textContent();
      const fontSize = await p.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.fontSize;
      });
      
      const fontSizeNum = parseFloat(fontSize);
      console.log(`P${i + 1}: ${fontSizeNum}px - ${text.substring(0, 50)}... ${fontSizeNum < 14 ? '❌ TOO SMALL' : '✅'}`);
    }

    await page.screenshot({ 
      path: 'tests/screenshots/about-r2-full-mobile-light.png',
      fullPage: true
    });
  });

  test('STEP 1.10 - Dark theme check', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark');
      localStorage.setItem('language', 'en');
    });

    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState('networkidle');

    console.log('\n=== DARK THEME ===');
    
    const bodyBg = await page.locator('body').evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.backgroundColor;
    });
    
    console.log('Body background:', bodyBg);

    await page.screenshot({ 
      path: 'tests/screenshots/about-r2-full-mobile-dark.png',
      fullPage: true
    });
  });

  test('STEP 1.11 - Arabic RTL check', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      localStorage.setItem('language', 'ar');
    });

    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState('networkidle');

    const htmlDir = await page.locator('html').getAttribute('dir');
    console.log('\n=== ARABIC RTL ===');
    console.log('HTML dir:', htmlDir);

    await page.screenshot({ 
      path: 'tests/screenshots/about-r2-full-mobile-arabic.png',
      fullPage: true
    });
  });

  test('STEP 1.12 - Console errors', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push({ type: msg.type(), text: msg.text() });
    });

    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      localStorage.setItem('language', 'en');
    });

    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('\n=== CONSOLE MESSAGES ===');
    const errors = consoleMessages.filter(m => m.type === 'error');
    const warnings = consoleMessages.filter(m => m.type === 'warning');
    
    console.log(`Errors: ${errors.length}`);
    errors.forEach(e => console.log(`  ERROR: ${e.text}`));
    
    console.log(`Warnings: ${warnings.length}`);
    warnings.forEach(w => console.log(`  WARNING: ${w.text}`));
  });
});
