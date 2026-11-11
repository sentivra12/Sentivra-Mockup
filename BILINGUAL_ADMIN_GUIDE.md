# 🌐 Bilingual Admin Panel Guide

## Overview

This guide explains how to use the bilingual components in the admin panel to manage content in both English and Arabic.

---

## 📦 Components

### 1. **BilingualInput**
For single-line or multi-line text inputs (title, description, etc.)

```jsx
import BilingualInput from '@/components/admin/BilingualInput';

<BilingualInput
  label="Service Title"
  nameEn="title"
  nameAr="title_ar"
  valueEn={formData.title}
  valueAr={formData.title_ar}
  onChange={handleInputChange}
  type="text" // or "textarea"
  required={true}
  placeholder="Enter service title"
  rows={4} // for textarea
  error={errors.title}
  helperText="This will appear in service cards"
/>
```

#### Props:
- `label` (string) - Field label
- `nameEn` (string) - Name for English field
- `nameAr` (string) - Name for Arabic field
- `valueEn` (string) - Current English value
- `valueAr` (string) - Current Arabic value
- `onChange` (function) - Callback (name, value)
- `type` (string) - 'text' | 'textarea' (default: 'text')
- `required` (boolean) - Is English field required?
- `placeholder` (string) - Placeholder text
- `rows` (number) - Rows for textarea (default: 4)
- `disabled` (boolean) - Disabled state
- `error` (string) - Error message
- `helperText` (string) - Helper text below input

---

### 2. **BilingualArrayInput**
For arrays of strings (features, benefits, tags, etc.)

```jsx
import BilingualArrayInput from '@/components/admin/BilingualArrayInput';

<BilingualArrayInput
  label="Service Features"
  valuesEn={formData.features}
  valuesAr={formData.features_ar}
  onChange={(lang, newArray) => {
    const fieldName = lang === 'en' ? 'features' : 'features_ar';
    setFormData(prev => ({ ...prev, [fieldName]: newArray }));
  }}
  placeholder="e.g., Responsive Design"
  maxItems={10}
  required={true}
/>
```

#### Props:
- `label` (string) - Field label
- `valuesEn` (array) - Array of English strings
- `valuesAr` (array) - Array of Arabic strings
- `onChange` (function) - Callback (lang, newArray)
- `placeholder` (string) - Placeholder for input
- `maxItems` (number) - Maximum number of items (default: 10)
- `required` (boolean) - Is at least one English item required?

---

## 🗃️ Database Structure

### Tables with Arabic Columns

All content tables now have `_ar` suffixed columns:

```sql
-- Example: services table
CREATE TABLE services (
  -- English columns
  title TEXT NOT NULL,
  short_description TEXT,
  long_description TEXT,
  features JSONB,
  benefits JSONB,
  
  -- Arabic columns
  title_ar TEXT,
  short_description_ar TEXT,
  long_description_ar TEXT,
  features_ar JSONB,
  benefits_ar JSONB,
  
  -- ... other columns
);
```

### Complete List of Bilingual Tables:

1. **site_settings** - `tagline_ar`, `address_ar`
2. **seo_settings** - `meta_title_ar`, `meta_description_ar`
3. **hero** - `headline_ar`, `subheadline_ar`, `cta_primary_text_ar`, `cta_secondary_text_ar`
4. **trust_badges** - `title_ar`, `description_ar`
5. **services** - `title_ar`, `short_description_ar`, `long_description_ar`, `features_ar`, `benefits_ar`, `pricing_info_ar`, `delivery_time_ar`
6. **projects** - `title_ar`, `short_description_ar`, `long_description_ar`
7. **mockups** - `title_ar`, `description_ar`
8. **testimonials** - `client_role_ar`, `client_company_ar`, `testimonial_text_ar`
9. **faqs** - `question_ar`, `answer_ar`
10. **process_steps** - `title_ar`, `description_ar`
11. **why_choose_us** - `title_ar`, `description_ar`
12. **countries** - `name_ar`, `description_ar`
13. **timeline_milestones** - `title_ar`, `description_ar`
14. **values** - `title_ar`, `description_ar`
15. **stats** - `label_ar`
16. **blog_posts** - `title_ar`, `excerpt_ar`, `content_ar`

