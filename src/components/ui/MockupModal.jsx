import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '../../i18n/useTranslation';

const MockupModal = ({ mockup, isOpen, onClose, onRequestDesign }) => {
  const { t, language } = useTranslation();
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Prevent background scroll
      document.body.style.overflow = 'hidden';
      
      // Focus the close button when modal opens
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);

      // Handle Escape key
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);

      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  // Handle click outside modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Focus trap
  const handleTabKey = (e) => {
    if (e.key !== 'Tab') return;

    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (!focusableElements || focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  if (!mockup) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
          onKeyDown={handleTabKey}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, type: 'spring', damping: 25 }}
            className="relative bg-color-background rounded-2xl shadow-lg-primary max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className={`absolute top-4 ${language === 'ar' ? 'left-4' : 'right-4'} z-10 bg-color-background/90 hover:bg-color-background rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110`}
              aria-label={t('mockups.modal.close')}
            >
              <X className="h-6 w-6 text-text-muted" />
            </button>

            {/* Image */}
            <div className="relative w-full h-[400px] bg-frost-soft overflow-hidden rounded-t-2xl">
              <img
                src={mockup.image}
                alt={mockup.title}
                className="w-full h-full object-cover"
                width="800"
                height="400"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <h2 
                    id="modal-title"
                    className="text-3xl font-bold text-primary-deep"
                  >
                    {mockup.title}
                  </h2>
                  <span className="px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full whitespace-nowrap">
                    {mockup.category}
                  </span>
                </div>
                <p className="text-lg text-text-muted leading-relaxed">
                  {mockup.description}
                </p>
              </div>

              {/* Additional Info */}
              <div className="bg-frost-soft rounded-lg p-6 space-y-3">
                <h3 className="font-bold text-primary-deep">{t('mockups.modal.whatsIncluded')}</h3>
                <ul className="space-y-2 text-text-muted">
                  <li className={`flex items-start gap-2 ${language === 'ar' ? 'flex-row-reverse text-right' : ''}`}>
                    <span className="text-primary mt-1">✓</span>
                    <span>{t('mockups.modal.feature1')}</span>
                  </li>
                  <li className={`flex items-start gap-2 ${language === 'ar' ? 'flex-row-reverse text-right' : ''}`}>
                    <span className="text-primary mt-1">✓</span>
                    <span>{t('mockups.modal.feature2')}</span>
                  </li>
                  <li className={`flex items-start gap-2 ${language === 'ar' ? 'flex-row-reverse text-right' : ''}`}>
                    <span className="text-primary mt-1">✓</span>
                    <span>{t('mockups.modal.feature3')}</span>
                  </li>
                  <li className={`flex items-start gap-2 ${language === 'ar' ? 'flex-row-reverse text-right' : ''}`}>
                    <span className="text-primary mt-1">✓</span>
                    <span>{t('mockups.modal.feature4')}</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className={`flex flex-col sm:flex-row gap-4 pt-4 ${language === 'ar' ? 'sm:flex-row-reverse' : ''}`}>
                {mockup.demoUrl && (
                  <a 
                    href={mockup.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      className={`w-full border-2 border-primary text-primary hover:bg-primary hover:text-white px-6 py-3 rounded-lg group ${language === 'ar' ? 'flex-row-reverse' : ''}`}
                    >
                      {t('mockups.modal.viewDemo')}
                      <ExternalLink className={`h-5 w-5 ${language === 'ar' ? 'mr-2' : 'ml-2'} group-hover:translate-x-1 transition-transform`} />
                    </Button>
                  </a>
                )}
                <Button
                  onClick={() => {
                    onRequestDesign(mockup);
                    onClose();
                  }}
                  size="lg"
                  className={`flex-1 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg group ${language === 'ar' ? 'flex-row-reverse' : ''}`}
                >
                  {t('mockups.modal.requestDesign')}
                  <ArrowRight className={`h-5 w-5 ${language === 'ar' ? 'mr-2 group-hover:-translate-x-1 rotate-180' : 'ml-2 group-hover:translate-x-1'} transition-transform`} />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MockupModal;


