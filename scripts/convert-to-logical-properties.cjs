#!/usr/bin/env node
/**
 * Convert Directional CSS to Logical Properties
 * 
 * This script converts physical directional properties (ml, mr, pl, pr, etc.)
 * to logical properties (ms, me, ps, pe) for better RTL support.
 * 
 * Mappings:
 * - ml-* → ms-* (margin-left → margin-inline-start)
 * - mr-* → me-* (margin-right → margin-inline-end)
 * - pl-* → ps-* (padding-left → padding-inline-start)
 * - pr-* → pe-* (padding-right → padding-inline-end)
 * - left-* → start-* (positioning)
 * - right-* → end-* (positioning)
 * - border-l → border-s (border-left → border-inline-start)
 * - border-r → border-e (border-right → border-inline-end)
 * - rounded-l → rounded-s
 * - rounded-r → rounded-e
 */

const fs = require('fs');
const path = require('path');

const conversions = [
  // Margins
  { pattern: /\bml-(\d+|auto|px)\b/g, replacement: 'ms-$1' },
  { pattern: /\bmr-(\d+|auto|px)\b/g, replacement: 'me-$1' },
  
  // Paddings
  { pattern: /\bpl-(\d+|auto|px)\b/g, replacement: 'ps-$1' },
  { pattern: /\bpr-(\d+|auto|px)\b/g, replacement: 'pe-$1' },
  
  // Positioning
  { pattern: /\bleft-(\d+|auto)\b/g, replacement: 'start-$1' },
  { pattern: /\bright-(\d+|auto)\b/g, replacement: 'end-$1' },
  
  // Borders
  { pattern: /\bborder-l-(\d+)\b/g, replacement: 'border-s-$1' },
  { pattern: /\bborder-r-(\d+)\b/g, replacement: 'border-e-$1' },
  { pattern: /\bborder-l\b/g, replacement: 'border-s' },
  { pattern: /\bborder-r\b/g, replacement: 'border-e' },
  
  // Rounded corners
  { pattern: /\brounded-l-(\w+)\b/g, replacement: 'rounded-s-$1' },
  { pattern: /\brounded-r-(\w+)\b/g, replacement: 'rounded-e-$1' },
  { pattern: /\brounded-l\b/g, replacement: 'rounded-s' },
  { pattern: /\brounded-r\b/g, replacement: 'rounded-e' },
  
  // Divide
  { pattern: /\bdivide-x-(\d+)\b/g, replacement: 'divide-x-$1 [&>*]:border-s-$1' },
];

function convertFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let changes = [];

    conversions.forEach(({ pattern, replacement }) => {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        modified = true;
        changes.push(`${pattern.source} → ${replacement}`);
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      changes.forEach(change => console.log(`   - ${change}`));
      return { success: true, changes: changes.length };
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
      return { success: true, changes: 0 };
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return { success: false, changes: 0 };
  }
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node convert-to-logical-properties.cjs <file-path>');
    console.log('Example: node convert-to-logical-properties.cjs src/components/Header.jsx');
    process.exit(1);
  }

  const filePath = args[0];
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  console.log(`\n🔄 Converting directional properties to logical properties...\n`);
  const result = convertFile(filePath);
  
  if (result.success && result.changes > 0) {
    console.log(`\n✨ Conversion complete! ${result.changes} pattern(s) updated.`);
  } else if (result.success) {
    console.log(`\n✨ File already uses logical properties or has no directional properties.`);
  } else {
    console.log(`\n❌ Conversion failed.`);
    process.exit(1);
  }
}

main();
