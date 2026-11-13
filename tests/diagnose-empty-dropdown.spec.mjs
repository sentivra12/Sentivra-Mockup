// @ts-check
import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

// Read credentials from .env.test.local
let adminEmail, adminPassword, supabaseUrl, supabaseAnonKey;

try {
  const envContent = readFileSync('.env.test.local', 'utf8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
      env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });
  
  adminEmail = env.ADMIN_EMAIL;
  adminPassword = env.ADMIN_PASSWORD;
  supabaseUrl = env.VITE_SUPABASE_URL;
  supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;
  
  if (!adminEmail || !adminPassword) {
    console.error('❌ Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env.test.local');
    console.error('Create .env.test.local with:');
    console.error('ADMIN_EMAIL=your-admin@email.com');
    console.error('ADMIN_PASSWORD=your-password');
    console.error('VITE_SUPABASE_URL=...');
    console.error('VITE_SUPABASE_ANON_KEY=...');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Cannot read .env.test.local:', error.message);
  console.error('Create .env.test.local with ADMIN_EMAIL and ADMIN_PASSWORD');
  process.exit(1);
}

test.describe('Diagnose Empty Dropdown', () => {
  test('Find exact cause of empty categories dropdown', async ({ page, context }) => {
    const evidence = {
      networkRequests: [],
      consoleMessages: [],
      reactQueryState: null,
      supabaseDirectResponse: null,
      authSession: null,
    };

    // Capture network requests
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('mockup_categories') || url.includes('/rest/v1/')) {
        try {
          const body = await response.text();
          evidence.networkRequests.push({
            url,
            status: response.status(),
            statusText: response.statusText(),
            headers: Object.fromEntries(response.headers()),
            body: body.substring(0, 1000), // First 1000 chars
          });
        } catch (e) {
          evidence.networkRequests.push({
            url,
            status: response.status(),
            error: e.message,
          });
        }
      }
    });

    // Capture console messages
    page.on('console', (msg) => {
      const text = msg.text();
      if (
        text.includes('Categories') ||
        text.includes('mockup') ||
        text.includes('error') ||
        text.includes('Error') ||
        text.includes('failed')
      ) {
        evidence.consoleMessages.push({
          type: msg.type(),
          text: text.substring(0, 500),
        });
      }
    });

    console.log('\n📍 Step 1: Navigate to login page');
    await page.goto('http://localhost:5173/admin/login', { waitUntil: 'networkidle' });

    console.log('📍 Step 2: Login as admin');
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL('**/admin/**', { timeout: 10000 });
    console.log('✅ Logged in successfully');

    // Capture auth session
    evidence.authSession = await page.evaluate(async () => {
      const supabase = window.supabase || window.__supabase;
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        return session ? {
          user_id: session.user?.id,
          email: session.user?.email,
          expires_at: session.expires_at,
          access_token_preview: session.access_token?.substring(0, 20) + '...',
        } : null;
      }
      return 'supabase_not_found_in_window';
    });

    console.log('📍 Step 3: Navigate to Mockups admin page');
    await page.goto('http://localhost:5173/admin/mockups', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // Let React Query settle

    console.log('📍 Step 4: Open "Add Mockup" modal');
    await page.click('button:has-text("Add Mockup")');
    await page.waitForTimeout(1000);

    console.log('📍 Step 5: Inspect category dropdown');
    const dropdownHTML = await page.locator('select[name="category_id"]').evaluate(el => el.outerHTML);
    const optionsCount = await page.locator('select[name="category_id"] option').count();
    const optionsText = await page.locator('select[name="category_id"] option').allTextContents();

    console.log(`   Dropdown has ${optionsCount} options:`, optionsText);

    console.log('📍 Step 6: Extract React Query state from window');
    evidence.reactQueryState = await page.evaluate(() => {
      // Try to access React Query devtools or internal state
      const queryClient = window.__REACT_QUERY_CLIENT__;
      if (queryClient) {
        const cache = queryClient.getQueryCache();
        const queries = cache.getAll();
        const categoriesQuery = queries.find(q => 
          q.queryKey && JSON.stringify(q.queryKey).includes('mockupCategories')
        );
        
        if (categoriesQuery) {
          return {
            queryKey: categoriesQuery.queryKey,
            state: categoriesQuery.state,
            data: categoriesQuery.state.data,
            error: categoriesQuery.state.error ? {
              message: categoriesQuery.state.error.message,
              code: categoriesQuery.state.error.code,
              details: categoriesQuery.state.error.details,
            } : null,
          };
        }
      }
      return 'react_query_not_accessible';
    });

    console.log('📍 Step 7: Test direct Supabase API call with admin token');
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      // Sign in to get admin token
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });

      if (authError) {
        evidence.supabaseDirectResponse = { error: 'Auth failed: ' + authError.message };
      } else {
        // Query mockup_categories
        const { data, error } = await supabase
          .from('mockup_categories')
          .select('*')
          .order('display_order');

        evidence.supabaseDirectResponse = {
          rowCount: data?.length || 0,
          rows: data,
          error: error ? {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          } : null,
        };

        await supabase.auth.signOut();
      }
    }

    // Print full evidence report
    console.log('\n' + '='.repeat(80));
    console.log('🔍 EVIDENCE REPORT');
    console.log('='.repeat(80));
    
    console.log('\n1️⃣ AUTH SESSION:');
    console.log(JSON.stringify(evidence.authSession, null, 2));
    
    console.log('\n2️⃣ NETWORK REQUESTS (mockup_categories):');
    evidence.networkRequests.forEach((req, i) => {
      console.log(`\nRequest ${i + 1}:`);
      console.log(`  URL: ${req.url}`);
      console.log(`  Status: ${req.status} ${req.statusText || ''}`);
      if (req.body) {
        console.log(`  Body: ${req.body.substring(0, 200)}`);
      }
      if (req.error) {
        console.log(`  Error: ${req.error}`);
      }
    });
    
    console.log('\n3️⃣ CONSOLE MESSAGES:');
    evidence.consoleMessages.slice(0, 10).forEach((msg, i) => {
      console.log(`  [${msg.type}] ${msg.text}`);
    });
    
    console.log('\n4️⃣ REACT QUERY STATE:');
    console.log(JSON.stringify(evidence.reactQueryState, null, 2));
    
    console.log('\n5️⃣ DIRECT SUPABASE API TEST:');
    console.log(JSON.stringify(evidence.supabaseDirectResponse, null, 2));
    
    console.log('\n6️⃣ DROPDOWN STATE:');
    console.log(`  Options count: ${optionsCount}`);
    console.log(`  Options text: ${JSON.stringify(optionsText)}`);
    console.log(`  HTML: ${dropdownHTML.substring(0, 300)}`);

    console.log('\n' + '='.repeat(80));
    console.log('🎯 DIAGNOSIS');
    console.log('='.repeat(80));

    // Analyze and determine cause
    if (evidence.supabaseDirectResponse?.error) {
      console.log('❌ CAUSE: Direct Supabase API call FAILED');
      console.log(`   Error: ${evidence.supabaseDirectResponse.error.message}`);
      console.log(`   Code: ${evidence.supabaseDirectResponse.error.code}`);
      console.log('   → RLS policy or permission issue');
    } else if (evidence.supabaseDirectResponse?.rowCount === 0) {
      console.log('❌ CAUSE: Table is EMPTY (0 rows returned from direct API)');
      console.log('   → Need to seed mockup_categories');
    } else if (evidence.supabaseDirectResponse?.rowCount > 0 && evidence.networkRequests.length === 0) {
      console.log('❌ CAUSE: No network request made from browser');
      console.log('   → Query is disabled, aborted, or hook not called');
    } else if (evidence.networkRequests.some(r => r.status >= 400)) {
      const failedReq = evidence.networkRequests.find(r => r.status >= 400);
      console.log('❌ CAUSE: Network request FAILED');
      console.log(`   Status: ${failedReq.status}`);
      console.log(`   Body: ${failedReq.body}`);
      console.log('   → Check RLS policies or API error');
    } else if (evidence.reactQueryState && evidence.reactQueryState.error) {
      console.log('❌ CAUSE: React Query has ERROR state');
      console.log(`   Error: ${JSON.stringify(evidence.reactQueryState.error)}`);
    } else if (evidence.reactQueryState && evidence.reactQueryState.data === undefined) {
      console.log('❌ CAUSE: React Query data is UNDEFINED');
      console.log(`   State: ${JSON.stringify(evidence.reactQueryState.state)}`);
      console.log('   → Query might be disabled, or initial state');
    } else if (typeof evidence.reactQueryState?.data === 'function') {
      console.log('❌ CAUSE: React Query data is a FUNCTION');
      console.log('   → Variable shadowing or wrong API return value');
    } else if (evidence.supabaseDirectResponse?.rowCount > 0 && optionsCount <= 1) {
      console.log('❌ CAUSE: Data exists but not rendered in dropdown');
      console.log(`   API returned ${evidence.supabaseDirectResponse.rowCount} rows`);
      console.log(`   Dropdown has ${optionsCount} options`);
      console.log('   → Frontend rendering issue or state problem');
    } else {
      console.log('✅ Need more investigation - print evidence above');
    }

    console.log('='.repeat(80) + '\n');

    // Fail test if dropdown is empty
    expect(optionsCount).toBeGreaterThan(1); // At least "Select..." + 1 category
  });
});
