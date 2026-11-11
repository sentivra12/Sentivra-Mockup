import { chromium } from 'playwright';

async function diagnoseFontRendering() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:4174/services', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  const fontAnalysis = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const p = document.querySelector('main p, section p');
    const primaryBtn = document.querySelector('a[href="/contact"] button span, a[href="/contact"] button');
    const secondaryBtn = Array.from(document.querySelectorAll('button')).find(b => 
      b.textContent.includes('Explore')
    );
    
    const analyzeElement = (el, name) => {
      if (!el) return { name, error: 'Not found' };
      
      const computed = window.getComputedStyle(el);
      
      // Parse RGB color
      const parseRGB = (rgbString) => {
        const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        return match ? {
          r: parseInt(match[1]),
          g: parseInt(match[2]),
          b: parseInt(match[3]),
          hex: '#' + [match[1], match[2], match[3]].map(x => 
            parseInt(x).toString(16).padStart(2, '0')
          ).join('')
        } : null;
      };
      
      const color = parseRGB(computed.color);
      const bgColor = parseRGB(computed.backgroundColor);
      
      return {
        name,
        text: el.textContent.substring(0, 50),
        font: {
          family: computed.fontFamily,
          size: computed.fontSize,
          weight: computed.fontWeight,
          style: computed.fontStyle
        },
        color: {
          raw: computed.color,
          parsed: color
        },
        rendering: {
          textRendering: computed.textRendering,
          webkitFontSmoothing: computed.webkitFontSmoothing,
          mozOsxFontSmoothing: computed.MozOsxFontSmoothing,
          fontSmooth: computed.fontSmooth
        },
        effects: {
          opacity: computed.opacity,
          filter: computed.filter,
          textShadow: computed.textShadow,
          letterSpacing: computed.letterSpacing
        },
        background: bgColor ? bgColor.hex : 'transparent'
      };
    };
    
    return {
      h1: analyzeElement(h1, 'H1'),
      paragraph: analyzeElement(p, 'Paragraph'),
      primaryButton: analyzeElement(primaryBtn, 'Primary Button'),
      secondaryButton: analyzeElement(secondaryBtn, 'Secondary Button (Sharp)')
    };
  });
  
  console.log('🔍 FONT & RENDERING ANALYSIS:\n');
  
  Object.entries(fontAnalysis).forEach(([key, data]) => {
    if (data.error) {
      console.log(`${data.name}: ❌ ${data.error}\n`);
      return;
    }
    
    console.log(`${data.name.toUpperCase()}:`);
    console.log(`  Text: "${data.text}"`);
    console.log(`  Font: ${data.font.family}`);
    console.log(`  Size: ${data.font.size}`);
    console.log(`  Weight: ${data.font.weight}`);
    console.log(`  Color: ${data.color.raw} (${data.color.parsed?.hex})`);
    console.log(`  Opacity: ${data.effects.opacity}`);
    console.log(`  Text Rendering: ${data.rendering.textRendering}`);
    console.log(`  Font Smoothing: ${data.rendering.webkitFontSmoothing || 'default'}`);
    
    // Flag potential issues
    const issues = [];
    if (parseInt(data.font.weight) < 500) issues.push('THIN FONT');
    if (parseFloat(data.effects.opacity) < 1) issues.push('LOW OPACITY');
    if (data.effects.filter !== 'none') issues.push('FILTER');
    
    // Check color lightness
    if (data.color.parsed) {
      const { r, g, b } = data.color.parsed;
      const lightness = (Math.max(r, g, b) + Math.min(r, g, b)) / 2;
      if (lightness > 180) issues.push('VERY LIGHT COLOR');
    }
    
    if (issues.length > 0) {
      console.log(`  🚨 ISSUES: ${issues.join(', ')}`);
    } else {
      console.log(`  ✅ Looks OK`);
    }
    console.log('');
  });
  
  // Compare
  console.log('🔍 COMPARISON:\n');
  if (!fontAnalysis.h1.error) {
    console.log('H1 (BLURRED):');
    console.log(`  Weight: ${fontAnalysis.h1.font.weight}`);
    console.log(`  Color: ${fontAnalysis.h1.color.parsed?.hex}`);
    console.log(`  Opacity: ${fontAnalysis.h1.effects.opacity}`);
  }
  
  if (!fontAnalysis.secondaryButton.error) {
    console.log('\nSecondary Button (SHARP):');
    console.log(`  Weight: ${fontAnalysis.secondaryButton.font.weight}`);
    console.log(`  Color: ${fontAnalysis.secondaryButton.color.parsed?.hex}`);
    console.log(`  Opacity: ${fontAnalysis.secondaryButton.effects.opacity}`);
  }
  
  await browser.close();
}

diagnoseFontRendering().catch(console.error);
