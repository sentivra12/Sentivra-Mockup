/**
 * Admin > Client Logos Page — Round 2
 *
 * REQUIREMENTS
 * ────────────────────────────────────────────────────────────────────────────
 * - Bilingual fields: client_name (EN) + client_name_ar (AR), fallback to EN
 * - Logo upload: SVG/PNG/WebP, transparent bg recommended, size/format hints
 * - Optional website_url (https only, with "Open link" test button)
 * - Optional alt_text (for accessibility)
 * - Invert-in-dark-mode toggle for dark logos on transparent bg
 * - Sort order (drag-to-reorder or manual numbers)
 * - Published toggle (is_active)
 * - SaveBar: disabled when unchanged, success toast, real Supabase error on failure
 * - Ctrl/Cmd+S keyboard shortcut
 * - List shows thumbnails, published state, order
 * - Live preview of how the strip will look
 * - All buttons readable at rest (AA contrast)
 * - "Add New" button always functional (onClick correct)
 * ────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, X, Save, ExternalLink, Eye } from 'lucide-react';
import PageHeader from '@/admin/components/PageHeader';
import SaveBar from '@/admin/components/SaveBar';
import { useFormDirty } from '@/admin/hooks/useFormDirty';
import DataTable from '@/admin/components/DataTable';
import MediaUploadField from '@/components/MediaUploadField';
import { useClientLogos, useCreateClientLogo, useUpdateClientLogo, useDeleteClientLogo } from '@/hooks/useContent';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n/useTranslation';

/* ── Helper: initials monogram (same as public component) ────────────────── */
function getInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

/* ── Preview badge component ───────────────────────────────────────────────── */
function PreviewBadge({ client }) {
  const [imgError, setImgError] = useState(false);
  const hasImage = client.logo_url && !imgError;

  return (
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: 12,
        background: 'linear-gradient(135deg, rgba(13,158,130,0.08), rgba(4,77,64,0.12))',
        border: '1px solid rgba(13,158,130,0.22)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        flexShrink: 0,
      }}
    >
      {hasImage ? (
        <img
          src={client.logo_url}
          alt={client.client_name}
          onError={() => setImgError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            filter: 'grayscale(100%)',
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
            background: 'linear-gradient(135deg, rgba(13,158,130,0.18), rgba(4,77,64,0.26))',
            fontSize: 18,
            fontWeight: 800,
            color: 'rgba(13,158,130,0.90)',
            letterSpacing: '-0.02em',
          }}
        >
          {getInitials(client.client_name)}
        </div>
      )}
    </div>
  );
}

