import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderOpen, X, Save, Plus, Trash2 } from 'lucide-react';
import PageHeader from '@/admin/components/PageHeader';
import DataTable from '@/admin/components/DataTable';
import SaveBar from '@/admin/components/SaveBar';
import { useFormDirty } from '@/admin/hooks/useFormDirty';
import MediaUploadField from '@/components/MediaUploadField';
import { useProjects, useProjectCategories, useCreateProject, useUpdateProject, useDeleteProject } from '@/hooks/useContent';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const ProjectsPage = () => {
  const { toast } = useToast();
  const { data: projects = [], isLoading } = useProjects();
  const { data: categories = [], isLoading: categoriesLoading } = useProjectCategories();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [galleryInput, setGalleryInput] = useState('');
  const [formData, setFormData] = useState({
    slug: '',
    title_en: '',
    title_ar: '',
    short_description_en: '',
    short_description_ar: '',
    long_description_en: '',
    long_description_ar: '',
    category_id: '',
    client_name: '',
    industry: '',
    project_year: new Date().getFullYear(),
    tech_stack: '',
    cover_image_url: '',
    cover_fit: 'cover',
    gallery_images: [],
    live_url: '',
    github_url: '',
    is_featured: false,
    is_active: true,
    display_order: 0,
  });

  const { isDirty, markClean, resetToInitial } = useFormDirty(formData, editingProject);

  const handleOpenModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        slug: project.slug,
        title_en: project.title_en || '',
        title_ar: project.title_ar || '',
        short_description_en: project.short_description_en || '',
        short_description_ar: project.short_description_ar || '',
        long_description_en: project.long_description_en || '',
        long_description_ar: project.long_description_ar || '',
        category_id: project.category_id || '',
        client_name: project.client_name || '',
        industry: project.industry || '',
        project_year: project.project_year || new Date().getFullYear(),
        tech_stack: Array.isArray(project.tech_stack)
          ? project.tech_stack.join(', ')
          : '',
        cover_image_url: project.cover_image_url || '',
        cover_fit: project.cover_fit || 'cover',
        gallery_images: project.gallery_images || [],
        live_url: project.live_url || '',
        github_url: project.github_url || '',
        is_featured: project.is_featured || false,
        is_active: project.is_active !== undefined ? project.is_active : true,
        display_order: project.display_order || 0,
      });
      setGalleryInput('');
    } else {
      setEditingProject(null);
      setFormData({
        slug: '',
        title_en: '',
        title_ar: '',
        short_description_en: '',
        short_description_ar: '',
        long_description_en: '',
        long_description_ar: '',
        category_id: categories[0]?.id || '',
        client_name: '',
        industry: '',
        project_year: new Date().getFullYear(),
        tech_stack: '',
        cover_image_url: '',
        cover_fit: 'cover',
        gallery_images: [],
        live_url: '',
        github_url: '',
        is_featured: false,
        is_active: true,
        display_order: projects.length,
      });
      setGalleryInput('');
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
    setEditingProject(null);
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
      [name]: type === 'checkbox' ? checked : value,
    });

    // Auto-generate slug from English title
    if (name === 'title_en' && !editingProject) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleAddGalleryImage = () => {
    if (galleryInput.trim()) {
      setFormData({
        ...formData,
        gallery_images: [...formData.gallery_images, galleryInput.trim()],
      });
      setGalleryInput('');
    }
  };

  const handleRemoveGalleryImage = (index) => {
    setFormData({
      ...formData,
      gallery_images: formData.gallery_images.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const projectData = {
        ...formData,
        tech_stack: formData.tech_stack
          ? formData.tech_stack
              .split(',')
              .map((t) => t.trim())
              .filter((t) => t)
          : [],
        gallery_images: formData.gallery_images,
      };

      if (editingProject) {
        await updateProject.mutateAsync({
          id: editingProject.id,
          values: projectData,
        });
        toast({
          title: 'Project updated!',
          description: 'The project has been updated successfully.',
        });
      } else {
        await createProject.mutateAsync(projectData);
        toast({
          title: 'Project created!',
          description: 'The project has been created successfully.',
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

  const handleDelete = async (project) => {
    if (!confirm(`Are you sure you want to delete "${project.title_en || project.title}"?`)) return;

    try {
      await deleteProject.mutateAsync(project.id);
      toast({
        title: 'Project deleted!',
        description: 'The project has been deleted successfully.',
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
      label: 'Title',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          {row.cover_image_url && (
            <img
              src={row.cover_image_url}
              alt={value}
              className="w-12 h-12 object-cover rounded-lg"
            />
          )}
          <div>
            <div className="font-medium">{value || row.title}</div>
            <div className="text-xs text-muted-foreground">{row.title_ar}</div>
            {row.is_featured && (
              <span className="text-xs text-yellow-500">⭐ Featured</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'category_id',
      label: 'Category',
      sortable: true,
      render: (value) => {
        const category = categories.find(c => c.id === value);
        return category ? (
          <span className="px-2.5 py-1 bg-purple-500/10 text-purple-500 text-xs rounded-full font-medium">
            {category.name_en}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        );
      },
    },
    {
      key: 'client_name',
      label: 'Client',
      render: (value) => value || <span className="text-xs text-muted-foreground">—</span>,
    },
    {
      key: 'tech_stack',
      label: 'Technologies',
      render: (value) => (
        <div className="flex flex-wrap gap-1">
          {(Array.isArray(value) ? value : []).slice(0, 3).map((tech, i) => (
            <span
              key={i}
              className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-xs rounded"
            >
              {tech}
            </span>
          ))}
          {value && value.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{value.length - 3}
            </span>
          )}
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
        title="Projects"
        description="Manage your portfolio projects"
        icon={FolderOpen}
        action={() => handleOpenModal()}
        actionLabel="Add Project"
      />

      <DataTable
        columns={columns}
        data={projects}
        isLoading={isLoading}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
        searchPlaceholder="Search projects..."
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
                    {editingProject ? 'Edit Project' : 'Add New Project'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {/* Bilingual Titles */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Project Title (English) *
                      </label>
                      <input
                        type="text"
                        name="title_en"
                        value={formData.title_en}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="e.g., E-commerce Platform"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Project Title (Arabic) *
                      </label>
                      <input
                        type="text"
                        name="title_ar"
                        value={formData.title_ar}
                        onChange={handleChange}
                        required
                        dir="rtl"
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="مثال: منصة التجارة الإلكترونية"
                      />
                    </div>
                  </div>

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
                      placeholder="ecommerce-platform"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Auto-generated from English title
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Category *
                    </label>
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="">Select a category</option>
                      {categories.filter(c => c.is_active).map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name_en} / {cat.name_ar}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Bilingual Short Descriptions */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Short Description (English) *
                      </label>
                      <textarea
                        name="short_description_en"
                        value={formData.short_description_en}
                        onChange={handleChange}
                        required
                        rows={3}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                        placeholder="Brief project overview..."
                      />
                    </div>
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
                        rows={3}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                        placeholder="نظرة عامة موجزة على المشروع..."
                      />
                    </div>
                  </div>

                  {/* Bilingual Long Descriptions */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Detailed Description (English)
                      </label>
                      <textarea
                        name="long_description_en"
                        value={formData.long_description_en}
                        onChange={handleChange}
                        rows={5}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                        placeholder="Full case study description..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Detailed Description (Arabic)
                      </label>
                      <textarea
                        name="long_description_ar"
                        value={formData.long_description_ar}
                        onChange={handleChange}
                        dir="rtl"
                        rows={5}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                        placeholder="وصف كامل لدراسة الحالة..."
                      />
                    </div>
                  </div>

                  {/* Client Info Row */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Client Name
                      </label>
                      <input
                        type="text"
                        name="client_name"
                        value={formData.client_name}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="e.g., Acme Corp"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Industry
                      </label>
                      <input
                        type="text"
                        name="industry"
                        value={formData.industry}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="e.g., E-commerce"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Year
                      </label>
                      <input
                        type="number"
                        name="project_year"
                        value={formData.project_year}
                        onChange={handleChange}
                        min="2000"
                        max="2100"
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="2024"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Technologies (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="tech_stack"
                      value={formData.tech_stack}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="React, Node.js, PostgreSQL, AWS"
                    />
                  </div>

                  <MediaUploadField
                    label="Cover Image"
                    value={formData.cover_image_url}
                    onChange={(url) => setFormData({ ...formData, cover_image_url: url })}
                    accept="image/*"
                    fileType="image"
                    showAltText={false}
                    helperText="Main project screenshot or preview image"
                  />

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Cover Image Fit
                    </label>
                    <select
                      name="cover_fit"
                      value={formData.cover_fit}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="cover">Fill (Cover)</option>
                      <option value="contain">Fit (Contain)</option>
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Cover fills the space (may crop), Contain fits inside (shows full image)
                    </p>
                  </div>

                  {/* Gallery Images */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Gallery Images
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={galleryInput}
                          onChange={(e) => setGalleryInput(e.target.value)}
                          className="flex-1 px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="https://example.com/image.jpg"
                        />
                        <Button
                          type="button"
                          onClick={handleAddGalleryImage}
                          variant="outline"
                          className="px-4"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      {formData.gallery_images.length > 0 && (
                        <div className="space-y-1">
                          {formData.gallery_images.map((url, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-accent/50 rounded-lg">
                              <img src={url} alt="" className="w-12 h-12 object-cover rounded" />
                              <span className="flex-1 text-sm truncate">{url}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryImage(index)}
                                className="p-1 hover:bg-background rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Live URL
                      </label>
                      <input
                        type="url"
                        name="live_url"
                        value={formData.live_url}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="https://project.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        GitHub URL
                      </label>
                      <input
                        type="url"
                        name="github_url"
                        value={formData.github_url}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="https://github.com/..."
                      />
                    </div>
                  </div>

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

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                    <Button type="button" onClick={handleCloseModal} variant="outline">
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createProject.isPending || updateProject.isPending}
                      className="bg-gradient-to-r from-primary to-secondary text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingProject ? 'Update' : 'Create'} Project
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
        isSaving={createProject.isPending || updateProject.isPending}
      />
    </div>
  );
};

export default ProjectsPage;
