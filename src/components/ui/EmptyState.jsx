import React from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Search, 
  Loader2, 
  AlertCircle, 
  MessageSquare,
  Image as ImageIcon,
  FileText,
  Inbox
} from 'lucide-react';
import { Button } from './button';
import { GlassCard } from './GlassCard';

const iconMap = {
  briefcase: Briefcase,
  search: Search,
  loader: Loader2,
  alert: AlertCircle,
  message: MessageSquare,
  image: ImageIcon,
  file: FileText,
  inbox: Inbox,
};

/**
 * EmptyState - Reusable empty state component
 * Shows helpful message when content is missing
 */
export function EmptyState({
  icon = 'inbox',
  title,
  description,
  action,
  actionLabel,
  className = '',
  glass = false,
}) {
  const Icon = typeof icon === 'string' ? iconMap[icon] : icon;

  const content = (
    <div className={`text-center py-12 px-4 ${className}`}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Icon className="w-16 h-16 mx-auto mb-4 text-color-text-muted opacity-50" />
      </motion.div>
      
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <h3 className="text-xl font-semibold text-color-text mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-color-text-muted max-w-md mx-auto mb-6">
            {description}
          </p>
        )}
        {action && actionLabel && (
          <Button onClick={action}>
            {actionLabel}
          </Button>
        )}
      </motion.div>
    </div>
  );

  if (glass) {
    return (
      <GlassCard className="col-span-full">
        {content}
      </GlassCard>
    );
  }

  return content;
}

/**
 * LoadingState - Loading indicator
 */
export function LoadingState({ message = 'Loading...', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
      <p className="text-color-text-muted">{message}</p>
    </div>
  );
}

/**
 * ErrorState - Error with retry option
 */
export function ErrorState({ 
  message = 'Something went wrong', 
  description = 'We couldn\'t load the content. Please try again.',
  onRetry,
  className = '' 
}) {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
      <h3 className="text-lg font-semibold text-color-text mb-2">
        {message}
      </h3>
      <p className="text-color-text-muted mb-4 max-w-md mx-auto">
        {description}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  );
}

/**
 * NoResults - Empty search/filter results
 */
export function NoResults({ query, onClear, className = '' }) {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      <Search className="w-12 h-12 mx-auto mb-4 text-color-text-muted opacity-50" />
      <h3 className="text-lg font-semibold text-color-text mb-2">
        No results found
      </h3>
      <p className="text-color-text-muted mb-4">
        {query ? (
          <>No results for <span className="font-medium">"{query}"</span>. Try different keywords.</>
        ) : (
          'No items match your filters. Try adjusting your search.'
        )}
      </p>
      {onClear && (
        <Button onClick={onClear} variant="ghost">
          Clear Filters
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
