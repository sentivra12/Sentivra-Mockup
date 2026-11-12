# 🔧 حل مشكلة القائمة المنسدلة الفارغة للفئات

## المشكلة المكتشفة

الـ RLS (Row Level Security) policy الحالية في جدول `mockup_categories` **تسمح فقط بقراءة الفئات النشطة** (`is_active = TRUE`) للمستخدمين الغير مصادق عليهم.

المستخدمين المصادقين (Admin) محتاجين policy منفصلة تسمح لهم برؤية **كل** الفئات (نشطة أو غير نشطة) عشان يقدروا يديروها في لوحة الإدارة.

## الحل

### الخطوة 1: افتح Supabase SQL Editor

1. اذهب إلى https://supabase.com/dashboard/project/YOUR_PROJECT
2. من القائمة الجانبية، اضغط على **SQL Editor**
3. اضغط **New Query**

### الخطوة 2: انسخ والصق هذا الـ SQL

```sql
-- ============================================================================
-- Migration: Fix mockup_categories SELECT policy for admin users
-- Description: Allow authenticated users to read ALL categories (not just active ones)
--              so admin panel can display categories in dropdown
-- ============================================================================

-- Drop the restrictive SELECT policy that only allows is_active = TRUE
DROP POLICY IF EXISTS "mockup_categories_select" ON mockup_categories;
DROP POLICY IF EXISTS "mockup_categories_select_public" ON mockup_categories;
DROP POLICY IF EXISTS "mockup_categories_select_authenticated" ON mockup_categories;

-- Create a new policy that allows:
-- 1. Public (unauthenticated) users can see only active categories
-- 2. Authenticated users can see ALL categories (for admin panel)
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

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ mockup_categories SELECT policies fixed';
  RAISE NOTICE '   - Public users: can see active categories only';
  RAISE NOTICE '   - Authenticated users: can see ALL categories';
  RAISE NOTICE '   - Admin users: can manage categories via is_admin()';
END $$;
```

### الخطوة 3: شغل الـ SQL

اضغط **Run** أو **Ctrl + Enter**

### الخطوة 4: تحقق من النتيجة

بعد تشغيل الـ SQL، المفروض تشوف رسالة نجاح في الـ Results:
```
✅ mockup_categories SELECT policies fixed
   - Public users: can see active categories only
   - Authenticated users: can see ALL categories
   - Admin users: can manage categories via is_admin()
```

### الخطوة 5: ارجع للوحة الإدارة

1. افتح لوحة الإدارة: https://sentivra-mockup.vercel.app/admin/mockups
2. **اعمل Hard Refresh** (Ctrl + Shift + R)
3. اضغط **Add Mockup**
4. المفروض دلوقتي القائمة المنسدلة تظهر الـ 8 فئات! 🎉

---

## ليه حصلت المشكلة؟

الـ RLS policy القديمة كانت:
```sql
CREATE POLICY "mockup_categories_select"
  ON mockup_categories FOR SELECT
  USING (is_active = TRUE);
```

هذه السياسة تطبق على **الجميع** (anon + authenticated)، وتسمح فقط برؤية الفئات النشطة.

المشكلة: المستخدمين المصادقين (Admin) محتاجين يشوفوا **كل** الفئات عشان يقدروا يديروها.

### الحل الجديد

قسمنا الـ policy لاثنين:
1. **Public users (anon)**: يشوفوا بس الفئات النشطة في الموقع العام
2. **Authenticated users**: يشوفوا كل الفئات في لوحة الإدارة

---

## إذا لم ينجح الحل

إذا بعد تطبيق الـ SQL لسه القائمة فارغة:

### 1. تحقق من الـ Policies في Supabase
- اذهب إلى **Table Editor** > **mockup_categories**
- اضغط على أيقونة **RLS** (القفل)
- تأكد إنك شايف:
  - ✅ `mockup_categories_select_public` (TO anon)
  - ✅ `mockup_categories_select_authenticated` (TO authenticated)

### 2. تحقق من تسجيل الدخول
- تأكد إنك مسجل دخول كـ Admin في لوحة الإدارة
- شوف الـ Console (F12) وتأكد مفيش error من Supabase
- لو في error `"JWT expired"` أو مشابه، سجل خروج وادخل تاني

### 3. امسح الـ Cache بالكامل
- Chrome: `Ctrl + Shift + Delete`
- اختر "Cached images and files"
- اضغط "Clear data"
- ارجع للوحة الإدارة وجرب تاني

### 4. تحقق من الـ Console Logs
افتح Developer Tools (F12) > Console وشوف الرسالة:
```
🔍 Mockup Categories Debug: {
  categories: Array(8),
  count: 8,
  isLoading: false,
  error: undefined
}
```

لو `count: 0` أو `error: { message: "..." }`، فيه مشكلة تانية.

---

## التحديثات في الكود

أضفت في `src/admin/pages/MockupsPage.jsx`:
- ✅ Debug logging للـ categories
- ✅ عرض رسالة "Loading categories..." أثناء التحميل
- ✅ عرض رسالة تحذير لو الفئات فارغة
- ✅ عرض رسالة الخطأ لو فشل تحميل الفئات

---

## الخطوة الأخيرة

بعد حل المشكلة، جرب **أضف mockup جديد** للتأكد إن كل حاجة شغالة! 🚀
