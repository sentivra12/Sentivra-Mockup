# SaveBar Integration Guide

Quick reference for adding SaveBar with dirty tracking to admin screens.

## Overview

The SaveBar component appears at the bottom of the screen when there are unsaved changes, providing Save and Discard buttons. It prevents data loss and improves UX.

## Step-by-Step Integration

### 1. Add Imports

```jsx
import SaveBar from '@/admin/components/SaveBar';
import { useFormDirty } from '@/admin/hooks/useFormDirty';
```

### 2. Initialize Dirty Tracking

Add this inside your component, **after** your state declarations:

```jsx
const { isDirty, markClean, resetToInitial } = useFormDirty(
  formData,        // Current form state
  editingItem      // Original data (or null if creating new)
);
```

**Important:** The second parameter should be the **original, unmodified** data that formData is compared against.

### 3. Update Submit Handler

Add `markClean()` after successful save:

```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    await updateMutation.mutateAsync({
      id: editingItem.id,
      ...formData,
    });

    toast({
      title: 'Success',
      description: 'Changes saved successfully.',
    });

    markClean();  // ← Add this line
    handleCloseModal();
  } catch (error) {
    toast({
      title: 'Error',
      description: error.message,
      variant: 'destructive',
    });
  }
};
```

### 4. Create Discard Handler

Add a new function:

```jsx
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
```

### 5. Update Close/Cancel Handler

Add warning when closing with unsaved changes:

```jsx
const handleCloseModal = () => {
  if (isDirty) {
    const shouldClose = window.confirm('You have unsaved changes. Are you sure you want to close?');
    if (!shouldClose) return;
  }
  setIsModalOpen(false);
  setEditingItem(null);
  resetToInitial();
};
```

### 6. Add SaveBar Component

At the end of your component, **before** the closing `</div>`, add:

```jsx
{/* SaveBar */}
<SaveBar
  isDirty={isDirty}
  onSave={handleSubmit}
  onDiscard={handleDiscard}
  isSaving={updateMutation.isPending}
/>
```

## Complete Example

```jsx
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import SaveBar from '@/admin/components/SaveBar';
import { useFormDirty } from '@/admin/hooks/useFormDirty';
import { useUpdateService } from '@/hooks/useServices';

const ServicesPage = () => {
  const { toast } = useToast();
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({});
  const updateService = useUpdateService();

  // Dirty tracking
  const { isDirty, markClean, resetToInitial } = useFormDirty(formData, editingService);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await updateService.mutateAsync({
        id: editingService.id,
        ...formData,
      });

      toast({
        title: 'Success',
        description: 'Service updated successfully.',
      });

      markClean();  // Mark as clean after save
      setIsModalOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

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

  const handleCloseModal = () => {
    if (isDirty) {
      const shouldClose = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!shouldClose) return;
    }
    setIsModalOpen(false);
    setEditingService(null);
    resetToInitial();
  };

  return (
    <div className="space-y-6">
      {/* Your page content here */}
      
      {/* SaveBar at the end */}
      <SaveBar
        isDirty={isDirty}
        onSave={handleSubmit}
        onDiscard={handleDiscard}
        isSaving={updateService.isPending}
      />
    </div>
  );
};

export default ServicesPage;
```

## Common Patterns

### Pattern 1: Modal Form
When using a modal for editing:
- Initialize `useFormDirty` in the **page component**, not inside the modal
- Pass `isDirty` state to modal's close button handler
- SaveBar appears on the **page**, not inside the modal

### Pattern 2: Inline Form
When editing directly on the page (no modal):
- SaveBar floats at bottom of viewport
- Shows only when `isDirty` is true
- Disappears after save or discard

### Pattern 3: Create vs Edit
```jsx
// For create: compare against empty object
const { isDirty, markClean, resetToInitial } = useFormDirty(formData, {});

// For edit: compare against original item
const { isDirty, markClean, resetToInitial } = useFormDirty(formData, editingItem);
```

## Checklist

Use this checklist when adding SaveBar to a screen:

- [ ] Import SaveBar component
- [ ] Import useFormDirty hook
- [ ] Initialize dirty tracking with `useFormDirty(formData, originalData)`
- [ ] Add `markClean()` in submit handler after successful save
- [ ] Create `handleDiscard()` function with confirm dialog
- [ ] Update close/cancel handlers to check `isDirty`
- [ ] Add `resetToInitial()` to close/cancel handlers
- [ ] Add `<SaveBar>` component at end of page
- [ ] Test: make change → SaveBar appears
- [ ] Test: click Save → SaveBar disappears
- [ ] Test: click Discard → changes revert
- [ ] Test: close modal with changes → shows warning

## Troubleshooting

### SaveBar doesn't appear
- Check that `isDirty` is being passed to SaveBar
- Verify `useFormDirty` is comparing correct objects
- Check console for errors

### SaveBar appears when it shouldn't
- Ensure initial data is set correctly
- Check for object reference issues (use spread operator)
- Verify formData and originalData are comparable

### Changes don't discard
- Check `resetToInitial()` is called in discard handler
- Verify initial data was captured correctly
- Check state update logic

### Save button stays in loading state
- Ensure `markClean()` is called after successful save
- Check mutation's `isPending` state is passed correctly
- Verify error handling doesn't skip `markClean()`

## Best Practices

1. **Always confirm discards** - Use `window.confirm()` before discarding changes
2. **Clear state on close** - Call `resetToInitial()` when closing modal/form
3. **Toast feedback** - Show success/error toasts for save/discard actions
4. **Don't mark clean on error** - Only call `markClean()` on successful save
5. **Test thoroughly** - Test all user flows: save, discard, close with changes, close without changes

## Files Reference

- **SaveBar Component:** `src/admin/components/SaveBar.jsx`
- **useFormDirty Hook:** `src/admin/hooks/useFormDirty.jsx`
- **Example Usage:** `src/admin/pages/PageContentPage.jsx` (fully implemented)

---

**Need Help?** Check the PageContentPage.jsx implementation for a complete working example.
