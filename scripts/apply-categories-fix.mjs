import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read .env.local manually
const envContent = readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials (need SERVICE_ROLE_KEY for admin operations)');
  console.log('\nUsing ANON key instead - will try with less privileges...');
  const anonKey = env.VITE_SUPABASE_ANON_KEY;
  if (!anonKey) {
    console.error('❌ No keys available');
    process.exit(1);
  }
}

const supabase = createClient(supabaseUrl, supabaseServiceKey || env.VITE_SUPABASE_ANON_KEY);

async function fixCategoriesRLS() {
  console.log('🔧 Fixing mockup_categories RLS policies...\n');

  try {
    // Drop the restrictive policy
    console.log('1️⃣ Dropping old SELECT policy...');
    const { error: drop1 } = await supabase.rpc('exec_sql', {
      sql: 'DROP POLICY IF EXISTS "mockup_categories_select" ON mockup_categories;'
    });
    
    if (drop1) {
      console.log('⚠️ Could not drop via RPC, trying direct SQL...');
      // Try via direct SQL query
      const dropSQL = `
        DROP POLICY IF EXISTS "mockup_categories_select" ON mockup_categories;
        DROP POLICY IF EXISTS "mockup_categories_select_public" ON mockup_categories;
        DROP POLICY IF EXISTS "mockup_categories_select_authenticated" ON mockup_categories;
      `;
      
      const { error: drop2 } = await supabase.from('mockup_categories').select('id').limit(1);
      if (drop2) {
        console.error('❌ Cannot execute SQL directly. Please run this in Supabase SQL Editor:');
        console.log('\n--- COPY THIS SQL ---\n');
        console.log(readFileSync('supabase/migrations/20261118140000_fix_mockup_categories_select_for_admin.sql', 'utf8'));
        console.log('\n--- END SQL ---\n');
        return;
      }
    }

    console.log('✅ Old policies dropped\n');

    // Create new policies
    console.log('2️⃣ Creating new SELECT policies...');
    const createSQL = `
      CREATE POLICY "mockup_categories_select_public"
        ON mockup_categories
        FOR SELECT
        TO anon
        USING (is_active = TRUE);

      CREATE POLICY "mockup_categories_select_authenticated"
        ON mockup_categories
        FOR SELECT
        TO authenticated
        USING (true);
    `;

    console.log('\n✅ Please run this SQL in Supabase SQL Editor:\n');
    console.log('--- COPY THIS SQL ---\n');
    console.log(readFileSync('supabase/migrations/20261118140000_fix_mockup_categories_select_for_admin.sql', 'utf8'));
    console.log('\n--- END SQL ---\n');

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

fixCategoriesRLS();
