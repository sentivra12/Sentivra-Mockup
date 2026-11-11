import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X, Save, Eye, Sparkles } from 'lucide-react';
import PageHeader from '@/admin/components/PageHeader';
import SaveBar from '@/admin/components/SaveBar';
import { useFormDirty } from '@/admin/hooks/useFormDirty';
import { useAllPageContent, useUpdatePageContent } from '@/hooks/useContent';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

/**
 * PageContentPage - Admin page for managing CMS page sections
 * Allows editing hero, section headers, CTAs for each page
 */
const PageContentPage = () => {
  const { toast } = useToast();
  const [selectedPage, setSelectedPage] = useState('services');
  const { data: pageContent = [], isLoading } = useAllPageContent(selectedPage);
  const updatePageContent = useUpdatePageContent();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [formData, setFormData] = useState({});

  // Track dirty state
  const { isDirty, markClean, resetToInitial } = useFormDirty(formData, editingContent);

  const pages = [
    { key: 'home', label: 'Home Page' },
    { key: 'services', label: 'Services Page' },
    { key: 'mockups', label: 'Mockups Page' },
    { key: 'about', label: 'About Page' },
    { key: 'contact', label: 'Contact Page' },
  ];

  const handleOpenModal = (content) => {
    setEditingContent(content);
    setFormData({
      label_en: content.label_en || '',
      label_ar: content.label_ar || '',
      title_en: content.title_en || '',
      title_ar: content.title_ar || '',
      title_accent_en: content.title_accent_en || '',
      title_accent_ar: content.title_accent_ar || '',
      subtitle_en: content.subtitle_en || '',
      subtitle_ar: content.subtitle_ar || '',
      description_en: content.description_en || '',
      description_ar: content.description_ar || '',
      primary_button_label_en: content.primary_button_label_en || '',
      primary_button_label_ar: content.primary_button_label_ar || '',
      primary_button_link: content.primary_button_link || '',
      secondary_button_label_en: content.secondary_button_label_en || '',
      secondary_button_label_ar: content.secondary_button_label_ar || '',
      secondary_button_link: content.secondary_button_link || '',
      background_image_url: content.background_image_url || '',
      is_active: content.is_active,
      // Mockups hero specific fields
      hero_eyebrow: content.hero_eyebrow || '',
      hero_eyebrow_ar: content.hero_eyebrow_ar || '',
      hero_handwritten_note: content.hero_handwritten_note || '',
      hero_handwritten_note_ar: content.hero_handwritten_note_ar || '',
      hero_industry_lead: content.hero_industry_lead || '',
      hero_industry_lead_ar: content.hero_industry_lead_ar || '',
      hero_primary_cta: content.hero_primary_cta || '',
      hero_primary_cta_ar: content.hero_primary_cta_ar || '',
      hero_secondary_cta: content.hero_secondary_cta || '',
      hero_secondary_cta_ar: content.hero_secondary_cta_ar || '',
      sticky_bar_text: content.sticky_bar_text || '',
      sticky_bar_text_ar: content.sticky_bar_text_ar || '',
      sticky_bar_cta: content.sticky_bar_cta || '',
      sticky_bar_cta_ar: content.sticky_bar_cta_ar || '',
      show_hero_stats: content.show_hero_stats !== false,
      show_industry_line: content.show_industry_line !== false,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isDirty) {
      const shouldClose = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!shouldClose) return;
    }
    setIsModalOpen(false);
    setEditingContent(null);
    resetToInitial();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updatePageContent.mutateAsync({
        id: editingContent.id,
        ...formData,
      });

      toast({
        title: 'Success',
        description: 'Page content updated successfully.',
      });

      markClean();
      handleCloseModal();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update page content.',
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

  const getViewLink = (pageKey, sectionKey) => {
    if (pageKey === 'home') return '/';
    if (sectionKey === 'hero') return `/${pageKey}`;
    return `/${pageKey}#${sectionKey}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Page Content Management"
        description="Edit hero sections, headings, and CTAs for each page"
        icon={FileText}
      />

      {/* Page Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Select Page
        </label>
        <div className="flex flex-wrap gap-2">
          {pages.map((page) => (
            <button
              key={page.key}
              onClick={() => setSelectedPage(page.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedPage === page.key
                  ? 'bg-primary-strong text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {page.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 gap-4">
        {pageContent.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 border border-gray-200 dark:border-gray-700 text-center">
            <FileText className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold mb-2">No content sections found</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              This page doesn't have any editable content sections yet.
            </p>
            <button
              onClick={() => {/* TODO: Create default sections */}}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-strong text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold"
            >
              <Sparkles className="w-5 h-5" />
              Create Default Sections
            </button>
          </div>
        ) : (
          pageContent.map((content) => (
            <motion.div
              key={content.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-primary-strong/50 dark:hover:border-primary-strong/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {content.section_key.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {content.title_en || 'Untitled'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={getViewLink(selectedPage, content.section_key)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title="View on site"
                  >
                    <Eye className="w-5 h-5" />
                  </a>
                  <button
                    onClick={() => handleOpenModal(content)}
                    className="px-4 py-2 rounded-lg bg-primary-strong text-white hover:bg-primary-dark transition-colors font-medium"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-2 text-sm">
                {content.label_en && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Label:</span>{' '}
                    <span className="text-gray-900 dark:text-gray-100">{content.label_en}</span>
                  </div>
                )}
                {content.description_en && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Description:</span>{' '}
                    <span className="text-gray-900 dark:text-gray-100 line-clamp-2">{content.description_en}</span>
                  </div>
                )}
                {content.primary_button_label_en && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Primary CTA:</span>{' '}
                    <span className="text-gray-900 dark:text-gray-100">{content.primary_button_label_en}</span>
                    {content.primary_button_link && (
                      <span className="text-gray-500 dark:text-gray-500 ml-2">→ {content.primary_button_link}</span>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-4 mt-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                    content.is_active 
                      ? 'bg-green-500/20 text-green-700 dark:text-green-400' 
                      : 'bg-red-500/20 text-red-700 dark:text-red-400'
                  }`}>
                    {content.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full border border-gray-200 dark:border-gray-700 shadow-xl my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Edit {editingContent?.section_key.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Modal Content */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Bilingual Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* English Column */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                      English Content
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Label</label>
                      <input
                        type="text"
                        name="label_en"
                        value={formData.label_en}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:border-primary-strong focus:ring-2 focus:ring-primary-strong/20"
                        placeholder="e.g., Our Services"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                      <input
                        type="text"
                        name="title_en"
                        value={formData.title_en}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:border-primary-strong focus:ring-2 focus:ring-primary-strong/20"
                        placeholder="Main headline"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title Accent</label>
                      <input
                        type="text"
                        name="title_accent_en"
                        value={formData.title_accent_en}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:border-primary-strong focus:ring-2 focus:ring-primary-strong/20"
                        placeholder="Highlighted word(s)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                      <textarea
                        name="description_en"
                        value={formData.description_en}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:border-primary-strong focus:ring-2 focus:ring-primary-strong/20"
                        placeholder="Paragraph text"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Button Label</label>
                      <input
                        type="text"
                        name="primary_button_label_en"
                        value={formData.primary_button_label_en}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:border-primary-strong focus:ring-2 focus:ring-primary-strong/20"
                        placeholder="Button text"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Secondary Button Label</label>
                      <input
                        type="text"
                        name="secondary_button_label_en"
                        value={formData.secondary_button_label_en}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:border-primary-strong focus:ring-2 focus:ring-primary-strong/20"
                        placeholder="Button text"
                      />
                    </div>
                  </div>

                  {/* Arabic Column */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                      Arabic Content (العربية)
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">التسمية</label>
                      <input
                        type="text"
                        name="label_ar"
                        value={formData.label_ar}
                        onChange={handleChange}
                        dir="rtl"
                        className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:border-primary-strong focus:ring-2 focus:ring-primary-strong/20"
                        placeholder="مثال: خدماتنا"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">العنوان</label>
                      <input
                        type="text"
                        name="title_ar"
                        value={formData.title_ar}
                        onChange={handleChange}
                        dir="rtl"
                        className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:border-primary-strong focus:ring-2 focus:ring-primary-strong/20"
                        placeholder="العنوان الرئيسي"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الكلمة المميزة</label>
                      <input
                        type="text"
                        name="title_accent_ar"
                        value={formData.title_accent_ar}
                        onChange={handleChange}
                        dir="rtl"
                        className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:border-primary-strong focus:ring-2 focus:ring-primary-strong/20"
                        placeholder="الكلمة البارزة"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الوصف</label>
                      <textarea
                        name="description_ar"
                        value={formData.description_ar}
                        onChange={handleChange}
                        dir="rtl"
                        rows={4}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:border-primary-strong focus:ring-2 focus:ring-primary-strong/20"
                        placeholder="نص الفقرة"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نص الزر الأساسي</label>
                      <input
                        type="text"
                        name="primary_button_label_ar"
                        value={formData.primary_button_label_ar}
                        onChange={handleChange}
                        dir="rtl"
                        className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:border-primary-strong focus:ring-2 focus:ring-primary-strong/20"
                        placeholder="نص الزر"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نص الزر الثانوي</label>
                      <input
                        type="text"
                        name="secondary_button_label_ar"
                        value={formData.secondary_button_label_ar}
                        onChange={handleChange}
                        dir="rtl"
                        className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:border-primary-strong focus:ring-2 focus:ring-primary-strong/20"
                        placeholder="نص الزر"
                      />
                    </div>
                  </div>
                </div>

                {/* Shared Fields */}
                <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Links & Settings</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Button Link</label>
                      <input
                        type="text"
                        name="primary_button_link"
                        value={formData.primary_button_link}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:border-primary-strong focus:ring-2 focus:ring-primary-strong/20"
                        placeholder="/contact or #section"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Secondary Button Link</label>
                      <input
                        type="text"
                        name="secondary_button_link"
                        value={formData.secondary_button_link}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:border-primary-strong focus:ring-2 focus:ring-primary-strong/20"
                        placeholder="/about or #section"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Background Image URL (Optional)</label>
                    <input
                      type="text"
                      name="background_image_url"
                      value={formData.background_image_url}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:border-primary-strong focus:ring-2 focus:ring-primary-strong/20"
                      placeholder="https://..."
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Leave empty for default gradient background
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="is_active"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-strong/20"
                    />
                    <label htmlFor="is_active" className="text-gray-700 dark:text-gray-300 font-medium">
                      Active (show on site)
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    type="submit"
                    disabled={updatePageContent.isPending}
                    className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3"
                  >
                    {updatePageContent.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCloseModal}
                    variant="outline"
                    className="px-6"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SaveBar */}
      <SaveBar
        isDirty={isDirty}
        onSave={handleSubmit}
        onDiscard={handleDiscard}
        isSaving={updatePageContent.isPending}
      />
    </div>
  );
};

export default PageContentPage;
