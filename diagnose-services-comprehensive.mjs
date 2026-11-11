/**
 * Comprehensive Services Page Diagnostics
 * 
 * Issues to check:
 * 1. Boxed section headers (SectionHeader / gradient text helper / InverseSurface)
 * 2. Empty mini visuals in service cards
 * 3. Tall empty first card
 * 4. Stuck hover offset on "Mobile Application Development"
 * 5. Unique icons per service
 * 6. Blank hero
 * 7. Duplicate services
 */

import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = 'screenshots-services-comprehensive';

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function diagnose() {
  console.log('🔍 Comprehensive Services Page Diagnostics\n');
  
  const browser = await chromium.launch({ headless: false });
  
  try {
    const themes = ['light', 'dark'];
    const languages = ['en', 'ar'];
    const viewports = [
      { name: '1440', width: 1440, height: 900 },
      { name: '390', width: 390, height: 844 }
    ];
    const motionPrefs = [
      { name: 'reduce', value: 'reduce' },
      { name: 'no-preference', value: 'no-preference' }
    ];
    
    for (const motionPref of motionPrefs) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Testing with reducedMotion: '${motionPref.name}'`);
      console.log('='.repeat(60));
      
      for (const theme of themes) {
        for (const lang of languages) {
          for (const viewport of viewports) {
            const testLabel = `${theme}-${lang}-${viewport.name}-motion-${motionPref.name}`;
            console.log(`\n📋 Testing: /services (${testLabel})`);
            
            const context = await browser.newContext({
              viewport: { width: viewport.width, height: viewport.height },
              colorScheme: theme,
              reducedMotion: motionPref.value
            });
            
            const page = await context.newPage();
            
            // Set language cookie
            await context.addCookies([{
              name: 'language',
              value: lang,
              domain: 'localhost',
              path: '/'
            }]);
            
            // Track console messages
            const consoleMessages = [];
            page.on('console', msg => {
              consoleMessages.push({
                type: msg.type(),
                text: msg.text()
              });
            });
            
            // Load page
            await page.goto(`${BASE_URL}/services`, { waitUntil: 'networkidle' });
            await page.waitForTimeout(3000); // Wait for animations/hydration
            
            // Full page screenshot
            await page.screenshot({
              path: path.join(SCREENSHOT_DIR, `services-full-${testLabel}.png`),
              fullPage: true
            });
            
            // ============================================
            // 1. CHECK SECTION HEADERS - Boxed appearance
            // ============================================
            console.log('  🔍 Checking section headers...');
            
            const sectionHeaders = await page.locator('[class*="SectionHeader"], h2:has-text("Comprehensive Software Solutions"), h2:has-text("How We Work"), h2:has-text("حلول برمجية شاملة")').all();
            
            console.log(`     Found ${sectionHeaders.length} section headers`);
            
            for (let i = 0; i < sectionHeaders.length; i++) {
              const header = sectionHeaders[i];
              const text = await header.textContent();
              const shortText = text.substring(0, 40);
              
              try {
                const box = await header.boundingBox();
                const styles = await header.evaluate(el => {
                  const computed = window.getComputedStyle(el);
                  // Also check parent for InverseSurface styles
                  const parent = el.closest('[class*="inverse"], [class*="InverseSurface"], section');
                  const parentComputed = parent ? window.getComputedStyle(parent) : null;
                  
                  return {
                    background: computed.background,
                    backgroundColor: computed.backgroundColor,
                    border: computed.border,
                    borderRadius: computed.borderRadius,
                    boxShadow: computed.boxShadow,
                    padding: computed.padding,
                    parentBg: parentComputed?.backgroundColor,
                    parentBorder: parentComputed?.border,
                    parentBoxShadow: parentComputed?.boxShadow
                  };
                });
                
                // Check if header looks "boxed" (has visible background/border different from page)
                const hasBackground = styles.backgroundColor && styles.backgroundColor !== 'rgba(0, 0, 0, 0)';
                const hasBorder = styles.border && styles.border !== 'none' && !styles.border.includes('0px');
                const hasBoxShadow = styles.boxShadow && styles.boxShadow !== 'none';
                
                if (hasBackground || hasBorder || hasBoxShadow) {
                  console.log(`     ⚠️  Header "${shortText}" appears boxed:`);
                  if (hasBackground) console.log(`        - Background: ${styles.backgroundColor}`);
                  if (hasBorder) console.log(`        - Border: ${styles.border}`);
                  if (hasBoxShadow) console.log(`        - Shadow: ${styles.boxShadow}`);
                }
                
                // Screenshot individual header
                if (box) {
                  await page.screenshot({
                    path: path.join(SCREENSHOT_DIR, `header-${i}-${testLabel}.png`),
                    clip: {
                      x: Math.max(0, box.x - 20),
                      y: Math.max(0, box.y - 20),
                      width: Math.min(viewport.width - box.x + 20, box.width + 40),
                      height: box.height + 40
                    }
                  });
                }
              } catch (e) {
                console.log(`     ⚠️  Could not analyze header "${shortText}": ${e.message}`);
              }
            }
            
            // ============================================
            // 2. CHECK SERVICE CARDS
            // ============================================
            console.log('  🔍 Checking service cards...');
            
            const serviceCards = await page.locator('[class*="service"], [class*="card"]:has([class*="icon"]), article').all();
            console.log(`     Found ${serviceCards.length} potential service cards`);
            
            for (let i = 0; i < Math.min(serviceCards.length, 10); i++) {
              const card = serviceCards[i];
              
              try {
                const box = await card.boundingBox();
                if (!box) continue;
                
                const cardInfo = await card.evaluate(el => {
                  const title = el.querySelector('h3, h4, [class*="title"]');
                  const icon = el.querySelector('svg, [class*="icon"]');
                  const visual = el.querySelector('[class*="visual"], [class*="animation"], canvas, video, img');
                  
                  return {
                    title: title?.textContent?.trim() || 'Unknown',
                    hasIcon: !!icon,
                    iconClass: icon?.getAttribute('class'),
                    hasVisual: !!visual,
                    visualType: visual?.tagName?.toLowerCase(),
                    height: el.getBoundingClientRect().height,
                    isEmpty: !el.textContent?.trim()
                  };
                });
                
                console.log(`     Card #${i + 1}: "${cardInfo.title.substring(0, 30)}"`);
                console.log(`        Height: ${cardInfo.height}px`);
                console.log(`        Icon: ${cardInfo.hasIcon ? '✓' : '✗'} ${cardInfo.iconClass || ''}`);
                console.log(`        Visual: ${cardInfo.hasVisual ? `✓ (${cardInfo.visualType})` : '✗'}`);
                
                if (cardInfo.height > 400) {
                  console.log(`        ⚠️  Unusually tall card (${cardInfo.height}px)`);
                }
                
                if (cardInfo.isEmpty) {
                  console.log(`        ⚠️  Card appears empty`);
                }
                
                if (!cardInfo.hasVisual) {
                  console.log(`        ⚠️  Missing visual element`);
                }
                
                // Screenshot first few cards
                if (i < 5 && box) {
                  await page.screenshot({
                    path: path.join(SCREENSHOT_DIR, `card-${i}-${testLabel}.png`),
                    clip: {
                      x: Math.max(0, box.x - 10),
                      y: Math.max(0, box.y - 10),
                      width: Math.min(viewport.width - box.x + 10, box.width + 20),
                      height: Math.min(viewport.height - box.y + 10, box.height + 20)
                    }
                  });
                }
              } catch (e) {
                console.log(`     ⚠️  Could not analyze card #${i + 1}: ${e.message}`);
              }
            }
            
            // ============================================
            // 3. CHECK FOR STUCK HOVER STATES
            // ============================================
            console.log('  🔍 Checking for stuck hover states...');
            
            const mobileDevCard = await page.locator('text=/Mobile Application Development|تطوير تطبيقات الموبايل/i').first();
            if (await mobileDevCard.count() > 0) {
              const styles = await mobileDevCard.evaluate(el => {
                const computed = window.getComputedStyle(el.closest('article, [class*="card"], div'));
                return {
                  transform: computed.transform,
                  translateY: computed.transform.match(/translateY?\(([^)]+)\)/)?.[1],
                  boxShadow: computed.boxShadow
                };
              });
              
              console.log(`     Mobile Dev card transform: ${styles.transform}`);
              if (styles.translateY && styles.translateY !== '0px') {
                console.log(`     ⚠️  Card has non-zero translateY: ${styles.translateY}`);
              }
            }
            
            // ============================================
            // 4. CHECK HERO
            // ============================================
            console.log('  🔍 Checking hero...');
            
            const hero = await page.locator('section').first();
            const heroBox = await hero.boundingBox();
            
            if (heroBox) {
              const heroInfo = await hero.evaluate(el => {
                const h1 = el.querySelector('h1');
                const p = el.querySelector('p');
                const button = el.querySelector('button, a[class*="button"]');
                
                return {
                  hasH1: !!h1,
                  h1Text: h1?.textContent?.trim(),
                  hasP: !!p,
                  pText: p?.textContent?.trim()?.substring(0, 50),
                  hasButton: !!button,
                  height: el.getBoundingClientRect().height,
                  isEmpty: !el.textContent?.trim()
                };
              });
              
              console.log(`     Hero height: ${heroInfo.height}px`);
              console.log(`     H1: ${heroInfo.hasH1 ? `✓ "${heroInfo.h1Text?.substring(0, 40)}"` : '✗ MISSING'}`);
              console.log(`     Paragraph: ${heroInfo.hasP ? `✓ "${heroInfo.pText}"` : '✗ MISSING'}`);
              console.log(`     Button: ${heroInfo.hasButton ? '✓' : '✗'}`);
              
              if (heroInfo.isEmpty || !heroInfo.hasH1) {
                console.log(`     ⚠️  Hero appears empty or missing content`);
              }
              
              // Screenshot hero
              await page.screenshot({
                path: path.join(SCREENSHOT_DIR, `hero-${testLabel}.png`),
                clip: {
                  x: 0,
                  y: 0,
                  width: viewport.width,
                  height: Math.min(heroBox.height, 800)
                }
              });
            }
            
            // ============================================
            // 5. CHECK FOR DUPLICATE SERVICES
            // ============================================
            console.log('  🔍 Checking for duplicate services...');
            
            const serviceTitles = await page.locator('h3, h4, [class*="title"]').allTextContents();
            const titleCounts = {};
            serviceTitles.forEach(title => {
              const cleaned = title.trim().toLowerCase();
              if (cleaned) {
                titleCounts[cleaned] = (titleCounts[cleaned] || 0) + 1;
              }
            });
            
            const duplicates = Object.entries(titleCounts).filter(([, count]) => count > 1);
            if (duplicates.length > 0) {
              console.log(`     ⚠️  Found ${duplicates.length} duplicate service titles:`);
              duplicates.forEach(([title, count]) => {
                console.log(`        - "${title.substring(0, 40)}" appears ${count} times`);
              });
            } else {
              console.log(`     ✓ No duplicate titles found`);
            }
            
            // ============================================
            // 6. CHECK CONSOLE ERRORS
            // ============================================
            const errors = consoleMessages.filter(m => m.type === 'error');
            if (errors.length > 0) {
              console.log(`  ⚠️  ${errors.length} console errors:`);
              errors.slice(0, 5).forEach(err => {
                console.log(`     ${err.text.substring(0, 100)}`);
              });
            }
            
            await context.close();
          }
        }
      }
    }
    
    console.log('\n✅ Comprehensive diagnostics complete!');
    console.log(`📸 Screenshots saved to: ${SCREENSHOT_DIR}/\n`);
    
  } catch (error) {
    console.error('❌ Error during diagnostics:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

diagnose().catch(console.error);
