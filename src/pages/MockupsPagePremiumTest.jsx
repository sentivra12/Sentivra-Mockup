import React from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { useThemeContext } from '@/theme/ThemeContext';
import { useMockups, useMockupCategories } from '@/hooks/useContent';
import MockupsHero from '@/components/mockups/MockupsHeroPremium';

const MockupsPagePremiumTest = () => {
  console.log('=== MockupsPagePremiumTest rendering ===');
  
  const { t, language } = useTranslation();
  console.log('useTranslation successful, language:', language);
  
  const { isDark } = useThemeContext();
  console.log('useThemeContext successful, isDark:', isDark);
  
  const { data: mockups = [], isLoading: mockupsLoading } = useMockups();
  console.log('useMockups successful, count:', mockups.length);
  
  const { data: categories = [], isLoading: categoriesLoading } = useMockupCategories();
  console.log('useMockupCategories successful, count:', categories.length);
  
  console.log('About to render MockupsHero');
  
  return (
    <div className="min-h-screen">
      <MockupsHero />
      <div className="py-20 text-center bg-white dark:bg-slate-900">
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Language: {language}, Dark: {isDark ? 'Yes' : 'No'}
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Mockups: {mockupsLoading ? 'Loading...' : mockups.length}
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Categories: {categoriesLoading ? 'Loading...' : categories.length}
        </p>
      </div>
    </div>
  );
};

export default MockupsPagePremiumTest;
