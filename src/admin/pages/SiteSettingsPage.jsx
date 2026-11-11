import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Globe, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Github, BarChart3, Eye, EyeOff } from 'lucide-react';
import PageHeader from '@/admin/components/PageHeader';
import SaveBar from '@/admin/components/SaveBar';
import { useFormDirty } from '@/admin/hooks/useFormDirty';
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
    meta_pixel_id: '',
    ga4_measurement_id: '',
    google_ads_id: '',
    google_ads_conversion_label: '',
    tiktok_pixel_id: '',
    enable_cookie_banner: false,
  });

  // Track dirty state
  const { isDirty, markClean, resetToInitial } = useFormDirty(formData, settings);

  const [showTrackingIds, setShowTrackingIds] = useState({
    meta_pixel_id: false,
    ga4_measurement_id: false,
    google_ads_id: false,
    google_ads_conversion_label: false,
    tiktok_pixel_id: false,
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
        meta_pixel_id: settings.meta_pixel_id || '',
        ga4_measurement_id: settings.ga4_measurement_id || '',
        google_ads_id: settings.google_ads_id || '',
        google_ads_conversion_label: settings.google_ads_conversion_label || '',
        tiktok_pixel_id: settings.tiktok_pixel_id || '',
        enable_cookie_banner: settings.enable_cookie_banner || false,
      });
    }
  }, [settings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const toggleShowTrackingId = (field) => {
    setShowTrackingIds(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    try {
      await updateSettings.mutateAsync(formData);
      markClean(formData); // Mark as clean after successful save
      toast({
        title: 'Settings saved!',
        description: 'Your site settings have been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save settings',
        variant: 'destructive',
      });
    }
  };

  const handleDiscard = () => {
    const initialData = resetToInitial();
    if (initialData) {
      setFormData(initialData);
    }
    toast({
      title: 'Changes discarded',
      description: 'Form reset to last saved state.',
    });
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

          {/* Analytics & Tracking */}
          <div className="pt-6 border-t border-border">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Analytics & Tracking
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Configure tracking pixels and analytics IDs. Leave blank to disable a platform. IDs are masked for security.
            </p>
            
            <div className="space-y-4">
              {/* Meta Pixel ID */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Meta Pixel ID
                </label>
                <div className="relative">
                  <input
                    type={showTrackingIds.meta_pixel_id ? "text" : "password"}
                    name="meta_pixel_id"
                    value={formData.meta_pixel_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 pr-10 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm"
                    placeholder="1234567890123456"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowTrackingId('meta_pixel_id')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showTrackingIds.meta_pixel_id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Find in Meta Events Manager → Data Sources → Your Pixel
                </p>
              </div>

              {/* GA4 Measurement ID */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Google Analytics 4 Measurement ID
                </label>
                <div className="relative">
                  <input
                    type={showTrackingIds.ga4_measurement_id ? "text" : "password"}
                    name="ga4_measurement_id"
                    value={formData.ga4_measurement_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 pr-10 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm"
                    placeholder="G-XXXXXXXXXX"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowTrackingId('ga4_measurement_id')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showTrackingIds.ga4_measurement_id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Find in GA4 Admin → Data Streams → Your Web Stream → Measurement ID
                </p>
              </div>

              {/* Google Ads ID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Google Ads ID
                  </label>
                  <div className="relative">
                    <input
                      type={showTrackingIds.google_ads_id ? "text" : "password"}
                      name="google_ads_id"
                      value={formData.google_ads_id}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 pr-10 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm"
                      placeholder="AW-123456789"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowTrackingId('google_ads_id')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showTrackingIds.google_ads_id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Find in Google Ads → Tools → Conversions → Tag Setup
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Google Ads Conversion Label
                  </label>
                  <div className="relative">
                    <input
                      type={showTrackingIds.google_ads_conversion_label ? "text" : "password"}
                      name="google_ads_conversion_label"
                      value={formData.google_ads_conversion_label}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 pr-10 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm"
                      placeholder="AbC123dEfGhIjKlMnOp"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowTrackingId('google_ads_conversion_label')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showTrackingIds.google_ads_conversion_label ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Conversion label from your conversion action
                  </p>
                </div>
              </div>

              {/* TikTok Pixel ID */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  TikTok Pixel ID
                </label>
                <div className="relative">
                  <input
                    type={showTrackingIds.tiktok_pixel_id ? "text" : "password"}
                    name="tiktok_pixel_id"
                    value={formData.tiktok_pixel_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 pr-10 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm"
                    placeholder="C1234567890ABCDEFGHIJ"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowTrackingId('tiktok_pixel_id')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showTrackingIds.tiktok_pixel_id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Find in TikTok Ads Manager → Assets → Events → Web Events → Your Pixel
                </p>
              </div>

              {/* Cookie Banner Toggle */}
              <div className="flex items-center gap-3 p-4 bg-accent/50 rounded-xl">
                <input
                  type="checkbox"
                  id="enable_cookie_banner"
                  name="enable_cookie_banner"
                  checked={formData.enable_cookie_banner}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary/50"
                />
                <label htmlFor="enable_cookie_banner" className="text-sm font-medium cursor-pointer">
                  Enable Cookie Consent Banner
                </label>
              </div>
              <p className="text-xs text-muted-foreground -mt-2 ml-8">
                Show a cookie consent banner before loading tracking scripts (required for GDPR compliance)
              </p>
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

      {/* SaveBar */}
      <SaveBar
        isDirty={isDirty}
        onSave={() => handleSubmit()}
        onDiscard={handleDiscard}
        isSaving={updateSettings.isPending}
      />
    </div>
  );
};

export default SiteSettingsPage;
