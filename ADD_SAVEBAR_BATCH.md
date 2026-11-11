# Batch SaveBar Integration - Remaining Screens

**Status:** 7/18 screens complete ✅  
**Remaining:** 11 screens

---

## ✅ Completed (7 screens)

1. **Page Content** ✅
2. **Hero Section** ✅
3. **Site Settings** ✅
4. **Services** ✅
5. **Testimonials** ✅
6. **FAQs** ✅
7. **Service Categories** ✅

---

## ⏳ Quick Wins (Simple Pattern - 5 min each)

These screens follow the same modal pattern and can be done quickly:

### 8. Client Logos ⏳
- File: `src/admin/pages/ClientLogosPage.jsx`
- Pattern: Modal with image upload
- Fields: Logo image, company name, link, display order

### 9. Values ⏳
- File: `src/admin/pages/ValuesPage.jsx`
- Pattern: Modal with icon + text
- Fields: Title EN/AR, description EN/AR, icon, order

### 10. Stats ⏳
- File: `src/admin/pages/StatsPage.jsx`
- Pattern: Modal with number + label
- Fields: Label EN/AR, value, suffix, icon, order

### 11. Marquee Items ⏳
- File: `src/admin/pages/MarqueeItemsPage.jsx`
- Pattern: Modal with text
- Fields: Text EN/AR, order

### 12. Countries ⏳
- File: `src/admin/pages/CountriesPage.jsx`
- Pattern: Modal with country info
- Fields: Name EN/AR, code, flag, order

### 13. Timeline ⏳
- File: `src/admin/pages/TimelinePage.jsx`
- Pattern: Modal with date + event
- Fields: Year, title EN/AR, description EN/AR

### 14. Mockup Categories ⏳
- File: `src/admin/pages/MockupCategoriesPage.jsx`
- Pattern: Modal with category info
- Fields: Name EN/AR, slug, description

---

## 🔧 Complex (Requires More Work - 10 min each)

### 15. Mockups ⚠️
- File: `src/admin/pages/MockupsPage.jsx`
- Complexity: High - Many fields (10+ fields, multiple image uploads)
- Fields: Title, slug, descriptions, multiple screenshots, URLs, metadata
- **Estimate:** 10-15 minutes

---

## ⚠️ Review/Decision Required (3 screens)

### 16. Projects ⚠️
- File: `src/admin/pages/ProjectsPage.jsx`
- **Question:** Remove? (Our Work page was removed from public site)
- If Keep: Add SaveBar (similar to Mockups, 10 min)
- If Remove: Delete file + remove from AdminLayout (2 min)

### 17. Project Categories ⚠️
- File: `src/admin/pages/ProjectCategoriesPage.jsx`
- **Depends on:** Projects decision
- If Keep: Add SaveBar (5 min)
- If Remove: Delete file (2 min)

### 18. Blog Posts ⚠️
- File: Check if exists (`src/admin/pages/BlogPostsPage.jsx`)
- **Question:** Is there a blog on public site?
- If Keep: Add SaveBar (10 min)
- If Remove: Delete file (2 min)

---

## Standard Integration Pattern

```jsx
// 1. Imports
import SaveBar from '@/admin/components/SaveBar';
import { useFormDirty } from '@/admin/hooks/useFormDirty';

// 2. Initialize hook
const { isDirty, markClean, resetToInitial } = useFormDirty(formData, editingItem);

// 3. handleSubmit - add markClean()
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await mutation.mutateAsync(data);
    markClean(); // ← Add this
    handleCloseModal();
  } catch (error) {
    // handle
  }
};

// 4. handleDiscard - new function
const handleDiscard = () => {
  if (window.confirm('Discard changes?')) {
    resetToInitial();
    toast({ title: 'Changes discarded' });
  }
};

// 5. handleCloseModal - add warning
const handleCloseModal = () => {
  if (isDirty) {
    if (!window.confirm('Unsaved changes. Close?')) return;
  }
  setIsModalOpen(false);
  resetToInitial();
};

// 6. Add SaveBar at end (before </div>)
<SaveBar
  isDirty={isDirty}
  onSave={handleSubmit}
  onDiscard={handleDiscard}
  isSaving={mutation.isPending}
/>
```

---

## Progress Tracking

| Screen | Status | Time | Notes |
|--------|--------|------|-------|
| Page Content | ✅ | - | Includes contrast fixes |
| Hero Section | ✅ | 3 min | |
| Site Settings | ✅ | 2 min | Fixed prop name |
| Services | ✅ | 5 min | |
| Testimonials | ✅ | 5 min | |
| FAQs | ✅ | 5 min | |
| Service Categories | ✅ | 5 min | |
| Client Logos | ⏳ | 3 min | |
| Values | ⏳ | 3 min | |
| Stats | ⏳ | 3 min | |
| Marquee Items | ⏳ | 3 min | |
| Countries | ⏳ | 3 min | |
| Timeline | ⏳ | 4 min | |
| Mockup Categories | ⏳ | 3 min | |
| Mockups | ⏳ | 10 min | Complex |
| Projects | ⚠️ | TBD | User decision |
| Project Categories | ⚠️ | TBD | Depends on Projects |
| Blog Posts | ⚠️ | TBD | Check if exists |

**Total Remaining:** ~40 minutes (excluding review screens)

---

## Build Verification

After each batch (3-4 screens):
```bash
npx vite build
```

Last successful build: 7 screens integrated ✅

---

## Next Steps

1. **Continue with Quick Wins** (7 screens, ~20 min)
   - Client Logos
   - Values  
   - Stats
   - Marquee Items
   - Countries
   - Timeline
   - Mockup Categories

2. **Handle Complex** (1 screen, ~10 min)
   - Mockups

3. **User Decision** (wait for answers)
   - Projects?
   - Project Categories?
   - Blog Posts?

4. **Final Build & Documentation**
   - Run full build test
   - Update ADMIN_AUDIT_STATUS.md
   - Create completion summary

---

**Session Progress:**
- Started: 4/18 screens
- Current: 7/18 screens (39%)
- Target: 15/18 screens (83% - excluding review items)
- Estimate: 30 more minutes for quick wins + complex
