#!/usr/bin/env node
/**
 * RLS Security Test
 * 
 * Tests Row Level Security policies to ensure:
 * - Anon users can only SELECT public content and INSERT messages
 * - Non-admin authenticated users cannot write to content tables
 * - Admin users have full access
 * 
 * Run: npm run test:rls
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

console.log('🔐 Testing RLS Policies...\n');

const results = {
  passed: [],
  failed: []
};

// Content tables that should be read-only for anon
const contentTables = [
  'site_settings',
  'services',
  'projects',
  'mockups',
  'testimonials',
  'faqs'
];

// Test 1: Anon can SELECT from content tables
console.log('📖 Test 1: Anon can SELECT public content');
for (const table of contentTables) {
  try {
    const { data, error } = await anonClient
      .from(table)
      .select('id')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is OK
      results.failed.push({ test: `Anon SELECT ${table}`, error: error.message });
      console.log(`  ❌ ${table}: ${error.message}`);
    } else {
      results.passed.push({ test: `Anon SELECT ${table}` });
      console.log(`  ✅ ${table}`);
    }
  } catch (err) {
    results.failed.push({ test: `Anon SELECT ${table}`, error: err.message });
    console.log(`  ❌ ${table}: ${err.message}`);
  }
}

// Test 2: Anon CANNOT INSERT into content tables
console.log('\n🚫 Test 2: Anon CANNOT INSERT into content tables');
const testInserts = [
  { table: 'site_settings', data: { site_name: 'Hack Attempt' } },
  { table: 'services', data: { slug: 'hack', title_en: 'Hack', title_ar: 'Hack' } },
  { table: 'mockups', data: { slug: 'hack', title_en: 'Hack', title_ar: 'Hack' } }
];

for (const test of testInserts) {
  try {
    const { data, error } = await anonClient
      .from(test.table)
      .insert(test.data)
      .select();
    
    if (error) {
      // This is what we WANT - the insert should fail
      results.passed.push({ test: `Anon INSERT ${test.table} blocked` });
      console.log(`  ✅ ${test.table}: Blocked (${error.message.substring(0, 50)}...)`);
    } else {
      // This is BAD - anon was able to insert
      results.failed.push({ test: `Anon INSERT ${test.table} blocked`, error: 'Insert succeeded (should have been blocked!)' });
      console.log(`  ❌ ${test.table}: Insert succeeded (SECURITY ISSUE!)`);
      // Clean up
      await anonClient.from(test.table).delete().eq('id', data[0].id);
    }
  } catch (err) {
    results.passed.push({ test: `Anon INSERT ${test.table} blocked` });
    console.log(`  ✅ ${test.table}: Blocked (${err.message.substring(0, 50)}...)`);
  }
}

// Test 3: Anon CAN INSERT messages
console.log('\n✉️  Test 3: Anon CAN INSERT messages');
try {
  const { data, error } = await anonClient
    .from('messages')
    .insert({
      name: 'RLS Test User',
      email: 'test@example.com',
      phone: '+1234567890',
      message: 'This is a test message from RLS test script',
      source: 'contact_form'
    })
    .select();
  
  if (error) {
    results.failed.push({ test: 'Anon INSERT messages', error: error.message });
    console.log(`  ❌ Blocked: ${error.message}`);
  } else {
    results.passed.push({ test: 'Anon INSERT messages' });
    console.log(`  ✅ Message inserted (id: ${data[0].id})`);
    // Note: We DON'T clean up - admin should be able to see test messages
  }
} catch (err) {
  results.failed.push({ test: 'Anon INSERT messages', error: err.message });
  console.log(`  ❌ ${err.message}`);
}

// Test 4: Anon CANNOT read messages (admin-only)
console.log('\n👁️  Test 4: Anon CANNOT read messages');
try {
  const { data, error } = await anonClient
    .from('messages')
    .select('*')
    .limit(1);
  
  if (error || (data && data.length === 0)) {
    results.passed.push({ test: 'Anon SELECT messages blocked' });
    console.log(`  ✅ Blocked`);
  } else {
    results.failed.push({ test: 'Anon SELECT messages blocked', error: 'Anon can read messages (SECURITY ISSUE!)' });
    console.log(`  ❌ Anon can read messages (SECURITY ISSUE!)`);
  }
} catch (err) {
  results.passed.push({ test: 'Anon SELECT messages blocked' });
  console.log(`  ✅ Blocked`);
}

// Test 5: Storage - anon can read, cannot write
console.log('\n📁 Test 5: Storage bucket policies');
try {
  // Try to upload (should fail)
  const testFile = new Blob(['test'], { type: 'text/plain' });
  const { data: uploadData, error: uploadError } = await anonClient.storage
    .from('media')
    .upload('test-rls-hack.txt', testFile);
  
  if (uploadError) {
    results.passed.push({ test: 'Anon storage upload blocked' });
    console.log(`  ✅ Upload blocked`);
  } else {
    results.failed.push({ test: 'Anon storage upload blocked', error: 'Upload succeeded (SECURITY ISSUE!)' });
    console.log(`  ❌ Upload succeeded (SECURITY ISSUE!)`);
  }
  
  // Try to list (should work - public read)
  const { data: listData, error: listError} = await anonClient.storage
    .from('media')
    .list();
  
  if (listError) {
    results.failed.push({ test: 'Anon storage list', error: listError.message });
    console.log(`  ❌ List failed: ${listError.message}`);
  } else {
    results.passed.push({ test: 'Anon storage list' });
    console.log(`  ✅ List allowed (public read)`);
  }
} catch (err) {
  console.log(`  ⚠️  Storage test skipped: ${err.message}`);
}

// Test 6: Admin tests (if credentials provided)
if (ADMIN_EMAIL && ADMIN_PASSWORD) {
  console.log('\n👨‍💼 Test 6: Admin access');
  
  try {
    const { data: authData, error: authError } = await anonClient.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    if (authError) {
      console.log(`  ⚠️  Could not authenticate admin: ${authError.message}`);
      console.log(`     (Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local to test admin access)`);
    } else {
      const adminClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: {
          headers: {
            Authorization: `Bearer ${authData.session.access_token}`
          }
        }
      });
      
      // Admin should be able to read messages
      const { data: msgData, error: msgError } = await adminClient
        .from('messages')
        .select('*')
        .limit(1);
      
      if (msgError) {
        results.failed.push({ test: 'Admin SELECT messages', error: msgError.message });
        console.log(`  ❌ Cannot read messages: ${msgError.message}`);
      } else {
        results.passed.push({ test: 'Admin SELECT messages' });
        console.log(`  ✅ Can read messages`);
      }
      
      // Admin should be able to insert into services
      const { data: svcData, error: svcError } = await adminClient
        .from('services')
        .insert({
          slug: 'rls-test-service',
          title_en: 'RLS Test Service',
          title_ar: 'خدمة اختبار RLS',
          is_active: false
        })
        .select();
      
      if (svcError) {
        results.failed.push({ test: 'Admin INSERT services', error: svcError.message });
        console.log(`  ❌ Cannot insert service: ${svcError.message}`);
      } else {
        results.passed.push({ test: 'Admin INSERT services' });
        console.log(`  ✅ Can insert service`);
        // Clean up
        await adminClient.from('services').delete().eq('id', svcData[0].id);
      }
      
      // Sign out
      await adminClient.auth.signOut();
    }
  } catch (err) {
    console.log(`  ⚠️  Admin test error: ${err.message}`);
  }
} else {
  console.log('\n⚠️  Skipping admin tests (set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local)');
}

// Summary
console.log(`\n📊 Summary:`);
console.log(`  Passed: ${results.passed.length}`);
console.log(`  Failed: ${results.failed.length}`);

if (results.failed.length > 0) {
  console.log(`\n❌ RLS tests FAILED:\n`);
  results.failed.forEach(f => {
    console.log(`  - ${f.test}: ${f.error}`);
  });
  process.exit(1);
} else {
  console.log(`\n✅ All RLS tests passed!`);
  process.exit(0);
}
