import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const PageHeader = ({ title, description, action, actionLabel, icon: Icon }) => {
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

      {action && (
        <Button
          onClick={action}
          className="bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          {actionLabel || 'Add New'}
        </Button>
      )}
    </motion.div>
  );
};

export default PageHeader;
