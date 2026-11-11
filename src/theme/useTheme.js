import { useThemeContext } from './ThemeContext';

/**
 * useTheme - Hook for accessing theme state and controls
 * 
 * @returns {Object} Theme context
 * @returns {string} theme - Current theme setting ('light' | 'dark' | 'system')
 * @returns {string} resolvedTheme - Actual applied theme ('light' | 'dark')
 * @returns {Function} setTheme - Change theme function
 * @returns {boolean} isDark - True if resolved theme is dark
 * @returns {boolean} isLight - True if resolved theme is light
 * 
 * @example
 * const { isDark, setTheme } = useTheme();
 * 
 * // Toggle between light and dark
 * setTheme(isDark ? 'light' : 'dark');
 * 
 * // Set to system preference
 * setTheme('system');
 */
export function useTheme() {
  return useThemeContext();
}
