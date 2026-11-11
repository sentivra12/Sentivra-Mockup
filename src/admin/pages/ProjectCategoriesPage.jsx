import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderKanban, X, Save, Plus } from 'lucide-react';
import PageHeader from '@/admin/components/PageHeader';
import { useProjectCategories, useCreateProjectCategory, useUpdateProjectCategory, useDeleteProjectCategory } from '@/hooks/useContent';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const ProjectCategoriesPage = () => {
  const { toast } = useToast();
  const { data: categories = [], isLoading } = useProjectCategories();
  const createCategory = useCreateProjectCategory();
  const updateCategory = useUpdateProjectCategory();
  const deleteCategory = useDeleteProjectCategory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    slug: '',
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
    color: '#3b82f6',
    display_order: 0,
    is_active: true,
  });

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
      setIsModalOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category? Projects using it will lose their category link.')) return;
    
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
        title="Project Categories"
        description="Manage project category groups for Our Work page"
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

      {/* Add/Edit Modal */}
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
              className="bg-navy rounded-xl max-w-2xl w-full border border-frost max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-frost sticky top-0 bg-navy z-10">
                <h2 className="text-2xl font-bold text-white">
                  {editingCategory ? 'Edit Category' : 'Add Category'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-navy-light rounded-lg">
                  <X className="w-6 h-6 text-frost" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* English & Arabic Names */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-frost mb-2">
                      Name (English) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="name_en"
                      value={formData.name_en}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Web Applications"
                      className="w-full px-4 py-2 bg-navy-darker border border-frost rounded-lg text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-frost mb-2">
                      Name (Arabic) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="name_ar"
                      value={formData.name_ar}
                      onChange={handleChange}
                      dir="rtl"
                      required
                      placeholder="مثال: تطبيقات الويب"
                      className="w-full px-4 py-2 bg-navy-darker border border-frost rounded-lg text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-frost mb-2">
                    Slug <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                    placeholder="e.g., web-applications"
                    className="w-full px-4 py-2 bg-navy-darker border border-frost rounded-lg text-white focus:border-primary focus:outline-none font-mono text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Auto-generated from English name. Lowercase, hyphens only.
                  </p>
                </div>

                {/* Descriptions (Optional) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-frost mb-2">
                      Description (English)
                    </label>
                    <textarea
                      name="description_en"
                      value={formData.description_en}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Optional description for admin reference"
                      className="w-full px-4 py-2 bg-navy-darker border border-frost rounded-lg text-white focus:border-primary focus:outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-frost mb-2">
                      Description (Arabic)
                    </label>
                    <textarea
                      name="description_ar"
                      value={formData.description_ar}
                      onChange={handleChange}
                      dir="rtl"
                      rows={3}
                      placeholder="وصف اختياري للمرجع الإداري"
                      className="w-full px-4 py-2 bg-navy-darker border border-frost rounded-lg text-white focus:border-primary focus:outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Color & Display Order */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-frost mb-2">
                      Color
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        className="w-16 h-10 bg-navy-darker border border-frost rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="flex-1 px-4 py-2 bg-navy-darker border border-frost rounded-lg text-white font-mono text-sm"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Used for gradients and visual differentiation
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-frost mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      name="display_order"
                      value={formData.display_order}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-2 bg-navy-darker border border-frost rounded-lg text-white focus:border-primary focus:outline-none"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Lower numbers appear first
                    </p>
                  </div>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-3 p-4 bg-navy-darker rounded-lg border border-frost">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="w-5 h-5 rounded text-primary focus:ring-primary focus:ring-offset-0"
                  />
                  <div>
                    <label htmlFor="is_active" className="text-frost font-medium cursor-pointer">
                      Active
                    </label>
                    <p className="text-xs text-gray-400">
                      Only active categories appear on the frontend
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-frost">
                  <Button 
                    type="submit" 
                    className="flex-1 bg-primary hover:bg-primary-dark"
                    disabled={createCategory.isLoading || updateCategory.isLoading}
                  >
                    <Save className="w-5 h-5 mr-2" />
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    variant="outline"
                    className="border-frost text-frost hover:bg-navy-light"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectCategoriesPage;
