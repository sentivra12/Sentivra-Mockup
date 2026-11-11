import { chromium } from 'playwright';

async function diagnose() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:4173/services', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  const ctaAnalysis = await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll('section'));
    const lastSection = sections[sections.length - 1];
    
    // Look for CTA heading
    const heading = lastSection.querySelector('h2, h3, h1');
    const paragraph = lastSection.querySelector('p');
    
    if (!heading) return { error: 'No CTA heading found' };
    
    const headingStyles = window.getComputedStyle(heading);
    const paragraphStyles = paragraph ? window.getComputedStyle(paragraph) : null;
    const sectionStyles = window.getComputedStyle(lastSection);
    
    // Helper to parse RGB
    const parseRGB = (rgbString) => {
      const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      return match ? { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) } : null;
    };
    
    // Calculate relative luminance
    const getLuminance = (rgb) => {
      if (!rgb) return null;
      const rsRGB = rgb.r / 255;
      const gsRGB = rgb.g / 255;
      const bsRGB = rgb.b / 255;
      
      const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
      const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
      const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
      
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    
    // Calculate contrast ratio
    const getContrastRatio = (rgb1, rgb2) => {
      const l1 = getLuminance(rgb1);
      const l2 = getLuminance(rgb2);
      if (l1 === null || l2 === null) return null;
      
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    };
    
    const headingColor = parseRGB(headingStyles.color);
    const sectionBg = parseRGB(sectionStyles.backgroundColor);
    const paragraphColor = paragraph ? parseRGB(paragraphStyles.color) : null;
    
    const headingContrast = getContrastRatio(headingColor, sectionBg);
    const paragraphContrast = paragraphColor ? getContrastRatio(paragraphColor, sectionBg) : null;
    
    return {
      sectionClass: lastSection.className,
      sectionBg: sectionStyles.backgroundColor,
      sectionBgRGB: sectionBg,
      heading: {
        text: heading.textContent.substring(0, 60),
        color: headingStyles.color,
        colorRGB: headingColor,
        contrast: headingContrast,
        passesAA: headingContrast >= 4.5,
        passesAAA: headingContrast >= 7
      },
      paragraph: paragraph ? {
        text: paragraph.textContent.substring(0, 60),
        color: paragraphStyles.color,
        colorRGB: paragraphColor,
        contrast: paragraphContrast,
        passesAA: paragraphContrast >= 4.5,
        passesAAA: paragraphContrast >= 7
      } : null
    };
  });
  
  if (ctaAnalysis.error) {
    console.log('❌', ctaAnalysis.error);
    return;
  }
  
  console.log('🎯 Final CTA Contrast Analysis:\n');
  console.log('Section Background:', ctaAnalysis.sectionBg);
  console.log('');
  
  console.log('HEADING:');
  console.log(`  Text: "${ctaAnalysis.heading.text}"`);
  console.log(`  Color: ${ctaAnalysis.heading.color}`);
  console.log(`  Contrast: ${ctaAnalysis.heading.contrast?.toFixed(2)}:1`);
  console.log(`  WCAG AA (4.5:1): ${ctaAnalysis.heading.passesAA ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  WCAG AAA (7:1): ${ctaAnalysis.heading.passesAAA ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');
  
  if (ctaAnalysis.paragraph) {
    console.log('PARAGRAPH:');
    console.log(`  Text: "${ctaAnalysis.paragraph.text}"`);
    console.log(`  Color: ${ctaAnalysis.paragraph.color}`);
    console.log(`  Contrast: ${ctaAnalysis.paragraph.contrast?.toFixed(2)}:1`);
    console.log(`  WCAG AA (4.5:1): ${ctaAnalysis.paragraph.passesAA ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  WCAG AAA (7:1): ${ctaAnalysis.paragraph.passesAAA ? '✅ PASS' : '❌ FAIL'}`);
  }
  
  await browser.close();
}

diagnose().catch(console.error);
