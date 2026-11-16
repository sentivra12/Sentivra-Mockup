/**
 * Lucide React icon map - explicit imports to avoid barrel import bloat
 * 
 * This file imports only the icons actually used in the database,
 * reducing bundle size by ~24KB gzip compared to importing all icons.
 */

import {
  Award,
  BarChart3,
  Bot,
  Box,
  CheckCircle,
  Code,
  Cpu,
  Database,
  Folder,
  Globe,
  Headphones,
  Heart,
  Layers,
  Layout,
  LayoutGrid,
  PackageSearch,
  Rocket,
  Search,
  Shield,
  Smartphone,
  Sparkles,
  TabletSmartphone,
  ThumbsUp,
  Users,
  Zap,
} from 'lucide-react';

/**
 * Icon map for dynamic lookup
 */
export const iconMap = {
  Award,
  BarChart3,
  Bot,
  Box,
  CheckCircle,
  Code,
  Cpu,
  Database,
  Folder,
  Globe,
  Headphones,
  Headset: Headphones, // Alias
  Heart,
  Layers,
  Layout,
  LayoutGrid,
  PackageSearch,
  Rocket,
  Search,
  Shield,
  Smartphone,
  Sparkles,
  TabletSmartphone,
  ThumbsUp,
  Users,
  Zap,
};

/**
 * Get icon component by name with fallback
 * @param {string} iconName - Lucide icon name
 * @param {Component} fallback - Fallback icon (default: Box)
 * @returns {Component} Icon component
 */
export const getIcon = (iconName, fallback = Box) => {
  return iconMap[iconName] || fallback;
};