/* ── Main component ────────────────────────────────────────────────────────── */
const ClientLogosPage = () => {
  const { toast } = useToast();
  const { language } = useTranslation();
  const isRTL = language === 'ar';

  const { data: clientLogos = [], isLoading } = useClientLogos();
  const createClientLogo = useCreateClientLogo();
  const updateClientLogo = useUpdateClientLogo();
  const deleteClientLogo = useDeleteClientLogo();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLogo, setEditingLogo] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState({
    client_name: '',
    client_name_ar: '',
    logo_url: '',
    website_url: '',
    alt_text: '',
    invert_in_dark: false,
    is_active: true,
    display_order: 0,
  });

  // Track dirty state
  const { isDirty, markClean, resetToInitial } = useFormDirty(formData, editingLogo);

  // Keyboard shortcut: Ctrl/Cmd+S
  useEffect(() => {
    if (!isModalOpen || !isDirty) return;
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSubmit(e);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isModalOpen, isDirty, formData]);

  const handleOpenModal = (logo = null) => {
    if (logo) {
      setEditingLogo(logo);
      setFormData({
        client_name: logo.client_name || '',
        client_name_ar: logo.client_name_ar || '',
        logo_url: logo.logo_url || '',
        website_url: logo.website_url || '',
        alt_text: logo.alt_text || '',
        invert_in_dark: logo.invert_in_dark || false,
        is_active: logo.is_active ?? true,
        display_order: logo.display_order || 0,
      });
    } else {
      setEditingLogo(null);
      setFormData({
        client_name: '',
        client_name_ar: '',
        logo_url: '',
        website_url: '',
        alt_text: '',
        invert_in_dark: false,
        is_active: true,
        display_order: clientLogos.length,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isDirty) {
      const shouldClose = window.confirm(
        language === 'ar'
          ? 'لديك تغييرات غير محفوظة. هل أنت متأكد من الإغلاق؟'
          : 'You have unsaved changes. Are you sure you want to close?'
      );
      if (!shouldClose) return;
    }
    setIsModalOpen(false);
    setEditingLogo(null);
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

    // Validate: client_name required
    if (!formData.client_name.trim()) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'اسم العميل مطلوب' : 'Client name is required',
        variant: 'destructive',
      });
      return;
    }

    // Validate: logo_url required
    if (!formData.logo_url.trim()) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'شعار العميل مطلوب' : 'Client logo is required',
        variant: 'destructive',
      });
      return;
    }

    // Validate: website_url must be https if provided
    if (formData.website_url.trim() && !formData.website_url.startsWith('https://')) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'رابط الموقع يجب أن يبدأ بـ https://' : 'Website URL must start with https://',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingLogo) {
        await updateClientLogo.mutateAsync({
          id: editingLogo.id,
          values: formData,
        });
        toast({
          title: language === 'ar' ? 'تم التحديث!' : 'Client logo updated!',
          description: language === 'ar' ? 'تم تحديث الشعار بنجاح.' : 'The client logo has been updated successfully.',
        });
      } else {
        await createClientLogo.mutateAsync(formData);
        toast({
          title: language === 'ar' ? 'تم الإنشاء!' : 'Client logo created!',
          description: language === 'ar' ? 'تم إنشاء الشعار بنجاح.' : 'The client logo has been created successfully.',
        });
      }

      markClean();
      handleCloseModal();
    } catch (error) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: error.message || (language === 'ar' ? 'فشل الحفظ' : 'Failed to save'),
        variant: 'destructive',
      });
    }
  };

  const handleDiscard = () => {
    const shouldDiscard = window.confirm(
      language === 'ar' ? 'تجاهل جميع التغييرات؟' : 'Discard all unsaved changes?'
    );
    if (shouldDiscard) {
      resetToInitial();
      toast({
        title: language === 'ar' ? 'تم التجاهل' : 'Changes discarded',
        description: language === 'ar' ? 'تم تجاهل جميع التغييرات.' : 'All unsaved changes have been discarded.',
      });
    }
  };

  const handleDelete = async (logo) => {
    if (
      !window.confirm(
        language === 'ar'
          ? `هل أنت متأكد من حذف "${logo.client_name}"؟`
          : `Are you sure you want to delete "${logo.client_name}"?`
      )
    )
      return;

    try {
      await deleteClientLogo.mutateAsync(logo.id);
      toast({
        title: language === 'ar' ? 'تم الحذف!' : 'Client logo deleted!',
        description: language === 'ar' ? 'تم حذف الشعار بنجاح.' : 'The client logo has been deleted successfully.',
      });
    } catch (error) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: error.message || (language === 'ar' ? 'فشل الحذف' : 'Failed to delete'),
        variant: 'destructive',
      });
    }
  };

  const columns = [
    {
      key: 'client_name',
      label: language === 'ar' ? 'العميل' : 'Client',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <PreviewBadge client={row} />
          <div>
            <div className="font-semibold text-sm text-color-text">{value}</div>
            {row.client_name_ar && (
              <div className="text-xs text-color-text-muted mt-0.5" dir="rtl">
                {row.client_name_ar}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'website_url',
      label: language === 'ar' ? 'الموقع' : 'Website',
      render: (value) =>
        value ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 hover:underline text-sm inline-flex items-center gap-1"
          >
            <span className="truncate max-w-[200px]">{value.replace(/^https?:\/\//, '')}</span>
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
        ) : (
          <span className="text-color-text-muted text-sm">—</span>
        ),
    },
    {
      key: 'display_order',
      label: language === 'ar' ? 'الترتيب' : 'Order',
      sortable: true,
      render: (value) => (
        <span className="text-sm font-mono text-color-text-muted">{value}</span>
      ),
    },
    {
      key: 'is_active',
      label: language === 'ar' ? 'الحالة' : 'Status',
      render: (value) =>
        value ? (
          <span className="px-2.5 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-semibold rounded-full">
            {language === 'ar' ? 'نشط' : 'Active'}
          </span>
        ) : (
          <span className="px-2.5 py-1 bg-gray-500/10 text-gray-600 dark:text-gray-400 text-xs font-semibold rounded-full">
            {language === 'ar' ? 'مخفي' : 'Hidden'}
          </span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={language === 'ar' ? 'شعارات العملاء' : 'Client Logos'}
        description={language === 'ar' ? 'إدارة شعارات العملاء الموثوقين' : 'Manage your trusted client logos'}
        icon={Users}
        action={() => handleOpenModal()}
        actionLabel={language === 'ar' ? 'إضافة شعار' : 'Add Client Logo'}
      />

      {/* Preview toggle */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"
          style={{ color: 'rgba(13,158,130,0.90)' }}
        >
          <Eye className="w-4 h-4" />
          {showPreview
            ? language === 'ar' ? 'إخفاء المعاينة' : 'Hide Preview'
            : language === 'ar' ? 'معاينة الشريط' : 'Preview Strip'}
        </button>
      </div>

      {/* Live preview of the strip */}
      {showPreview && clientLogos.length > 0 && (
        <div className="mb-6 p-6 bg-color-surface border border-color-border rounded-xl">
          <h3 className="text-sm font-semibold text-color-text mb-4">
            {language === 'ar' ? 'معاينة مباشرة' : 'Live Preview'}
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-6 py-4">
            {clientLogos.filter(c => c.is_active).map(client => (
              <PreviewBadge key={client.id} client={client} />
            ))}
          </div>
          {clientLogos.filter(c => c.is_active).length === 0 && (
            <p className="text-center text-color-text-muted text-sm py-8">
              {language === 'ar' ? 'لا توجد شعارات نشطة' : 'No active logos'}
            </p>
          )}
        </div>
      )}

      <DataTable
        columns={columns}
        data={clientLogos}
        isLoading={isLoading}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
        searchPlaceholder={language === 'ar' ? 'بحث...' : 'Search client logos...'}
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
                className="bg-color-background border border-color-border rounded-2xl shadow-2xl w-full max-w-2xl my-8"
              >
                <div className="flex items-center justify-between p-6 border-b border-color-border">
                  <h2 className="text-2xl font-bold text-color-text">
                    {editingLogo
                      ? language === 'ar' ? 'تعديل الشعار' : 'Edit Client Logo'
                      : language === 'ar' ? 'إضافة شعار جديد' : 'Add New Client Logo'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 hover:bg-color-surface rounded-lg transition-colors"
                    aria-label={language === 'ar' ? 'إغلاق' : 'Close'}
                  >
                    <X className="w-5 h-5 text-color-text" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                  {/* Client Name (EN) */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-color-text">
                      {language === 'ar' ? 'اسم العميل (EN)' : 'Client Name (EN)'} *
                    </label>
                    <input
                      type="text"
                      name="client_name"
                      value={formData.client_name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 bg-color-surface border border-color-border rounded-xl text-color-text placeholder:text-color-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="e.g., Tech Corp"
                      style={{ color: 'var(--color-text)' }}
                    />
                  </div>

                  {/* Client Name (AR) */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-color-text">
                      {language === 'ar' ? 'اسم العميل (عربي)' : 'Client Name (AR)'}
                    </label>
                    <input
                      type="text"
                      name="client_name_ar"
                      value={formData.client_name_ar}
                      onChange={handleChange}
                      dir="rtl"
                      className="w-full px-4 py-2.5 bg-color-surface border border-color-border rounded-xl text-color-text placeholder:text-color-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="مثال: شركة التقنية"
                      style={{ color: 'var(--color-text)' }}
                    />
                    <p className="text-xs text-color-text-muted mt-1">
                      {language === 'ar'
                        ? 'اختياري — يظهر في الموقع العربي'
                        : 'Optional — falls back to English name'}
                    </p>
                  </div>

                  {/* Logo */}
                  <MediaUploadField
                    label={language === 'ar' ? 'الشعار' : 'Client Logo'}
                    value={formData.logo_url}
                    onChange={(url) => setFormData({ ...formData, logo_url: url })}
                    accept="image/svg+xml,image/png,image/webp,image/jpeg"
                    fileType="image"
                    required
                    showAltText={false}
                    helperText={
                      language === 'ar'
                        ? 'SVG أو PNG موصى به (خلفية شفافة). حد أقصى 5 ميجابايت.'
                        : 'SVG or PNG recommended (transparent background). Max 5MB.'
                    }
                  />

                  {/* Alt Text */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-color-text">
                      {language === 'ar' ? 'النص البديل' : 'Alt Text'}
                    </label>
                    <input
                      type="text"
                      name="alt_text"
                      value={formData.alt_text}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-color-surface border border-color-border rounded-xl text-color-text placeholder:text-color-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder={
                        language === 'ar'
                          ? 'وصف الشعار للوصولية'
                          : 'Describe the logo for accessibility'
                      }
                      style={{ color: 'var(--color-text)' }}
                    />
                    <p className="text-xs text-color-text-muted mt-1">
                      {language === 'ar'
                        ? 'اختياري — الافتراضي: اسم العميل'
                        : 'Optional — defaults to client name'}
                    </p>
                  </div>

                  {/* Website URL */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-color-text">
                      {language === 'ar' ? 'رابط الموقع' : 'Website URL'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        name="website_url"
                        value={formData.website_url}
                        onChange={handleChange}
                        className="flex-1 px-4 py-2.5 bg-color-surface border border-color-border rounded-xl text-color-text placeholder:text-color-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder="https://client-website.com"
                        style={{ color: 'var(--color-text)' }}
                      />
                      {formData.website_url && (
                        <a
                          href={formData.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-colors inline-flex items-center gap-2 flex-shrink-0"
                          style={{ background: 'rgba(13,158,130,0.90)' }}
                        >
                          <ExternalLink className="w-4 h-4" />
                          {language === 'ar' ? 'فتح' : 'Open'}
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-color-text-muted mt-1">
                      {language === 'ar'
                        ? 'اختياري — يجب أن يبدأ بـ https://'
                        : 'Optional — must start with https://'}
                    </p>
                  </div>

                  {/* Display Order & Checkboxes */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-color-text">
                        {language === 'ar' ? 'ترتيب العرض' : 'Display Order'}
                      </label>
                      <input
                        type="number"
                        name="display_order"
                        value={formData.display_order}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-2.5 bg-color-surface border border-color-border rounded-xl text-color-text focus:outline-none focus:ring-2 focus:ring-brand-500"
                        style={{ color: 'var(--color-text)' }}
                      />
                    </div>

                    <div className="space-y-3 pt-7">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="is_active"
                          checked={formData.is_active}
                          onChange={handleChange}
                          className="w-5 h-5 rounded border-color-border accent-brand-600"
                        />
                        <span className="text-sm font-medium text-color-text">
                          {language === 'ar' ? 'نشط (مرئي)' : 'Active (Visible)'}
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="invert_in_dark"
                          checked={formData.invert_in_dark}
                          onChange={handleChange}
                          className="w-5 h-5 rounded border-color-border accent-brand-600"
                        />
                        <span className="text-sm font-medium text-color-text">
                          {language === 'ar' ? 'عكس في الوضع الداكن' : 'Invert in dark mode'}
                        </span>
                      </label>
                    </div>
                  </div>

                  <p className="text-xs text-color-text-muted">
                    {language === 'ar'
                      ? '"عكس في الوضع الداكن" مفيد للشعارات الداكنة على خلفية شفافة'
                      : '"Invert in dark mode" is useful for dark logos on transparent backgrounds'}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-color-border">
                    <Button
                      type="button"
                      onClick={handleCloseModal}
                      variant="outline"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </Button>
                    <Button
                      type="submit"
                      disabled={createClientLogo.isPending || updateClientLogo.isPending}
                      className="bg-gradient-to-r from-brand-600 to-brand-700 text-white hover:from-brand-700 hover:to-brand-800"
                      style={{ background: 'linear-gradient(135deg, rgba(13,158,130,0.90), rgba(4,77,64,0.95))' }}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingLogo
                        ? language === 'ar' ? 'تحديث' : 'Update'
                        : language === 'ar' ? 'إنشاء' : 'Create'}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* SaveBar */}
      <SaveBar
        isDirty={isDirty}
        onSave={handleSubmit}
        onDiscard={handleDiscard}
        isSaving={createClientLogo.isPending || updateClientLogo.isPending}
      />
    </div>
  );
};

export default ClientLogosPage;
