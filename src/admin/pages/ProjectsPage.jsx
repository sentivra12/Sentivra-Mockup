import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderOpen, X, Save } from 'lucide-react';
import PageHeader from '@/admin/components/PageHeader';
import DataTable from '@/admin/components/DataTable';
import MediaUploadField from '@/components/MediaUploadField';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '@/hooks/useContent';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const ProjectsPage = () => {
  const { toast } = useToast();
  const { data: projects = [], isLoading } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    short_description: '',
    long_description: '',
    category: 'Web Apps',
    technologies: '',
    image_url: '',
    project_url: '',
    github_url: '',
    is_featured: false,
    is_active: true,
    display_order: 0,
  });

  const categories = [
    'Web Apps',
    'Mobile',
    'ERP',
    'CRM',
    'AI & Chatbots',
    'Other',
  ];

  const handleOpenModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title,
        slug: project.slug,
        short_description: project.short_description || '',
        long_description: project.long_description || '',
        category: project.category,
        technologies: Array.isArray(project.technologies)
          ? project.technologies.join(', ')
          : '',
        image_url: project.image_url || '',
        project_url: project.project_url || '',
        github_url: project.github_url || '',
        is_featured: project.is_featured,
        is_active: project.is_active,
        display_order: project.display_order || 0,
      });
    } else {
      setEditingProject(null);
      setFormData({
        title: '',
        slug: '',
        short_description: '',
        long_description: '',
        category: 'Web Apps',
        technologies: '',
        image_url: '',
        project_url: '',
        github_url: '',
        is_featured: false,
        is_active: true,
        display_order: projects.length,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    if (name === 'title' && !editingProject) {
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
      const projectData = {
        ...formData,
        technologies: formData.technologies
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t),
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
    if (!confirm(`Are you sure you want to delete "${project.title}"?`)) return;

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
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          {row.image_url && (
            <img
              src={row.image_url}
              alt={value}
              className="w-12 h-12 object-cover rounded-lg"
            />
          )}
          <div>
            <div className="font-medium">{value}</div>
            {row.is_featured && (
              <span className="text-xs text-yellow-500">⭐ Featured</span>
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
        <span className="px-2.5 py-1 bg-purple-500/10 text-purple-500 text-xs rounded-full font-medium">
          {value}
        </span>
      ),
    },
    {
      key: 'technologies',
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
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="e.g., E-commerce Platform"
                    />
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
                  </div>

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

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Short Description *
                    </label>
                    <textarea
                      name="short_description"
                      value={formData.short_description}
                      onChange={handleChange}
                      required
                      rows={2}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      placeholder="Brief project overview"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Detailed Description
                    </label>
                    <textarea
                      name="long_description"
                      value={formData.long_description}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      placeholder="Full project description..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Technologies (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="technologies"
                      value={formData.technologies}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="React, Node.js, PostgreSQL, AWS"
                    />
                  </div>

                  <MediaUploadField
                    label="Project Image"
                    value={formData.image_url}
                    onChange={(url) => setFormData({ ...formData, image_url: url })}
                    accept="image/*"
                    fileType="image"
                    showAltText={false}
                    helperText="Main project screenshot or preview image"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Project URL
                      </label>
                      <input
                        type="url"
                        name="project_url"
                        value={formData.project_url}
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
    </div>
  );
};

export default ProjectsPage;
