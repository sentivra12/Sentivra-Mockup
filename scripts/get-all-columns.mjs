import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const envContent = readFileSync('.env.local', 'utf8');
let SUPABASE_URL, SUPABASE_ANON_KEY;
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    if (key === 'VITE_SUPABASE_URL') SUPABASE_URL = value;
    if (key === 'VITE_SUPABASE_ANON_KEY') SUPABASE_ANON_KEY = value;
  }
});

const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const tables = [
  'seo_settings', 'service_categories', 'project_categories', 
  'testimonials', 'client_logos', 'process_steps', 'why_choose_us',
  'countries', 'timeline_milestones', 'values', 'stats', 'blog_posts',
  'messages', 'media', 'marquee_items'
];

for (const table of tables) {
  const { data, error } = await client.from(table).select('*').limit(1);
  if (error) {
    console.log(`"${table}": ERROR - ${error.code}`);
  } else if (data && data.length > 0) {
    const cols = Object.keys(data[0]).filter(k => k !== 'updated_by' && k !== 'uploaded_by');
    console.log(`"${table}": [${cols.map(c => `"${c}"`).join(', ')}]`);
  } else {
    // Empty table - check schema
    const { data: schemaData, error: schemaError } = await client.from(table).select('*').limit(0);
    if (schemaError && schemaError.code === 'PGRST204') {
      console.log(`"${table}": MISSING COLUMNS`);
    } else {
      console.log(`"${table}": EXISTS but EMPTY (can't determine columns)`);
    }
  }
}
