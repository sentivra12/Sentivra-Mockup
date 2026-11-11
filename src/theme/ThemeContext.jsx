import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

/**
 * ThemeProvider - Manages theme state (light/dark/system) with localStorage persistence
 * 
 * Theme values:
 * - 'light': Force light theme
 * - 'dark': Force dark theme
 * - 'system': Follow OS preference (default)
 * 
 * The resolved theme is either 'light' or 'dark' based on user choice or system preference
 */
export function ThemeProvider({ children }) {
  // Load saved theme from localStorage, default to 'system'
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('sentivra-theme');
      // Validate saved value
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        return saved;
      }
      return 'system';
    } catch (error) {
      console.error('ThemeProvider: Error reading localStorage:', error);
      return 'system';
    }
  });

  // Resolved theme is either 'light' or 'dark'
  const [resolvedTheme, setResolvedTheme] = useState('light');

  // System preference listener
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateResolvedTheme = () => {
      if (theme === 'system') {
        setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
      } else {
        setResolvedTheme(theme);
      }
    };

    // Initial update
    updateResolvedTheme();

    // Listen for system preference changes (only matters when theme is 'system')
    const handler = () => {
      if (theme === 'system') {
        updateResolvedTheme();
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove both classes first
    root.classList.remove('light', 'dark');
    
    // Add the resolved theme class
    root.classList.add(resolvedTheme);
    
    // Update data attribute for CSS selectors
    root.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  // Change theme and persist to localStorage
  const changeTheme = (newTheme) => {
    if (['light', 'dark', 'system'].includes(newTheme)) {
      setTheme(newTheme);
      localStorage.setItem('sentivra-theme', newTheme);
    }
  };

  const value = {
    theme, // 'light' | 'dark' | 'system'
    resolvedTheme, // 'light' | 'dark'
    setTheme: changeTheme,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
}
