# Supabase Backend Setup Guide

## 📋 Overview
This guide will help you set up the Supabase backend for your Sentivra CMS.

## 🚀 Step 1: Create Supabase Account & Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign Up"**
3. Sign up with GitHub, Google, or Email
4. Once logged in, click **"New Project"**
5. Fill in the details:
   - **Project Name**: `sentivra-cms` (or any name you prefer)
   - **Database Password**: Create a strong password (save it securely!)
   - **Region**: Choose the closest region to your users
   - **Pricing Plan**: Select **Free** (includes 500MB database, 1GB file storage)
6. Click **"Create new project"**
7. Wait 1-2 minutes for project initialization

## 🔑 Step 2: Get Your API Credentials

1. Once your project is ready, go to **Settings** (gear icon in sidebar)
2. Click on **API** in the left menu
3. You'll see two important values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)
4. **COPY BOTH VALUES** - you'll need them next

## 📝 Step 3: Configure Environment Variables

1. In your project root (d:\Sentivra-main), create a file named `.env.local`
2. Add the following (replace with YOUR values from Step 2):

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxxxxx
```

3. Save the file
4. **IMPORTANT**: Add `.env.local` to your `.gitignore` file (should already be there)

## 🗄️ Step 4: Run Database Migrations

### Option A: Using Supabase Dashboard (Recommended for Beginners)

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **"New query"**
4. Open the file `supabase/migrations/20261104000001_initial_schema.sql` from your project
5. Copy the ENTIRE content
6. Paste it into the SQL Editor
7. Click **"Run"** (or press Ctrl+Enter)
8. Wait for success message ✅
9. Repeat steps 3-7 for the file `supabase/migrations/20261104000002_seed_data.sql`

### Option B: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (you'll need the project reference ID from dashboard)
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## 📊 Step 5: Verify Database Setup

1. Go to **Table Editor** in Supabase dashboard
2. You should see all 19 tables:
   - site_settings
   - seo_settings
   - hero
   - trust_badges
   - services
   - projects
   - mockups
   - client_logos
   - testimonials
   - faqs
   - process_steps
   - why_choose_us
   - countries
   - timeline_milestones
   - values
   - stats
   - blog_posts
   - messages
   - media
3. Click on any table (e.g., `services`) to see the seeded data

## 🔐 Step 6: Create Your First Admin User

1. Go to **Authentication** → **Users** in Supabase dashboard
2. Click **"Add user"** → **"Create new user"**
3. Fill in:
   - **Email**: your-email@example.com
   - **Password**: Create a strong password
   - **Auto Confirm User**: ✅ CHECK THIS (important!)
4. Click **"Create user"**
5. **SAVE YOUR CREDENTIALS** - you'll use these to login to the admin dashboard

## 📦 Step 7: Configure Storage Buckets

1. Go to **Storage** in Supabase dashboard
2. Click **"New bucket"**
3. Create the following buckets:

### Bucket 1: `images`
- **Name**: `images`
- **Public bucket**: ✅ YES
- **Allowed MIME types**: `image/*`
- **File size limit**: 5MB
- Click **"Create bucket"**

### Bucket 2: `videos`
- **Name**: `videos`
- **Public bucket**: ✅ YES
- **Allowed MIME types**: `video/*`
- **File size limit**: 50MB
- Click **"Create bucket"**

### Bucket 3: `documents`
- **Name**: `documents`
- **Public bucket**: ✅ YES
- **Allowed MIME types**: `application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **File size limit**: 10MB
- Click **"Create bucket"**

### Configure Storage Policies

For each bucket:
1. Click on the bucket name
2. Go to **Policies** tab
3. Click **"New Policy"**
4. Choose **"For full customization"**
5. Add these policies:

**Public READ (for all users):**
```sql
Policy name: Public Read Access
Allowed operation: SELECT
Policy definition: true
```

**Authenticated WRITE (for admin only):**
```sql
Policy name: Authenticated Upload
Allowed operation: INSERT
Policy definition: auth.role() = 'authenticated'
```

**Authenticated UPDATE/DELETE (for admin only):**
```sql
Policy name: Authenticated Manage
Allowed operation: UPDATE, DELETE
Policy definition: auth.role() = 'authenticated'
```

## ✅ Step 8: Test the Setup

1. Go back to your project terminal
2. Install dependencies (if you haven't already):
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. The website should now fetch data from Supabase!
5. Visit `http://localhost:5173/admin` to access the admin dashboard
6. Login with the credentials you created in Step 6

## 🎉 You're Done!

Your Supabase backend is now fully set up and connected to your Sentivra website.

## 📚 Next Steps

- [ ] Upload your logo and client logos via the admin dashboard
- [ ] Customize the content (services, projects, testimonials, etc.)
- [ ] Add your real contact information in Site Settings
- [ ] Upload hero video to Supabase Storage and update the hero section
- [ ] Test the contact form submissions

## 🆘 Troubleshooting

### Error: "Invalid API key"
- Double-check your `.env.local` file
- Make sure you copied the **anon public** key, not the **service_role** key
- Restart your development server after changing `.env.local`

### Error: "relation does not exist"
- Make sure you ran BOTH migration files in order
- Check the SQL Editor for any error messages
- Verify all 19 tables exist in the Table Editor

### Error: "Row Level Security policy violation"
- Make sure you created the user in Step 6
- Check that "Auto Confirm User" was enabled
- Verify the RLS policies were created correctly

### Storage upload fails
- Verify the storage buckets exist
- Check that the bucket is marked as "Public"
- Ensure the storage policies were created

## 📞 Need Help?

If you encounter any issues during setup, check:
1. Supabase Documentation: https://supabase.com/docs
2. Supabase Discord: https://discord.supabase.com
3. Or contact the development team

---

**Important Security Notes:**
- Never commit `.env.local` to Git
- Never share your `service_role` key publicly
- The `anon public` key is safe to use in client-side code
- Consider setting up additional security rules for production use
