/**
 * BEFORE test — proves old mobile hero problems exist IN SOURCE.
 * Checks the original source strings that caused each problem.
 * Must FAIL after the fix (strings are gone), proving they were removed.
 */
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const HERO = path.resolve('src/components/home/PremiumHero.jsx');
const src  = () => fs.readFileSync(HERO, 'utf8');

test.describe('BEFORE: Old mobile hero problems in source', () => {

  test('hero had injected <style> with !important mobile override', () => {
    expect(src()).toContain('min-height: clamp(480px, 60vh, 600px) !important');
  });

  test('hero had no mobile/desktop split (single PremiumHero for all widths)', () => {
    // Old code had no HomeHeroMobile import
    expect(src()).not.toContain('HomeHeroMobile');
  });

  test('HeroVisual was NOT lazy-loaded (eager import)', () => {
    // Old code: import HeroVisual from '@/components/home/HeroVisual'
    expect(src()).toContain("import HeroVisual from '@/components/home/HeroVisual'");
  });

  test('typewriter had minWidth 8ch (clips long service names)', () => {
    expect(src()).toContain("minWidth: '8ch'");
  });

  test('primary CTA was white bg (bg-white), jarring on emerald hero', () => {
    expect(src()).toContain('bg-white shadow-xl');
  });
});
