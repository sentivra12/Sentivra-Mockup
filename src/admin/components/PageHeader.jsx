import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const PageHeader = ({ title, description, action, actionLabel, icon: Icon }) => {
  // Support THREE patterns:
  // 1. action={handleClick} (function) - renders default button
  // 2. action={<CustomButtons />} (React element) - renders as-is
  // 3. action={{ label, onClick }} (object) - renders button with config
  const isActionFunction = typeof action === 'function';
  const isActionElement = React.isValidElement(action);
  const isActionObject = action && typeof action === 'object' && !isActionElement && !Array.isArray(action);

  // Dev mode: warn if action is invalid
  if (process.env.NODE_ENV === 'development' && action) {
    if (!isActionFunction && !isActionElement && !isActionObject) {
      console.error(
        '[PageHeader] Invalid action prop. Expected function, React element, or object { label, onClick }, got:',
        typeof action,
        action
      );
    }
    if (isActionObject && typeof action.onClick !== 'function') {
      console.error(
        '[PageHeader] action.onClick must be a function, got:',
        typeof action.onClick,
        action.onClick
      );
    }
  }

  // If action is already a valid React element, use it directly
  if (isActionElement) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-xl">
              <Icon className="w-6 h-6 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {title}
            </h1>
            {description && (
              <p className="text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>
        {action}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-xl">
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>

      {action && !isActionElement && (
        <>
          {isActionObject ? (
            // Pattern 3: Config object { label, onClick }
            <Button
              onClick={action.onClick}
              className="bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl transition-all min-h-[44px]"
            >
              <Plus className="w-4 h-4 mr-2" />
              {action.label || actionLabel || 'Add New'}
            </Button>
          ) : isActionFunction ? (
            // Pattern 1: Direct function
            <Button
              onClick={action}
              className="bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl transition-all min-h-[44px]"
            >
              <Plus className="w-4 h-4 mr-2" />
              {actionLabel || 'Add New'}
            </Button>
          ) : null}
        </>
      )}
    </motion.div>
  );
};

export default PageHeader;
