import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Globe, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Github } from 'lucide-react';
import PageHeader from '@/admin/components/PageHeader';
import { useSiteSettings, useUpdateSiteSettings } from '@/hooks/useContent';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const SiteSettingsPage = () => {
  const { toast } = useToast();
  const { data: settings, isLoading } = useSiteSettings();
  const updateSettings = useUpdateSiteSettings();

  const [formData, setFormData] = useState({
    site_name: '',
    tagline: '',
    primary_email: '',
    primary_phone: '',
    whatsapp_number: '',
    address: '',
    facebook_url: '',
    twitter_url: '',
    linkedin_url: '',
    instagram_url: '',
    github_url: '',
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        site_name: settings.site_name || '',
        tagline: settings.tagline || '',
        primary_email: settings.primary_email || '',
        primary_phone: settings.primary_phone || '',
        whatsapp_number: settings.whatsapp_number || '',
        address: settings.address || '',
        facebook_url: settings.facebook_url || '',
        twitter_url: settings.twitter_url || '',
        linkedin_url: settings.linkedin_url || '',
        instagram_url: settings.instagram_url || '',
        github_url: settings.github_url || '',
      });
    }
  }, [settings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateSettings.mutateAsync(formData);
      toast({
        title: 'Settings saved!',
        description: 'Your site settings have been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Site Settings" icon={Settings} />
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-accent rounded-xl" />
          <div className="h-20 bg-accent rounded-xl" />
          <div className="h-20 bg-accent rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Site Settings"
        description="Manage your website's global settings"
        icon={Settings}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* General Information */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              General Information
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Site Name *
                  </label>
                  <input
                    type="text"
                    name="site_name"
                    value={formData.site_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Sentivra"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tagline
                  </label>
                  <input
                    type="text"
                    name="tagline"
                    value={formData.tagline}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="From Ideas to Real Digital Products"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="pt-6 border-t border-border">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Contact Information
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Primary Email *
                  </label>
                  <input
                    type="email"
                    name="primary_email"
                    value={formData.primary_email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="info@sentivra.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Primary Phone
                  </label>
                  <input
                    type="tel"
                    name="primary_phone"
                    value={formData.primary_phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    name="whatsapp_number"
                    value={formData.whatsapp_number}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="+1234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="123 Main St, City, Country"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="pt-6 border-t border-border">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Facebook className="w-5 h-5 text-primary" />
              Social Media Links
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </label>
                  <input
                    type="url"
                    name="facebook_url"
                    value={formData.facebook_url}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="https://facebook.com/sentivra"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </label>
                  <input
                    type="url"
                    name="twitter_url"
                    value={formData.twitter_url}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="https://twitter.com/sentivra"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    name="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="https://linkedin.com/company/sentivra"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </label>
                  <input
                    type="url"
                    name="instagram_url"
                    value={formData.instagram_url}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="https://instagram.com/sentivra"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Github className="w-4 h-4" />
                    GitHub
                  </label>
                  <input
                    type="url"
                    name="github_url"
                    value={formData.github_url}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="https://github.com/sentivra"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-border flex justify-end">
            <Button
              type="submit"
              disabled={updateSettings.isPending}
              className="bg-gradient-to-r from-primary to-secondary text-white px-8"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default SiteSettingsPage;
