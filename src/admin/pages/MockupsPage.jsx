import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, X, Save } from 'lucide-react';
import PageHeader from '@/admin/components/PageHeader';
import DataTable from '@/admin/components/DataTable';
import { useMockups, useCreateMockup, useUpdateMockup, useDeleteMockup } from '@/hooks/useContent';
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
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Landing Pages',
    image_url: '',
    thumbnail_url: '',
    download_url: '',
    tags: '',
    is_premium: false,
    price: 0,
    is_active: true,
    display_order: 0,
  });

  const categories = [
    'E-commerce',
    'Landing Pages',
    'Dashboards',
    'Mobile Apps',
    'Admin Panels',
    'Portfolios',
    'Blogs',
    'Corporate',
    'SaaS',
  ];

  const handleOpenModal = (mockup = null) => {
    if (mockup) {
      setEditingMockup(mockup);
      setFormData({
        title: mockup.title,
        description: mockup.description || '',
        category: mockup.category,
        image_url: mockup.image_url || '',
        thumbnail_url: mockup.thumbnail_url || '',
        download_url: mockup.download_url || '',
        tags: Array.isArray(mockup.tags) ? mockup.tags.join(', ') : '',
        is_premium: mockup.is_premium || false,
        price: mockup.price || 0,
        is_active: mockup.is_active,
        display_order: mockup.display_order || 0,
      });
    } else {
      setEditingMockup(null);
      setFormData({
        title: '',
        description: '',
        category: 'Landing Pages',
        image_url: '',
        thumbnail_url: '',
        download_url: '',
        tags: '',
        is_premium: false,
        price: 0,
        is_active: true,
        display_order: mockups.length,
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
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const mockupData = {
        ...formData,
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t),
        price: parseFloat(formData.price) || 0,
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
    if (!confirm(`Are you sure you want to delete "${mockup.title}"?`)) return;

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
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          {row.image_url && (
            <img
              src={row.thumbnail_url || row.image_url}
              alt={value}
              className="w-16 h-12 object-cover rounded-lg"
            />
          )}
          <div>
            <div className="font-medium">{value}</div>
            {row.is_premium && (
              <span className="text-xs text-yellow-500">💎 Premium</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (value) => (
        <span className="px-2.5 py-1 bg-pink-500/10 text-pink-500 text-xs rounded-full font-medium">
          {value}
        </span>
      ),
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
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Mockup Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="E-commerce Dashboard"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      placeholder="Brief description of the mockup..."
                    />
                  </div>

                  {/* Image URLs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Image URL *
                      </label>
                      <input
                        type="url"
                        name="image_url"
                        value={formData.image_url}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="https://..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Thumbnail URL
                      </label>
                      <input
                        type="url"
                        name="thumbnail_url"
                        value={formData.thumbnail_url}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="https://... (optional)"
                      />
                    </div>
                  </div>

                  {/* Download URL */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Download URL
                    </label>
                    <input
                      type="url"
                      name="download_url"
                      value={formData.download_url}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="https://... (optional)"
                    />
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
                      placeholder="modern, minimal, clean"
                    />
                  </div>

                  {/* Premium & Price */}
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
                      <span className="text-sm font-medium">Active (Visible)</span>
                    </label>
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
    </div>
  );
};

export default MockupsPage;
