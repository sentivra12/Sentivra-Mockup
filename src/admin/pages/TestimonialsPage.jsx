import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Save } from 'lucide-react';
import PageHeader from '@/admin/components/PageHeader';
import DataTable from '@/admin/components/DataTable';
import { useTestimonials, useCreateTestimonial, useUpdateTestimonial, useDeleteTestimonial } from '@/hooks/useContent';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const TestimonialsPage = () => {
  const { toast } = useToast();
  const { data: testimonials = [], isLoading } = useTestimonials();
  const createTestimonial = useCreateTestimonial();
  const updateTestimonial = useUpdateTestimonial();
  const deleteTestimonial = useDeleteTestimonial();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [formData, setFormData] = useState({
    client_name: '',
    client_title: '',
    company_name: '',
    testimonial_text: '',
    rating: 5,
    avatar_url: '',
    is_featured: false,
    is_active: true,
    display_order: 0,
  });

  const handleOpenModal = (testimonial = null) => {
    if (testimonial) {
      setEditingTestimonial(testimonial);
      setFormData({
        client_name: testimonial.client_name,
        client_title: testimonial.client_title || '',
        company_name: testimonial.company_name || '',
        testimonial_text: testimonial.testimonial_text,
        rating: testimonial.rating || 5,
        avatar_url: testimonial.avatar_url || '',
        is_featured: testimonial.is_featured,
        is_active: testimonial.is_active,
        display_order: testimonial.display_order || 0,
      });
    } else {
      setEditingTestimonial(null);
      setFormData({
        client_name: '',
        client_title: '',
        company_name: '',
        testimonial_text: '',
        rating: 5,
        avatar_url: '',
        is_featured: false,
        is_active: true,
        display_order: testimonials.length,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTestimonial(null);
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
      const testimonialData = {
        ...formData,
        rating: parseInt(formData.rating),
      };

      if (editingTestimonial) {
        await updateTestimonial.mutateAsync({
          id: editingTestimonial.id,
          values: testimonialData,
        });
        toast({
          title: 'Testimonial updated!',
          description: 'The testimonial has been updated successfully.',
        });
      } else {
        await createTestimonial.mutateAsync(testimonialData);
        toast({
          title: 'Testimonial created!',
          description: 'The testimonial has been created successfully.',
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

  const handleDelete = async (testimonial) => {
    if (!confirm(`Are you sure you want to delete the testimonial from "${testimonial.client_name}"?`)) return;

    try {
      await deleteTestimonial.mutateAsync(testimonial.id);
      toast({
        title: 'Testimonial deleted!',
        description: 'The testimonial has been deleted successfully.',
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
      key: 'client_name',
      label: 'Client',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          {row.avatar_url ? (
            <img
              src={row.avatar_url}
              alt={value}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {value.charAt(0)}
            </div>
          )}
          <div>
            <div className="font-medium">{value}</div>
            {row.client_title && (
              <div className="text-xs text-muted-foreground">{row.client_title}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'company_name',
      label: 'Company',
      sortable: true,
    },
    {
      key: 'rating',
      label: 'Rating',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < value ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'
              }`}
            />
          ))}
        </div>
      ),
    },
    {
      key: 'testimonial_text',
      label: 'Testimonial',
      render: (value) => (
        <div className="max-w-md truncate text-muted-foreground">
          "{value}"
        </div>
      ),
    },
    {
      key: 'is_featured',
      label: 'Featured',
      render: (value) =>
        value ? (
          <span className="text-yellow-500">⭐ Featured</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Testimonials"
        description="Manage customer testimonials and reviews"
        icon={Star}
        action={() => handleOpenModal()}
        actionLabel="Add Testimonial"
      />

      <DataTable
        columns={columns}
        data={testimonials}
        isLoading={isLoading}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
        searchPlaceholder="Search testimonials..."
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
                className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl my-8"
              >
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <h2 className="text-2xl font-bold">
                    {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  {/* Client Name */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Client Name *
                    </label>
                    <input
                      type="text"
                      name="client_name"
                      value={formData.client_name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Sarah Johnson"
                    />
                  </div>

                  {/* Client Title & Company */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Job Title
                      </label>
                      <input
                        type="text"
                        name="client_title"
                        value={formData.client_title}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="CEO"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="Tech Innovations Inc."
                      />
                    </div>
                  </div>

                  {/* Testimonial Text */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Testimonial Text *
                    </label>
                    <textarea
                      name="testimonial_text"
                      value={formData.testimonial_text}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      placeholder="Write the testimonial here..."
                    />
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Rating (1-5 stars)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        name="rating"
                        min="1"
                        max="5"
                        value={formData.rating}
                        onChange={handleChange}
                        className="flex-1"
                      />
                      <div className="flex items-center gap-1 min-w-[120px]">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < formData.rating
                                ? 'fill-yellow-500 text-yellow-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Avatar URL */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Avatar URL
                    </label>
                    <input
                      type="url"
                      name="avatar_url"
                      value={formData.avatar_url}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>

                  {/* Display Order, Featured, Active */}
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
                          name="is_featured"
                          checked={formData.is_featured}
                          onChange={handleChange}
                          className="w-5 h-5 rounded border-border"
                        />
                        <span className="text-sm font-medium">Featured</span>
                      </label>
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
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                    <Button type="button" onClick={handleCloseModal} variant="outline">
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createTestimonial.isPending || updateTestimonial.isPending}
                      className="bg-gradient-to-r from-primary to-secondary text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingTestimonial ? 'Update' : 'Create'} Testimonial
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

export default TestimonialsPage;
