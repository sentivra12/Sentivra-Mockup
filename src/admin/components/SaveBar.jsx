import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * SaveBar - A sticky bottom bar that appears when there are unsaved changes
 * 
 * Features:
 * - Always visible when there are changes (even when disabled shows where it is)
 * - Sticks to bottom above floating buttons
 * - Shows clear unsaved changes indicator
 * - Works with reduced motion
 * - RTL-aware
 * - Safe-area aware for mobile
 * 
 * Usage:
 * const [hasChanges, setHasChanges] = useState(false);
 * <SaveBar 
 *   hasChanges={hasChanges}
 *   onSave={handleSave}
 *   onDiscard={handleDiscard}
 *   isSaving={mutation.isPending}
 * />
 */
const SaveBar = ({ 
  hasChanges = false, 
  onSave, 
  onDiscard, 
  isSaving = false,
  saveText = 'Save changes',
  discardText = 'Discard'
}) => {
  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (!hasChanges) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  // Keyboard shortcut: Ctrl/Cmd+S to save
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (hasChanges && !isSaving && onSave) {
          onSave();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [hasChanges, isSaving, onSave]);

  // Always show the bar (even when disabled) so users know where it is
  // When no changes, show it as disabled/dimmed
  const variants = {
    hidden: {
      y: 100,
      opacity: 0
    },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  // For reduced motion, just fade in/out without sliding
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animationVariants = prefersReducedMotion 
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : variants;

  return (
    <AnimatePresence>
      {/* Always render when there are changes OR show briefly on mount to indicate location */}
      <motion.div
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={animationVariants}
        transition={{ duration: 0.2 }}
        className={`fixed bottom-0 left-0 right-0 z-40 ${hasChanges ? '' : 'pointer-events-none'}`}
        style={{
          // Safe area for mobile notches/home indicators
          paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }}
      >
        {/* Elevated bar with shadow */}
        <div className={`
          border-t border-border
          bg-card/95 backdrop-blur-lg
          shadow-[0_-4px_12px_rgba(0,0,0,0.1)]
          dark:shadow-[0_-4px_12px_rgba(0,0,0,0.3)]
          ${hasChanges ? '' : 'opacity-30'}
        `}>
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Unsaved changes indicator */}
              <div className="flex items-center gap-3">
                {hasChanges && (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 bg-orange-500 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Unsaved changes
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Press Ctrl+S or click Save to apply changes
                      </p>
                    </div>
                  </>
                )}
                {!hasChanges && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm">
                      Save bar will appear here when you make changes
                    </p>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                {hasChanges && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onDiscard}
                      disabled={isSaving}
                      className="min-w-[100px]"
                    >
                      <X className="w-4 h-4 mr-2" />
                      {discardText}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={onSave}
                      disabled={isSaving}
                      className="bg-gradient-to-r from-primary to-secondary text-white min-w-[120px]"
                    >
                      {isSaving ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"
                          />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {saveText}
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SaveBar;
