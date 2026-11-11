import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical, Save, X } from 'lucide-react';
import PageHeader from '@/admin/components/PageHeader';
import { 
  useAllMarqueeItems, 
  useCreateMarqueeItem, 
  useUpdateMarqueeItem, 
  useDeleteMarqueeItem 
} from '@/hooks/useContent';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { getAvailableIcons, resolveIcon } from '../../lib/iconResolver';

const COMMON_ICONS = getAvailableIcons();

const MarqueeItemsPage = () => {
  const { toast } = useToast();
  const { data: items = [], isLoading } = useAllMarqueeItems();
  const createItem = useCreateMarqueeItem();
  const updateItem = useUpdateMarqueeItem();
  const deleteItem = useDeleteMarqueeItem();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    row_number: 1,
    text_en: '',
    text_ar: '',
    icon_name: '',
    display_order: 0,
    is_published: true,
  });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        row_number: item.row_number,
        text_en: item.text_en,
        text_ar: item.text_ar,
        icon_name: item.icon_name || '',
        display_order: item.display_order,
        is_published: item.is_published,
      });
    } else {
      setEditingId(null);
      setFormData({
        row_number: 1,
        text_en: '',
        text_ar: '',
        icon_name: '',
        display_order: items.length,
        is_published: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      row_number: 1,
      text_en: '',
      text_ar: '',
      icon_name: '',
      display_order: 0,
      is_published: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await updateItem.mutateAsync({ id: editingId, ...formData });
        toast({
          title: 'Success',
          description: 'Marquee item updated successfully',
        });
      } else {
        await createItem.mutateAsync(formData);
        toast({
          title: 'Success',
          description: 'Marquee item created successfully',
        });
      }
      markClean();
      handleCloseModal();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save marquee item',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this marquee item?')) {
      return;
    }

    try {
      await deleteItem.mutateAsync(id);
      toast({
        title: 'Success',
        description: 'Marquee item deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete marquee item',
        variant: 'destructive',
      });
    }
  };

  const togglePublished = async (item) => {
    try {
      await updateItem.mutateAsync({
        id: item.id,
        is_published: !item.is_published,
      });
      toast({
        title: 'Success',
        description: `Marquee item ${!item.is_published ? 'published' : 'unpublished'}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update publish status',
        variant: 'destructive',
      });
    }
  };

  // Separate items by row
  const row1Items = items.filter((item) => item.row_number === 1);
  const row2Items = items.filter((item) => item.row_number === 2);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marquee Band Items"
        description="Manage the content displayed in the brand marquee band"
        action={
          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4 me-2" />
            Add Item
          </Button>
        }
      />

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading marquee items...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Row 1: Large Display Text */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Row 1: Large Display Text</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Large text with gradient/outlined style (40-64px). No icons.
            </p>
            
            <div className="bg-card rounded-lg border">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-start text-sm font-medium">Order</th>
                    <th className="px-4 py-3 text-start text-sm font-medium">Text (EN)</th>
                    <th className="px-4 py-3 text-start text-sm font-medium">Text (AR)</th>
                    <th className="px-4 py-3 text-start text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-end text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {row1Items.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-muted-foreground">
                        No items in Row 1. Add some to get started.
                      </td>
                    </tr>
                  ) : (
                    row1Items.map((item) => (
                      <tr key={item.id} className="border-t hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <GripVertical className="w-4 h-4 text-muted-foreground" />
                            <span className="font-mono text-sm">{item.display_order}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 max-w-xs truncate">{item.text_en}</td>
                        <td className="px-4 py-3 max-w-xs truncate">{item.text_ar}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              item.is_published
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                            }`}
                          >
                            {item.is_published ? 'Published' : 'Unpublished'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => togglePublished(item)}
                              className="p-1 hover:bg-muted rounded transition-colors"
                              title={item.is_published ? 'Unpublish' : 'Publish'}
                            >
                              {item.is_published ? (
                                <EyeOff className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <Eye className="w-4 h-4 text-muted-foreground" />
                              )}
                            </button>
                            <button
                              onClick={() => handleOpenModal(item)}
                              className="p-1 hover:bg-muted rounded transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1 hover:bg-muted rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Row 2: Smaller Text with Icons */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Row 2: Smaller Text with Icons</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Smaller text (18-22px) with optional Lucide icons. Used for services, values, etc.
            </p>
            
            <div className="bg-card rounded-lg border">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-start text-sm font-medium">Order</th>
                    <th className="px-4 py-3 text-start text-sm font-medium">Icon</th>
                    <th className="px-4 py-3 text-start text-sm font-medium">Text (EN)</th>
                    <th className="px-4 py-3 text-start text-sm font-medium">Text (AR)</th>
                    <th className="px-4 py-3 text-start text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-end text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {row2Items.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-muted-foreground">
                        No items in Row 2. Add some to get started.
                      </td>
                    </tr>
                  ) : (
                    row2Items.map((item) => {
                      const IconComponent = item.icon_name ? resolveIcon(item.icon_name) : null;
                      
                      return (
                        <tr key={item.id} className="border-t hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <GripVertical className="w-4 h-4 text-muted-foreground" />
                              <span className="font-mono text-sm">{item.display_order}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {IconComponent ? (
                              <IconComponent className="w-5 h-5 text-primary" />
                            ) : (
                              <span className="text-muted-foreground text-xs">None</span>
                            )}
                          </td>
                          <td className="px-4 py-3 max-w-xs truncate">{item.text_en}</td>
                          <td className="px-4 py-3 max-w-xs truncate">{item.text_ar}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                item.is_published
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                              }`}
                            >
                              {item.is_published ? 'Published' : 'Unpublished'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => togglePublished(item)}
                                className="p-1 hover:bg-muted rounded transition-colors"
                                title={item.is_published ? 'Unpublish' : 'Publish'}
                              >
                                {item.is_published ? (
                                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="w-4 h-4 text-muted-foreground" />
                                )}
                              </button>
                              <button
                                onClick={() => handleOpenModal(item)}
                                className="p-1 hover:bg-muted rounded transition-colors"
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-1 hover:bg-muted rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">
                  {editingId ? 'Edit Marquee Item' : 'Add Marquee Item'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-1 hover:bg-muted rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Row Number */}
                <div>
                  <label className="block text-sm font-medium mb-2">Row</label>
                  <select
                    value={formData.row_number}
                    onChange={(e) => setFormData({ ...formData, row_number: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                    required
                  >
                    <option value={1}>Row 1 (Large Display Text)</option>
                    <option value={2}>Row 2 (Smaller with Icons)</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.row_number === 1
                      ? 'Large gradient text (no icons)'
                      : 'Smaller text with optional icon'}
                  </p>
                </div>

                {/* Text EN */}
                <div>
                  <label className="block text-sm font-medium mb-2">Text (English) *</label>
                  <input
                    type="text"
                    value={formData.text_en}
                    onChange={(e) => setFormData({ ...formData, text_en: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                    placeholder="Enter English text"
                    required
                  />
                </div>

                {/* Text AR */}
                <div>
                  <label className="block text-sm font-medium mb-2">Text (Arabic) *</label>
                  <input
                    type="text"
                    value={formData.text_ar}
                    onChange={(e) => setFormData({ ...formData, text_ar: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-background text-end"
                    placeholder="أدخل النص بالعربية"
                    dir="rtl"
                    required
                  />
                </div>

                {/* Icon (Row 2 only) */}
                {formData.row_number === 2 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Icon (Optional)</label>
                    <div className="grid grid-cols-6 gap-2 p-3 border rounded-lg bg-muted/30 max-h-48 overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, icon_name: '' })}
                        className={`p-3 rounded border-2 transition-all ${
                          formData.icon_name === ''
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                        title="No icon"
                      >
                        <X className="w-5 h-5 text-muted-foreground mx-auto" />
                      </button>
                      
                      {COMMON_ICONS.map((iconName) => {
                        const IconComponent = resolveIcon(iconName);
                        return (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => setFormData({ ...formData, icon_name: iconName })}
                            className={`p-3 rounded border-2 transition-all ${
                              formData.icon_name === iconName
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                            }`}
                            title={iconName}
                          >
                            <IconComponent className="w-5 h-5 text-primary mx-auto" />
                          </button>
                        );
                      })}
                    </div>
                    {formData.icon_name && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Selected: {formData.icon_name}
                      </p>
                    )}
                  </div>
                )}

                {/* Display Order */}
                <div>
                  <label className="block text-sm font-medium mb-2">Display Order</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Lower numbers appear first
                  </p>
                </div>

                {/* Published */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label htmlFor="is_published" className="text-sm font-medium">
                    Published (visible on website)
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={createItem.isPending || updateItem.isPending}
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 me-2" />
                    {editingId ? 'Update' : 'Create'}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCloseModal}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MarqueeItemsPage;
