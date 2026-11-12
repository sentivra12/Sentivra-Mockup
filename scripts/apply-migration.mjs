#!/usr/bin/env node
/**
 * Apply migration directly via Supabase Management API
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the migration SQL
const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20261118130000_fix_mockup_categories_data.sql');
const sql = readFileSync(migrationPath, 'utf8');

// Execute via PostgREST rpc (if available) or show instructions
console.log('Migration SQL to apply:\n');
console.log(sql);
console.log('\n---\n');
console.log('Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/sgpmklrdglrgbvbxshrf/sql/new');
