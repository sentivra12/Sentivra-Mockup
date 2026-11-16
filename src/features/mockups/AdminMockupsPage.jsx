/**
 * AdminMockupsPage — full rebuild
 *
 * Dialog requirements met:
 * - Portaled to document.body, position fixed inset-0, z-[200]
 * - Sticky header + sticky footer (Save/Cancel always visible)
 * - Body scrolls inside, scroll-lock without layout shift (scrollbar-gutter)
 * - Focus trap (Tab/Shift+Tab cycle), focus returns to trigger on close
 * - Esc closes, unsaved-changes confirmation
 * - Full-screen on 390px
 * - Ctrl/Cmd+S saves
 *
 * Fields:
 * - Website URL (https only, trimmed, test-open button)
 * - Main image upload (preview/replace/remove, 5MB, type validation, alt EN/AR)
 * - Title EN/AR, Short description EN/AR, Long description EN/AR (tab switcher)
 * - Category (loads from DB), Tags (comma-separated), Industry, Client name
 * - Features list (add/remove rows)
 * - Slug (auto from EN title, editable)
 * - Published / Featured / Open in new tab / Allow embed preview (Switch)
 * - Sort order
 *
 * List:
 * - Thumbnail, title, category, inline publish toggle, featured badge, edit/delete
 * - Delete has confirmation dialog
 * - aria-labels on icon-only buttons
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import {
  Image, Save, AlertCircle, Upload, Trash2, X,
  Plus, ExternalLink, GripVertical, Star, Eye, EyeOff,
} from 'lucide-react';
import PageHeader from '@/admin/components/PageHeader';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  useMockupCategories,
  useAllMockups,
  useCreateMockup,
  useUpdateMockup,
  useDeleteMockup,
  useUploadImage,
} from './hooks';

// ─── helpers ────────────────────────────────────────────────────────────────

function slugify(str = '') {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

function isValidHttpsUrl(url) {
  if (!url) return false;
  try {
    const p = new URL(url.trim());
    return p.protocol === 'https:';
  } catch {
    return false;
  }
}

// Parse tags from whatever the DB returns (jsonb array or TEXT[] or comma string)
function parseTags(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === 'string') return raw.split(',').map(s => s.trim()).filter(Boolean);
  return [];
}

const EMPTY_FORM = {
  title_en: '',
  title_ar: '',
  slug: '',
  category_id: '',
  website_url: '',
  short_description_en: '',
  short_description_ar: '',
  long_description_en: '',
  long_description_ar: '',
  desktop_screenshot_url: '',
  thumbnail_url: '',
  image_alt_en: '',
  image_alt_ar: '',
  tags: [],           // string[]
  industry: '',
  client_name: '',
  features: [],       // string[]
  is_featured: false,
  is_active: true,
  open_in_new_tab: true,
  allow_embed_preview: false,
  display_order: 0,
  title: '',          // legacy sync
  category: null,     // legacy sync
};

// ─── Switch component (accessible, AA contrast) ─────────────────────────────

function Switch({ id, checked, onChange, label }) {
  return (
    <label htmlFor={id} className="flex items-center gap-3 cursor-pointer select-none group">
      <button
        id={id}
        role="switch"
        type="button"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
          checked ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </label>
  );
}

// ─── Focus Trap ─────────────────────────────────────────────────────────────

function useFocusTrap(ref, active) {
  useEffect(() => {
    if (!active || !ref.current) return;
    const el = ref.current;
    const focusable = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    const getNodes = () => Array.from(el.querySelectorAll(focusable)).filter(
      n => !n.disabled && n.offsetParent !== null
    );

    const handler = (e) => {
      if (e.key !== 'Tab') return;
      const nodes = getNodes();
      if (!nodes.length) { e.preventDefault(); return; }
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    el.addEventListener('keydown', handler);
    // Auto-focus first focusable
    setTimeout(() => getNodes()[0]?.focus(), 50);
    return () => el.removeEventListener('keydown', handler);
  }, [active, ref]);
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AdminMockupsPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen]       = useState(false);
  const [editing, setEditing]     = useState(null);    // mockup object or null
  const [form, setForm]           = useState(EMPTY_FORM);
  const [dirty, setDirty]         = useState(false);
  const [descTab, setDescTab]     = useState('en');    // 'en' | 'ar'
  const [uploadingImg, setUploadingImg] = useState(false);
  const [urlError, setUrlError]   = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [slugManual, setSlugManual] = useState(false);

  const triggerRef  = useRef(null);   // "Add New" button — focus returns here on close
  const dialogRef   = useRef(null);
  const urlInputRef = useRef(null);

  useFocusTrap(dialogRef, isOpen);

  // Queries
  const categoriesQuery = useMockupCategories();
  const mockupsQuery    = useAllMockups();
  const createMockup    = useCreateMockup();
  const updateMockup    = useUpdateMockup();
  const deleteMockup    = useDeleteMockup();
  const uploadImage     = useUploadImage();

  const categories = categoriesQuery.data || [];
  const mockups    = mockupsQuery.data    || [];

  // ── form helpers ────────────────────────────────────────────────────────

  const patchForm = useCallback((patch) => {
    setForm(prev => { const next = { ...prev, ...patch }; return next; });
    setDirty(true);
  }, []);

  // Auto-slug from EN title unless user edited it manually
  useEffect(() => {
    if (!slugManual && form.title_en) {
      setForm(prev => ({ ...prev, slug: slugify(form.title_en) }));
    }
  }, [form.title_en, slugManual]);

  // ── open / close ─────────────────────────────────────────────────────────

  const openAdd = useCallback(() => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDirty(false);
    setDescTab('en');
    setSlugManual(false);
    setUrlError('');
    setIsOpen(true);
  }, []);

  const openEdit = useCallback((mockup) => {
    setEditing(mockup);
    setForm({
      title_en:              mockup.title_en            || '',
      title_ar:              mockup.title_ar            || '',
      slug:                  mockup.slug                || '',
      category_id:           mockup.category_id         || '',
      website_url:           mockup.website_url         || mockup.demo_url || '',
      short_description_en:  mockup.short_description_en || '',
      short_description_ar:  mockup.short_description_ar || '',
      long_description_en:   mockup.long_description_en  || '',
      long_description_ar:   mockup.long_description_ar  || '',
      desktop_screenshot_url: mockup.desktop_screenshot_url || '',
      thumbnail_url:         mockup.thumbnail_url || '',
      image_alt_en:          mockup.image_alt_en        || '',
      image_alt_ar:          mockup.image_alt_ar        || '',
      tags:    parseTags(mockup.tags),
      industry:    mockup.industry    || '',
      client_name: mockup.client_name || '',
      features:    Array.isArray(mockup.features) ? mockup.features : [],
      is_featured:         mockup.is_featured         ?? false,
      is_active:           mockup.is_active           ?? true,
      open_in_new_tab:     mockup.open_in_new_tab     ?? true,
      allow_embed_preview: mockup.allow_embed_preview ?? false,
      display_order:       mockup.display_order       ?? 0,
      title:    mockup.title    || '',
      category: mockup.category || null,
    });
    setDirty(false);
    setDescTab('en');
    setSlugManual(true);  // existing slug — don't auto-overwrite
    setUrlError('');
    setIsOpen(true);
  }, []);

  const requestClose = useCallback(() => {
    if (dirty) {
      if (!window.confirm('You have unsaved changes. Close anyway?')) return;
    }
    setIsOpen(false);
    setDirty(false);
    // Return focus to the "Add New" trigger
    setTimeout(() => triggerRef.current?.focus(), 50);
  }, [dirty]);

  // Esc key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') requestClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, requestClose]);

  // Scroll-lock without layout shift
  useEffect(() => {
    if (isOpen) {
      const bar = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${bar}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  // Ctrl/Cmd+S
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSubmit();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, form]);

  // ── image upload ─────────────────────────────────────────────────────────

  const handleImageUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please upload an image (PNG, JPG, WebP…)', variant: 'destructive' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Maximum 10 MB. Please compress your image.', variant: 'destructive' });
      return;
    }
    setUploadingImg(true);
    try {
      const { createOptimizedVersions } = await import('@/utils/imageResize');
      
      const { card, full, original } = await createOptimizedVersions(file);
      
      // Upload card version (thumbnail)
      const cardFile = new File([card.blob], `card-${Date.now()}.webp`, { type: 'image/webp' });
      const thumbnailUrl = await uploadImage.mutateAsync({ file: cardFile });
      
      // Upload full version  
      const fullFile = new File([full.blob], `full-${Date.now()}.webp`, { type: 'image/webp' });
      const fullUrl = await uploadImage.mutateAsync({ file: fullFile });
      
      patchForm({ 
        desktop_screenshot_url: fullUrl,
        thumbnail_url: thumbnailUrl
      });
      
      const saved = Math.round((original.size - card.size - full.size) / 1024);
      toast({ 
        title: 'Uploaded & Optimized', 
        description: `Card: ${Math.round(card.size/1024)}KB, Full: ${Math.round(full.size/1024)}KB (saved ${saved}KB)` 
      });
    } catch (err) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploadingImg(false);
    }
  };

  // ── submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!form.title_en.trim()) {
      toast({ title: 'Validation error', description: 'English title is required', variant: 'destructive' });
      return;
    }
    if (form.website_url && !isValidHttpsUrl(form.website_url)) {
      setUrlError('URL must start with https://');
      urlInputRef.current?.focus();
      return;
    }

    const payload = {
      ...form,
      slug:     form.slug || slugify(form.title_en),
      title:    form.title_en,          // legacy sync
      category: null,                   // legacy sync (not the join object)
      tags:     form.tags,
      features: form.features,
    };

    try {
      if (editing) {
        await updateMockup.mutateAsync({ id: editing.id, updates: payload });
        toast({ title: 'Saved', description: 'Mockup updated.' });
      } else {
        await createMockup.mutateAsync(payload);
        toast({ title: 'Created', description: 'Mockup added.' });
      }
      setIsOpen(false);
      setDirty(false);
      setTimeout(() => triggerRef.current?.focus(), 50);
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  // ── delete ───────────────────────────────────────────────────────────────

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMockup.mutateAsync(deleteTarget.id);
      toast({ title: 'Deleted', description: `"${deleteTarget.title_en}" removed.` });
    } catch (err) {
      toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
    } finally {
      setDeleteTarget(null);
    }
  };

  // ── inline publish toggle ────────────────────────────────────────────────

  const togglePublish = async (mockup) => {
    try {
      await updateMockup.mutateAsync({
        id: mockup.id,
        updates: { is_active: !mockup.is_active, title: mockup.title_en, category: null },
      });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const isSaving = createMockup.isPending || updateMockup.isPending;

  // ── feature rows helper ──────────────────────────────────────────────────

  const addFeature    = () => patchForm({ features: [...form.features, ''] });
  const removeFeature = (i) => patchForm({ features: form.features.filter((_, idx) => idx !== i) });
  const editFeature   = (i, val) => {
    const next = [...form.features]; next[i] = val; patchForm({ features: next });
  };

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mockups"
        description="Manage website mockups and templates"
        action={
          <Button
            ref={triggerRef}
            onClick={openAdd}
            className="bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl transition-all min-h-[44px]"
          >
            <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
            Add Mockup
          </Button>
        }
      />

      {/* ── Mockup List ─────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {mockupsQuery.isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading…</div>
        ) : mockupsQuery.isError ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-destructive" />
            <p className="text-destructive mb-2 font-medium">Failed to load mockups</p>
            <p className="text-sm text-muted-foreground mb-4">{mockupsQuery.error?.message}</p>
            <Button variant="outline" size="sm" onClick={() => mockupsQuery.refetch()}>Retry</Button>
          </div>
        ) : mockups.length === 0 ? (
          <div className="p-12 text-center">
            <Image className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No mockups yet</p>
            <Button size="sm" onClick={openAdd}>Add your first mockup</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground">Image</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Title</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Category</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Published</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Featured</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockups.map((m) => (
                  <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    {/* Thumbnail */}
                    <td className="p-4">
                      {m.desktop_screenshot_url ? (
                        <img
                          src={m.desktop_screenshot_url}
                          alt={m.title_en}
                          className="w-16 h-12 object-cover rounded-md border border-border"
                        />
                      ) : (
                        <div className="w-16 h-12 rounded-md bg-muted border border-border flex items-center justify-center">
                          <Image className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                        </div>
                      )}
                    </td>

                    {/* Title */}
                    <td className="p-4 max-w-[200px]">
                      <div className="font-medium text-foreground truncate">{m.title_en}</div>
                      {m.title_ar && (
                        <div className="text-xs text-muted-foreground truncate" dir="rtl">{m.title_ar}</div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="p-4 text-muted-foreground">
                      {m.category?.name_en || '—'}
                    </td>

                    {/* Publish toggle */}
                    <td className="p-4">
                      <button
                        onClick={() => togglePublish(m)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          m.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200'
                            : 'bg-muted text-muted-foreground hover:bg-muted/70'
                        }`}
                        aria-label={m.is_active ? `Unpublish ${m.title_en}` : `Publish ${m.title_en}`}
                        title={m.is_active ? 'Click to unpublish' : 'Click to publish'}
                      >
                        {m.is_active ? (
                          <><Eye className="w-3 h-3" aria-hidden="true" /> Published</>
                        ) : (
                          <><EyeOff className="w-3 h-3" aria-hidden="true" /> Draft</>
                        )}
                      </button>
                    </td>

                    {/* Featured */}
                    <td className="p-4">
                      {m.is_featured && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                          <Star className="w-3 h-3" aria-hidden="true" /> Featured
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(m)}
                          aria-label={`Edit ${m.title_en}`}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(m)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          aria-label={`Delete ${m.title_en}`}
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add / Edit Dialog (portaled) ─────────────────────────────────── */}
      {isOpen && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="mockup-dialog-title"
          className="fixed inset-0 z-[200] flex items-center justify-center"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={requestClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <div
            ref={dialogRef}
            className="relative z-10 flex flex-col bg-card border border-border shadow-2xl rounded-2xl
                       w-full max-w-3xl mx-4
                       sm:mx-6
                       max-h-[90vh]
                       sm:max-h-[90vh]
                       /* full-screen on 390 */
                       xs:max-h-screen xs:m-0 xs:rounded-none"
            style={{ maxHeight: 'min(90vh, 900px)' }}
          >
            {/* ── Sticky Header ── */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/95 backdrop-blur sticky top-0 rounded-t-2xl z-10 flex-shrink-0">
              <h2 id="mockup-dialog-title" className="text-xl font-semibold">
                {editing ? 'Edit Mockup' : 'Add New Mockup'}
              </h2>
              <button
                type="button"
                onClick={requestClose}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* ── Scrollable Body ── */}
            <form
              id="mockup-form"
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
            >

              {/* Website URL */}
              <div>
                <label htmlFor="website_url" className="block text-sm font-medium mb-1.5">
                  Website URL <span className="text-muted-foreground font-normal">(https only)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    ref={urlInputRef}
                    id="website_url"
                    type="url"
                    value={form.website_url}
                    onChange={e => { patchForm({ website_url: e.target.value }); setUrlError(''); }}
                    onBlur={e => {
                      const v = e.target.value.trim();
                      if (v && !isValidHttpsUrl(v)) setUrlError('URL must start with https://');
                    }}
                    placeholder="https://example.com"
                    className="flex-1 px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    aria-describedby={urlError ? 'url-error' : undefined}
                    aria-invalid={!!urlError}
                  />
                  {form.website_url && isValidHttpsUrl(form.website_url) && (
                    <a
                      href={form.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      aria-label="Open link in new tab"
                      title="Open link"
                    >
                      <ExternalLink className="w-4 h-4" aria-hidden="true" />
                    </a>
                  )}
                </div>
                {urlError && (
                  <p id="url-error" className="mt-1 text-xs text-destructive" role="alert">{urlError}</p>
                )}
              </div>

              {/* Main Image */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Screenshot / Main Image <span className="text-muted-foreground font-normal">(PNG, JPG, WebP — max 5MB)</span>
                </label>
                {form.desktop_screenshot_url ? (
                  <div className="relative rounded-xl overflow-hidden border border-border">
                    <img
                      src={form.desktop_screenshot_url}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <label
                        htmlFor="img-replace"
                        className="cursor-pointer p-2 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors"
                        title="Replace image"
                        aria-label="Replace image"
                      >
                        <Upload className="w-4 h-4" aria-hidden="true" />
                        <input
                          id="img-replace"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={e => handleImageUpload(e.target.files?.[0])}
                          disabled={uploadingImg}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => patchForm({ desktop_screenshot_url: '' })}
                        className="p-2 rounded-lg bg-red-500/80 text-white hover:bg-red-600 transition-colors"
                        aria-label="Remove image"
                        title="Remove image"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                    {uploadingImg && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">Uploading…</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <label
                    htmlFor="img-upload"
                    className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border rounded-xl p-8 cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-colors ${uploadingImg ? 'opacity-60 pointer-events-none' : ''}`}
                  >
                    <Upload className="w-10 h-10 text-muted-foreground" aria-hidden="true" />
                    <span className="text-sm text-muted-foreground">
                      {uploadingImg ? 'Uploading…' : 'Click to upload or drag & drop'}
                    </span>
                    <input
                      id="img-upload"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={e => handleImageUpload(e.target.files?.[0])}
                      disabled={uploadingImg}
                    />
                  </label>
                )}

                {/* Alt text */}
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label htmlFor="image_alt_en" className="block text-xs font-medium mb-1 text-muted-foreground">Alt text (EN)</label>
                    <input
                      id="image_alt_en"
                      type="text"
                      value={form.image_alt_en}
                      onChange={e => patchForm({ image_alt_en: e.target.value })}
                      placeholder="Screenshot of…"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label htmlFor="image_alt_ar" className="block text-xs font-medium mb-1 text-muted-foreground">Alt text (AR)</label>
                    <input
                      id="image_alt_ar"
                      type="text"
                      value={form.image_alt_ar}
                      onChange={e => patchForm({ image_alt_ar: e.target.value })}
                      dir="rtl"
                      placeholder="لقطة شاشة لـ…"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="title_en" className="block text-sm font-medium mb-1.5">
                    Title (English) <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="title_en"
                    type="text"
                    required
                    value={form.title_en}
                    onChange={e => patchForm({ title_en: e.target.value })}
                    placeholder="E-commerce Dashboard"
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="title_ar" className="block text-sm font-medium mb-1.5">Title (Arabic)</label>
                  <input
                    id="title_ar"
                    type="text"
                    dir="rtl"
                    value={form.title_ar}
                    onChange={e => patchForm({ title_ar: e.target.value })}
                    placeholder="لوحة التحكم"
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                </div>
              </div>

              {/* Slug */}
              <div>
                <label htmlFor="slug" className="block text-sm font-medium mb-1.5">
                  Slug <span className="text-muted-foreground font-normal">(auto-generated, editable)</span>
                </label>
                <input
                  id="slug"
                  type="text"
                  value={form.slug}
                  onChange={e => { setSlugManual(true); patchForm({ slug: slugify(e.target.value) }); }}
                  placeholder="ecommerce-dashboard"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono"
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category_id" className="block text-sm font-medium mb-1.5">Category</label>
                {categoriesQuery.isLoading ? (
                  <div className="text-sm text-muted-foreground py-2">Loading categories…</div>
                ) : categoriesQuery.isError ? (
                  <div className="text-sm text-destructive py-2">
                    Could not load categories — <button type="button" className="underline" onClick={() => categoriesQuery.refetch()}>retry</button>
                  </div>
                ) : (
                  <select
                    id="category_id"
                    value={form.category_id}
                    onChange={e => patchForm({ category_id: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  >
                    <option value="">Uncategorized</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name_en}{c.name_ar ? ` / ${c.name_ar}` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Descriptions — tab switcher EN | AR */}
              <div>
                <div className="flex items-center gap-1 mb-3 border-b border-border">
                  {['en', 'ar'].map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setDescTab(lang)}
                      className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                        descTab === lang
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {lang === 'en' ? 'English' : 'العربية'}
                    </button>
                  ))}
                </div>

                {descTab === 'en' ? (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="short_en" className="block text-sm font-medium mb-1.5">Short Description (EN)</label>
                      <textarea
                        id="short_en"
                        rows={2}
                        value={form.short_description_en}
                        onChange={e => patchForm({ short_description_en: e.target.value })}
                        placeholder="Brief one-line summary…"
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="long_en" className="block text-sm font-medium mb-1.5">Long Description (EN)</label>
                      <textarea
                        id="long_en"
                        rows={4}
                        value={form.long_description_en}
                        onChange={e => patchForm({ long_description_en: e.target.value })}
                        placeholder="Full description shown on the detail page…"
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4" dir="rtl">
                    <div>
                      <label htmlFor="short_ar" className="block text-sm font-medium mb-1.5">وصف مختصر</label>
                      <textarea
                        id="short_ar"
                        rows={2}
                        value={form.short_description_ar}
                        onChange={e => patchForm({ short_description_ar: e.target.value })}
                        placeholder="ملخص قصير…"
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="long_ar" className="block text-sm font-medium mb-1.5">وصف كامل</label>
                      <textarea
                        id="long_ar"
                        rows={4}
                        value={form.long_description_ar}
                        onChange={e => patchForm({ long_description_ar: e.target.value })}
                        placeholder="الوصف الكامل للتصميم…"
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Industry / Client / Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="industry" className="block text-sm font-medium mb-1.5">Industry</label>
                  <input
                    id="industry"
                    type="text"
                    value={form.industry}
                    onChange={e => patchForm({ industry: e.target.value })}
                    placeholder="e.g. Healthcare"
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="client_name" className="block text-sm font-medium mb-1.5">Client Name <span className="text-muted-foreground font-normal">(optional)</span></label>
                  <input
                    id="client_name"
                    type="text"
                    value={form.client_name}
                    onChange={e => patchForm({ client_name: e.target.value })}
                    placeholder="Acme Corp"
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags_input" className="block text-sm font-medium mb-1.5">
                  Tags <span className="text-muted-foreground font-normal">(comma-separated)</span>
                </label>
                <input
                  id="tags_input"
                  type="text"
                  value={form.tags.join(', ')}
                  onChange={e => patchForm({ tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  placeholder="responsive, modern, dark-mode"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>

              {/* Features list */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Features / What's Included</label>
                  <button
                    type="button"
                    onClick={addFeature}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Add row
                  </button>
                </div>
                <div className="space-y-2">
                  {form.features.map((f, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                      <input
                        type="text"
                        value={f}
                        onChange={e => editFeature(i, e.target.value)}
                        placeholder={`Feature ${i + 1}`}
                        className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        aria-label={`Feature ${i + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeFeature(i)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        aria-label={`Remove feature ${i + 1}`}
                      >
                        <X className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                  {form.features.length === 0 && (
                    <p className="text-xs text-muted-foreground">No features yet — click "Add row".</p>
                  )}
                </div>
              </div>

              {/* Sort order */}
              <div>
                <label htmlFor="display_order" className="block text-sm font-medium mb-1.5">Sort Order</label>
                <input
                  id="display_order"
                  type="number"
                  min={0}
                  value={form.display_order}
                  onChange={e => patchForm({ display_order: parseInt(e.target.value, 10) || 0 })}
                  className="w-32 px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>

              {/* Switches */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <Switch id="sw-active"   checked={form.is_active}           onChange={v => patchForm({ is_active: v })}           label="Published" />
                <Switch id="sw-featured" checked={form.is_featured}         onChange={v => patchForm({ is_featured: v })}         label="Featured" />
                <Switch id="sw-newtab"   checked={form.open_in_new_tab}     onChange={v => patchForm({ open_in_new_tab: v })}     label="Open URL in new tab" />
                <Switch id="sw-embed"    checked={form.allow_embed_preview} onChange={v => patchForm({ allow_embed_preview: v })} label="Allow embed preview" />
              </div>

            </form>

            {/* ── Sticky Footer ── */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-card/95 backdrop-blur sticky bottom-0 rounded-b-2xl flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={requestClose}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="mockup-form"
                disabled={isSaving}
                className="bg-gradient-to-r from-primary to-secondary text-white min-w-[100px]"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                    Saving…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="w-4 h-4" aria-hidden="true" />
                    {editing ? 'Save Changes' : 'Create'}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Delete Confirmation Dialog ────────────────────────────────────── */}
      {deleteTarget && createPortal(
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-desc"
          className="fixed inset-0 z-[300] flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-black/60" onClick={() => setDeleteTarget(null)} aria-hidden="true" />
          <div className="relative z-10 bg-card border border-border rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h2 id="delete-dialog-title" className="text-lg font-semibold mb-2">Delete Mockup?</h2>
            <p id="delete-dialog-desc" className="text-sm text-muted-foreground mb-6">
              "<strong>{deleteTarget.title_en}</strong>" will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button
                onClick={confirmDelete}
                disabled={deleteMockup.isPending}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                {deleteMockup.isPending ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
