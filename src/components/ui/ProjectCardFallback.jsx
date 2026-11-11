import React from 'react';
import * as LucideIcons from 'lucide-react';

/**
 * ProjectCardFallback - Designed fallback visual for missing project covers
 * 
 * Creates a branded fallback using CSS/SVG instead of:
 * - Broken image icons
 * - Stock photos
 * - Generic placeholders
 * 
 * Features:
 * - Browser/device frame with abstract UI
 * - Category icon overlay
 * - Gradient background (category-based color)
 * - Geometric patterns
 * - Clean, professional look
 * 
 * Props:
 * @param {String} projectTitle - Project name
 * @param {String} category - Project category for color theming
 * @param {String} icon - Lucide icon name for the category
 * @param {String} className - Additional CSS classes
 */
const ProjectCardFallback = ({ 
  projectTitle = 'Project', 
  category = 'web-apps',
  icon = 'Code',
  className = '' 
}) => {
  // Get icon component
  const Icon = LucideIcons[icon] || LucideIcons.Folder;

  // Category-based gradient colors
  const gradientMap = {
    'web-apps': 'from-blue-500 via-cyan-500 to-blue-600',
    'mobile': 'from-purple-500 via-pink-500 to-purple-600',
    'erp': 'from-green-500 via-emerald-500 to-green-600',
    'crm': 'from-orange-500 via-amber-500 to-orange-600',
    'ai-chatbots': 'from-pink-500 via-rose-500 to-pink-600',
    'other': 'from-gray-500 via-slate-500 to-gray-600',
    'all': 'from-indigo-500 via-blue-500 to-indigo-600',
  };

  const gradient = gradientMap[category] || gradientMap['other'];

  return (
    <div className={`relative w-full aspect-[16/10] overflow-hidden bg-gradient-to-br ${gradient} ${className}`}>
      {/* Subtle geometric background pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(30deg, transparent 40%, rgba(255,255,255,0.1) 40%, rgba(255,255,255,0.1) 60%, transparent 60%),
            linear-gradient(-30deg, transparent 40%, rgba(255,255,255,0.05) 40%, rgba(255,255,255,0.05) 60%, transparent 60%)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Abstract browser/device frame */}
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="relative w-full max-w-[85%] aspect-[4/3] rounded-lg bg-white/90 backdrop-blur-sm shadow-2xl overflow-hidden">
          {/* Browser chrome */}
          <div className="h-6 bg-white/50 border-b border-gray-200/50 flex items-center gap-1.5 px-3">
            <div className="w-2 h-2 rounded-full bg-red-400/60" />
            <div className="w-2 h-2 rounded-full bg-yellow-400/60" />
            <div className="w-2 h-2 rounded-full bg-green-400/60" />
          </div>

          {/* Abstract UI content */}
          <div className="p-4 space-y-2">
            {/* Header bar */}
            <div className="h-8 bg-gradient-to-r from-gray-200/60 to-gray-100/40 rounded" />
            
            {/* Content blocks */}
            <div className="grid grid-cols-3 gap-2">
              <div className="h-12 bg-gray-100/40 rounded" />
              <div className="h-12 bg-gray-100/40 rounded" />
              <div className="h-12 bg-gray-100/40 rounded" />
            </div>
            
            {/* Text lines */}
            <div className="space-y-1.5 pt-1">
              <div className="h-2 bg-gray-200/50 rounded w-full" />
              <div className="h-2 bg-gray-200/50 rounded w-4/5" />
              <div className="h-2 bg-gray-200/50 rounded w-3/5" />
            </div>
          </div>

          {/* Category icon overlay (centered, large) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 blur-2xl opacity-30">
                <Icon className={`w-24 h-24 text-white`} strokeWidth={1.5} />
              </div>
              {/* Icon */}
              <Icon className={`w-24 h-24 text-white/90 relative`} strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent" />

      {/* Subtle shine effect */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 55%, transparent 100%)',
        }}
      />
    </div>
  );
};

/**
 * ProjectCardFallbackLogo - Simpler fallback for logo-style images
 * Used when cover_fit is 'contain' (for logos that shouldn't be cropped)
 */
export const ProjectCardFallbackLogo = ({ 
  projectTitle = 'Project', 
  icon = 'Code',
  className = '' 
}) => {
  const Icon = LucideIcons[icon] || LucideIcons.Folder;

  return (
    <div className={`relative w-full aspect-[16/10] overflow-hidden bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-800 dark:to-gray-900 ${className}`}>
      {/* Subtle dot pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Center icon with glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Soft glow */}
          <div className="absolute inset-0 blur-3xl opacity-20">
            <div className="w-32 h-32 bg-primary rounded-full" />
          </div>
          
          {/* Icon */}
          <div className="relative w-32 h-32 rounded-2xl bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center border border-gray-200/50 dark:border-gray-700/50">
            <Icon className="w-16 h-16 text-primary" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary/5 to-transparent rounded-tr-full" />
    </div>
  );
};

export default ProjectCardFallback;
