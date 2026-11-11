import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, Save, ChevronDown, ChevronRight } from 'lucide-react';
import PageHeader from '@/admin/components/PageHeader';
import SaveBar from '@/admin/components/SaveBar';
import { useFormDirty } from '@/admin/hooks/useFormDirty';
import { useFAQs, useCreateFAQ, useUpdateFAQ, useDeleteFAQ } from '@/hooks/useContent';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const FAQsPage = () => {
  const { toast } = useToast();
  const [selectedPage, setSelectedPage] = useState('contact');
  const { data: faqs = [], isLoading } = useFAQs(selectedPage);
  const createFAQ = useCreateFAQ();
  const updateFAQ = useUpdateFAQ();
  const deleteFAQ = useDeleteFAQ();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState(null);
  const [expandedFAQs, setExpandedFAQs] = useState(new Set());
  const [formData, setFormData] = useState({
    page_key: 'contact',
    question: '',
    question_ar: '',
    answer: '',
    answer_ar: '',
    is_active: true,
    display_order: 0,
  });

  // Track dirty state
  const { isDirty, markClean, resetToInitial } = useFormDirty(formData, editingFAQ);

  const pageOptions = [
    { value: 'contact', label: 'Contact Page' },
    { value: 'mockups', label: 'Mockups Page' },
    { value: 'services', label: 'Services Page' },
    { value: 'general', label: 'General' },
  ];

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedFAQs);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFAQs(newExpanded);
  };

  const handleOpenModal = (faq = null) => {
    if (faq) {
      setEditingFAQ(faq);
      setFormData({
        page_key: faq.page_key,
        question: faq.question,
        question_ar: faq.question_ar || '',
        answer: faq.answer,
        answer_ar: faq.answer_ar || '',
        is_active: faq.is_active,
        display_order: faq.display_order || 0,
      });
    } else {
      setEditingFAQ(null);
      setFormData({
        page_key: selectedPage,
        question: '',
        question_ar: '',
        answer: '',
        answer_ar: '',
        is_active: true,
        display_order: faqs.length,
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
    setEditingFAQ(null);
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
      if (editingFAQ) {
        await updateFAQ.mutateAsync({
          id: editingFAQ.id,
          values: formData,
        });
        toast({
          title: 'FAQ updated!',
          description: 'The FAQ has been updated successfully.',
        });
      } else {
        await createFAQ.mutateAsync(formData);
        toast({
          title: 'FAQ created!',
          description: 'The FAQ has been created successfully.',
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

  const handleDelete = async (faq) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      await deleteFAQ.mutateAsync(faq.id);
      toast({
        title: 'FAQ deleted!',
        description: 'The FAQ has been deleted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div>
      <PageHeader
        title="FAQs"
        description="Manage frequently asked questions"
        icon={HelpCircle}
        action={() => handleOpenModal()}
        actionLabel="Add FAQ"
      />

      {/* Page Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Filter by Page</label>
        <select
          value={selectedPage}
          onChange={(e) => setSelectedPage(e.target.value)}
          className="px-4 py-2.5 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          {pageOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* FAQs List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl overflow-hidden"
      >
        {isLoading ? (
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-accent rounded-lg" />
              ))}
            </div>
          </div>
        ) : faqs.length > 0 ? (
          <div className="divide-y divide-border">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <div className="flex items-start gap-4 p-6 hover:bg-accent/50 transition-colors">
                  {/* Expand Button */}
                  <button
                    onClick={() => toggleExpanded(faq.id)}
                    className="flex-shrink-0 p-2 hover:bg-accent rounded-lg transition-colors"
                  >
                    {expandedFAQs.has(faq.id) ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{faq.question}</h3>
                        {!faq.is_active && (
                          <span className="inline-block px-2 py-0.5 bg-gray-500/10 text-gray-500 text-xs rounded-full">
                            Hidden
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenModal(faq)}
                          className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-lg transition-colors"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(faq)}
                          className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Expanded Answer */}
                    <AnimatePresence>
                      {expandedFAQs.has(faq.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 pt-3 border-t border-border text-muted-foreground">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground">
            <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No FAQs found for {pageOptions.find(p => p.value === selectedPage)?.label}</p>
            <button
              onClick={() => handleOpenModal()}
              className="mt-4 text-primary hover:underline"
            >
              Add your first FAQ
            </button>
          </div>
        )}
      </motion.div>

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
                className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl"
              >
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <h2 className="text-2xl font-bold">
                    {editingFAQ ? 'Edit FAQ' : 'Add New FAQ'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  {/* Page Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Page *
                    </label>
                    <select
                      name="page_key"
                      value={formData.page_key}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      {pageOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Question (English) */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Question (English) *
                    </label>
                    <input
                      type="text"
                      name="question"
                      value={formData.question}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="What services do you offer?"
                    />
                  </div>

                  {/* Question (Arabic) */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Question (Arabic)
                    </label>
                    <input
                      type="text"
                      name="question_ar"
                      value={formData.question_ar}
                      onChange={handleChange}
                      dir="rtl"
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="ما هي الخدمات التي تقدمونها؟"
                    />
                  </div>

                  {/* Answer (English) */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Answer (English) *
                    </label>
                    <textarea
                      name="answer"
                      value={formData.answer}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      placeholder="We specialize in custom web and mobile application development..."
                    />
                  </div>

                  {/* Answer (Arabic) */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Answer (Arabic)
                    </label>
                    <textarea
                      name="answer_ar"
                      value={formData.answer_ar}
                      onChange={handleChange}
                      rows={6}
                      dir="rtl"
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      placeholder="نحن متخصصون في تطوير تطبيقات الويب والجوال المخصصة..."
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
                      disabled={createFAQ.isPending || updateFAQ.isPending}
                      className="bg-gradient-to-r from-primary to-secondary text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingFAQ ? 'Update' : 'Create'} FAQ
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
        isSaving={createFAQ.isPending || updateFAQ.isPending}
      />
    </div>
  );
};

export default FAQsPage;
