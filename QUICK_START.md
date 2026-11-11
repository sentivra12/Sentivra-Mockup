# 🚀 Quick Start - Services Page Round 1

## TL;DR - Get Running in 5 Minutes

### 1. Run Migration (1 minute)
1. Go to: https://app.supabase.com
2. Open SQL Editor
3. Copy file: `supabase/migrations/20261102000001_add_services_arabic_and_faqs.sql`
4. Paste & Run

### 2. Add Translations (2 minutes)
1. Open `QUICK_SETUP.sql`
2. Copy Section 1 (Arabic translations)
3. Replace Arabic text with yours (or keep template)
4. Paste & Run in Supabase SQL Editor

### 3. Add Contact Info (1 minute)
1. In `QUICK_SETUP.sql`, Section 2
2. Replace `+20 XXX XXX XXXX` with your real WhatsApp/phone
3. Replace `contact@sentivra.com` with your real email
4. Paste & Run

### 4. Start Dev Server (1 minute)
```bash
cd d:\Sentivra-main
npm run dev
```

### 5. Test in Browser
Open: `http://localhost:5173/services`

**Done! 🎉**

---

## What You Get

### 🎨 Premium Design
- Animated services orbit hero
- Searchable service gallery (type or press `/`)
- 3-step "How We Work" strip
- "Why Choose Us" section (4 tiles)
- FAQ accordion (numbered, smooth animation)
- Final CTA with magnetic button + WhatsApp

### 🌍 Full Bilingual
- English/Arabic from database
- RTL/LTR support
- Light/Dark themes
- Real-time language switching

### ♿ Accessible
- ARIA labels
- Keyboard navigation (Tab, Enter, Space, `/`)
- Screen reader friendly
- Reduced motion support

### ⚡ Performant
- Target: Lighthouse 90+ on all metrics
- CLS ~0 (no layout shift)
- LCP <2s
- Optimized animations

---

## Quick Commands

### Development
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing URLs
```
# English Light
http://localhost:5173/services

# Arabic Light
http://localhost:5173/services?lang=ar

# Then toggle dark mode in browser for dark variants
```

### Database Quick Checks
```sql
-- Check Arabic fields exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'services' AND column_name LIKE '%_ar';

-- Check services
SELECT slug, title_en, title_ar FROM services WHERE is_active = true;

-- Check FAQs
SELECT display_order, question FROM faqs WHERE page_key = 'services';

-- Check contact info
SELECT whatsapp_number, primary_email FROM site_settings;
```

---

## Files You Need

### Essential
- ✅ `supabase/migrations/20261102000001_add_services_arabic_and_faqs.sql` - Run this first
- ✅ `QUICK_SETUP.sql` - Helper queries for translations & contact
- ✅ `CHECK_SETUP.md` - Full testing checklist

### Components (Already Created)
- ✅ 7 new components in `src/components/ui/`
- ✅ Main page: `src/pages/ServicesPageRound1.jsx`
- ✅ Language hook: `src/i18n/useLanguage.js`

### Documentation
- ✅ `SERVICES_PAGE_ROUND1_GUIDE.md` - Full guide (English)
- ✅ Artifact above - Full guide (Arabic)
- ✅ This file - Quick start

---

## Troubleshooting (90% of Issues)

### Page is blank?
→ Run migration first (Step 1)

### Services show English only in Arabic mode?
→ Add translations (Step 2)

### WhatsApp button not showing?
→ Add real number (Step 3)

### FAQ not showing?
→ Check migration ran, activate FAQs:
```sql
UPDATE faqs SET is_active = true WHERE page_key = 'services';
```

### Search not working?
→ Check console (F12), refresh page

---

## Next Steps

After testing locally:

1. ✅ Test all 4 modes (light/dark × EN/AR)
2. ✅ Test mobile (360px) and desktop (1920px)
3. ✅ Run Lighthouse (target: 90+ all scores)
4. ✅ Get stakeholder approval on design
5. ✅ Deploy to production

---

## Success Metrics

Your page is ready when:
- ✅ All services display in both EN & AR
- ✅ Search works (type or press `/`)
- ✅ FAQ accordion animates smoothly
- ✅ WhatsApp button appears (bottom right)
- ✅ Magnetic button pulls on hover (desktop)
- ✅ All 4 modes look good
- ✅ Lighthouse ≥90 on all metrics
- ✅ No console errors

---

## Support

Check these in order:
1. Console errors (F12)
2. Network tab (see failed requests)
3. `CHECK_SETUP.md` (full checklist)
4. `SERVICES_PAGE_ROUND1_GUIDE.md` (detailed guide)

---

**Time to first working page: ~5 minutes**
**Time to production-ready: ~30 minutes** (with testing)

Good luck! 🚀
