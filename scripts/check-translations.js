#!/usr/bin/env node

/**
 * Translation Key Coverage Checker
 * Finds all t() usage in the codebase and validates against locale files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load locale files
const enPath = path.join(__dirname, '../src/i18n/locales/en.json');
const arPath = path.join(__dirname, '../src/i18n/locales/ar.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
const ar = JSON.parse(fs.readFileSync(arPath, 'utf-8'));

// Find all translation keys used in code
function extractKeysFromCode(dir, keys = new Set()) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      extractKeysFromCode(fullPath, keys);
    } else if (entry.isFile() && (entry.name.endsWith('.jsx') || entry.name.endsWith('.tsx'))) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      // Match t('key') and t("key") patterns
      const matches = content.matchAll(/t\(['"]([^'"]+)['"]\)/g);
      for (const match of matches) {
        keys.add(match[1]);
      }
    }
  }
  
  return keys;
}

// Check if key exists in nested object
function hasKey(obj, keyPath) {
  const parts = keyPath.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return false;
    }
  }
  
  return true;
}

// Get value from nested object
function getValue(obj, keyPath) {
  const parts = keyPath.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  
  return current;
}

console.log('🔍 Scanning translation keys...\n');

const srcDir = path.join(__dirname, '../src');
const usedKeys = extractKeysFromCode(srcDir);

console.log(`Found ${usedKeys.size} unique translation keys in code\n`);

const missingInEn = [];
const missingInAr = [];
const hasIssues = [];

for (const key of usedKeys) {
  const inEn = hasKey(en, key);
  const inAr = hasKey(ar, key);
  
  if (!inEn) {
    missingInEn.push(key);
  }
  if (!inAr) {
    missingInAr.push(key);
  }
  
  if (!inEn || !inAr) {
    hasIssues.push({ key, inEn, inAr });
  }
}

// Report
if (missingInEn.length > 0) {
  console.log('❌ Missing in en.json:');
  missingInEn.forEach(key => console.log(`   - ${key}`));
  console.log('');
}

if (missingInAr.length > 0) {
  console.log('❌ Missing in ar.json:');
  missingInAr.forEach(key => console.log(`   - ${key}`));
  console.log('');
}

if (hasIssues.length === 0) {
  console.log('✅ All translation keys are present in both locale files!');
} else {
  console.log(`⚠️  Total issues: ${hasIssues.length}`);
  console.log(`   Missing in EN: ${missingInEn.length}`);
  console.log(`   Missing in AR: ${missingInAr.length}`);
  process.exit(1);
}
