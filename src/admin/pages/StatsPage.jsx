import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical, Save, X } from 'lucide-react';
import { useStats } from '@/hooks/useContent';
import { getAvailableIcons, resolveIcon } from '../../lib/iconResolver';

const COMMON_ICONS = getAvailableIcons();

const StatsPage = () => {
  const { data: stats = [], isLoading } = useStats();
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});

  const handleEdit = (stat) => {
    setEditingId(stat.id);
    setFormData({
      key: stat.key || '',
      label: stat.label || '',
      label_ar: stat.label_ar || '',
      value: stat.value || 0,
      prefix: stat.prefix || '',
      suffix: stat.suffix || '',
      icon: stat.icon || 'CheckCircle',
      description: stat.description || '',
      description_ar: stat.description_ar || '',
      pages: stat.pages || ['home'],
      display_order: stat.display_order || 0,
      is_active: stat.is_active !== false
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
  };

  const renderIconPicker = () => {
    return (
      <div className="grid grid-cols-5 gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg max-h-48 overflow-y-auto">
        {COMMON_ICONS.map((iconName) => {
          const IconComponent = resolveIcon(iconName);
          return (
            <button
              key={iconName}
              type="button"
              onClick={() => setFormData({ ...formData, icon: iconName })}
              className={`p-3 rounded-lg border-2 transition-all ${
                formData.icon === iconName
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
              }`}
              title={iconName}
            >
              <IconComponent className="w-5 h-5 mx-auto" />
            </button>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Statistics</h1>
          <p className="text-muted-foreground mt-1">
            Manage stats shown across Home, Services, Our Work, and About pages
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-strong transition-colors">
          <Plus className="w-4 h-4" />
          Add Stat
        </button>
      </div>

      {/* Stats List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Order</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Key</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Label (EN)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Label (AR)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Value</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Icon</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Pages</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {stats.map((stat) => {
                const IconComponent = resolveIcon(stat.icon);
                const isEditing = editingId === stat.id;

                if (isEditing) {
                  return (
                    <tr key={stat.id} className="bg-blue-50 dark:bg-blue-950">
                      <td colSpan="9" className="p-6">
                        <div className="space-y-6">
                          <h3 className="text-lg font-semibold">Edit Stat</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Key */}
                            <div>
                              <label className="block text-sm font-medium mb-2">Key (unique identifier)</label>
                              <input
                                type="text"
                                value={formData.key || ''}
                                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                                placeholder="e.g. projects, clients, countries"
                              />
                            </div>

                            {/* Display Order */}
                            <div>
                              <label className="block text-sm font-medium mb-2">Display Order</label>
                              <input
                                type="number"
                                value={formData.display_order || 0}
                                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                              />
                            </div>

                            {/* Label EN */}
                            <div>
                              <label className="block text-sm font-medium mb-2">Label (English)</label>
                              <input
                                type="text"
                                value={formData.label || ''}
                                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                                placeholder="e.g. Projects Completed"
                              />
                            </div>

                            {/* Label AR */}
                            <div>
                              <label className="block text-sm font-medium mb-2">Label (Arabic)</label>
                              <input
                                type="text"
                                value={formData.label_ar || ''}
                                onChange={(e) => setFormData({ ...formData, label_ar: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                                placeholder="e.g. المشاريع المكتملة"
                                dir="rtl"
                              />
                            </div>

                            {/* Value */}
                            <div>
                              <label className="block text-sm font-medium mb-2">Numeric Value</label>
                              <input
                                type="number"
                                value={formData.value || 0}
                                onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) || 0 })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                                placeholder="e.g. 50, 98"
                              />
                            </div>

                            {/* Prefix & Suffix */}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-sm font-medium mb-2">Prefix</label>
                                <input
                                  type="text"
                                  value={formData.prefix || ''}
                                  onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                                  placeholder="$, €"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">Suffix</label>
                                <input
                                  type="text"
                                  value={formData.suffix || ''}
                                  onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
                                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                                  placeholder="+, %, K, M"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Icon Picker */}
                          <div>
                            <label className="block text-sm font-medium mb-2">Icon</label>
                            {renderIconPicker()}
                            <p className="text-xs text-gray-500 mt-1">Selected: {formData.icon}</p>
                          </div>

                          {/* Pages */}
                          <div>
                            <label className="block text-sm font-medium mb-2">Show on Pages</label>
                            <div className="flex flex-wrap gap-2">
                              {['home', 'services', 'our-work', 'about'].map((page) => (
                                <label key={page} className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                                  <input
                                    type="checkbox"
                                    checked={(formData.pages || []).includes(page)}
                                    onChange={(e) => {
                                      const newPages = e.target.checked
                                        ? [...(formData.pages || []), page]
                                        : (formData.pages || []).filter(p => p !== page);
                                      setFormData({ ...formData, pages: newPages });
                                    }}
                                    className="rounded border-gray-300"
                                  />
                                  <span className="text-sm capitalize">{page}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Active Toggle */}
                          <div>
                            <label className="inline-flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.is_active !== false}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                className="rounded border-gray-300"
                              />
                              <span className="text-sm font-medium">Published (visible on site)</span>
                            </label>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-3 pt-4 border-t">
                            <button
                              onClick={handleCancel}
                              className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                              <X className="w-4 h-4" />
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                // TODO: Save logic
                                console.log('Save:', formData);
                                handleCancel();
                              }}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-strong transition-colors"
                            >
                              <Save className="w-4 h-4" />
                              Save Changes
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={stat.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{stat.display_order}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {stat.key || '—'}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium">{stat.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400" dir="rtl">
                        {stat.label_ar || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold">
                        {stat.prefix}{stat.value}{stat.suffix}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-5 h-5 text-primary" />
                        <span className="text-xs text-gray-500">{stat.icon}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(stat.pages || ['home']).map((page) => (
                          <span key={page} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                            {page}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {stat.is_active ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-400">
                          <Eye className="w-3 h-3" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
                          <EyeOff className="w-3 h-3" />
                          Hidden
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(stat)}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">📊 Important Notes</h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
          <li><strong>One value per key:</strong> Each stat key (e.g. "projects") shows the SAME number on all pages</li>
          <li><strong>Never store "50+":</strong> Use value=50 + suffix="+" (not value="50+" as text)</li>
          <li><strong>Icon names:</strong> Use Lucide React icon names (e.g. "CheckCircle", "Users")</li>
          <li><strong>Pages control:</strong> Choose which pages show each stat (home, services, our-work, about)</li>
          <li><strong>Arabic translations:</strong> Add label_ar for proper bilingual support</li>
        </ul>
      </div>
    </div>
  );
};

export default StatsPage;
