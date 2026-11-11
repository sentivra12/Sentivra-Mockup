import * as Icons from 'lucide-react';

/**
 * Icon resolver with whitelist and aliases for renamed icons
 * Provides fallback to Sparkles for missing icons
 */

// Whitelist of allowed icons
const ICON_WHITELIST = [
  'CheckCircle',
  'Users',
  'Globe',
  'Calendar',
  'ThumbsUp',
  'TrendingUp',
  'Award',
  'Target',
  'Briefcase',
  'Building2',
  'Headphones',
  'Star',
  'Heart',
  'Zap',
  'Shield',
  'Clock',
  'Package',
  'Sparkles' // fallback icon
];

// Aliases for renamed icons
const ICON_ALIASES = {
  'UsersRound': 'Users',
  'CircleCheck': 'CheckCircle',
  'Check': 'CheckCircle',
  'User': 'Users',
  'World': 'Globe',
  'Like': 'ThumbsUp',
  'Trending': 'TrendingUp',
  'Trophy': 'Award',
  'Bullseye': 'Target',
  'Case': 'Briefcase',
  'Building': 'Building2',
  'Headset': 'Headphones',
  'StarIcon': 'Star',
  'HeartIcon': 'Heart',
  'Lightning': 'Zap',
  'ShieldCheck': 'Shield'
};

/**
 * Resolve an icon name to a Lucide React component
 * @param {string} iconName - The icon name to resolve
 * @returns {React.Component} - The icon component or Sparkles fallback
 */
export function resolveIcon(iconName) {
  if (!iconName) return Icons.Sparkles;

  // Check if it's an alias
  const resolvedName = ICON_ALIASES[iconName] || iconName;

  // Check if it's in the whitelist
  if (!ICON_WHITELIST.includes(resolvedName)) {
    console.warn(`Icon "${iconName}" not in whitelist, using Sparkles fallback`);
    return Icons.Sparkles;
  }

  // Return the icon component
  const IconComponent = Icons[resolvedName];
  if (!IconComponent) {
    console.warn(`Icon "${resolvedName}" not found in lucide-react, using Sparkles fallback`);
    return Icons.Sparkles;
  }

  return IconComponent;
}

/**
 * Get the list of available icons for icon pickers
 * @returns {Array<string>} - Array of icon names
 */
export function getAvailableIcons() {
  return ICON_WHITELIST.filter(name => name !== 'Sparkles');
}
