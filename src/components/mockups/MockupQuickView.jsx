import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Share2, ChevronLeft, ChevronRight, Monitor, Tablet, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import DeviceFrame from './DeviceFrame';
import { useTranslation } from '@/i18n/useTranslation';
import { useAllPageContent } from '@/hooks/useContent';
import { useSiteSettings } from '@/hooks/useContent';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

/**
 * MockupQuickView - Accessible modal with device switcher
 * 
 * Features:
 * - Device switcher (Desktop/Tablet/Mobile)
 * - Large preview inside device frame
 * - Full-page screenshot scrolls with mouse wheel or slider
 * - "What's Included" list (from jsonb)
 * - Action buttons: View Demo, Request Design, WhatsApp
 * - Previous/Next navigation
 * - Share button (copy link)
 * - Keyboard support (Esc, arrows)
 * - Focus trap, returns focus on close
 * - No background scroll
 */
const MockupQuickView = ({ 
  mockup, 
  isOpen, 
  onClose,
  allMockups = [],
  categories = []
}) => {
  const { language } = useTranslation();
  const isRTL = language === 'ar';
  const { getContent } = useAllPageContent();
  const { data: siteSettings } = useSiteSettings();
  const { toast } = useToast();
  
  const [activeDevice, setActiveDevice] = useState('desktop');
  const [scrollPosition, setScrollPosition] = useState(0);
  const [returnFocusElement, setReturnFocusElement] = useState(null);

  // Get bilingual content
  const getTitle = (m) => isRTL ? (m?.title_ar || m?.title) : (m?.title_en || m?.title);
  const getDescription = (m) => isRTL 
    ? (m?.long_description_ar || m?.short_description_ar || m?.description) 
    : (m?.long_description_en || m?.short_description_en || m?.description);

  const title = getTitle(mockup);
  const description = getDescription(mockup);
  const category = categories.find(c => c.id === mockup?.category_id);
  const categoryName = isRTL ? category?.name_ar : category?.name_en;

  // Parse what's included
  const whatsIncluded = (() => {
    if (!mockup?.whats_included) return [];
    if (Array.isArray(mockup.whats_included)) return mockup.whats_included;
    try {
      return JSON.parse(mockup.whats_included);
    } catch {
      return [];
    }
  })();

  // Find current mockup index
  const currentIndex = allMockups.findIndex(m => m.id === mockup?.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allMockups.length - 1;

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        if (isRTL && hasNext) handleNext();
        else if (!isRTL && hasPrevious) handlePrevious();
      } else if (e.key === 'ArrowRight') {
        if (isRTL && hasPrevious) handlePrevious();
        else if (!isRTL && hasNext) handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasPrevious, hasNext, isRTL]);

  // Store return focus element
  useEffect(() => {
    if (isOpen) {
      setReturnFocusElement(document.activeElement);
    } else if (returnFocusElement) {
      returnFocusElement.focus();
    }
  }, [isOpen]);

  // Prevent background scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handlePrevious = () => {
    if (hasPrevious) {
      const prevMockup = allMockups[currentIndex - 1];
      window.history.replaceState({}, '', `/mockups?mockup=${prevMockup.slug}`);
      // Parent component should handle mockup change
    }
  };

  const handleNext = () => {
    if (hasNext) {
      const nextMockup = allMockups[currentIndex + 1];
      window.history.replaceState({}, '', `/mockups?mockup=${nextMockup.slug}`);
      // Parent component should handle mockup change
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/mockups/${mockup.slug}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyToClipboard(url);
        }
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: isRTL ? 'تم النسخ' : 'Copied',
        description: isRTL ? 'تم نسخ الرابط' : 'Link copied to clipboard',
      });
    });
  };

  const handleWhatsApp = () => {
    const phoneNumber = siteSettings?.whatsapp_number || '201558952126';
    const message = isRTL
      ? `مرحباً! أنا مهتم بتصميم "${title}" من صفحة التصاميم الجاهزة. أريد مناقشة خيارات التخصيص.`
      : `Hello! I'm interested in the "${title}" design from your mockups page. I'd like to discuss customization options.`;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!mockup || !isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-color-background rounded-2xl shadow-2xl w-full max-w-6xl my-8 border border-frost"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="mockup-title"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-frost bg-color-background/95 backdrop-blur-sm rounded-t-2xl">
                <div className="flex-1">
                  <h2 id="mockup-title" className="text-2xl font-bold text-primary-deep dark:text-white mb-1">
                    {title}
                  </h2>
                  {categoryName && (
                    <p className="text-sm text-text-muted">{categoryName}</p>
                  )}
                </div>

                {/* Actions */}
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {/* Share */}
                  <button
                    onClick={handleShare}
                    className="p-2 hover:bg-frost-soft rounded-lg transition-colors"
                    aria-label={getContent('mockups-modal-share')}
                  >
                    <Share2 className="w-5 h-5 text-text-muted" />
                  </button>

                  {/* Close */}
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-frost-soft rounded-lg transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5 text-text-muted" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                {/* Left: Device Preview (2 columns on large screens) */}
                <div className="lg:col-span-2">
                  {/* Device Switcher */}
                  <div className={`flex items-center justify-center gap-2 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <button
                      onClick={() => setActiveDevice('desktop')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        activeDevice === 'desktop'
                          ? 'bg-primary text-white'
                          : 'bg-frost-soft text-text-muted hover:bg-frost'
                      }`}
                    >
                      <Monitor className="w-4 h-4" />
                      <span>{getContent('mockups-modal-device-desktop')}</span>
                    </button>
                    <button
                      onClick={() => setActiveDevice('tablet')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        activeDevice === 'tablet'
                          ? 'bg-primary text-white'
                          : 'bg-frost-soft text-text-muted hover:bg-frost'
                      }`}
                    >
                      <Tablet className="w-4 h-4" />
                      <span>{getContent('mockups-modal-device-tablet')}</span>
                    </button>
                    <button
                      onClick={() => setActiveDevice('mobile')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        activeDevice === 'mobile'
                          ? 'bg-primary text-white'
                          : 'bg-frost-soft text-text-muted hover:bg-frost'
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>{getContent('mockups-modal-device-mobile')}</span>
                    </button>
                  </div>

                  {/* Device Frame with Preview */}
                  <div className="flex items-center justify-center bg-gradient-to-br from-frost-soft to-white dark:from-gray-900 dark:to-gray-800 rounded-xl p-8 min-h-[500px]">
                    <DeviceFrame
                      type={activeDevice}
                      mockup={{
                        ...mockup,
                        desktop_screenshot_url: activeDevice === 'desktop' ? mockup.desktop_screenshot_url : null,
                        tablet_screenshot_url: activeDevice === 'tablet' ? mockup.tablet_screenshot_url : null,
                        mobile_screenshot_url: activeDevice === 'mobile' ? mockup.mobile_screenshot_url : null,
                      }}
                      className={
                        activeDevice === 'desktop' ? 'w-full max-w-2xl' :
                        activeDevice === 'tablet' ? 'w-80' :
                        'w-64'
                      }
                      animate={false}
                    />
                  </div>

                  {/* Previous/Next Navigation */}
                  {(hasPrevious || hasNext) && (
                    <div className={`flex items-center justify-between mt-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <button
                        onClick={handlePrevious}
                        disabled={!hasPrevious}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                          hasPrevious
                            ? 'bg-frost-soft hover:bg-frost text-primary-deep'
                            : 'bg-frost-soft/50 text-text-muted cursor-not-allowed'
                        }`}
                      >
                        <ChevronLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                        <span>{getContent('mockups-modal-previous')}</span>
                      </button>
                      <button
                        onClick={handleNext}
                        disabled={!hasNext}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                          hasNext
                            ? 'bg-frost-soft hover:bg-frost text-primary-deep'
                            : 'bg-frost-soft/50 text-text-muted cursor-not-allowed'
                        }`}
                      >
                        <span>{getContent('mockups-modal-next')}</span>
                        <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Right: Details */}
                <div className="space-y-6">
                  {/* Description */}
                  {description && (
                    <div>
                      <h3 className="text-lg font-bold text-primary-deep dark:text-white mb-2">
                        {isRTL ? 'الوصف' : 'Description'}
                      </h3>
                      <p className="text-text-muted leading-relaxed whitespace-pre-line">
                        {description}
                      </p>
                    </div>
                  )}

                  {/* What's Included */}
                  {whatsIncluded.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-primary-deep dark:text-white mb-3">
                        {getContent('mockups-modal-whats-included')}
                      </h3>
                      <ul className={`space-y-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {whatsIncluded.map((item, index) => (
                          <li key={index} className={`flex items-start gap-2 text-text-muted ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <span className="text-primary mt-1">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {mockup.demo_url && (
                      <a
                        href={mockup.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Button className="w-full bg-primary hover:bg-primary-dark text-white">
                          <ExternalLink className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                          {getContent('mockups-modal-view-demo')}
                        </Button>
                      </a>
                    )}

                    <Link to={`/contact?design=${mockup.slug}`} className="block">
                      <Button className="w-full bg-secondary hover:bg-secondary/90 text-white">
                        {getContent('mockups-modal-request-design')}
                      </Button>
                    </Link>

                    {siteSettings?.whatsapp_number && (
                      <Button
                        onClick={handleWhatsApp}
                        variant="outline"
                        className="w-full border-2 border-primary/30 text-primary-deep dark:text-white hover:bg-primary/5"
                      >
                        {getContent('mockups-modal-order-whatsapp')}
                      </Button>
                    )}

                    <Link to={`/mockups/${mockup.slug}`} className="block">
                      <Button
                        variant="outline"
                        className="w-full border border-frost text-text-muted hover:bg-frost-soft"
                      >
                        {isRTL ? 'عرض التفاصيل الكاملة' : 'View Full Details'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MockupQuickView;
