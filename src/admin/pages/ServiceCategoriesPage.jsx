import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderKanban, X, Save, Plus } from 'lucide-react';
import PageHeader from '@/admin/components/PageHeader';
import SaveBar from '@/admin/components/SaveBar';
import { useFormDirty } from '@/admin/hooks/useFormDirty';
import { useServiceCategories, useCreateServiceCategory, useUpdateServiceCategory, useDeleteServiceCategory } from '@/hooks/useContent';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const ServiceCategoriesPage = () => {
  const { toast } = useToast();
  const { data: categories = [], isLoading } = useServiceCategories();
  const createCategory = useCreateServiceCategory();
  const updateCategory = useUpdateServiceCategory();
  const deleteCategory = useDeleteServiceCategory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    slug: '',
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
    icon: 'Code',
    color: '#3b82f6',
    display_order: 0,
    is_active: true,
  });

  // Track dirty state
  const { isDirty, markClean, resetToInitial } = useFormDirty(formData, editingCategory);

  const iconOptions = [
    'Code', 'Database', 'Bot', 'BarChart3', 'Smartphone', 'Layers',
    'Server', 'Cloud', 'Cpu', 'Globe', 'Shield', 'Zap', 'Sparkles'
  ];

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData(category);
    } else {
      setEditingCategory(null);
      setFormData({
        slug: '',
        name_en: '',
        name_ar: '',
        description_en: '',
        description_ar: '',
        icon: 'Code',
        color: '#3b82f6',
        display_order: categories.length,
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    // Auto-generate slug from English name
    if (name === 'name_en' && !editingCategory) {
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
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, ...formData });
        toast({ title: 'Success', description: 'Category updated successfully.' });
      } else {
        await createCategory.mutateAsync(formData);
        toast({ title: 'Success', description: 'Category created successfully.' });
      }
      markClean();
      setIsModalOpen(false);
      resetToInitial();
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
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
    setEditingCategory(null);
    resetToInitial();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category? Services using it will lose their category link.')) return;
    
    try {
      await deleteCategory.mutateAsync(id);
      toast({ title: 'Success', description: 'Category deleted successfully.' });
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
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
        title="Service Categories"
        description="Manage service category groups"
        icon={FolderKanban}
        action={
          <Button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary-dark">
            <Plus className="w-5 h-5 mr-2" />
            Add Category
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-navy-light rounded-lg p-6 border border-frost hover:border-primary/50 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${category.color}20`, color: category.color }}
                >
                  <span className="text-2xl">📁</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{category.name_en}</h3>
                  <p className="text-sm text-frost">{category.name_ar}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                category.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {category.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            {category.description_en && (
              <p className="text-sm text-gray-400 mb-4 line-clamp-2">{category.description_en}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => handleOpenModal(category)}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(category.id)}
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal - Similar structure to PageContentPage, shortened for token limit */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-navy rounded-xl max-w-2xl w-full border border-frost"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-frost">
                <h2 className="text-2xl font-bold text-white">
                  {editingCategory ? 'Edit Category' : 'Add Category'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-navy-light rounded-lg">
                  <X className="w-6 h-6 text-frost" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-frost mb-2">Name (English)</label>
                    <input
                      type="text"
                      name="name_en"
                      value={formData.name_en}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 bg-navy-darker border border-frost rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-frost mb-2">Name (Arabic)</label>
                    <input
                      type="text"
                      name="name_ar"
                      value={formData.name_ar}
                      onChange={handleChange}
                      dir="rtl"
                      required
                      className="w-full px-4 py-2 bg-navy-darker border border-frost rounded-lg text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-frost mb-2">Slug</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-navy-darker border border-frost rounded-lg text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-frost mb-2">Icon</label>
                    <select
                      name="icon"
                      value={formData.icon}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-navy-darker border border-frost rounded-lg text-white"
                    >
                      {iconOptions.map((icon) => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-frost mb-2">Color</label>
                    <input
                      type="color"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      className="w-full h-10 bg-navy-darker border border-frost rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="w-5 h-5 rounded"
                  />
                  <label htmlFor="is_active" className="text-frost font-medium">Active</label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 bg-primary hover:bg-primary-dark">
                    <Save className="w-5 h-5 mr-2" />
                    Save
                  </Button>
                  <Button type="button" onClick={() => setIsModalOpen(false)} variant="outline">
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
        isSaving={createCategory.isPending || updateCategory.isPending}
      />
    </div>
  );
};

export default ServiceCategoriesPage;
