/**
 * BEFORE test — proves the OLD palette existed in source.
 *
 * Strategy: grep the source files directly (no live server needed) for the
 * old color strings that were present before the fix.  The test MUST FAIL
 * now (after the fix) because those strings are gone, proving we changed them.
 *
 * We deliberately do NOT start a dev server here; file-system grep is
 * deterministic and reproducible.
 *
 * Run BEFORE the fix  → test PASSES  (old colors are present  → assertion succeeds)
 * Run AFTER  the fix  → test FAILS   (old colors are absent   → assertion fails)
 *
 * That's the science: the BEFORE test is a regression detector that trips
 * when the problem is gone.
 */

import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const SRC = path.resolve('src/components/mockups');

/** Returns true if the file contains the substring */
function fileContains(filename, substring) {
  const full = path.join(SRC, filename);
  if (!fs.existsSync(full)) return false;
  return fs.readFileSync(full, 'utf8').includes(substring);
}

test.describe('BEFORE: Old palette present in source', () => {

  test('HowItWorksStrip — had cyan-400 icon color', () => {
    // This WAS present before fix; now it is gone → test FAILS (expected)
    expect(fileContains('HowItWorksStrip.jsx', 'text-cyan-400')).toBe(true);
  });

  test('HowItWorksStrip — had bg-slate-900/50 section bg', () => {
    expect(fileContains('HowItWorksStrip.jsx', 'bg-slate-900/50')).toBe(true);
  });

  test('HowItWorksStrip — had old hex #6FD3D8 connector gradient', () => {
    expect(fileContains('HowItWorksStrip.jsx', '#6FD3D8')).toBe(true);
  });

  test('PremiumFAQAccordion — had bg-[#0A1525] navy section bg', () => {
    expect(fileContains('PremiumFAQAccordion.jsx', 'bg-[#0A1525]')).toBe(true);
  });

  test('PremiumFAQAccordion — had focus-visible:ring-cyan-400', () => {
    expect(fileContains('PremiumFAQAccordion.jsx', 'ring-cyan-400')).toBe(true);
  });

  test('PremiumFAQAccordion — had text-cyan-400 icon color', () => {
    expect(fileContains('PremiumFAQAccordion.jsx', 'text-cyan-400')).toBe(true);
  });

  test('PremiumFAQAccordion — read faq.question (old column name)', () => {
    // Old code: const question = language === 'ar' ? (faq.question_ar ...) : faq.question
    // The key bug: "faq.question" with no _en suffix
    expect(fileContains('PremiumFAQAccordion.jsx', ': faq.question;')).toBe(true);
  });

  test('PremiumFinalCTA — had hardcoded #EEF2F4 button color', () => {
    expect(fileContains('PremiumFinalCTA.jsx', '#EEF2F4')).toBe(true);
  });

  test('PremiumFinalCTA — had rgba(111, 211, 216 old teal blob', () => {
    expect(fileContains('PremiumFinalCTA.jsx', 'rgba(111, 211, 216')).toBe(true);
  });

  test('PremiumFinalCTA — had rgba(92, 126, 143 old slate blob', () => {
    expect(fileContains('PremiumFinalCTA.jsx', 'rgba(92, 126, 143')).toBe(true);
  });
});
