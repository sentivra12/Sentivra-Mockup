# Blank White Page - Root Cause & Fix

## Root Cause

**The site showed a blank white page because the `.env.local` file was missing.**

When Supabase client is created with `undefined` URL and key (from missing environment variables), the `@supabase/supabase-js` library throws an error during module initialization. This error happens **before React renders anything**, causing the entire app to crash silently and show a blank white page.

### Why It Failed Silently

1. **No Error Boundary** - React had no top-level error boundary to catch initialization errors
2. **No Environment Validation** - The app didn't check if required env vars exist before using them
3. **Supabase Client Created at Import Time** - The client is instantiated when the module loads, not when a component renders, so the error happens outside React's error handling

---

## Changes Made

### 1. Fixed Supabase Client (`src/lib/supabase.js`)

**Before:**
```javascript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// This crashes if undefined
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**After:**
```javascript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Export flag to check if env vars are missing
export const isMissingEnv = !supabaseUrl || !supabaseAnonKey;

// Create client with fallback placeholder values to prevent crash
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  { auth: { persistSession: true, autoRefreshToken: true } }
);
```

**Result:** App no longer crashes when env vars are missing. API calls will fail gracefully instead.

---

### 2. Added React Error Boundary (`src/components/ErrorBoundary.jsx`)

Created a top-level error boundary that:
- Catches any React rendering errors
- Shows a friendly error screen instead of blank page
- Displays error details in development mode
- Provides "Refresh Page" button

**Added to:** `src/main.jsx` - wraps the entire app

---

### 3. Added Environment Warning Banner (`src/components/EnvWarning.jsx`)

Created a yellow warning banner that:
- Shows at the top when env vars are missing
- Displays clear setup instructions
- Includes expandable details with exact steps
- Only shows when `isMissingEnv` is true

**Added to:** `src/main.jsx` - renders before the App

---

### 4. Updated Main Entry Point (`src/main.jsx`)

**Before:**
```javascript
<QueryClientProvider client={queryClient}>
  <BrowserRouter>
    <App />
    <Toaster />
  </BrowserRouter>
</QueryClientProvider>
```

**After:**
```javascript
<ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <EnvWarning />
      <App />
      <Toaster />
    </BrowserRouter>
  </QueryClientProvider>
</ErrorBoundary>
```

---

## Files Changed

1. ✅ `src/lib/supabase.js` - Added fallback values and `isMissingEnv` export
2. ✅ `src/components/ErrorBoundary.jsx` - New file (error boundary)
3. ✅ `src/components/EnvWarning.jsx` - New file (warning banner)
4. ✅ `src/main.jsx` - Wrapped app in ErrorBoundary and added EnvWarning

---

## How to Fix This for Your Setup

### Option 1: Run Without Backend (Demo Mode)

The site now works without Supabase! You'll see:
- Yellow warning banner at the top
- Public pages render with empty data
- Loading states appear briefly
- No data from database (expected)

**To run in demo mode:**
```bash
npm run dev
```

Visit: http://localhost:5174

---

### Option 2: Connect to Supabase (Full Mode)

**Step 1: Create .env.local file**
```bash
# In the project root (d:\Sentivra-main)
# Create a new file called .env.local
```

**Step 2: Add your Supabase credentials**
```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxxxxx
```

**Step 3: Get your credentials**

1. Go to https://app.supabase.com
2. Select your project (or create one)
3. Go to **Settings** → **API**
4. Copy **Project URL** → paste as `VITE_SUPABASE_URL`
5. Copy **anon/public key** → paste as `VITE_SUPABASE_ANON_KEY`

**Step 4: Run migrations** (if not done yet)
```bash
# Install Supabase CLI if needed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

**Step 5: Restart dev server**
```bash
# Stop current server (Ctrl+C)
npm run dev
```

The yellow warning banner will disappear and data will load from Supabase!

---

## How to Verify the Fix

### 1. Check Dev Server
```bash
npm run dev
```

**Expected output:**
```
VITE v4.5.14  ready in 472 ms
➜  Local:   http://localhost:5174/
```

### 2. Check Browser Console

Open http://localhost:5174 in your browser

**Without .env.local (Demo Mode):**
- ✅ Page loads (no blank screen)
- ✅ Yellow warning banner appears
- ⚠️ Console shows: "Missing Supabase environment variables!"
- ✅ Pages render with empty data

**With .env.local (Full Mode):**
- ✅ Page loads
- ✅ No warning banner
- ✅ Data loads from Supabase
- ✅ No console errors

### 3. Test Error Boundary

To verify error boundary works, temporarily add this to HomePage.jsx:
```javascript
throw new Error('Test error'); // Remove after testing
```

**Expected:** Friendly error screen with "Something went wrong" message (not blank page)

---

## Prevention for Future

These changes ensure this never happens again:

1. **Graceful Degradation** - App works without backend
2. **Clear Error Messages** - Users see what's wrong, not blank page
3. **Development Warnings** - Console shows missing env vars
4. **Visual Indicators** - Warning banner shows setup instructions
5. **Error Boundaries** - Catches any unexpected errors

---

## Quick Reference

### Dev Server Commands
```bash
# Start dev server
npm run dev

# Stop dev server
Ctrl + C

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables
```env
# Required for backend features
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key

# Optional (defaults exist)
# Add more as needed
```

### Ports
- **Default:** http://localhost:5173
- **If in use:** http://localhost:5174 (auto-increments)

---

## Summary

**What was broken:**
- Missing `.env.local` caused Supabase client creation to fail
- App crashed silently showing blank white page

**What was fixed:**
1. Made Supabase client initialization safe (fallback values)
2. Added Error Boundary to catch all errors
3. Added Environment Warning banner with instructions
4. App now works in demo mode without backend

**What you need to do:**
- Create `.env.local` with your Supabase credentials (see steps above)
- Restart dev server
- Run migrations if needed
- Verify site loads with data

**Current status:**
✅ Site loads (no blank page)
✅ Error handling in place
✅ Clear warnings when config missing
✅ Works in demo mode without backend
