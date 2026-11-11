import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, X, Save, Upload, AlertCircle } from 'lucide-react';
import PageHeader from '@/admin/components/PageHeader';
import SaveBar from '@/admin/components/SaveBar';
import { useFormDirty } from '@/admin/hooks/useFormDirty';
import DataTable from '@/admin/components/DataTable';
import { useServices, useCreateService, useUpdateService, useDeleteService } from '@/hooks/useContent';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const ServicesPage = () => {
  const { toast } = useToast();
  const { data: services = [], isLoading } = useServices();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    title_en: '',
    title_ar: '',
    slug: '',
    short_description_en: '',
    short_description_ar: '',
    long_description_en: '',
    long_description_ar: '',
    icon: 'Code',
    category_id: null, // Will be set to first category's ID
    features: '',
    technologies: '',
    is_active: true,
    is_featured: false,
    display_order: 0,
  });

  const categories = ['Web & Mobile', 'Business Systems', 'AI & Data'];
  
  const iconOptions = [
    'Code', 'Smartphone', 'Bot', 'BarChart3', 'Database', 'Layers',
    'Server', 'Cloud', 'Cpu', 'Globe', 'Shield', 'Zap'
  ];

  // Track dirty state
  const { isDirty, markClean, resetToInitial } = useFormDirty(formData, editingService);

  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        title_en: service.title_en || '',
        title_ar: service.title_ar || '',
        slug: service.slug,
        short_description_en: service.short_description_en || '',
        short_description_ar: service.short_description_ar || '',
        long_description_en: service.long_description_en || '',
        long_description_ar: service.long_description_ar || '',
        icon: service.icon || 'Code',
        category_id: service.category_id,
        features: Array.isArray(service.features) 
          ? service.features.join('\n') 
          : typeof service.features === 'string'
          ? service.features
          : '',
        technologies: Array.isArray(service.technologies)
          ? service.technologies.join('\n')
          : typeof service.technologies === 'string'
          ? service.technologies
          : '',
        is_active: service.is_active,
        is_featured: service.is_featured || false,
        display_order: service.display_order || 0,
      });
    } else {
      setEditingService(null);
      setFormData({
        title_en: '',
        title_ar: '',
        slug: '',
        short_description_en: '',
        short_description_ar: '',
        long_description_en: '',
        long_description_ar: '',
        icon: 'Code',
        category_id: null,
        features: '',
        technologies: '',
        is_active: true,
        is_featured: false,
        display_order: services.length,
      });
    }
    setIsModalOpen(true);
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    // Auto-generate slug from English title
    if (name === 'title_en' && !editingService) {
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
      const serviceData = {
        ...formData,
        features: formData.features
          .split('\n')
          .filter((f) => f.trim())
          .map((f) => f.trim()),
        technologies: formData.technologies
          .split('\n')
          .filter((t) => t.trim())
          .map((t) => t.trim()),
      };

      if (editingService) {
        await updateService.mutateAsync({
          id: editingService.id,
          values: serviceData,
        });
        toast({
          title: 'Service updated!',
          description: 'The service has been updated successfully.',
        });
      } else {
        await createService.mutateAsync(serviceData);
        toast({
          title: 'Service created!',
          description: 'The service has been created successfully.',
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

  const handleDelete = async (service) => {
    if (!confirm(`Are you sure you want to delete "${service.title}"?`)) return;

    try {
      await deleteService.mutateAsync(service.id);
      toast({
        title: 'Service deleted!',
        description: 'The service has been deleted successfully.',
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
      label: 'Title (EN)',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <div className="font-medium">{value}</div>
          {!row.is_active && (
            <span className="px-2 py-0.5 bg-gray-500/10 text-gray-500 text-xs rounded-full">
              Hidden
            </span>
          )}
          {row.is_featured && (
            <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-600 text-xs rounded-full">
              Featured
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (value) => (
        <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
          {value}
        </span>
      ),
    },
    {
      key: 'short_description',
      label: 'Description',
      render: (value) => (
        <div className="max-w-md truncate text-muted-foreground">
          {value}
        </div>
      ),
    },
    {
      key: 'display_order',
      label: 'Order',
      sortable: true,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Services"
        description="Manage your service offerings"
        icon={Briefcase}
        action={() => handleOpenModal()}
        actionLabel="Add Service"
      />

      <DataTable
        columns={columns}
        data={services}
        isLoading={isLoading}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
        searchPlaceholder="Search services..."
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
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <h2 className="text-2xl font-bold">
                    {editingService ? 'Edit Service' : 'Add New Service'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  {/* English Title */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Service Title (English) *
                    </label>
                    <input
                      type="text"
                      name="title_en"
                      value={formData.title_en}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="e.g., Web Application Development"
                    />
                  </div>

                  {/* Arabic Title */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Service Title (Arabic) *
                    </label>
                    <input
                      type="text"
                      name="title_ar"
                      value={formData.title_ar}
                      onChange={handleChange}
                      required
                      dir="rtl"
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="مثال: تطوير تطبيقات الويب"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm"
                      placeholder="web-application-development"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Auto-generated from English title. Used in URL: /services/{formData.slug}
                    </p>
                  </div>

                  {/* Category & Icon */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Category *
                      </label>
                      <select
                        name="category_id"
                        value={formData.category_id || ''}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Link to service_categories table (manage via Service Categories page)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Icon
                      </label>
                      <select
                        name="icon"
                        value={formData.icon}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        {iconOptions.map((icon) => (
                          <option key={icon} value={icon}>
                            {icon}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* English Short Description */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Short Description (English) *
                    </label>
                    <textarea
                      name="short_description_en"
                      value={formData.short_description_en}
                      onChange={handleChange}
                      required
                      rows={2}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      placeholder="Brief overview (1-2 sentences)"
                    />
                  </div>

                  {/* Arabic Short Description */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Short Description (Arabic) *
                    </label>
                    <textarea
                      name="short_description_ar"
                      value={formData.short_description_ar}
                      onChange={handleChange}
                      required
                      dir="rtl"
                      rows={2}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      placeholder="نظرة عامة مختصرة (جملة أو جملتان)"
                    />
                  </div>

                  {/* English Long Description */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Detailed Description (English)
                    </label>
                    <textarea
                      name="long_description_en"
                      value={formData.long_description_en}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      placeholder="Full service description..."
                    />
                  </div>

                  {/* Arabic Long Description */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Detailed Description (Arabic)
                    </label>
                    <textarea
                      name="long_description_ar"
                      value={formData.long_description_ar}
                      onChange={handleChange}
                      dir="rtl"
                      rows={4}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      placeholder="وصف الخدمة الكامل..."
                    />
                  </div>

                  {/* Features */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Features (one per line, bilingual)
                    </label>
                    <textarea
                      name="features"
                      value={formData.features}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none font-mono text-sm"
                      placeholder="Custom API Development&#10;Progressive Web Apps&#10;Cloud-based Deployment"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Stored as JSON array. Use English for now (Arabic features can be added later).
                    </p>
                  </div>

                  {/* Technologies */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Technologies (one per line)
                    </label>
                    <textarea
                      name="technologies"
                      value={formData.technologies}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none font-mono text-sm"
                      placeholder="React&#10;Node.js&#10;PostgreSQL"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Stored as JSON array. Will display with tech icons if available.
                    </p>
                  </div>

                  {/* Display Order, Active, Featured */}
                  <div className="grid grid-cols-3 gap-4">
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

                    <div className="flex items-center pt-8">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="is_active"
                          checked={formData.is_active}
                          onChange={handleChange}
                          className="w-5 h-5 rounded border-border"
                        />
                        <span className="text-sm font-medium">Active</span>
                      </label>
                    </div>

                    <div className="flex items-center pt-8">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="is_featured"
                          checked={formData.is_featured}
                          onChange={handleChange}
                          className="w-5 h-5 rounded border-border"
                        />
                        <span className="text-sm font-medium">Featured</span>
                      </label>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                    <Button
                      type="button"
                      onClick={handleCloseModal}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createService.isPending || updateService.isPending}
                      className="bg-gradient-to-r from-primary to-secondary text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingService ? 'Update' : 'Create'} Service
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
        isSaving={createService.isPending || updateService.isPending}
      />
    </div>
  );
};

export default ServicesPage;
