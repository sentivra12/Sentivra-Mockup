import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, X, Save, AlertCircle, CheckCircle, Upload, Trash2 } from 'lucide-react';
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
  useSystemCheck,
} from './hooks';

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export default function AdminMockupsPage() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMockup, setEditingMockup] = useState(null);
  const [showSystemCheck, setShowSystemCheck] = useState(false);

  // Queries
  const categoriesQuery = useMockupCategories();
  const mockupsQuery = useAllMockups();

  // Mutations
  const createMockup = useCreateMockup();
  const updateMockup = useUpdateMockup();
  const deleteMockup = useDeleteMockup();
  const uploadImage = useUploadImage();
  const systemCheck = useSystemCheck();

  const categories = categoriesQuery.data || [];
  const mockups = mockupsQuery.data || [];

  const [formData, setFormData] = useState({
    title_en: '',
    title_ar: '',
    category_id: '',
    short_description_en: '',
    short_description_ar: '',
    desktop_screenshot_url: '',
    image_alt_en: '',
    image_alt_ar: '',
    demo_url: '',
    is_featured: false,
    is_active: true,
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  const handleOpenModal = (mockup = null) => {
    if (mockup) {
      setEditingMockup(mockup);
      setFormData({
        title_en: mockup.title_en || '',
        title_ar: mockup.title_ar || '',
        category_id: mockup.category_id || '',
        short_description_en: mockup.short_description_en || '',
        short_description_ar: mockup.short_description_ar || '',
        desktop_screenshot_url: mockup.desktop_screenshot_url || '',
        image_alt_en: mockup.image_alt_en || '',
        image_alt_ar: mockup.image_alt_ar || '',
        demo_url: mockup.demo_url || '',
        is_featured: mockup.is_featured || false,
        is_active: mockup.is_active !== false,
      });
    } else {
      setEditingMockup(null);
      setFormData({
        title_en: '',
        title_ar: '',
        category_id: '',
        short_description_en: '',
        short_description_ar: '',
        desktop_screenshot_url: '',
        image_alt_en: '',
        image_alt_ar: '',
        demo_url: '',
        is_featured: false,
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMockup(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file (PNG, JPG, etc.)',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image must be less than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploadingImage(true);
    try {
      const url = await uploadImage.mutateAsync({ file });
      setFormData((prev) => ({ ...prev, desktop_screenshot_url: url }));
      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title_en.trim()) {
      toast({
        title: 'Validation error',
        description: 'English title is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.category_id) {
      toast({
        title: 'Validation error',
        description: 'Category is required',
        variant: 'destructive',
      });
      return;
    }

    const slug = editingMockup?.slug || generateSlug(formData.title_en);

    const mockupData = {
      ...formData,
      slug,
    };

    try {
      if (editingMockup) {
        await updateMockup.mutateAsync({
          id: editingMockup.id,
          updates: mockupData,
        });
        toast({
          title: 'Success',
          description: 'Mockup updated successfully',
        });
      } else {
        await createMockup.mutateAsync(mockupData);
        toast({
          title: 'Success',
          description: 'Mockup created successfully',
        });
      }
      handleCloseModal();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this mockup?')) return;

    try {
      await deleteMockup.mutateAsync(id);
      toast({
        title: 'Success',
        description: 'Mockup deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleRunSystemCheck = async () => {
    try {
      const results = await systemCheck.mutateAsync();
      setShowSystemCheck(results);
    } catch (error) {
      toast({
        title: 'System check failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mockups"
        description="Manage website mockups and templates"
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRunSystemCheck}
              disabled={systemCheck.isPending}
            >
              System Check
            </Button>
            <Button onClick={() => handleOpenModal()}>
              <Image className="w-4 h-4 mr-2" />
              Add Mockup
            </Button>
          </div>
        }
      />

      {/* System Check Results */}
      {showSystemCheck && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">System Check Results</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowSystemCheck(null)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <CheckItem label="Read categories" value={showSystemCheck.canReadCategories} detail={`${showSystemCheck.categoriesCount} categories`} />
            <CheckItem label="is_admin()" value={showSystemCheck.isAdmin} />
            <CheckItem label="Insert mockup" value={showSystemCheck.canInsertMockup} />
            <CheckItem label="Delete mockup" value={showSystemCheck.canDeleteMockup} />
            <CheckItem label="Upload file" value={showSystemCheck.canUploadFile} />
            <CheckItem label="Delete file" value={showSystemCheck.canDeleteFile} />
          </div>
          {showSystemCheck.errors.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-red-600">Errors:</p>
              {showSystemCheck.errors.map((err, i) => (
                <div key={i} className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                  <strong>{err.check}:</strong> {err.error}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Mockups List */}
      <div className="bg-card border border-border rounded-lg">
        {mockupsQuery.isLoading ? (
          <div className="p-8 text-center">Loading mockups...</div>
        ) : mockupsQuery.isError ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <p className="text-red-600 mb-2">Failed to load mockups</p>
            <p className="text-sm text-muted-foreground mb-4">{mockupsQuery.error.message}</p>
            <Button onClick={() => mockupsQuery.refetch()} size="sm">
              Retry
            </Button>
          </div>
        ) : mockups.length === 0 ? (
          <div className="p-8 text-center">
            <Image className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No mockups yet</p>
            <Button onClick={() => handleOpenModal()} size="sm">
              Add your first mockup
            </Button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left p-4">Image</th>
                <th className="text-left p-4">Title</th>
                <th className="text-left p-4">Category</th>
                <th className="text-left p-4">Status</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockups.map((mockup) => (
                <tr key={mockup.id} className="border-b border-border hover:bg-muted/50">
                  <td className="p-4">
                    {mockup.desktop_screenshot_url ? (
                      <img
                        src={mockup.desktop_screenshot_url}
                        alt={mockup.title_en}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                        <Image className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="font-medium">{mockup.title_en}</div>
                    {mockup.title_ar && (
                      <div className="text-sm text-muted-foreground" dir="rtl">
                        {mockup.title_ar}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    {mockup.category?.name_en || 'Uncategorized'}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {mockup.is_featured && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded">
                          Featured
                        </span>
                      )}
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          mockup.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {mockup.is_active ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenModal(mockup)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(mockup.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {editingMockup ? 'Edit Mockup' : 'Add New Mockup'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  {categoriesQuery.isLoading ? (
                    <div className="text-sm text-muted-foreground">Loading categories...</div>
                  ) : categoriesQuery.isError ? (
                    <div>
                      <div className="text-sm text-red-600 mb-2">
                        Error: {categoriesQuery.error.message}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => categoriesQuery.refetch()}
                      >
                        Retry
                      </Button>
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No categories found. <a href="/admin/mockup-categories" className="text-primary underline">Add categories first</a>
                    </div>
                  ) : (
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="">Select a category...</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name_en}{cat.name_ar ? ` / ${cat.name_ar}` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* English Title */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Title (English) <span className="text-red-500">*</span>
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

                {/* Arabic Title */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Title (Arabic)
                  </label>
                  <input
                    type="text"
                    name="title_ar"
                    value={formData.title_ar}
                    onChange={handleChange}
                    dir="rtl"
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="لوحة تحكم التجارة الإلكترونية"
                  />
                </div>

                {/* Screenshot Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Screenshot
                  </label>
                  {formData.desktop_screenshot_url ? (
                    <div className="relative">
                      <img
                        src={formData.desktop_screenshot_url}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, desktop_screenshot_url: '' }))
                        }
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files[0])}
                        disabled={uploadingImage}
                        className="hidden"
                        id="screenshot-upload"
                      />
                      <label
                        htmlFor="screenshot-upload"
                        className="cursor-pointer text-primary hover:underline"
                      >
                        {uploadingImage ? 'Uploading...' : 'Choose file or drag and drop'}
                      </label>
                      <p className="text-xs text-muted-foreground mt-2">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </div>

                {/* Short Descriptions */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Short Description (English)
                    </label>
                    <textarea
                      name="short_description_en"
                      value={formData.short_description_en}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Brief description..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Short Description (Arabic)
                    </label>
                    <textarea
                      name="short_description_ar"
                      value={formData.short_description_ar}
                      onChange={handleChange}
                      dir="rtl"
                      rows={3}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="وصف موجز..."
                    />
                  </div>
                </div>

                {/* Demo URL */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Demo URL
                  </label>
                  <input
                    type="url"
                    name="demo_url"
                    value={formData.demo_url}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="https://example.com/demo"
                  />
                </div>

                {/* Flags */}
                <div className="flex gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="is_featured"
                      checked={formData.is_featured}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Featured</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Published</span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t border-border">
                  <Button type="button" variant="outline" onClick={handleCloseModal}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMockup.isPending || updateMockup.isPending}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingMockup ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckItem({ label, value, detail }) {
  return (
    <div className="flex items-center gap-2">
      {value ? (
        <CheckCircle className="w-5 h-5 text-green-600" />
      ) : (
        <AlertCircle className="w-5 h-5 text-red-600" />
      )}
      <span className="text-sm">
        {label} {detail && <span className="text-muted-foreground">({detail})</span>}
      </span>
    </div>
  );
}
