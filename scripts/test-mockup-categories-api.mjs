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
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMockupCategoriesAPI() {
  console.log('🔍 Testing Mockup Categories API...\n');

  try {
    const { data, error } = await supabase
      .from('mockup_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (error) {
      console.error('❌ API Error:', error);
      return;
    }

    console.log(`✅ Found ${data.length} active categories:\n`);
    
    data.forEach((cat, i) => {
      console.log(`${i + 1}. ID: ${cat.id}`);
      console.log(`   Slug: ${cat.slug}`);
      console.log(`   Name EN: ${cat.name_en}`);
      console.log(`   Name AR: ${cat.name_ar}`);
      console.log(`   Icon: ${cat.icon}`);
      console.log(`   Active: ${cat.is_active}`);
      console.log(`   Order: ${cat.display_order}`);
      console.log('');
    });

    // Test the exact query that useMockupCategories uses
    console.log('\n📋 Raw API response (what React Query will receive):');
    console.log(JSON.stringify(data, null, 2));

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testMockupCategoriesAPI();
