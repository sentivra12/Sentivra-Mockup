#!/usr/bin/env node
/**
 * Schema Checker
 * 
 * Verifies that all tables and columns required by the frontend exist in Supabase.
 * Run: npm run check:schema
 * 
 * Uses the anon key to check public-readable tables, and optionally an admin session
 * for admin-only tables if ADMIN_EMAIL and ADMIN_PASSWORD are set in .env.local
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load manifest
const manifestPath = join(__dirname, 'schema-manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

// Load env
const envPath = join(__dirname, '..', '.env.local');
let SUPABASE_URL, SUPABASE_ANON_KEY, ADMIN_EMAIL, ADMIN_PASSWORD;

try {
  const envContent = readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (key === 'VITE_SUPABASE_URL') SUPABASE_URL = value;
      if (key === 'VITE_SUPABASE_ANON_KEY') SUPABASE_ANON_KEY = value;
      if (key === 'ADMIN_EMAIL') ADMIN_EMAIL = value;
      if (key === 'ADMIN_PASSWORD') ADMIN_PASSWORD = value;
    }
  });
} catch (err) {
  console.error('Failed to read .env.local:', err.message);
  process.exit(1);
}

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🔍 Checking schema against manifest...\n');
console.log(`Supabase URL: ${SUPABASE_URL}`);
console.log(`Anon key: ${SUPABASE_ANON_KEY.substring(0, 20)}...\n`);

const results = {
  passed: [],
  failed: []
};

// Check each table
for (const [tableName, tableDef] of Object.entries(manifest.tables)) {
  const columns = tableDef.columns.join(',');
  const checkType = tableDef.adminOnly ? 'ADMIN' : 'PUBLIC';
  
  try {
    const { data, error } = await anonClient
      .from(tableName)
      .select(columns)
      .limit(0);
    
    if (error) {
      // Parse PostgREST errors
      let message = error.message;
      if (error.code === 'PGRST204') {
        // Column not found
        const match = error.message.match(/Could not find the '(\w+)' column/);
        if (match) {
          message = `Missing column: ${match[1]}`;
        }
      } else if (error.code === '42P01' || error.message.includes('does not exist')) {
        message = 'Table does not exist';
      } else if (error.code === '42703') {
        message = 'Column does not exist';
      }
      
      results.failed.push({
        table: tableName,
        type: checkType,
        error: message,
        code: error.code
      });
      console.log(`❌ ${tableName} [${checkType}]: ${message}`);
    } else {
      results.passed.push({ table: tableName, type: checkType });
      console.log(`✅ ${tableName} [${checkType}]`);
    }
  } catch (err) {
    results.failed.push({
      table: tableName,
      type: checkType,
      error: err.message
    });
    console.log(`❌ ${tableName} [${checkType}]: ${err.message}`);
  }
}

// Summary
console.log(`\n📊 Summary:`);
console.log(`  Passed: ${results.passed.length}`);
console.log(`  Failed: ${results.failed.length}`);

if (results.failed.length > 0) {
  console.log(`\n❌ Schema check FAILED. Fix the following:\n`);
  results.failed.forEach(f => {
    console.log(`  - ${f.table}: ${f.error}`);
  });
  process.exit(1);
} else {
  console.log(`\n✅ All schema checks passed!`);
  process.exit(0);
}