---

## 💻 Implementation Steps

### Step 1: Run the Migration

```bash
# Apply the migration to add Arabic columns
npx supabase db push

# Or if using local Supabase:
psql -h localhost -U postgres -d postgres -f supabase/migrations/20261107000001_add_arabic_columns.sql
```

### Step 2: Update Your Hooks

Modify `useContent.js` or your data fetching hooks to select Arabic columns:

```javascript
// Before:
const { data: services } = await supabase
  .from('services')
  .select('*')
  .eq('is_active', true);

// After: (stays the same, columns are automatically included)
// Just make sure your components check for _ar fields
```

### Step 3: Create Admin Forms

```jsx
// Example: ServiceForm.jsx
import { useState } from 'react';
import BilingualInput from '@/components/admin/BilingualInput';
import BilingualArrayInput from '@/components/admin/BilingualArrayInput';
import { supabase } from '@/lib/supabase';

export default function ServiceForm({ service }) {
  const [formData, setFormData] = useState({
    title: service?.title || '',
    title_ar: service?.title_ar || '',
    short_description: service?.short_description || '',
    short_description_ar: service?.short_description_ar || '',
    features: service?.features || [],
    features_ar: service?.features_ar || [],
    // ... other fields
  });

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (field, lang, newArray) => {
    const fieldName = lang === 'en' ? field : `${field}_ar`;
    setFormData(prev => ({ ...prev, [fieldName]: newArray }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert arrays to JSONB
    const payload = {
      ...formData,
      features: JSON.stringify(formData.features),
      features_ar: formData.features_ar.length > 0 
        ? JSON.stringify(formData.features_ar) 
        : null,
    };

    const { data, error } = await supabase
      .from('services')
      .upsert(payload);

    if (error) {
      console.error('Error:', error);
      return;
    }

    alert('✅ Saved successfully!');
  };

  return (
    <form onSubmit={handleSubmit}>
      <BilingualInput
        label="Title"
        nameEn="title"
        nameAr="title_ar"
        valueEn={formData.title}
        valueAr={formData.title_ar}
        onChange={handleInputChange}
        required={true}
      />

      <BilingualInput
        label="Short Description"
        nameEn="short_description"
        nameAr="short_description_ar"
        valueEn={formData.short_description}
        valueAr={formData.short_description_ar}
        onChange={handleInputChange}
        type="textarea"
        required={true}
      />

      <BilingualArrayInput
        label="Features"
        valuesEn={formData.features}
        valuesAr={formData.features_ar}
        onChange={handleArrayChange}
      />

      <button type="submit">Save</button>
    </form>
  );
}
```

### Step 4: Update Frontend Components

Components automatically check for Arabic content:

```jsx
// In your service card component
import { useTranslation } from '@/i18n/useTranslation';

function ServiceCard({ service }) {
  const { language } = useTranslation();
  
  const title = language === 'ar' && service.title_ar 
    ? service.title_ar 
    : service.title;
    
  const description = language === 'ar' && service.short_description_ar
    ? service.short_description_ar
    : service.short_description;
  
  return (
    <div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
```

---

## 🎨 UI Features

### Visual Indicators

The bilingual components provide visual feedback:

1. **Language Tabs**
   - 🇬🇧 EN / 🇸🇦 AR
   - Active tab highlighted in primary color
   - Badge showing item count for arrays

2. **Translation Status**
   - ✓ Green checkmark = content exists
   - ○ Gray circle = content missing
   - Shows for both languages at once

3. **Character Count**
   - For textareas
   - Shows current language
   - Displays "Left to Right" or "يمين إلى يسار"

4. **Smart Placeholders**
   - Direction changes based on active language
   - Arabic inputs are right-aligned with RTL direction

---

## ✅ Validation Rules

### Required Fields

English content is typically required, Arabic is optional:

```javascript
const validate = () => {
  const errors = {};
  
  // English is required
  if (!formData.title.trim()) {
    errors.title = 'English title is required';
  }
  
  // Arabic is optional (no validation needed)
  // Users can leave Arabic fields empty
  
  return errors;
};
```

### Recommended Workflow

