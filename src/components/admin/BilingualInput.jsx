import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown } from 'lucide-react';

/**
 * BilingualInput Component
 * 
 * A reusable component for handling bilingual (English/Arabic) text inputs
 * in the admin panel. Provides tabs for EN/AR with visual indicators.
 * 
 * @param {string} label - Field label (e.g., "Title", "Description")
 * @param {string} nameEn - Input name for English field
 * @param {string} nameAr - Input name for Arabic field
 * @param {string} valueEn - Current English value
 * @param {string} valueAr - Current Arabic value
 * @param {function} onChange - Callback function (name, value)
 * @param {string} type - Input type: 'text', 'textarea', 'wysiwyg'
 * @param {boolean} required - Is English field required?
 * @param {string} placeholder - Placeholder text
 * @param {number} rows - Rows for textarea (default: 4)
 * @param {boolean} disabled - Disabled state
 * @param {string} error - Error message
 * @param {string} helperText - Helper text below input
 */
const BilingualInput = ({
  label,
  nameEn,
  nameAr,
  valueEn = '',
  valueAr = '',
  onChange,
  type = 'text',
  required = false,
  placeholder = '',
  rows = 4,
  disabled = false,
  error = '',
  helperText = ''
}) => {
  const [activeTab, setActiveTab] = useState('en');

  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  const renderInput = (lang) => {
    const name = lang === 'en' ? nameEn : nameAr;
    const value = lang === 'en' ? valueEn : valueAr;
    const isRequired = lang === 'en' && required;
    const dir = lang === 'ar' ? 'rtl' : 'ltr';

    const baseClasses = `
      w-full px-4 py-3 border rounded-lg 
      focus:ring-2 focus:ring-primary focus:border-primary 
      outline-none transition-all duration-200
      disabled:bg-gray-100 disabled:cursor-not-allowed
      ${error ? 'border-red-500' : 'border-gray-300'}
      ${lang === 'ar' ? 'font-arabic text-right' : ''}
    `;

    if (type === 'textarea') {
      return (
        <textarea
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={isRequired}
          disabled={disabled}
          rows={rows}
          dir={dir}
          className={baseClasses}
        />
      );
    }

    return (
      <input
        type={type}
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={isRequired}
        disabled={disabled}
        dir={dir}
        className={baseClasses}
      />
    );
  };

  return (
    <div className="w-full">
      {/* Label */}
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        <Globe className="inline-block h-4 w-4 ml-2 text-gray-400" />
      </label>

      {/* Language Tabs */}
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => setActiveTab('en')}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
            transition-all duration-200
            ${activeTab === 'en' 
              ? 'bg-primary text-white shadow-md' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
          `}
        >
          <span className="text-lg">🇬🇧</span>
          <span>EN</span>
          {valueEn && <span className="w-2 h-2 bg-green-500 rounded-full"></span>}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ar')}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
            transition-all duration-200
            ${activeTab === 'ar' 
              ? 'bg-primary text-white shadow-md' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
          `}
        >
          <span className="text-lg">🇸🇦</span>
          <span>AR</span>
          {valueAr && <span className="w-2 h-2 bg-green-500 rounded-full"></span>}
        </button>
      </div>

      {/* Input Field with Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.15 }}
        >
          {renderInput(activeTab)}
        </motion.div>
      </AnimatePresence>

      {/* Character Count (for textarea) */}
      {type === 'textarea' && (
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>
            {activeTab === 'en' ? 'English' : 'Arabic'}: {' '}
            {activeTab === 'en' ? valueEn.length : valueAr.length} characters
          </span>
          
          {/* Language Indicator */}
          <span className={`px-2 py-1 rounded ${
            activeTab === 'ar' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {activeTab === 'ar' ? 'يمين إلى يسار' : 'Left to Right'}
          </span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-600 flex items-center gap-1"
        >
          <span>⚠️</span>
          {error}
        </motion.p>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500 flex items-center gap-1">
          <span>ℹ️</span>
          {helperText}
        </p>
      )}

      {/* Translation Status */}
      <div className="mt-3 flex items-center gap-3 text-xs">
        <div className={`flex items-center gap-1 ${valueEn ? 'text-green-600' : 'text-gray-400'}`}>
          <span className={`w-3 h-3 rounded-full ${valueEn ? 'bg-green-500' : 'bg-gray-300'}`}></span>
          <span>EN {valueEn ? '✓' : '○'}</span>
        </div>
        <div className={`flex items-center gap-1 ${valueAr ? 'text-green-600' : 'text-gray-400'}`}>
          <span className={`w-3 h-3 rounded-full ${valueAr ? 'bg-green-500' : 'bg-gray-300'}`}></span>
          <span>AR {valueAr ? '✓' : '○'}</span>
        </div>
      </div>
    </div>
  );
};

export default BilingualInput;
