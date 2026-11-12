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

console.log('Testing actual columns...\n');

const tables = ['services', 'mockups', 'projects', 'site_settings'];

for (const table of tables) {
  const { data, error } = await client.from(table).select('*').limit(1);
  if (error) {
    console.log(`${table}: ERROR - ${error.message} (${error.code})`);
  } else if (data && data.length > 0) {
    console.log(`${table}: ${Object.keys(data[0]).join(', ')}`);
  } else {
    console.log(`${table}: EXISTS but EMPTY`);
  }
}
