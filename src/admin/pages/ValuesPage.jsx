import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Save } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import PageHeader from '@/admin/components/PageHeader';
import SaveBar from '@/admin/components/SaveBar';
import { useFormDirty } from '@/admin/hooks/useFormDirty';
import DataTable from '@/admin/components/DataTable';
import { useValues, useCreateValue, useUpdateValue, useDeleteValue } from '@/hooks/useContent';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const ValuesPage = () => {
  const { toast } = useToast();
  const { data: values = [], isLoading } = useValues();
  const createValue = useCreateValue();
  const updateValue = useUpdateValue();
  const deleteValue = useDeleteValue();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingValue, setEditingValue] = useState(null);
  const [formData, setFormData] = useState({
    icon: 'Heart',
    title: '',
    description: '',
    display_order: 0,
    is_active: true,
  });

  // Track dirty state
  const { isDirty, markClean, resetToInitial } = useFormDirty(formData, editingValue);

  // Get icon component for preview
  const getIcon = (iconName) => {
    const Icon = LucideIcons[iconName];
    return Icon || LucideIcons.Heart;
  };

  const handleOpenModal = (value = null) => {
    if (value) {
      setEditingValue(value);
      setFormData({
        icon: value.icon,
        title: value.title,
        description: value.description || '',
        display_order: value.display_order || 0,
        is_active: value.is_active,
      });
    } else {
      setEditingValue(null);
      setFormData({
        icon: 'Heart',
        title: '',
        description: '',
        display_order: values.length,
        is_active: true,
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
    setEditingValue(null);
    resetToInitial();
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

    if (!formData.icon.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Icon name is required.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingValue) {
        await updateValue.mutateAsync({
          id: editingValue.id,
          values: formData,
        });
        toast({
          title: 'Value updated!',
          description: 'The company value has been updated successfully.',
        });
      } else {
        await createValue.mutateAsync(formData);
        toast({
          title: 'Value created!',
          description: 'The company value has been created successfully.',
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

  const handleDelete = async (value) => {
    if (!confirm(`Are you sure you want to delete "${value.title}"?`)) return;

    try {
      await deleteValue.mutateAsync(value.id);
      toast({
        title: 'Value deleted!',
        description: 'The company value has been deleted successfully.',
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
      key: 'icon',
      label: 'Icon',
      render: (value) => {
        const Icon = getIcon(value.icon);
        return (
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        );
      },
    },
    {
      key: 'title',
      label: 'Value',
      render: (value) => (
        <div>
          <div className="font-medium">{value.title}</div>
          {value.description && (
            <div className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {value.description}
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
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value.is_active
            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
        }`}>
          {value.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  // Popular icon suggestions
  const iconSuggestions = [
    'Heart', 'Target', 'Users', 'Zap', 'Shield', 'Star', 'Award', 
    'TrendingUp', 'Lightbulb', 'Rocket', 'Eye', 'CheckCircle'
  ];

  const IconPreview = getIcon(formData.icon);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Values"
        description="Manage your company's core values and principles (shown on About page)"
        icon={Heart}
        action={{
          label: 'Add Value',
          onClick: () => handleOpenModal(),
        }}
      />

      <DataTable
        data={values}
        columns={columns}
        isLoading={isLoading}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
        emptyMessage="No values yet. Add your first company value!"
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
                    {editingValue ? 'Edit Value' : 'Add New Value'}
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
                  {/* Icon Name with Preview */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Icon Name (Lucide React) <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                          <IconPreview className="w-8 h-8 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          name="icon"
                          value={formData.icon}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="Heart"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Enter Lucide React icon name (PascalCase)
                        </p>
                      </div>
                    </div>
                    
                    {/* Icon Suggestions */}
                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground mb-2">Quick select:</p>
                      <div className="flex flex-wrap gap-2">
                        {iconSuggestions.map((iconName) => {
                          const SuggestionIcon = getIcon(iconName);
                          return (
                            <button
                              key={iconName}
                              type="button"
                              onClick={() => setFormData({ ...formData, icon: iconName })}
                              className={`px-3 py-2 rounded-lg border transition-colors ${
                                formData.icon === iconName
                                  ? 'bg-primary text-white border-primary'
                                  : 'bg-background border-border hover:bg-accent'
                              }`}
                            >
                              <SuggestionIcon className="w-4 h-4 inline mr-1" />
                              <span className="text-xs">{iconName}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Value Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Customer First"
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
                      placeholder="Describe this company value..."
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
                      disabled={createValue.isPending || updateValue.isPending}
                      className="bg-gradient-to-r from-primary to-secondary text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingValue ? 'Update' : 'Create'} Value
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
        isSaving={createValue.isPending || updateValue.isPending}
      />
    </div>
  );
};

export default ValuesPage;
