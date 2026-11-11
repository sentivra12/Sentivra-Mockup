import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, X, Save } from 'lucide-react';
import PageHeader from '@/admin/components/PageHeader';
import SaveBar from '@/admin/components/SaveBar';
import { useFormDirty } from '@/admin/hooks/useFormDirty';
import DataTable from '@/admin/components/DataTable';
import { useCountries, useCreateCountry, useUpdateCountry, useDeleteCountry } from '@/hooks/useContent';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const CountriesPage = () => {
  const { toast } = useToast();
  const { data: countries = [], isLoading } = useCountries();
  const createCountry = useCreateCountry();
  const updateCountry = useUpdateCountry();
  const deleteCountry = useDeleteCountry();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    country_code: '',
    flag_emoji: '',
    description: '',
    client_count: 0,
    display_order: 0,
    is_active: true,
  });

  // Track dirty state
  const { isDirty, markClean, resetToInitial } = useFormDirty(formData, editingCountry);

  const handleOpenModal = (country = null) => {
    if (country) {
      setEditingCountry(country);
      setFormData({
        name: country.name,
        country_code: country.country_code || '',
        flag_emoji: country.flag_emoji || '',
        description: country.description || '',
        client_count: country.client_count || 0,
        display_order: country.display_order || 0,
        is_active: country.is_active,
      });
    } else {
      setEditingCountry(null);
      setFormData({
        name: '',
        country_code: '',
        flag_emoji: '',
        description: '',
        client_count: 0,
        display_order: countries.length,
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
    setEditingCountry(null);
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
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Country name is required.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingCountry) {
        await updateCountry.mutateAsync({
          id: editingCountry.id,
          values: formData,
        });
        toast({
          title: 'Country updated!',
          description: 'The country has been updated successfully.',
        });
      } else {
        await createCountry.mutateAsync(formData);
        toast({
          title: 'Country created!',
          description: 'The country has been created successfully.',
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

  const handleDelete = async (country) => {
    if (!confirm(`Are you sure you want to delete "${country.name}"?`)) return;

    try {
      await deleteCountry.mutateAsync(country.id);
      toast({
        title: 'Country deleted!',
        description: 'The country has been deleted successfully.',
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
      key: 'flag_emoji',
      label: 'Flag',
      render: (country) => (
        <span className="text-2xl">{country.flag_emoji || '🌍'}</span>
      ),
    },
    {
      key: 'name',
      label: 'Country Name',
      render: (country) => (
        <div>
          <div className="font-medium">{country.name}</div>
          {country.country_code && (
            <div className="text-sm text-muted-foreground">{country.country_code}</div>
          )}
        </div>
      ),
    },
    {
      key: 'client_count',
      label: 'Clients',
      render: (country) => (
        <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
          {country.client_count || 0}
        </span>
      ),
    },
    {
      key: 'display_order',
      label: 'Order',
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (country) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          country.is_active
            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
        }`}>
          {country.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Countries"
        description="Manage countries where you serve clients (shown on About page)"
        icon={Globe}
        action={{
          label: 'Add Country',
          onClick: () => handleOpenModal(),
        }}
      />

      <DataTable
        data={countries}
        columns={columns}
        isLoading={isLoading}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
        emptyMessage="No countries yet. Add your first country!"
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
                    {editingCountry ? 'Edit Country' : 'Add New Country'}
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
                  {/* Country Name */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Country Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="United States"
                    />
                  </div>

                  {/* Country Code and Flag Emoji */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Country Code
                      </label>
                      <input
                        type="text"
                        name="country_code"
                        value={formData.country_code}
                        onChange={handleChange}
                        maxLength={3}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 uppercase"
                        placeholder="US"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        2-3 letter code (e.g., US, SAU)
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Flag Emoji
                      </label>
                      <input
                        type="text"
                        name="flag_emoji"
                        value={formData.flag_emoji}
                        onChange={handleChange}
                        maxLength={4}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-2xl"
                        placeholder="🇺🇸"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Country flag emoji
                      </p>
                    </div>
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
                      rows={3}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      placeholder="Brief description about your presence in this country..."
                    />
                  </div>

                  {/* Client Count and Display Order */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Client Count
                      </label>
                      <input
                        type="number"
                        name="client_count"
                        value={formData.client_count}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Number of clients in this country
                      </p>
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
                      disabled={createCountry.isPending || updateCountry.isPending}
                      className="bg-gradient-to-r from-primary to-secondary text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingCountry ? 'Update' : 'Create'} Country
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
        isSaving={createCountry.isPending || updateCountry.isPending}
      />
    </div>
  );
};

export default CountriesPage;
