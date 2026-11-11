import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, X, Eye, Trash2, CheckCircle, Clock, Archive, ExternalLink, TrendingUp } from 'lucide-react';
import PageHeader from '@/admin/components/PageHeader';
import DataTable from '@/admin/components/DataTable';
import { useMessages, useUpdateMessageStatus, useDeleteMessage } from '@/hooks/useContent';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const MessagesPage = () => {
  const { toast } = useToast();
  const { data: messages = [], isLoading } = useMessages();
  const updateStatus = useUpdateMessageStatus();
  const deleteMessage = useDeleteMessage();

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterSource, setFilterSource] = useState('all');

  // Get unique attribution sources
  const attributionSources = [...new Set(
    messages
      .filter(m => m.utm_source)
      .map(m => m.utm_source)
  )].sort();

  // Filter messages
  const filteredMessages = messages.filter((msg) => {
    if (filterStatus !== 'all' && msg.status !== filterStatus) return false;
    if (filterType !== 'all' && msg.type !== filterType) return false;
    if (filterSource !== 'all' && msg.utm_source !== filterSource) return false;
    return true;
  });

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    
    // Mark as read if new
    if (message.status === 'new') {
      updateStatus.mutate({ id: message.id, status: 'read' });
    }
  };

  const handleCloseModal = () => {
    setSelectedMessage(null);
  };

  const handleUpdateStatus = async (messageId, status) => {
    try {
      await updateStatus.mutateAsync({ id: messageId, status });
      toast({
        title: 'Status updated!',
        description: `Message marked as ${status}.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (message) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      await deleteMessage.mutateAsync(message.id);
      toast({
        title: 'Message deleted!',
        description: 'The message has been deleted successfully.',
      });
      if (selectedMessage?.id === message.id) {
        setSelectedMessage(null);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const statusBadge = (status) => {
    const badges = {
      new: 'bg-green-500/10 text-green-500',
      read: 'bg-blue-500/10 text-blue-500',
      replied: 'bg-purple-500/10 text-purple-500',
      archived: 'bg-gray-500/10 text-gray-500',
    };
    return badges[status] || badges.new;
  };

  const typeBadge = (type) => {
    const badges = {
      contact: 'bg-blue-500/10 text-blue-500',
      mockup_request: 'bg-pink-500/10 text-pink-500',
      quote_request: 'bg-yellow-500/10 text-yellow-500',
    };
    return badges[type] || badges.contact;
  };

  const columns = [
    {
      key: 'full_name',
      label: 'From',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          {/* Mockup Thumbnail if design request */}
          {row.mockup_id && row.mockups && (row.mockups.cover_image_url || row.mockups.desktop_screenshot_url) && (
            <img
              src={row.mockups.cover_image_url || row.mockups.desktop_screenshot_url}
              alt="Design"
              className="w-12 h-10 object-cover rounded"
            />
          )}
          <div>
            <div className="font-medium">{value || row.name}</div>
            <div className="text-xs text-muted-foreground">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (value, row) => (
        <div>
          <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${typeBadge(value || 'contact')}`}>
            {(value || 'contact').replace('_', ' ')}
          </span>
          {/* Show mockup title if design request */}
          {row.mockup_id && row.mockups && (
            <div className="text-xs text-muted-foreground mt-1 truncate max-w-[120px]">
              {row.mockups.title_en}
            </div>
          )}
          {/* Show attribution source if available */}
          {row.utm_source && (
            <div className="flex items-center gap-1 mt-1 text-xs text-blue-500">
              <TrendingUp className="w-3 h-3" />
              {row.utm_source}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'subject',
      label: 'Subject',
      render: (value, row) => (
        <div className="max-w-md">
          <div className="font-medium truncate">{value || 'No subject'}</div>
          <div className="text-xs text-muted-foreground truncate">{row.message}</div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${statusBadge(value)}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      sortable: true,
      render: (value) => new Date(value).toLocaleString(),
    },
  ];

  const newMessagesCount = messages.filter((m) => m.status === 'new').length;

  return (
    <div>
      <PageHeader
        title="Messages"
        description={`You have ${newMessagesCount} unread message${newMessagesCount !== 1 ? 's' : ''}`}
        icon={Mail}
      />

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
          <option value="archived">Archived</option>
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="all">All Types</option>
          <option value="contact">Contact</option>
          <option value="mockup_request">Mockup Request</option>
          <option value="quote_request">Quote Request</option>
        </select>

        <select
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
          className="px-4 py-2 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="all">All Sources</option>
          {attributionSources.map(source => (
            <option key={source} value={source}>{source}</option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={filteredMessages}
        isLoading={isLoading}
        onView={handleViewMessage}
        onDelete={handleDelete}
        searchPlaceholder="Search messages..."
      />

      {/* Message Detail Modal */}
      <AnimatePresence>
        {selectedMessage && (
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
                className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{selectedMessage.name}</h2>
                      <p className="text-sm text-muted-foreground">{selectedMessage.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {/* Meta Info */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-accent/50 rounded-xl">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Type</p>
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${typeBadge(selectedMessage.type)}`}>
                        {selectedMessage.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Status</p>
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${statusBadge(selectedMessage.status)}`}>
                        {selectedMessage.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Date</p>
                      <p className="text-sm font-medium">
                        {new Date(selectedMessage.created_at).toLocaleString()}
                      </p>
                    </div>
                    {selectedMessage.phone && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Phone</p>
                        <p className="text-sm font-medium">{selectedMessage.phone}</p>
                      </div>
                    )}
                  </div>

                  {/* Subject */}
                  {selectedMessage.subject && (
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1">Subject</p>
                      <p className="text-lg font-medium">{selectedMessage.subject}</p>
                    </div>
                  )}

                  {/* Message */}
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-2">Message</p>
                    <div className="p-4 bg-accent/30 rounded-xl whitespace-pre-wrap">
                      {selectedMessage.message || selectedMessage.project_details}
                    </div>
                  </div>

                  {/* Mockup Design Request */}
                  {selectedMessage.mockup_id && selectedMessage.mockups && (
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-2">Requested Design</p>
                      <a
                        href={`/mockups/${selectedMessage.mockups.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 bg-pink-500/10 border border-pink-500/20 rounded-xl hover:bg-pink-500/20 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          {(selectedMessage.mockups.cover_image_url || selectedMessage.mockups.desktop_screenshot_url) && (
                            <img
                              src={selectedMessage.mockups.cover_image_url || selectedMessage.mockups.desktop_screenshot_url}
                              alt={selectedMessage.mockups.title_en}
                              className="w-20 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <div className="font-bold text-primary-deep">
                              {selectedMessage.mockups.title_en}
                            </div>
                            {selectedMessage.mockups.title_ar && (
                              <div className="text-sm text-muted-foreground">
                                {selectedMessage.mockups.title_ar}
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-pink-500 font-semibold">
                            View Design →
                          </div>
                        </div>
                      </a>
                    </div>
                  )}

                  {/* Additional Fields */}
                  {selectedMessage.company && (
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1">Company</p>
                      <p className="text-sm">{selectedMessage.company}</p>
                    </div>
                  )}
                  {selectedMessage.service_interest && (
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1">Service Interest</p>
                      <p className="text-sm">{selectedMessage.service_interest}</p>
                    </div>
                  )}

                  {/* Attribution Data */}
                  {(selectedMessage.utm_source || selectedMessage.utm_campaign || selectedMessage.utm_medium || 
                    selectedMessage.gclid || selectedMessage.fbclid || selectedMessage.ttclid || 
                    selectedMessage.referrer || selectedMessage.landing_page) && (
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Attribution Data
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                        {selectedMessage.utm_source && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Source</p>
                            <p className="text-sm font-medium">{selectedMessage.utm_source}</p>
                          </div>
                        )}
                        {selectedMessage.utm_medium && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Medium</p>
                            <p className="text-sm font-medium">{selectedMessage.utm_medium}</p>
                          </div>
                        )}
                        {selectedMessage.utm_campaign && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Campaign</p>
                            <p className="text-sm font-medium">{selectedMessage.utm_campaign}</p>
                          </div>
                        )}
                        {selectedMessage.utm_content && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Content</p>
                            <p className="text-sm font-medium">{selectedMessage.utm_content}</p>
                          </div>
                        )}
                        {selectedMessage.utm_term && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Term</p>
                            <p className="text-sm font-medium">{selectedMessage.utm_term}</p>
                          </div>
                        )}
                        {selectedMessage.gclid && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Google Click ID</p>
                            <p className="text-sm font-mono text-xs truncate">{selectedMessage.gclid}</p>
                          </div>
                        )}
                        {selectedMessage.fbclid && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Facebook Click ID</p>
                            <p className="text-sm font-mono text-xs truncate">{selectedMessage.fbclid}</p>
                          </div>
                        )}
                        {selectedMessage.ttclid && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">TikTok Click ID</p>
                            <p className="text-sm font-mono text-xs truncate">{selectedMessage.ttclid}</p>
                          </div>
                        )}
                        {selectedMessage.referrer && (
                          <div className="sm:col-span-2">
                            <p className="text-xs text-muted-foreground mb-0.5">Referrer</p>
                            <a 
                              href={selectedMessage.referrer} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-500 hover:underline flex items-center gap-1 truncate"
                            >
                              {selectedMessage.referrer}
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            </a>
                          </div>
                        )}
                        {selectedMessage.landing_page && (
                          <div className="sm:col-span-2">
                            <p className="text-xs text-muted-foreground mb-0.5">Landing Page</p>
                            <a 
                              href={selectedMessage.landing_page} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-500 hover:underline flex items-center gap-1 truncate"
                            >
                              {selectedMessage.landing_page}
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            </a>
                          </div>
                        )}
                        {selectedMessage.attribution_timestamp && (
                          <div className="sm:col-span-2">
                            <p className="text-xs text-muted-foreground mb-0.5">First Visit</p>
                            <p className="text-sm">{new Date(selectedMessage.attribution_timestamp).toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between p-6 border-t border-border bg-accent/30">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleUpdateStatus(selectedMessage.id, 'read')}
                      variant="outline"
                      size="sm"
                      disabled={selectedMessage.status === 'read'}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Mark as Read
                    </Button>
                    <Button
                      onClick={() => handleUpdateStatus(selectedMessage.id, 'replied')}
                      variant="outline"
                      size="sm"
                      disabled={selectedMessage.status === 'replied'}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Replied
                    </Button>
                    <Button
                      onClick={() => handleUpdateStatus(selectedMessage.id, 'archived')}
                      variant="outline"
                      size="sm"
                      disabled={selectedMessage.status === 'archived'}
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Archive
                    </Button>
                  </div>
                  <Button
                    onClick={() => handleDelete(selectedMessage)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessagesPage;
