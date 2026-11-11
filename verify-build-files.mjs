import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('\n🔍 Verifying built files...\n');

// Check if dist folder exists
if (!existsSync('dist')) {
  console.log('❌ dist folder does not exist');
  process.exit(1);
}

// Find the main JS bundle
const indexHtml = readFileSync('dist/index.html', 'utf-8');
const jsMatch = indexHtml.match(/src="\/assets\/(index-[a-f0-9]+\.js)"/);

if (!jsMatch) {
  console.log('❌ Could not find main JS bundle in index.html');
  process.exit(1);
}

const jsFile = jsMatch[1];
console.log(`✅ Found main bundle: ${jsFile}`);

// Read the bundle
const bundlePath = join('dist', 'assets', jsFile);
const bundle = readFileSync(bundlePath, 'utf-8');

// Check for PremiumCTA component
const hasPremiumCTA = bundle.includes('PremiumCTA') || 
                      bundle.includes('Like What You See') ||
                      bundle.includes('هل أعجبك ما');

console.log(`${hasPremiumCTA ? '✅' : '❌'} PremiumCTA component: ${hasPremiumCTA ? 'FOUND' : 'NOT FOUND'}`);

// Check for InverseSurface with bg-[var(--inverse-bg)]
const hasInverseBg = bundle.includes('inverse-surface') &&
                     (bundle.includes('bg-[var(--inverse-bg)]') || 
                      bundle.includes('--inverse-bg'));

console.log(`${hasInverseBg ? '✅' : '❌'} InverseSurface with inverse-bg: ${hasInverseBg ? 'FOUND' : 'NOT FOUND'}`);

// Check for device stage
const hasDeviceStage = bundle.includes('DeviceStage') ||
                       bundle.includes('aspect-video') ||
                       bundle.includes('laptop') ||
                       bundle.includes('phone');

console.log(`${hasDeviceStage ? '✅' : '❌'} Device stage: ${hasDeviceStage ? 'FOUND' : 'NOT FOUND'}`);

// Check CSS
const cssMatch = indexHtml.match(/href="\/assets\/(index-[a-f0-9]+\.css)"/);
if (cssMatch) {
  const cssFile = cssMatch[1];
  console.log(`✅ Found CSS bundle: ${cssFile}`);
  
  const cssPath = join('dist', 'assets', cssFile);
  const css = readFileSync(cssPath, 'utf-8');
  
  const hasInverseCSS = css.includes('.inverse-surface') || css.includes('--inverse-bg');
  console.log(`${hasInverseCSS ? '✅' : '❌'} Inverse CSS variables: ${hasInverseCSS ? 'FOUND' : 'NOT FOUND'}`);
}

console.log('\n✅ Build verification complete!\n');
