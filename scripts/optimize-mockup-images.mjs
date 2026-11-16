#!/usr/bin/env node
/**
 * One-time script to optimize existing mockup images
 * Creates WebP thumbnails for mockups that don't have thumbnail_url
 * 
 * Usage: node scripts/optimize-mockup-images.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = join(__dirname, '..', '.env.local');
let env = {};
try {
  const envContent = readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  });
} catch (err) {
  console.error('❌ Could not read .env.local file');
  process.exit(1);
}

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Download image from URL
 */
async function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Resize image to WebP using canvas (Node.js environment)
 */
async function resizeToWebP(imageBuffer, maxWidth, quality) {
  // Note: This requires canvas to be available in Node.js
  // For server-side, we'd need node-canvas or sharp library
  // Since we can't add new dependencies, this is a placeholder
  throw new Error('Server-side image processing requires additional dependencies (sharp or node-canvas). Please run this from a browser environment or add the dependency.');
}

/**
 * Main optimization function
 */
async function optimizeMockupImages() {
  console.log('🔍 Fetching mockups without thumbnail_url...\n');
  
  const { data: mockups, error } = await supabase
    .from('mockups')
    .select('id, title_en, desktop_screenshot_url, cover_image_url, image_url, thumbnail_url')
    .or('thumbnail_url.is.null,thumbnail_url.eq.')
    .eq('is_active', true)
    .order('id');
  
  if (error) {
    console.error('❌ Error fetching mockups:', error.message);
    process.exit(1);
  }
  
  if (!mockups || mockups.length === 0) {
    console.log('✅ All mockups already have thumbnails!');
    return;
  }
  
  console.log(`📊 Found ${mockups.length} mockups to optimize\n`);
  console.log('=' .repeat(80));
  
  const results = {
    success: [],
    failed: [],
    skipped: [],
  };
  
  for (const mockup of mockups) {
    const imageUrl = mockup.desktop_screenshot_url || mockup.cover_image_url || mockup.image_url;
    
    if (!imageUrl) {
      console.log(`⏭️  ${mockup.id}: ${mockup.title_en || 'Untitled'}`);
      console.log(`   No image URL found - SKIPPED\n`);
      results.skipped.push({ id: mockup.id, reason: 'No image URL' });
      continue;
    }
    
    console.log(`🔄 ${mockup.id}: ${mockup.title_en || 'Untitled'}`);
    console.log(`   Image: ${imageUrl.substring(0, 60)}...`);
    
    try {
      // Since we can't process images without dependencies, 
      // provide instructions for manual processing
      console.log(`   ⚠️  Manual action required:`);
      console.log(`   1. Download: ${imageUrl}`);
      console.log(`   2. Resize to max 640px width, WebP format, 75% quality`);
      console.log(`   3. Upload to Supabase storage`);
      console.log(`   4. Update thumbnail_url for mockup ID ${mockup.id}\n`);
      
      results.failed.push({ 
        id: mockup.id, 
        reason: 'Requires manual processing (no image library available)' 
      });
      
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}\n`);
      results.failed.push({ id: mockup.id, reason: err.message });
    }
  }
  
  console.log('=' .repeat(80));
  console.log('\n📊 SUMMARY:');
  console.log(`   ✅ Successful: ${results.success.length}`);
  console.log(`   ❌ Failed: ${results.failed.length}`);
  console.log(`   ⏭️  Skipped: ${results.skipped.length}`);
  console.log(`   📝 Total: ${mockups.length}`);
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed items:');
    results.failed.forEach(({ id, reason }) => {
      console.log(`   - ID ${id}: ${reason}`);
    });
  }
  
  console.log('\n💡 TIP: Use the Admin > Mockups page to upload optimized images.');
  console.log('   The upload form now automatically creates thumbnails when you upload.');
}

// Run
optimizeMockupImages().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
