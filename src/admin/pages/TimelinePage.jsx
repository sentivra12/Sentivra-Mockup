import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, X, Save } from 'lucide-react';
import PageHeader from '@/admin/components/PageHeader';
import DataTable from '@/admin/components/DataTable';
import SaveBar from '@/admin/components/SaveBar';
import { useFormDirty } from '@/admin/hooks/useFormDirty';
import { useTimeline, useCreateTimelineMilestone, useUpdateTimelineMilestone, useDeleteTimelineMilestone } from '@/hooks/useContent';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const TimelinePage = () => {
  const { toast } = useToast();
  const { data: timelineMilestones = [], isLoading } = useTimeline();
  const createMilestone = useCreateTimelineMilestone();
  const updateMilestone = useUpdateTimelineMilestone();
  const deleteMilestone = useDeleteTimelineMilestone();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    title: '',
    description: '',
    display_order: 0,
    is_active: true,
  });

  const { isDirty, markClean, resetToInitial } = useFormDirty(formData, editingMilestone);

  const handleOpenModal = (milestone = null) => {
    if (milestone) {
      setEditingMilestone(milestone);
      setFormData({
        year: milestone.year,
        title: milestone.title,
        description: milestone.description || '',
        display_order: milestone.display_order || 0,
        is_active: milestone.is_active,
      });
    } else {
      setEditingMilestone(null);
      setFormData({
        year: new Date().getFullYear(),
        title: '',
        description: '',
        display_order: timelineMilestones.length,
        is_active: true,
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
    setEditingMilestone(null);
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
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Title is required.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.year < 1900 || formData.year > 2100) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid year.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingMilestone) {
        await updateMilestone.mutateAsync({
          id: editingMilestone.id,
          values: formData,
        });
        toast({
          title: 'Milestone updated!',
          description: 'The timeline milestone has been updated successfully.',
        });
      } else {
        await createMilestone.mutateAsync(formData);
        toast({
          title: 'Milestone created!',
          description: 'The timeline milestone has been created successfully.',
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

  const handleDelete = async (milestone) => {
    if (!confirm(`Are you sure you want to delete the milestone "${milestone.title}"?`)) return;

    try {
      await deleteMilestone.mutateAsync(milestone.id);
      toast({
        title: 'Milestone deleted!',
        description: 'The timeline milestone has been deleted successfully.',
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
      key: 'year',
      label: 'Year',
      render: (milestone) => (
        <span className="font-bold text-lg text-primary">{milestone.year}</span>
      ),
    },
    {
      key: 'title',
      label: 'Milestone',
      render: (milestone) => (
        <div>
          <div className="font-medium">{milestone.title}</div>
          {milestone.description && (
            <div className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {milestone.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'display_order',
      label: 'Order',
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (milestone) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          milestone.is_active
            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
        }`}>
          {milestone.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Timeline Milestones"
        description="Manage company timeline and milestones (shown on About page)"
        icon={Calendar}
        action={{
          label: 'Add Milestone',
          onClick: () => handleOpenModal(),
        }}
      />

      <DataTable
        data={timelineMilestones}
        columns={columns}
        isLoading={isLoading}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
        emptyMessage="No milestones yet. Add your first company milestone!"
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
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-background rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background z-10">
                  <h2 className="text-2xl font-bold">
                    {editingMilestone ? 'Edit Milestone' : 'Add New Milestone'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Year */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Year <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      required
                      min="1900"
                      max="2100"
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="2024"
                    />
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Milestone Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Company Founded"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      placeholder="Brief description of this milestone..."
                    />
                  </div>

                  {/* Display Order */}
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
                    <p className="text-xs text-muted-foreground mt-1">
                      Lower numbers appear first (usually chronological order)
                    </p>
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                        className="w-5 h-5 rounded border-border"
                      />
                      <span className="text-sm font-medium">Active (Visible on About Page)</span>
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                    <Button type="button" onClick={handleCloseModal} variant="outline">
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMilestone.isPending || updateMilestone.isPending}
                      className="bg-gradient-to-r from-primary to-secondary text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingMilestone ? 'Update' : 'Create'} Milestone
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
        isSaving={createMilestone.isPending || updateMilestone.isPending}
      />
    </div>
  );
};

export default TimelinePage;
