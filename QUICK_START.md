# 🚀 Quick Start - Do This Right Now

Follow these 8 steps in exact order. Each step must work before moving to the next.

---

## 1️⃣ FILL .ENV.LOCAL

**File location:** `d:\Sentivra-main\.env.local`

1. Open https://app.supabase.com
2. Click your project → Settings → API
3. Copy **Project URL** and **anon public key**
4. Open `.env.local` in Notepad
5. Replace the placeholder values:

```env
VITE_SUPABASE_URL=https://your-id-here.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

6. Save file
7. In terminal: Press Ctrl+C, then run: `npm run dev`
8. **Verify**: Open http://localhost:5174 - yellow banner should be GONE

---

## 2️⃣ CREATE DATABASE TABLES

1. Go to: https://app.supabase.com → Your Project
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Open file: `d:\Sentivra-main\supabase\migrations\20261104000001_initial_schema.sql`
5. Copy ALL content (Ctrl+A, Ctrl+C)
6. Paste in SQL Editor (Ctrl+V)
7. Click **RUN**
8. Wait for "Success" message

---

## 3️⃣ ADD SAMPLE DATA

1. Click **New Query** in SQL Editor
2. Open file: `d:\Sentivra-main\supabase\migrations\20261104000002_seed_data.sql`
3. Copy ALL content (Ctrl+A, Ctrl+C)
4. Paste in SQL Editor
5. Click **RUN**
6. **Verify**: Go to http://localhost:5174 - should show services, not empty

---

## 4️⃣ CREATE STORAGE BUCKETS

In Supabase, click **Storage** → Create these 6 buckets (all public):

1. `services` ✅ Public
2. `projects` ✅ Public
3. `mockups` ✅ Public
4. `logos` ✅ Public
5. `testimonials` ✅ Public
6. `hero` ✅ Public

For each bucket:
- Click bucket → **Policies** → **New Policy**
- Choose: "Give users authenticated or anon read access"
- Save

---

## 5️⃣ CREATE ADMIN USER

### A. Create User
1. In Supabase: **Authentication** → **Users**
2. Click **Add user** → **Create user**
3. Email: your-email@example.com
4. Password: (your strong password)
5. ✅ Check "Auto Confirm User"
6. Click **Create user**

### B. Grant Admin Role
1. **SQL Editor** → **New Query**
2. First, create user_roles table:

```sql
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view all roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

3. Click **RUN**
4. **New Query** again, add your user as admin:

```sql
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'your-email@example.com';
```

5. Replace email with YOUR email
6. Click **RUN**

---

## 6️⃣ TEST ADMIN LOGIN

1. Go to: http://localhost:5174/admin
2. Login with your email and password
3. Should see dashboard with stats
4. **If error "Not authorized"**: Check step 5B completed correctly

---

## 7️⃣ TEST: ADD A SERVICE

1. In admin, click **Services**
2. Click **Add Service**
3. Fill in:
   - Title: "Test Service"
   - Category: "Web & Mobile"
   - Short Description: "Test"
   - Icon: "Code"
4. Click **Save**
5. Go to: http://localhost:5174/services
6. Your service should appear!

---

## 8️⃣ TEST: CONTACT FORM

1. Go to: http://localhost:5174/contact
2. Fill and submit form
3. Green toast: "Message Sent Successfully!"
4. Go to: http://localhost:5174/admin/messages
5. Your message should appear!

---

## ✅ Final Checklist

All these should work now:

- [ ] http://localhost:5174 - Shows services (not empty)
- [ ] http://localhost:5174/services - 9 services visible
- [ ] http://localhost:5174/admin - Can login
- [ ] http://localhost:5174/admin/services - Can add service
- [ ] http://localhost:5174/admin/messages - Can see messages
- [ ] Contact form submission works

---

## 🆘 If Something Fails

### Yellow Banner Still Shows
→ Check `.env.local` has correct values
→ Restart dev server: Ctrl+C then `npm run dev`

### Empty Data on Site
→ Run Step 3 again (seed data)
→ Check browser console (F12) for errors

### Can't Login
→ Check Step 5B completed
→ Check email is exactly the same

### Full Guide
→ Open: `SUPABASE_SETUP_GUIDE.md`

---

**You're done! Time: ~15 minutes** 🎉
