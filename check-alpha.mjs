/**
 * Alpha channel inspector — checks if hands-360.webp has transparent pixels
 * and finds the min/max alpha to detect background bleed.
 */
import { chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const webpPath = path.join(__dir, 'public/hero/hands-360.webp');
const pngPath  = path.join(__dir, 'public/hero/hands.png');

const browser = await chromium.launch({ headless: true });
const page    = await browser.newPage();
await page.setContent('<html><body></body></html>');

for (const [label, filePath] of [['hands-360.webp', webpPath], ['hands.png', pngPath]]) {
  const data   = fs.readFileSync(filePath);
  const b64    = data.toString('base64');
  const mime   = filePath.endsWith('.png') ? 'image/png' : 'image/webp';

  const result = await page.evaluate(async ({ b64, mime, label }) => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const c   = document.createElement('canvas');
        c.width   = img.naturalWidth;
        c.height  = img.naturalHeight;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const pxData  = ctx.getImageData(0, 0, c.width, c.height).data;
        let minA = 255, maxA = 0, transparentCount = 0, opaqueCount = 0, semiCount = 0;
        for (let i = 3; i < pxData.length; i += 4) {
          const a = pxData[i];
          if (a < minA) minA = a;
          if (a > maxA) maxA = a;
          if (a === 0)   transparentCount++;
          else if (a === 255) opaqueCount++;
          else semiCount++;
        }
        const total = c.width * c.height;
        // Sample corners (20x20 patch) — should be transparent if properly cut-out
        const corners = [];
        for (const [cx, cy] of [[0,0],[c.width-20,0],[0,c.height-20],[c.width-20,c.height-20]]) {
          let sumA = 0, count = 0;
          for (let y = cy; y < Math.min(cy+20,c.height); y++) {
            for (let x = cx; x < Math.min(cx+20,c.width); x++) {
              sumA += pxData[(y * c.width + x) * 4 + 3];
              count++;
            }
          }
          corners.push(Math.round(sumA / count));
        }
        resolve({
          label, w: c.width, h: c.height, total,
          minA, maxA, transparentCount, opaqueCount, semiCount,
          cornerAvgAlpha: corners,  // TL, TR, BL, BR — should be 0 if transparent
          hasAlpha: minA < 255,
          backgroundLeak: corners.some(a => a > 20), // any corner with >20 avg alpha = background bleed
        });
      };
      img.onerror = () => resolve({ label, error: 'load failed' });
      img.src = `data:${mime};base64,${b64}`;
    });
  }, { b64, mime, label });

  console.log(`\n=== ${label} ===`);
  console.log(`  Size:       ${result.w}×${result.h}  (${Math.round(data.length/1024)}KB)`);
  console.log(`  Alpha range: min=${result.minA}  max=${result.maxA}`);
  console.log(`  Pixels: transparent=${result.transparentCount}  semi=${result.semiCount}  opaque=${result.opaqueCount}  total=${result.total}`);
  console.log(`  Corner avg alpha [TL,TR,BL,BR]: ${result.cornerAvgAlpha}`);
  console.log(`  Has alpha channel: ${result.hasAlpha}`);
  console.log(`  Background leak detected: ${result.backgroundLeak}`);
}

await browser.close();
console.log('\nDone.');
