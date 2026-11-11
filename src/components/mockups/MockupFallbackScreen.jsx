import React from 'react';
import { LayoutGrid, Menu } from 'lucide-react';

/**
 * MockupFallbackScreen - CSS/SVG wireframe when mockup image is missing
 * 
 * Features:
 * - Category-based gradient colors
 * - Realistic website wireframe (nav, hero, cards, footer)
 * - Responsive to device type
 * - Never shows broken images
 */

// Category color mappings
const categoryColors = {
  'business-corporate': 'from-blue-500 to-blue-600',
  'ecommerce': 'from-green-500 to-emerald-600',
  'restaurant-food': 'from-orange-500 to-amber-600',
  'healthcare': 'from-red-500 to-rose-600',
  'education': 'from-indigo-500 to-purple-600',
  'fitness-wellness': 'from-pink-500 to-rose-600',
  'real-estate': 'from-teal-500 to-cyan-600',
  'portfolio-personal': 'from-purple-500 to-violet-600',
  'other': 'from-gray-500 to-slate-600',
  'default': 'from-primary to-primary-dark',
};

const MockupFallbackScreen = ({ category, title, type = 'desktop' }) => {
  // Get gradient based on category
  const getGradient = () => {
    const categorySlug = category?.toLowerCase().replace(/\s+&\s+/g, '-').replace(/\s+/g, '-');
    return categoryColors[categorySlug] || categoryColors.default;
  };

  const gradientClass = getGradient();

  // Desktop wireframe
  if (type === 'desktop') {
    return (
      <div className="w-full h-full bg-gradient-to-br from-frost-soft to-white dark:from-gray-900 dark:to-gray-800 p-4 flex flex-col">
        {/* Nav bar */}
        <div className="w-full h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-sm flex items-center justify-between px-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradientClass}`} />
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-12 h-2 bg-gray-300 dark:bg-gray-700 rounded-full" />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>

        {/* Hero section */}
        <div className="flex-1 bg-gradient-to-br from-white/60 to-gray-100/60 dark:from-gray-800/60 dark:to-gray-900/60 rounded-lg p-6 mb-4 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradientClass} mx-auto mb-4 flex items-center justify-center`}>
              <LayoutGrid className="w-8 h-8 text-white" />
            </div>
            <div className="w-48 h-4 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-2" />
            <div className="w-64 h-3 bg-gray-200 dark:bg-gray-600 rounded-full mx-auto mb-2" />
            <div className="w-56 h-3 bg-gray-200 dark:bg-gray-600 rounded-full mx-auto mb-4" />
            <div className="flex gap-2 justify-center">
              <div className={`w-24 h-8 rounded bg-gradient-to-r ${gradientClass}`} />
              <div className="w-24 h-8 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-3 shadow-sm">
              <div className={`w-full aspect-video rounded bg-gradient-to-br ${gradientClass} mb-2`} />
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-1" />
              <div className="w-3/4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="w-full h-16 bg-gray-800 dark:bg-gray-950 rounded-lg flex items-center justify-center">
          <div className="flex gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-6 h-6 rounded bg-gray-700" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Tablet wireframe
  if (type === 'tablet') {
    return (
      <div className="w-full h-full bg-gradient-to-br from-frost-soft to-white dark:from-gray-900 dark:to-gray-800 p-3 flex flex-col">
        {/* Nav */}
        <div className="w-full h-10 bg-white/80 dark:bg-gray-800/80 rounded-lg flex items-center justify-between px-3 mb-3">
          <div className={`w-6 h-6 rounded bg-gradient-to-br ${gradientClass}`} />
          <Menu className="w-5 h-5 text-gray-400" />
        </div>

        {/* Hero */}
        <div className="flex-1 bg-gradient-to-br from-white/60 to-gray-100/60 dark:from-gray-800/60 dark:to-gray-900/60 rounded-lg p-4 mb-3 flex flex-col items-center justify-center">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientClass} mb-3`} />
          <div className="w-32 h-3 bg-gray-300 dark:bg-gray-700 rounded-full mb-2" />
          <div className="w-40 h-2 bg-gray-200 dark:bg-gray-600 rounded-full mb-2" />
          <div className={`w-20 h-6 rounded bg-gradient-to-r ${gradientClass} mt-3`} />
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 gap-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-2">
              <div className={`w-full aspect-square rounded bg-gradient-to-br ${gradientClass} mb-2`} />
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Mobile wireframe
  if (type === 'mobile') {
    return (
      <div className="w-full h-full bg-gradient-to-br from-frost-soft to-white dark:from-gray-900 dark:to-gray-800 p-2 flex flex-col">
        {/* Status bar */}
        <div className="w-full h-6 flex items-center justify-between px-2 mb-2">
          <div className="text-[10px] font-semibold text-gray-900 dark:text-gray-100">9:41</div>
          <div className="flex gap-1">
            <div className="w-4 h-2 bg-gray-400 dark:bg-gray-600 rounded-sm" />
          </div>
        </div>

        {/* Header */}
        <div className="w-full h-12 bg-white/80 dark:bg-gray-800/80 rounded-lg flex items-center justify-between px-3 mb-2">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradientClass}`} />
          <Menu className="w-4 h-4 text-gray-400" />
        </div>

        {/* Hero */}
        <div className="w-full bg-gradient-to-br from-white/60 to-gray-100/60 dark:from-gray-800/60 dark:to-gray-900/60 rounded-lg p-3 mb-2 text-center">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradientClass} mx-auto mb-2`} />
          <div className="w-24 h-2 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-1" />
          <div className="w-28 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full mx-auto mb-2" />
          <div className={`w-16 h-5 rounded bg-gradient-to-r ${gradientClass} mx-auto`} />
        </div>

        {/* Content cards */}
        <div className="space-y-2 flex-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-2 flex gap-2">
              <div className={`w-16 h-16 rounded bg-gradient-to-br ${gradientClass} flex-shrink-0`} />
              <div className="flex-1">
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mb-1" />
                <div className="w-3/4 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom nav */}
        <div className="w-full h-12 bg-white/80 dark:bg-gray-800/80 rounded-lg flex items-center justify-around mt-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`w-6 h-6 rounded ${i === 0 ? `bg-gradient-to-br ${gradientClass}` : 'bg-gray-300 dark:bg-gray-700'}`} />
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default MockupFallbackScreen;
