# SaveBar Integration - Final Completion Guide

**Status:** 9/15 screens complete (60%)  
**Remaining:** 6 screens (can be completed in ~20 minutes)

---

## ✅ What's Already Done (9 screens)

1. ✅ **Page Content** - Complete
2. ✅ **Hero Section** - Complete
3. ✅ **Site Settings** - Complete
4. ✅ **Services** - Complete
5. ✅ **Testimonials** - Complete
6. ✅ **FAQs** - Complete
7. ✅ **Service Categories** - Complete
8. ✅ **Client Logos** - Complete
9. ✅ **Values** - Complete

**Build Status:** ✅ Passing

---

## ⏳ Remaining 6 Screens - Quick Reference

For each screen below, apply this **exact pattern**:

### Pattern to Apply (Copy-Paste)

```jsx
// 1. ADD IMPORTS (at top, after existing imports)
import SaveBar from '@/admin/components/SaveBar';
import { useFormDirty } from '@/admin/hooks/useFormDirty';

// 2. ADD HOOK (after formData useState)
const { isDirty, markClean, resetToInitial } = useFormDirty(formData, editingItem);

// 3. UPDATE handleSubmit (add markClean before handleCloseModal)
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await mutation.mutateAsync(data);
    toast({ title: 'Success', description: '...' });
    markClean(); // ← ADD THIS LINE
    handleCloseModal();
  } catch (error) {
    toast({ title: 'Error', description: error.message, variant: 'destructive' });
  }
};

// 4. ADD handleDiscard (new function after handleSubmit)
const handleDiscard = () => {
  const shouldDiscard = window.confirm('Discard all unsaved changes?');
  if (shouldDiscard) {
    resetToInitial();
    toast({
      title: 'Changes discarded',
      description: 'All unsaved changes have been discarded.',
    });
  }
};

// 5. UPDATE handleCloseModal (add isDirty check)
const handleCloseModal = () => {
  if (isDirty) {
    const shouldClose = window.confirm('You have unsaved changes. Are you sure you want to close?');
    if (!shouldClose) return;
  }
  setIsModalOpen(false);
  setEditingItem(null);
  resetToInitial();
};

// 6. ADD SaveBar (before closing </div> and after </AnimatePresence>)
      </AnimatePresence>

      {/* SaveBar */}
      <SaveBar
        isDirty={isDirty}
        onSave={handleSubmit}
        onDiscard={handleDiscard}
        isSaving={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};
```

---

## 📋 Screen-by-Screen Checklist

### 10. ⏳ MarqueeItemsPage

**File:** `src/admin/pages/MarqueeItemsPage.jsx`

**Variables to use:**
- `editingItem` → `editingMarqueeItem`
- `createMutation` → `createMarqueeItem`
- `updateMutation` → `updateMarqueeItem`

**Steps:**
1. Add imports (SaveBar, useFormDirty)
2. Add hook: `useFormDirty(formData, editingMarqueeItem)`
3. Add `markClean()` in handleSubmit
4. Add `handleDiscard()` function
5. Update `handleCloseModal()` with isDirty check
6. Add `<SaveBar>` before closing `</div>`

**Time:** ~3 minutes

---

### 11. ⏳ CountriesPage

**File:** `src/admin/pages/CountriesPage.jsx`

**Variables to use:**
- `editingItem` → `editingCountry`
- `createMutation` → `createCountry`
- `updateMutation` → `updateCountry`

**Steps:** Same as above

**Time:** ~3 minutes

---

### 12. ⏳ TimelinePage

**File:** `src/admin/pages/TimelinePage.jsx`

**Variables to use:**
- `editingItem` → `editingTimelineItem`
- `createMutation` → `createTimelineItem`
- `updateMutation` → `updateTimelineItem`

**Steps:** Same as above

**Time:** ~3 minutes

---

### 13. ⏳ MockupCategoriesPage

**File:** `src/admin/pages/MockupCategoriesPage.jsx`

**Variables to use:**
- `editingItem` → `editingCategory`
- `createMutation` → `createMockupCategory`
- `updateMutation` → `updateMockupCategory`

**Steps:** Same as above

**Time:** ~4 minutes

---

### 14. ⏳ ProjectsPage

**File:** `src/admin/pages/ProjectsPage.jsx`

**Variables to use:**
- `editingItem` → `editingProject`
- `createMutation` → `createProject`
- `updateMutation` → `updateProject`

**Steps:** Same as above

**Time:** ~8 minutes (larger form)

---

### 15. ⏳ MockupsPage

**File:** `src/admin/pages/MockupsPage.jsx`

**Variables to use:**
- `editingItem` → `editingMockup`
- `createMutation` → `createMockup`
- `updateMutation` → `updateMockup`

**Steps:** Same as above

**Time:** ~10 minutes (most complex form)

---

## 🔍 How to Verify Each Screen

After adding SaveBar to a screen:

1. **Check imports:** SaveBar and useFormDirty imported
2. **Check hook:** `useFormDirty` initialized with correct params
3. **Check handleSubmit:** `markClean()` called after success
4. **Check handleDiscard:** Function exists with confirm dialog
5. **Check handleCloseModal:** isDirty check added
6. **Check SaveBar:** Component added with all 4 props
7. **Check mutation names:** Correct for that screen

---

## 🏗️ Build Verification

After completing all 6 screens, run:

```bash
npx vite build
```

**Expected:** Build succeeds with no errors

---

## 📊 Final Status

When all 6 are complete:

- **Total screens:** 15 modal-based screens
- **Complete:** 15/15 (100%)
- **Build:** ✅ Passing
- **Pattern:** ✅ Consistent across all screens

---

## 🎯 Quick Copy-Paste Template

Use this for each screen (replace `ITEM`, `MUTATION` with actual names):

```jsx
import SaveBar from '@/admin/components/SaveBar';
import { useFormDirty } from '@/admin/hooks/useFormDirty';

// After formData state:
const { isDirty, markClean, resetToInitial } = useFormDirty(formData, editingITEM);

// In handleSubmit, after success, before handleCloseModal():
markClean();

// New function after handleSubmit:
const handleDiscard = () => {
  if (window.confirm('Discard all unsaved changes?')) {
    resetToInitial();
    toast({ title: 'Changes discarded', description: 'All unsaved changes have been discarded.' });
  }
};

// Update handleCloseModal:
const handleCloseModal = () => {
  if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to close?')) return;
  setIsModalOpen(false);
  setEditingITEM(null);
  resetToInitial();
};

// Before closing </div>:
<SaveBar
  isDirty={isDirty}
  onSave={handleSubmit}
  onDiscard={handleDiscard}
  isSaving={createMUTATION.isPending || updateMUTATION.isPending}
/>
```

---

## ✅ Success Criteria

Each screen should have:
- [x] SaveBar component visible when form is dirty
- [x] Warning on close with unsaved changes
- [x] Discard button resets form to initial state
- [x] Save clears dirty state
- [x] Build passes with no errors

---

## 📝 Notes

- All screens follow the **same exact pattern**
- No special cases or exceptions
- Each screen takes 3-10 minutes depending on complexity
- Total time for all 6: ~25-30 minutes

---

**Last Updated:** Current session  
**Next:** Apply pattern to remaining 6 screens  
**Goal:** 100% completion
