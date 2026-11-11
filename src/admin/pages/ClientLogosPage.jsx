import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, X, Save } from 'lucide-react';
import PageHeader from '@/admin/components/PageHeader';
import SaveBar from '@/admin/components/SaveBar';
import { useFormDirty } from '@/admin/hooks/useFormDirty';
import DataTable from '@/admin/components/DataTable';
import MediaUploadField from '@/components/MediaUploadField';
import { useClientLogos, useCreateClientLogo, useUpdateClientLogo, useDeleteClientLogo } from '@/hooks/useContent';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const ClientLogosPage = () => {
  const { toast } = useToast();
  const { data: clientLogos = [], isLoading } = useClientLogos();
  const createClientLogo = useCreateClientLogo();
  const updateClientLogo = useUpdateClientLogo();
  const deleteClientLogo = useDeleteClientLogo();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLogo, setEditingLogo] = useState(null);
  const [formData, setFormData] = useState({
    client_name: '',
    logo_url: '',
    website_url: '',
    is_active: true,
    display_order: 0,
  });

  // Track dirty state
  const { isDirty, markClean, resetToInitial } = useFormDirty(formData, editingLogo);

  const handleOpenModal = (logo = null) => {
    if (logo) {
      setEditingLogo(logo);
      setFormData({
        client_name: logo.client_name,
        logo_url: logo.logo_url || '',
        website_url: logo.website_url || '',
        is_active: logo.is_active,
        display_order: logo.display_order || 0,
      });
    } else {
      setEditingLogo(null);
      setFormData({
        client_name: '',
        logo_url: '',
        website_url: '',
        is_active: true,
        display_order: clientLogos.length,
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
    setEditingLogo(null);
    resetToInitial();
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
      if (editingLogo) {
        await updateClientLogo.mutateAsync({
          id: editingLogo.id,
          values: formData,
        });
        toast({
          title: 'Client logo updated!',
          description: 'The client logo has been updated successfully.',
        });
      } else {
        await createClientLogo.mutateAsync(formData);
        toast({
          title: 'Client logo created!',
          description: 'The client logo has been created successfully.',
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

  const handleDelete = async (logo) => {
    if (!confirm(`Are you sure you want to delete "${logo.client_name}"?`)) return;

    try {
      await deleteClientLogo.mutateAsync(logo.id);
      toast({
        title: 'Client logo deleted!',
        description: 'The client logo has been deleted successfully.',
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
          {row.logo_url ? (
            <img
              src={row.logo_url}
              alt={value}
              className="w-16 h-16 object-contain bg-white p-2 rounded-lg border border-border"
            />
          ) : (
            <div className="w-16 h-16 bg-accent rounded-lg flex items-center justify-center text-2xl font-bold text-primary">
              {value.charAt(0)}
            </div>
          )}
          <div className="font-medium">{value}</div>
        </div>
      ),
    },
    {
      key: 'website_url',
      label: 'Website',
      render: (value) =>
        value ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {value}
          </a>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: 'display_order',
      label: 'Order',
      sortable: true,
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (value) =>
        value ? (
          <span className="px-2.5 py-1 bg-green-500/10 text-green-500 text-xs rounded-full">
            Active
          </span>
        ) : (
          <span className="px-2.5 py-1 bg-gray-500/10 text-gray-500 text-xs rounded-full">
            Hidden
          </span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Client Logos"
        description="Manage your trusted client logos"
        icon={Users}
        action={() => handleOpenModal()}
        actionLabel="Add Client Logo"
      />

      <DataTable
        columns={columns}
        data={clientLogos}
        isLoading={isLoading}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
        searchPlaceholder="Search client logos..."
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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg"
              >
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <h2 className="text-2xl font-bold">
                    {editingLogo ? 'Edit Client Logo' : 'Add New Client Logo'}
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
                      placeholder="e.g., Tech Corp"
                    />
                  </div>

                  {/* Logo */}
                  <MediaUploadField
                    label="Client Logo"
                    value={formData.logo_url}
                    onChange={(url) => setFormData({ ...formData, logo_url: url })}
                    accept="image/*"
                    fileType="image"
                    required
                    showAltText={false}
                    helperText="Company logo (PNG recommended for transparency)"
                  />

                  {/* Website URL */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Website URL
                    </label>
                    <input
                      type="url"
                      name="website_url"
                      value={formData.website_url}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="https://client-website.com"
                    />
                  </div>

                  {/* Display Order & Active */}
                  <div className="grid grid-cols-2 gap-4">
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
                        <span className="text-sm font-medium">Active (Visible)</span>
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
                      disabled={createClientLogo.isPending || updateClientLogo.isPending}
                      className="bg-gradient-to-r from-primary to-secondary text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingLogo ? 'Update' : 'Create'} Logo
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
        isSaving={createClientLogo.isPending || updateClientLogo.isPending}
      />
    </div>
  );
};

export default ClientLogosPage;