1. ✅ Fill in English content first (required)
2. ✅ Click "AR" tab
3. ✅ Add Arabic translations
4. ✅ Review both using Preview mode
5. ✅ Save

---

## 🔄 Data Flow

### Saving Data

```javascript
// Form data state
{
  title: 'Web Development',
  title_ar: 'تطوير الويب',
  features: ['Responsive', 'SEO'],
  features_ar: ['متجاوب', 'محسّن لمحركات البحث']
}

// Convert to database format
{
  title: 'Web Development',
  title_ar: 'تطوير الويب',
  features: '["Responsive", "SEO"]',  // JSON string
  features_ar: '["متجاوب", "محسّن لمحركات البحث"]'
}
```

### Loading Data

```javascript
// From database
{
  title: 'Web Development',
  title_ar: 'تطوير الويب',
  features: '["Responsive", "SEO"]',  // JSON string
  features_ar: '["متجاوب", "محسّن لمحركات البحث"]'
}

// Parse to form state
{
  title: 'Web Development',
  title_ar: 'تطوير الويب',
  features: ['Responsive', 'SEO'],  // Parsed array
  features_ar: ['متجاوب', 'محسّن لمحركات البحث']
}
```

---

## 📝 Best Practices

### 1. Content Strategy

- ✅ Always fill English content first (it's the fallback)
- ✅ Arabic translations should be natural, not literal
- ✅ Keep similar structure/length for both languages
- ⚠️ Some technical terms may stay in English even in Arabic

### 2. Character Limits

Recommend these limits for consistency:

- **Title**: 60 chars max (both languages)
- **Short Description**: 150 chars max
- **Meta Description**: 160 chars max
- **Features/Benefits**: 10 items max, 50 chars per item

### 3. Array Items

For arrays (features, benefits):
- Add items one by one
- You don't need the same number of items in both languages
- Items can be in different order if needed for the language

### 4. JSONB Arrays

When saving to Supabase:
```javascript
// ✅ Correct
features_ar: formData.features_ar.length > 0 
  ? JSON.stringify(formData.features_ar) 
  : null

// ❌ Wrong
features_ar: JSON.stringify([]) // Don't save empty arrays as "[]"
```

---

## 🐛 Troubleshooting

### Arabic text not showing?

1. Check if `_ar` column exists in database
2. Verify data was saved correctly
3. Check frontend is using correct field name
4. Ensure IBM Plex Sans Arabic font is loaded

### Array items not saving?

1. Make sure you're converting to JSON string before saving:
   ```javascript
   JSON.stringify(formData.features_ar)
   ```

2. Parse back when loading:
   ```javascript
   const features = typeof data.features === 'string' 
     ? JSON.parse(data.features) 
     : data.features;
   ```

### Form validation issues?

1. Only English fields should be marked `required={true}`
2. Arabic fields are optional
3. Check error messages are showing correctly

---

## 🚀 Future Enhancements

Possible additions for Phase 3:

1. **Auto-translate button** using AI
2. **Side-by-side preview** mode
3. **Bulk import/export** for translations
4. **Translation completion percentage**
5. **Rich text editor** for long descriptions
6. **Image alt text** bilingual support

---

## 📚 Examples

### Full Service Form Example

See: `src/components/admin/ExampleServiceForm.jsx`

This is a complete, working example showing:
- ✅ BilingualInput for text fields
- ✅ BilingualArrayInput for features/benefits
- ✅ Form validation
- ✅ Preview mode
- ✅ Save to Supabase

### Quick Snippet

```jsx
<BilingualInput
  label="Page Title"
  nameEn="title"
  nameAr="title_ar"
  valueEn={title}
  valueAr={titleAr}
  onChange={(name, value) => {
    if (name === 'title') setTitle(value);
    if (name === 'title_ar') setTitleAr(value);
  }}
  required={true}
/>
```

---

## ✨ Summary

You now have:

1. ✅ Database migration with 50+ Arabic columns
2. ✅ `BilingualInput` component for text fields
3. ✅ `BilingualArrayInput` component for arrays
4. ✅ Complete example form
5. ✅ Visual indicators and validation
6. ✅ RTL support built-in

The admin panel is now fully bilingual-ready! 🎉

---

**Need help?** Check the example form or reach out for support.
