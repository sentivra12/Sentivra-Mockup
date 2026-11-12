import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, X, Save } from 'lucide-react';
import PageHeader from '@/admin/components/PageHeader';
import DataTable from '@/admin/components/DataTable';
import SaveBar from '@/admin/components/SaveBar';
import { useFormDirty } from '@/admin/hooks/useFormDirty';
import MediaUploadField from '@/components/MediaUploadField';
import { useMockups, useMockupCategories, useCreateMockup, useUpdateMockup, useDeleteMockup } from '@/hooks/useContent';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const MockupsPage = () => {
  const { toast } = useToast();
  const { data: mockups = [], isLoading } = useMockups();
  const createMockup = useCreateMockup();
  const updateMockup = useUpdateMockup();
  const deleteMockup = useDeleteMockup();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMockup, setEditingMockup] = useState(null);
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useMockupCategories();
  
  // Debug: Log categories data
  React.useEffect(() => {
    console.log('🔍 Mockup Categories Debug:', {
      categories,
      count: categories?.length || 0,
      isLoading: categoriesLoading,
      error: categoriesError
    });
  }, [categories, categoriesLoading, categoriesError]);
  
  const [formData, setFormData] = useState({
    slug: '',
    title_en: '',
    title_ar: '',
    short_description_en: '',
    short_description_ar: '',
    long_description_en: '',
    long_description_ar: '',
    category_id: null,
    desktop_screenshot_url: '',
    desktop_screenshot_alt_en: '',
    desktop_screenshot_alt_ar: '',
    full_page_screenshot_url: '',
    tablet_screenshot_url: '',
    mobile_screenshot_url: '',
    cover_image_url: '',
    demo_url: '',
    live_url: '',
    client_name: '',
    industry: '',
    project_year: new Date().getFullYear(),
    whats_included: [],
    features: [],
    technologies: [],
    tags: '',
    gallery_images: [],
    open_in_new_tab: true,
    is_new: false,
    is_popular: false,
    is_featured: false,
    is_premium: false,
    price: 0,
    is_active: true,
    display_order: 0,
  });

  const { isDirty, markClean, resetToInitial } = useFormDirty(formData, editingMockup);

  const handleOpenModal = (mockup = null) => {
    if (mockup) {
      setEditingMockup(mockup);
      setFormData({
        slug: mockup.slug || '',
        title_en: mockup.title_en || mockup.title || '',
        title_ar: mockup.title_ar || '',
        short_description_en: mockup.short_description_en || mockup.description || '',
        short_description_ar: mockup.short_description_ar || '',
        long_description_en: mockup.long_description_en || '',
        long_description_ar: mockup.long_description_ar || '',
        category_id: mockup.category_id || null,
        desktop_screenshot_url: mockup.desktop_screenshot_url || mockup.image_url || '',
        desktop_screenshot_alt_en: mockup.desktop_screenshot_alt_en || '',
        desktop_screenshot_alt_ar: mockup.desktop_screenshot_alt_ar || '',
        full_page_screenshot_url: mockup.full_page_screenshot_url || '',
        tablet_screenshot_url: mockup.tablet_screenshot_url || '',
        mobile_screenshot_url: mockup.mobile_screenshot_url || '',
        cover_image_url: mockup.cover_image_url || mockup.thumbnail_url || '',
        demo_url: mockup.demo_url || mockup.download_url || '',
        live_url: mockup.live_url || '',
        client_name: mockup.client_name || '',
        industry: mockup.industry || '',
        project_year: mockup.project_year || new Date().getFullYear(),
        whats_included: Array.isArray(mockup.whats_included) ? mockup.whats_included : [],
        features: Array.isArray(mockup.features) ? mockup.features : [],
        technologies: Array.isArray(mockup.technologies) ? mockup.technologies : [],
        tags: Array.isArray(mockup.tags) ? mockup.tags.join(', ') : '',
        gallery_images: Array.isArray(mockup.gallery_images) ? mockup.gallery_images : [],
        open_in_new_tab: mockup.open_in_new_tab !== false,
        is_new: mockup.is_new || false,
        is_popular: mockup.is_popular || false,
        is_featured: mockup.is_featured || false,
        is_premium: mockup.is_premium || false,
        price: mockup.price || 0,
        is_active: mockup.is_active !== false,
        display_order: mockup.display_order || 0,
      });
    } else {
      setEditingMockup(null);
      setFormData({
        slug: '',
        title_en: '',
        title_ar: '',
        short_description_en: '',
        short_description_ar: '',
        long_description_en: '',
        long_description_ar: '',
        category_id: Array.isArray(categories) && categories.length > 0 ? categories[0].id : null,
        desktop_screenshot_url: '',
        desktop_screenshot_alt_en: '',
        desktop_screenshot_alt_ar: '',
        full_page_screenshot_url: '',
        tablet_screenshot_url: '',
        mobile_screenshot_url: '',
        cover_image_url: '',
        demo_url: '',
        whats_included: [],
        tags: '',
        is_new: false,
        is_popular: false,
        is_featured: false,
        is_premium: false,
        price: 0,
        is_active: true,
        display_order: mockups.length,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isDirty) {
      if (!confirm('You have unsaved changes. Are you sure you want to close?')) {
        return;
      }
    }
    setIsModalOpen(false);
    setEditingMockup(null);
  };

  const handleDiscard = () => {
    if (confirm('Are you sure you want to discard all changes?')) {
      resetToInitial();
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    // Auto-generate slug from English title
    if (name === 'title_en' && !editingMockup) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate live_url if provided
      if (formData.live_url && !formData.live_url.startsWith('https://')) {
        toast({
          title: 'Invalid URL',
          description: 'Live website URL must start with https://',
          variant: 'destructive',
        });
        return;
      }

      const mockupData = {
        ...formData,
        tags: Array.isArray(formData.tags) 
          ? formData.tags 
          : formData.tags.split(',').map((t) => t.trim()).filter((t) => t),
        price: parseFloat(formData.price) || 0,
        project_year: formData.project_year ? parseInt(formData.project_year) : null,
        whats_included: Array.isArray(formData.whats_included) ? formData.whats_included : [],
        features: Array.isArray(formData.features) ? formData.features : [],
        technologies: Array.isArray(formData.technologies) ? formData.technologies : [],
        gallery_images: Array.isArray(formData.gallery_images) ? formData.gallery_images : [],
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
      };

      if (editingMockup) {
        await updateMockup.mutateAsync({
          id: editingMockup.id,
          values: mockupData,
        });
        toast({
          title: 'Mockup updated!',
          description: 'The mockup has been updated successfully.',
        });
      } else {
        await createMockup.mutateAsync(mockupData);
        toast({
          title: 'Mockup created!',
          description: 'The mockup has been created successfully.',
        });
      }

      markClean();
      handleCloseModal();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (mockup) => {
    if (!confirm(`Are you sure you want to delete "${mockup.title_en || mockup.title}"?`)) return;

    try {
      await deleteMockup.mutateAsync(mockup.id);
      toast({
        title: 'Mockup deleted!',
        description: 'The mockup has been deleted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const columns = [
    {
      key: 'title_en',
      label: 'Title',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          {(row.desktop_screenshot_url || row.cover_image_url || row.image_url) && (
            <img
              src={row.cover_image_url || row.thumbnail_url || row.desktop_screenshot_url || row.image_url}
              alt={value}
              className="w-16 h-12 object-cover rounded-lg"
            />
          )}
          <div>
            <div className="font-medium">{value || row.title}</div>
            <div className="text-xs text-muted-foreground">{row.title_ar}</div>
            <div className="flex gap-1 mt-1">
              {row.is_new && <span className="text-xs px-1.5 py-0.5 bg-green-500/10 text-green-500 rounded">NEW</span>}
              {row.is_popular && <span className="text-xs px-1.5 py-0.5 bg-blue-500/10 text-blue-500 rounded">POPULAR</span>}
              {row.is_featured && <span className="text-xs px-1.5 py-0.5 bg-purple-500/10 text-purple-500 rounded">FEATURED</span>}
              {row.is_premium && <span className="text-xs px-1.5 py-0.5 bg-yellow-500/10 text-yellow-500 rounded">💎 PREMIUM</span>}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'mockup_categories',
      label: 'Category',
      sortable: true,
      render: (value, row) => {
        const categoryName = value?.name_en || row.category || '-';
        return (
          <span className="px-2.5 py-1 bg-pink-500/10 text-pink-500 text-xs rounded-full font-medium">
            {categoryName}
          </span>
        );
      },
    },
    {
      key: 'tags',
      label: 'Tags',
      render: (value) =>
        value && value.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {value.slice(0, 2).map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-xs rounded"
              >
                {tag}
              </span>
            ))}
            {value.length > 2 && (
              <span className="text-xs text-muted-foreground">+{value.length - 2}</span>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        ),
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (value, row) =>
        row.is_premium ? (
          <span className="font-medium">${value}</span>
        ) : (
          <span className="text-green-500 font-medium">Free</span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Mockups"
        description="Manage design mockups and templates"
        icon={Image}
        action={() => handleOpenModal()}
        actionLabel="Add Mockup"
      />

      <DataTable
        columns={columns}
        data={mockups}
        isLoading={isLoading}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
        searchPlaceholder="Search mockups..."
      />

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-3xl my-8"
              >
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <h2 className="text-2xl font-bold">
                    {editingMockup ? 'Edit Mockup' : 'Add New Mockup'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Slug <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm"
                      placeholder="e-commerce-dashboard"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Auto-generated from English title. Lowercase, hyphens only.
                    </p>
                  </div>

                  {/* Title - Bilingual */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Title (English) <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="title_en"
                        value={formData.title_en}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="E-commerce Dashboard"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Title (Arabic) <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="title_ar"
                        value={formData.title_ar}
                        onChange={handleChange}
                        dir="rtl"
                        required
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="لوحة تحكم التجارة الإلكترونية"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Category <span className="text-red-400">*</span>
                    </label>
                    <select
                      name="category_id"
                      value={formData.category_id || ''}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="">Select a category...</option>
                      {categoriesLoading && <option disabled>Loading categories...</option>}
                      {!categoriesLoading && categories.length === 0 && (
                        <option disabled>No categories found - try refreshing (Ctrl+Shift+R)</option>
                      )}
                      {Array.isArray(categories) && categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name_en} / {cat.name_ar}
                        </option>
                      ))}
                    </select>
                    {!categoriesLoading && categories.length === 0 && (
                      <p className="text-xs text-amber-500 mt-1">
                        ⚠️ Categories not loading? Try a hard refresh (Ctrl+Shift+R) to clear cache.
                      </p>
                    )}
                    {categoriesError && (
                      <p className="text-xs text-red-500 mt-1">
                        ❌ Error loading categories: {categoriesError.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Manage categories in the Mockup Categories page
                    </p>
                  </div>

                  {/* Short Description - Bilingual */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Short Description (English) <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        name="short_description_en"
                        value={formData.short_description_en}
                        onChange={handleChange}
                        required
                        rows={2}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                        placeholder="Brief 1-sentence summary for grid cards..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Short Description (Arabic) <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        name="short_description_ar"
                        value={formData.short_description_ar}
                        onChange={handleChange}
                        dir="rtl"
                        required
                        rows={2}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                        placeholder="ملخص موجز من جملة واحدة للبطاقات..."
                      />
                    </div>
                  </div>

                  {/* Long Description - Bilingual */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Long Description (English)
                      </label>
                      <textarea
                        name="long_description_en"
                        value={formData.long_description_en}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                        placeholder="Detailed description for the mockup detail page..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Long Description (Arabic)
                      </label>
                      <textarea
                        name="long_description_ar"
                        value={formData.long_description_ar}
                        onChange={handleChange}
                        dir="rtl"
                        rows={4}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                        placeholder="وصف تفصيلي لصفحة تفاصيل التصميم..."
                      />
                    </div>
                  </div>

                  {/* Screenshot Uploads */}
                  <div className="border-t border-border pt-4">
                    <h3 className="text-lg font-semibold mb-4">Screenshots (Device Views)</h3>
                    
                    <MediaUploadField
                      label="Desktop Screenshot"
                      value={formData.desktop_screenshot_url}
                      onChange={(url) => setFormData({ ...formData, desktop_screenshot_url: url })}
                      accept="image/*"
                      fileType="image"
                      required
                      showAltText={false}
                      helperText="Desktop/laptop view (recommended: 1440x900px)"
                    />

                    {/* Desktop Alt Text - Bilingual */}
                    <div className="grid grid-cols-2 gap-4 mt-2 mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Desktop Alt Text (EN)
                        </label>
                        <input
                          type="text"
                          name="desktop_screenshot_alt_en"
                          value={formData.desktop_screenshot_alt_en}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="E-commerce dashboard desktop view"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Desktop Alt Text (AR)
                        </label>
                        <input
                          type="text"
                          name="desktop_screenshot_alt_ar"
                          value={formData.desktop_screenshot_alt_ar}
                          onChange={handleChange}
                          dir="rtl"
                          className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="عرض سطح المكتب للوحة التحكم"
                        />
                      </div>
                    </div>

                    <MediaUploadField
                      label="Full-Page Screenshot (Optional)"
                      value={formData.full_page_screenshot_url}
                      onChange={(url) => setFormData({ ...formData, full_page_screenshot_url: url })}
                      accept="image/*"
                      fileType="image"
                      showAltText={false}
                      helperText="Tall full-page screenshot for scroll preview (recommended: 1440x3000px+)"
                    />

                    <MediaUploadField
                      label="Tablet Screenshot (Optional)"
                      value={formData.tablet_screenshot_url}
                      onChange={(url) => setFormData({ ...formData, tablet_screenshot_url: url })}
                      accept="image/*"
                      fileType="image"
                      showAltText={false}
                      helperText="Tablet view (recommended: 768x1024px)"
                    />

                    <MediaUploadField
                      label="Mobile Screenshot (Optional)"
                      value={formData.mobile_screenshot_url}
                      onChange={(url) => setFormData({ ...formData, mobile_screenshot_url: url })}
                      accept="image/*"
                      fileType="image"
                      showAltText={false}
                      helperText="Mobile view (recommended: 390x844px)"
                    />

                    <MediaUploadField
                      label="Cover Image (Optional)"
                      value={formData.cover_image_url}
                      onChange={(url) => setFormData({ ...formData, cover_image_url: url })}
                      accept="image/*"
                      fileType="image"
                      showAltText={false}
                      helperText="Custom cover/thumbnail for grid cards (fallback: desktop screenshot)"
                    />
                  </div>

                  {/* Gallery Images */}
                  <div className="border-t border-border pt-6">
                    <h3 className="text-lg font-semibold mb-4">Gallery Images (Optional)</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Additional images for the mockup detail page gallery
                    </p>
                    
                    {/* Gallery Images List */}
                    <div className="space-y-3 mb-4">
                      {(formData.gallery_images || []).map((imageUrl, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-accent/30 rounded-lg border border-border">
                          <img 
                            src={imageUrl} 
                            alt={`Gallery ${index + 1}`} 
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{imageUrl}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newGallery = [...(formData.gallery_images || [])];
                              newGallery.splice(index, 1);
                              setFormData({ ...formData, gallery_images: newGallery });
                            }}
                            className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Gallery Image */}
                    <MediaUploadField
                      label="Add Gallery Image"
                      value=""
                      onChange={(url) => {
                        if (url) {
                          const newGallery = [...(formData.gallery_images || []), url];
                          setFormData({ ...formData, gallery_images: newGallery });
                        }
                      }}
                      accept="image/*"
                      fileType="image"
                      showAltText={false}
                      helperText="Upload additional screenshots or images to showcase details"
                    />
                  </div>

                  {/* Demo URL */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Demo URL (Optional)
                    </label>
                    <input
                      type="url"
                      name="demo_url"
                      value={formData.demo_url}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="https://demo.example.com"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Link to live preview or Figma file
                    </p>
                  </div>

                  {/* Live Website URL - NEW */}
                  <div className="border-t border-border pt-6">
                    <label className="block text-sm font-medium mb-2">
                      Live Website URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        name="live_url"
                        value={formData.live_url}
                        onChange={handleChange}
                        className="flex-1 px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="https://www.client-website.com"
                      />
                      {formData.live_url && (
                        <a
                          href={formData.live_url.startsWith('http://') || formData.live_url.startsWith('https://') 
                            ? formData.live_url 
                            : `https://${formData.live_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2"
                        >
                          <span>Test</span>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      🌐 Real website URL (HTTPS only). Card will open this URL instead of details page. Leave empty for internal preview only.
                    </p>
                  </div>

                  {/* Open in New Tab Toggle */}
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="open_in_new_tab"
                        checked={formData.open_in_new_tab}
                        onChange={handleChange}
                        className="w-5 h-5 rounded border-border"
                      />
                      <span className="text-sm font-medium">Open live website in new tab</span>
                    </label>
                  </div>

                  {/* Client & Project Info */}
                  <div className="border-t border-border pt-6">
                    <h3 className="text-lg font-semibold mb-4">Client & Project Info</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Client Name (Optional)
                        </label>
                        <input
                          type="text"
                          name="client_name"
                          value={formData.client_name}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="Acme Corporation"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Industry (Optional)
                        </label>
                        <input
                          type="text"
                          name="industry"
                          value={formData.industry}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="E-commerce"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Project Year (Optional)
                        </label>
                        <input
                          type="number"
                          name="project_year"
                          value={formData.project_year}
                          onChange={handleChange}
                          min="2000"
                          max="2099"
                          className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="2024"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Features List */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Features (JSON Array - Optional)
                    </label>
                    <textarea
                      name="features"
                      value={JSON.stringify(formData.features, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          setFormData({ ...formData, features: parsed });
                        } catch {
                          // Invalid JSON, keep current value
                        }
                      }}
                      rows={4}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none font-mono text-sm"
                      placeholder='["Responsive Design", "Dark Mode", "Multi-language"]'
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      List of key features (shows on detail page)
                    </p>
                  </div>

                  {/* Technologies */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Technologies (JSON Array - Optional)
                    </label>
                    <textarea
                      name="technologies"
                      value={JSON.stringify(formData.technologies, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          setFormData({ ...formData, technologies: parsed });
                        } catch {
                          // Invalid JSON, keep current value
                        }
                      }}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none font-mono text-sm"
                      placeholder='["React", "Node.js", "PostgreSQL"]'
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Tech stack used (shows on detail page)
                    </p>
                  </div>

                  {/* What's Included List */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      What's Included (JSON Array)
                    </label>
                    <textarea
                      name="whats_included"
                      value={JSON.stringify(formData.whats_included, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          setFormData({ ...formData, whats_included: parsed });
                        } catch {
                          // Invalid JSON, keep current value
                        }
                      }}
                      rows={5}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none font-mono text-sm"
                      placeholder='["Responsive design", "Modern UI", "Clean code"]'
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Features included in this mockup (JSON array format)
                    </p>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="modern, minimal, clean, responsive"
                    />
                  </div>

                  {/* Badges */}
                  <div className="border-t border-border pt-4">
                    <h3 className="text-lg font-semibold mb-3">Badges</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <label className="flex items-center gap-2 cursor-pointer p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                        <input
                          type="checkbox"
                          name="is_new"
                          checked={formData.is_new}
                          onChange={handleChange}
                          className="w-5 h-5 rounded border-border"
                        />
                        <span className="text-sm font-medium">🆕 New</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                        <input
                          type="checkbox"
                          name="is_popular"
                          checked={formData.is_popular}
                          onChange={handleChange}
                          className="w-5 h-5 rounded border-border"
                        />
                        <span className="text-sm font-medium">🔥 Popular</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                        <input
                          type="checkbox"
                          name="is_featured"
                          checked={formData.is_featured}
                          onChange={handleChange}
                          className="w-5 h-5 rounded border-border"
                        />
                        <span className="text-sm font-medium">⭐ Featured</span>
                      </label>
                    </div>
                  </div>

                  {/* Premium & Price & Display Order */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center pt-8">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="is_premium"
                          checked={formData.is_premium}
                          onChange={handleChange}
                          className="w-5 h-5 rounded border-border"
                        />
                        <span className="text-sm font-medium">💎 Premium</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Price ($)
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        disabled={!formData.is_premium}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Display Order
                      </label>
                      <input
                        type="number"
                        name="display_order"
                        value={formData.display_order}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>

                  {/* Active */}
                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                        className="w-5 h-5 rounded border-border"
                      />
                      <span className="text-sm font-medium">Active (Visible on Frontend)</span>
                    </label>
                  </div>

                  {/* Live Card Preview */}
                  <div className="border-t border-border pt-6">
                    <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Preview how this mockup card will appear on the public /mockups page
                    </p>
                    
                    {/* Preview Card */}
                    <div className="max-w-sm mx-auto p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl">
                      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-lg">
                        {/* Image */}
                        <div className="relative h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                          {(formData.cover_image_url || formData.desktop_screenshot_url) ? (
                            <img 
                              src={formData.cover_image_url || formData.desktop_screenshot_url} 
                              alt={formData.title_en || 'Preview'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          {/* Badges */}
                          <div className="absolute top-3 left-3 flex gap-2">
                            {formData.is_new && (
                              <span className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                                🆕 New
                              </span>
                            )}
                            {formData.is_popular && (
                              <span className="px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
                                🔥 Popular
                              </span>
                            )}
                            {formData.is_featured && (
                              <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
                                ⭐ Featured
                              </span>
                            )}
                            {formData.is_premium && (
                              <span className="px-2 py-1 bg-purple-500 text-white text-xs font-medium rounded-full">
                                💎 Premium
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-gray-900 dark:text-white text-base line-clamp-1">
                              {formData.title_en || 'Untitled Mockup'}
                            </h4>
                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full whitespace-nowrap">
                              {formData.category_name || 'Category'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {formData.short_description_en || 'No description provided'}
                          </p>
                          
                          {/* Click behavior indicator */}
                          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formData.live_url ? (
                                <>
                                  🌐 Clicking card opens: <span className="font-semibold text-primary">{formData.live_url}</span>
                                  {formData.open_in_new_tab && ' (new tab)'}
                                </>
                              ) : (
                                '🔍 Clicking card opens detail modal (no live_url set)'
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                    <Button type="button" onClick={handleCloseModal} variant="outline">
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMockup.isPending || updateMockup.isPending}
                      className="bg-gradient-to-r from-primary to-secondary text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingMockup ? 'Update' : 'Create'} Mockup
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <SaveBar
        isDirty={isDirty}
        onSave={handleSubmit}
        onDiscard={handleDiscard}
        isSaving={createMockup.isPending || updateMockup.isPending}
      />
    </div>
  );
};

export default MockupsPage;
