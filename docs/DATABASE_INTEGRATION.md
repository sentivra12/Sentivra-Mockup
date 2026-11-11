# Database Integration Guide

## Overview

Sentivra now supports **dual-mode data fetching**: data can come from **Supabase** (when configured) or fall back to **static data** (when Supabase is not available). This ensures the app works seamlessly in both development and production environments.

---

## Architecture

### 1. **Supabase Client** (`src/lib/supabase.js`)

- Pre-configured Supabase client with auth helpers
- Exports `isMissingEnv` flag to detect if environment variables are missing
- Handles graceful degradation when env vars are not set

### 2. **Database Hooks** (`src/hooks/useDatabase.js`)

React hooks for fetching data with loading/error states:

| Hook | Purpose | Parameters |
|------|---------|------------|
| `useServices()` | Fetch all services | `{ category, featured }` |
| `useService(slug)` | Fetch single service by slug | `slug` |
| `useProjects()` | Fetch all projects | `{ category, featured }` |
| `useProject(slug)` | Fetch single project by slug | `slug` |
| `useTestimonials()` | Fetch testimonials | `{ featured, limit }` |
| `useMockups()` | Fetch mockups | `{ category }` |
| `useHero()` | Fetch hero section data | - |
| `useStats()` | Fetch stats counters | - |
| `useClientLogos()` | Fetch client logos | - |
| `useFAQs(pageKey)` | Fetch FAQs by page | `pageKey` |

**All hooks automatically**:
- ✅ Handle loading states
- ✅ Handle error states
- ✅ Support bilingual data (EN/AR)
- ✅ Provide `refetch()` function
- ✅ Fall back to static data if Supabase fails

### 3. **Data Files** (Dual-Mode)

Updated files support **both static and dynamic data**:

- `src/data/services.js`
- `src/data/projects.js`
- `src/data/testimonials.js`
- `src/data/mockups.js`

Each file exports:
- **Static data**: `servicesStatic`, `projectsStatic`, etc. (default export for backward compatibility)
- **Fetch functions**: `fetchServices()`, `fetchProjects()`, etc.

---

## Usage Examples

### Example 1: Using Hooks (Recommended)

```jsx
import { useServices } from '../hooks/useDatabase';

function ServicesPage() {
  const { data: services, loading, error, refetch } = useServices({ 
    category: 'Web & Mobile',
    featured: true 
  });

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!services?.length) return <NoResults />;

  return (
    <div>
      {services.map(service => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}
```

### Example 2: Using Fetch Functions

```jsx
import { fetchServices } from '../data/services';
import { useLanguage } from '../contexts/LanguageContext';

function ServicesPage() {
  const { language } = useLanguage();
  const [services, setServices] = useState([]);

  useEffect(() => {
    const loadServices = async () => {
      const data = await fetchServices({ 
        featured: true, 
        language 
      });
      setServices(data);
    };
    loadServices();
  }, [language]);

  return (
    <div>
      {services.map(service => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}
```

### Example 3: Static Data (Legacy)

```jsx
// Still works for backward compatibility
import { services } from '../data/services';

function ServicesPage() {
  return (
    <div>
      {services.map(service => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}
```

---

## Bilingual Support

All hooks and fetch functions automatically return bilingual data based on the current language context:

### Database Structure

Each translatable field has two columns:
- `title` (English)
- `title_ar` (Arabic)

### Automatic Translation

The hooks/functions check the language context and return the appropriate field:

```javascript
{
  title: language === 'ar' && service.title_ar 
    ? service.title_ar 
    : service.title
}
```

### Supported Bilingual Fields

**Services**:
- `title` / `title_ar`
- `short_description` / `short_description_ar`
- `long_description` / `long_description_ar`
- `features` / `features_ar`
- `benefits` / `benefits_ar`

**Projects**:
- `title` / `title_ar`
- `short_description` / `short_description_ar`
- `long_description` / `long_description_ar`

**Testimonials**:
- `testimonial_text` / `testimonial_text_ar`
- `client_name` / `client_name_ar`
- `client_role` / `client_role_ar`
- `client_company` / `client_company_ar`

**Mockups**:
- `title` / `title_ar`
- `description` / `description_ar`
- `category` / `category_ar`

---

## Environment Setup

### Required Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Get Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings → API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

### Run Migrations

After setting up env variables, run the SQL migrations:

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Run migrations in order:
   - `20261104000001_initial_schema.sql`
   - `20261104000002_seed_data.sql`
   - `20261104000003_add_dashboard_fields.sql`
   - `20261105000001_setup_storage.sql`
   - `20261107000001_add_arabic_columns.sql`
   - `20261108000001_add_arabic_translations.sql`
   - `20261108000002_cleanup_duplicate_services.sql`

---

## Error Handling

### Graceful Degradation

If Supabase fails, the app **automatically falls back** to static data:

```javascript
// Supabase not configured → uses static data
const services = await fetchServices(); 

// Supabase query fails → returns static data
const { data } = useServices(); // data = servicesStatic
```

### Error States

Hooks provide error objects for UI handling:

```jsx
const { data, loading, error, refetch } = useServices();

if (error) {
  return (
    <ErrorState 
      error={error} 
      onRetry={refetch}
      message="Failed to load services. Please try again."
    />
  );
}
```

---

## Performance Considerations

### Caching

The hooks use React's `useEffect` dependency array for automatic caching:

```javascript
// Only refetches when category or language changes
const { data } = useServices({ category: 'Web & Mobile' });
```

### Loading States

Always show loading states for better UX:

```jsx
if (loading) return <LoadingState />;
```

### Refetch Function

Use `refetch()` for manual data refresh:

```jsx
const { data, refetch } = useServices();

<button onClick={refetch}>Refresh Services</button>
```

---

## Migration Path

### Phase 1: ✅ Complete
- Created database hooks
- Updated data files with fetch functions
- Maintained backward compatibility

### Phase 2: In Progress
- Update HomePage to use hooks
- Update Services page
- Update Projects page

### Phase 3: Future
- Update all pages to use database hooks
- Remove static data files (optional)
- Add admin dashboard for content management

---

## Best Practices

### ✅ DO

- Use hooks for new components
- Handle loading/error states
- Show empty states when no data
- Use `refetch()` for user-triggered updates
- Test with both Supabase enabled/disabled

### ❌ DON'T

- Don't mix static imports with hooks in the same component
- Don't forget to handle loading states
- Don't assume data will always be available
- Don't hardcode language-specific content

---

## Troubleshooting

### Issue: "Missing Supabase environment variables"

**Solution**: Create `.env.local` with required variables

### Issue: Hook returns `null`

**Possible causes**:
1. Supabase query failed (check console)
2. Data not seeded in database
3. Row is marked `is_active = false`

**Solution**: Check browser console for errors

### Issue: Wrong language displayed

**Solution**: Ensure LanguageContext is providing correct language value

### Issue: Static data still showing

**Possible causes**:
1. Component not updated to use hooks
2. Environment variables not loaded (restart dev server)

**Solution**: Update component to use hooks, restart server

---

## Next Steps

1. ✅ Database hooks created
2. ✅ Data files updated
3. ⏳ Update HomePage components (next task)
4. ⏳ Test bilingual data
5. ⏳ Performance optimization
