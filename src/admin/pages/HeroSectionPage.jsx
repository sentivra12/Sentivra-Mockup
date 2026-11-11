import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, Save } from 'lucide-react';
import PageHeader from '@/admin/components/PageHeader';
import SaveBar from '@/admin/components/SaveBar';
import { useFormDirty } from '@/admin/hooks/useFormDirty';
import MediaUploadField from '@/components/MediaUploadField';
import { useHero, useUpdateHero } from '@/hooks/useContent';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const HeroSectionPage = () => {
  const { toast } = useToast();
  const { data: hero, isLoading } = useHero();
  const updateHero = useUpdateHero();

  const [formData, setFormData] = useState({
    headline: '',
    subheadline: '',
    cta_primary_text: '',
    cta_primary_link: '',
    cta_secondary_text: '',
    cta_secondary_link: '',
    video_url: '',
    video_webm_url: '',
    video_poster_url: '',
    is_active: true,
  });

  useEffect(() => {
    if (hero) {
      setFormData({
        headline: hero.headline || '',
        subheadline: hero.subheadline || '',
        cta_primary_text: hero.cta_primary_text || '',
        cta_primary_link: hero.cta_primary_link || '',
        cta_secondary_text: hero.cta_secondary_text || '',
        cta_secondary_link: hero.cta_secondary_link || '',
        video_url: hero.video_url || '',
        video_webm_url: hero.video_webm_url || '',
        video_poster_url: hero.video_poster_url || '',
        is_active: hero.is_active !== undefined ? hero.is_active : true,
      });
    }
  }, [hero]);

  // Track dirty state
  const { isDirty, markClean, resetToInitial } = useFormDirty(formData, hero);

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
      await updateHero.mutateAsync(formData);
      toast({
        title: 'Hero section updated!',
        description: 'The homepage hero section has been updated successfully.',
      });
      markClean();
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

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Hero Section" icon={Globe} />
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
        title="Hero Section"
        description="Manage the homepage hero banner content"
        icon={Globe}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Headline & Subheadline */}
          <div>
            <h3 className="text-lg font-bold mb-4">Main Content</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Headline *
                </label>
                <input
                  type="text"
                  name="headline"
                  value={formData.headline}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="From Ideas to Real Digital Products"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Subheadline
                </label>
                <input
                  type="text"
                  name="subheadline"
                  value={formData.subheadline}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="We transform your business ideas into powerful software solutions"
                />
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="pt-6 border-t border-border">
            <h3 className="text-lg font-bold mb-4">Call-to-Action Buttons</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Primary Button Text
                  </label>
                  <input
                    type="text"
                    name="cta_primary_text"
                    value={formData.cta_primary_text}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Get Started"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Primary Button Link
                  </label>
                  <input
                    type="text"
                    name="cta_primary_link"
                    value={formData.cta_primary_link}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="/contact"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Secondary Button Text
                  </label>
                  <input
                    type="text"
                    name="cta_secondary_text"
                    value={formData.cta_secondary_text}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="View Our Work"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Secondary Button Link
                  </label>
                  <input
                    type="text"
                    name="cta_secondary_link"
                    value={formData.cta_secondary_link}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="/our-work"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Background Video */}
          <div className="pt-6 border-t border-border">
            <h3 className="text-lg font-bold mb-4">Background Video</h3>
            <div className="space-y-6">
              <MediaUploadField
                label="Video (MP4)"
                value={formData.video_url}
                onChange={(url) => setFormData({ ...formData, video_url: url })}
                accept="video/mp4"
                fileType="video"
                helperText="Main video file. Recommended: under 10MB for fast loading."
              />

              <MediaUploadField
                label="Video (WebM) - Optional"
                value={formData.video_webm_url}
                onChange={(url) => setFormData({ ...formData, video_webm_url: url })}
                accept="video/webm"
                fileType="video"
                helperText="Alternative format for better browser compatibility."
              />

              <MediaUploadField
                label="Video Poster (Thumbnail)"
                value={formData.video_poster_url}
                onChange={(url) => setFormData({ ...formData, video_poster_url: url })}
                accept="image/*"
                fileType="image"
                helperText="Image shown before video loads."
              />

              {/* Video Preview */}
              {formData.video_url && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Live Preview
                  </label>
                  <div className="aspect-video bg-accent/30 rounded-xl border-2 border-dashed border-frost overflow-hidden">
                    <video
                      src={formData.video_url}
                      poster={formData.video_poster_url}
                      className="w-full h-full object-cover"
                      controls
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Active Toggle */}
          <div className="pt-6 border-t border-border">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-5 h-5 rounded border-border"
              />
              <span className="text-sm font-medium">
                Active (Show hero section on homepage)
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-border flex justify-end">
            <Button
              type="submit"
              disabled={updateHero.isPending}
              className="bg-primary-strong text-white px-8 hover:bg-primary-dark focus-visible:ring-2 focus-visible:ring-primary-strong focus-visible:ring-offset-2"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateHero.isPending ? 'Saving...' : 'Save Hero Section'}
            </Button>
          </div>
        </form>
      </motion.div>

      {/* SaveBar */}
      <SaveBar
        isDirty={isDirty}
        onSave={handleSubmit}
        onDiscard={handleDiscard}
        isSaving={updateHero.isPending}
      />
    </div>
  );
};

export default HeroSectionPage;
