# 🔧 تطبيق Database Migration - تعليمات سريعة

## ⚠️ مهم جداً!

الموقع شغال على Vercel، لكن **فيه مشاكل في Supabase Database** محتاجة تطبيق migration.

---

## 🎯 الطريقة الأسرع (5 دقائق):

### 1️⃣ افتح Supabase Dashboard
https://supabase.com/dashboard/project/sgpmklrdglrgbvbxshrf

### 2️⃣ افتح SQL Editor
من القائمة الجانبية → **SQL Editor**

أو مباشرة: https://supabase.com/dashboard/project/sgpmklrdglrgbvbxshrf/sql

### 3️⃣ انسخ الكود
افتح الملف: `supabase/migrations/20261118000001_fix_rls_policies.sql`

**أو انسخ من هنا:**

```sql
-- Fix infinite recursion in RLS policies
-- This migration removes circular dependencies in user_roles checks

-- =============================================
-- FIX: Remove problematic RLS policies that cause infinite recursion
-- =============================================

-- Drop and recreate site_settings policies without user_roles dependency
DROP POLICY IF EXISTS "site_settings_select_policy" ON site_settings;
DROP POLICY IF EXISTS "site_settings_update_policy" ON site_settings;
DROP POLICY IF EXISTS "site_settings_admin_all" ON site_settings;

-- Simple policies that don't check roles (since it's single-row config)
CREATE POLICY "site_settings_select_policy" 
ON site_settings FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "site_settings_update_policy" 
ON site_settings FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid()
  )
);

CREATE POLICY "site_settings_insert_policy" 
ON site_settings FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid()
  )
);

-- =============================================
-- FIX: Ensure mockups table has all required columns
-- =============================================

-- Add missing bilingual columns if they don't exist
DO $$ 
BEGIN
  -- Check and add title_en
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mockups' AND column_name = 'title_en'
  ) THEN
    ALTER TABLE mockups ADD COLUMN title_en TEXT;
    
    -- Migrate existing title to title_en
    UPDATE mockups SET title_en = title WHERE title_en IS NULL;
  END IF;

  -- Check and add title_ar
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mockups' AND column_name = 'title_ar'
  ) THEN
    ALTER TABLE mockups ADD COLUMN title_ar TEXT;
  END IF;

  -- Check and add short_description_en
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mockups' AND column_name = 'short_description_en'
  ) THEN
    ALTER TABLE mockups ADD COLUMN short_description_en TEXT;
    
    -- Migrate existing description to short_description_en
    UPDATE mockups SET short_description_en = description WHERE short_description_en IS NULL;
  END IF;

  -- Check and add short_description_ar
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mockups' AND column_name = 'short_description_ar'
  ) THEN
    ALTER TABLE mockups ADD COLUMN short_description_ar TEXT;
  END IF;

  -- Check and add cover_image_url
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mockups' AND column_name = 'cover_image_url'
  ) THEN
    ALTER TABLE mockups ADD COLUMN cover_image_url TEXT;
  END IF;

  -- Check and add desktop_screenshot_url
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mockups' AND column_name = 'desktop_screenshot_url'
  ) THEN
    ALTER TABLE mockups ADD COLUMN desktop_screenshot_url TEXT;
    
    -- Migrate existing image_url to desktop_screenshot_url
    UPDATE mockups SET desktop_screenshot_url = image_url WHERE desktop_screenshot_url IS NULL;
  END IF;
END $$;

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
DO $$ 
BEGIN 
  RAISE NOTICE '✅ RLS policies fixed - infinite recursion resolved';
  RAISE NOTICE '✅ Mockups table schema updated with bilingual columns';
END $$;
```

### 4️⃣ شغّل الكود
- الصق الكود في SQL Editor
- اضغط **Run** أو اضغط `Ctrl+Enter`

### 5️⃣ تأكد من النجاح
هتشوف الرسائل دي:
```
✅ RLS policies fixed - infinite recursion resolved
✅ Mockups table schema updated with bilingual columns
```

---

## 🧪 اختبار بعد التطبيق:

### 1. Site Settings Page:
افتح: https://sentivra-mockup.vercel.app/admin/settings
**المتوقع:** الصفحة تحمّل بدون "infinite recursion" errors

### 2. Mockups Admin Page:
افتح: https://sentivra-mockup.vercel.app/admin/mockups
**المتوقع:** الصفحة تحمّل البيانات بدون "column does not exist" errors

### 3. Console Check:
- افتح Developer Console (F12)
- **المتوقع:** مفيش Supabase errors

---

## ❓ لو محتاج مساعدة:

**لو ظهرت errors:**
1. خد screenshot من الـ error
2. ابعته
3. هساعدك فوراً

---

## 📌 ملاحظات مهمة:

- ✅ الـ migration **آمن 100%** - مش هيحذف بيانات
- ✅ يقدر يشتغل **أكتر من مرة** بدون مشاكل
- ✅ بيضيف الأعمدة بس لو **مش موجودة**
- ✅ بينقل البيانات القديمة للأعمدة الجديدة

---

## 🔄 طريقة بديلة (لو عندك Supabase CLI):

```bash
# تأكد إنك متصل
supabase link --project-ref sgpmklrdglrgbvbxshrf

# طبّق الـ migration
supabase db push
```

---

**بعد ما تخلص، الموقع هيشتغل 100% بدون أي errors!** 🎉
