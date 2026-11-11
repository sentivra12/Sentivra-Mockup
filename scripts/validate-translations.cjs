#!/usr/bin/env node
/**
 * Translation Key Validation Script
 * 
 * Extracts all t("...") calls from the codebase and validates that:
 * 1. Every key exists in both en.json and ar.json
 * 2. No raw translation keys render on screen
 * 3. Fails the build if keys are missing
 * 
 * Usage: node scripts/validate-translations.js
 * In package.json: Add to "prebuild": "node scripts/validate-translations.js"
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// ANSI colors
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

const SRC_DIR = path.join(__dirname, '../src');
const EN_PATH = path.join(SRC_DIR, 'i18n/locales/en.json');
const AR_PATH = path.join(SRC_DIR, 'i18n/locales/ar.json');

console.log('🔍 Validating translation keys...\n');

// Load translation files
let enTranslations, arTranslations;
try {
  enTranslations = JSON.parse(fs.readFileSync(EN_PATH, 'utf8'));
  arTranslations = JSON.parse(fs.readFileSync(AR_PATH, 'utf8'));
  console.log(`✓ Loaded English translations from ${path.relative(process.cwd(), EN_PATH)}`);
  console.log(`✓ Loaded Arabic translations from ${path.relative(process.cwd(), AR_PATH)}\n`);
} catch (error) {
  console.error(`${RED}✗ Error loading translation files:${RESET}`, error.message);
  process.exit(1);
}

// Flatten nested translation keys
function flattenKeys(obj, prefix = '') {
  let keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys = keys.concat(flattenKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const enKeys = new Set(flattenKeys(enTranslations));
const arKeys = new Set(flattenKeys(arTranslations));

console.log(`📊 Found ${enKeys.size} English keys`);
console.log(`📊 Found ${arKeys.size} Arabic keys\n`);

// Extract t("...") calls from source files
const tCallRegex = /t\(['"`]([a-zA-Z0-9._]+)['"`]\)/g;
const usedKeys = new Set();

// Ignore list: keys that are false positives from dynamic code
const ignoreList = new Set([
  'img', 'canvas', '2d', '.', 'meta', 'link', 'mockup', 
  'div', 'span', 'p', 'h1', 'h2', 'h3', 'src', 'alt'
]);

const sourceFiles = glob.sync('**/*.{js,jsx,ts,tsx}', {
  cwd: SRC_DIR,
  absolute: true,
  ignore: ['**/node_modules/**', '**/dist/**', '**/*.test.*', '**/*.spec.*']
});

console.log(`📁 Scanning ${sourceFiles.length} source files...\n`);

sourceFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = tCallRegex.exec(content)) !== null) {
    const key = match[1];
    // Skip ignored keys (likely false positives)
    if (!ignoreList.has(key) && key.includes('.')) {
      usedKeys.add(key);
    }
  }
});

console.log(`🔑 Found ${usedKeys.size} translation keys used in code\n`);

// Validation
let hasErrors = false;
const missingInEn = [];
const missingInAr = [];
const unusedKeys = [];

// Check for missing keys
usedKeys.forEach(key => {
  if (!enKeys.has(key)) {
    missingInEn.push(key);
    hasErrors = true;
  }
  if (!arKeys.has(key)) {
    missingInAr.push(key);
    hasErrors = true;
  }
});

// Check for unused keys (warning only)
enKeys.forEach(key => {
  if (!usedKeys.has(key)) {
    unusedKeys.push(key);
  }
});

// Report results
if (missingInEn.length > 0) {
  console.error(`${RED}✗ Missing in en.json (${missingInEn.length}):${RESET}`);
  missingInEn.forEach(key => console.error(`  - ${key}`));
  console.log('');
}

if (missingInAr.length > 0) {
  console.error(`${RED}✗ Missing in ar.json (${missingInAr.length}):${RESET}`);
  missingInAr.forEach(key => console.error(`  - ${key}`));
  console.log('');
}

if (unusedKeys.length > 0 && unusedKeys.length < 50) {
  console.warn(`${YELLOW}⚠ Potentially unused keys (${unusedKeys.length}):${RESET}`);
  unusedKeys.slice(0, 10).forEach(key => console.warn(`  - ${key}`));
  if (unusedKeys.length > 10) {
    console.warn(`  ... and ${unusedKeys.length - 10} more`);
  }
  console.log('');
}

// Check for keys that are identical in EN and AR (likely untranslated)
const identicalKeys = [];
enKeys.forEach(key => {
  if (arKeys.has(key)) {
    const enValue = getNestedValue(enTranslations, key);
    const arValue = getNestedValue(arTranslations, key);
    if (enValue === arValue && typeof enValue === 'string' && /[a-zA-Z]/.test(enValue)) {
      identicalKeys.push({ key, value: enValue });
    }
  }
});

if (identicalKeys.length > 0) {
  console.warn(`${YELLOW}⚠ Keys with identical EN/AR values (possibly untranslated, ${identicalKeys.length}):${RESET}`);
  identicalKeys.slice(0, 10).forEach(({ key, value }) => {
    console.warn(`  - ${key}: "${value.substring(0, 50)}${value.length > 50 ? '...' : ''}"`);
  });
  if (identicalKeys.length > 10) {
    console.warn(`  ... and ${identicalKeys.length - 10} more`);
  }
  console.log('');
}

// Helper to get nested value
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Final result
if (hasErrors) {
  console.error(`${RED}✗ Translation validation FAILED${RESET}`);
  console.error(`${RED}Build cannot proceed with missing translation keys.${RESET}\n`);
  process.exit(1);
} else {
  console.log(`${GREEN}✓ All translation keys are valid!${RESET}\n`);
  process.exit(0);
}
