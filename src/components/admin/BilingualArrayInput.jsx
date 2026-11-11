import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Plus, X, GripVertical } from 'lucide-react';

/**
 * BilingualArrayInput Component
 * 
 * For handling arrays of strings in both languages (e.g., features, benefits, tags)
 * Allows adding, removing, and reordering items independently for each language
 * 
 * @param {string} label - Field label
 * @param {array} valuesEn - Array of English strings
 * @param {array} valuesAr - Array of Arabic strings
 * @param {function} onChange - Callback function (lang, newArray)
 * @param {string} placeholder - Placeholder for input
 * @param {number} maxItems - Maximum number of items (default: 10)
 * @param {boolean} required - Is at least one English item required?
 */
const BilingualArrayInput = ({
  label,
  valuesEn = [],
  valuesAr = [],
  onChange,
  placeholder = 'Enter item',
  maxItems = 10,
  required = false
}) => {
  const [activeTab, setActiveTab] = useState('en');
  const [inputValue, setInputValue] = useState('');

  const values = activeTab === 'en' ? valuesEn : valuesAr;
  const dir = activeTab === 'ar' ? 'rtl' : 'ltr';

  const handleAdd = () => {
    if (!inputValue.trim()) return;
    if (values.length >= maxItems) return;

    const newArray = [...values, inputValue.trim()];
    onChange(activeTab, newArray);
    setInputValue('');
  };

  const handleRemove = (index) => {
    const newArray = values.filter((_, i) => i !== index);
    onChange(activeTab, newArray);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
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
          {valuesEn.length > 0 && (
            <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
              {valuesEn.length}
            </span>
          )}
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
          {valuesAr.length > 0 && (
            <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
              {valuesAr.length}
            </span>
          )}
        </button>
      </div>

      {/* Input Area with Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.15 }}
          className="space-y-3"
        >
          {/* Add New Item */}
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              dir={dir}
              disabled={values.length >= maxItems}
              className={`
                flex-1 px-4 py-2 border border-gray-300 rounded-lg
                focus:ring-2 focus:ring-primary focus:border-primary
                outline-none transition-all duration-200
                disabled:bg-gray-100 disabled:cursor-not-allowed
                ${activeTab === 'ar' ? 'font-arabic text-right' : ''}
              `}
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={!inputValue.trim() || values.length >= maxItems}
              className="
                px-4 py-2 bg-primary text-white rounded-lg
                hover:bg-primary-dark transition-colors duration-200
                disabled:bg-gray-300 disabled:cursor-not-allowed
                flex items-center gap-2 flex-shrink-0
              "
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>

          {/* Items Count */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {values.length} / {maxItems} items
            </span>
            {values.length === 0 && (
              <span className="text-amber-600">⚠️ No items added yet</span>
            )}
          </div>

          {/* Items List */}
          {values.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {values.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`
                    flex items-center gap-2 p-3 bg-gray-50 rounded-lg
                    border border-gray-200 hover:border-primary
                    transition-all duration-200 group
                    ${activeTab === 'ar' ? 'flex-row-reverse' : ''}
                  `}
                >
                  {/* Drag Handle */}
                  <GripVertical className="h-4 w-4 text-gray-400 cursor-move flex-shrink-0" />

                  {/* Item Number */}
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-semibold">
                    {index + 1}
                  </span>

                  {/* Item Text */}
                  <span className={`flex-1 text-sm text-gray-700 ${activeTab === 'ar' ? 'text-right font-arabic' : ''}`}>
                    {item}
                  </span>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="
                      flex-shrink-0 p-1 text-gray-400 hover:text-red-600
                      hover:bg-red-50 rounded transition-all duration-200
                      opacity-0 group-hover:opacity-100
                    "
                    aria-label="Remove item"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Translation Status */}
      <div className="mt-3 flex items-center gap-3 text-xs">
        <div className={`flex items-center gap-1 ${valuesEn.length > 0 ? 'text-green-600' : 'text-gray-400'}`}>
          <span className={`w-3 h-3 rounded-full ${valuesEn.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
          <span>EN {valuesEn.length > 0 ? `✓ (${valuesEn.length})` : '○'}</span>
        </div>
        <div className={`flex items-center gap-1 ${valuesAr.length > 0 ? 'text-green-600' : 'text-gray-400'}`}>
          <span className={`w-3 h-3 rounded-full ${valuesAr.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
          <span>AR {valuesAr.length > 0 ? `✓ (${valuesAr.length})` : '○'}</span>
        </div>
      </div>

      {/* Helper Text */}
      <p className="mt-2 text-xs text-gray-500">
        💡 Tip: Press Enter to quickly add items. You can add different items for each language.
      </p>
    </div>
  );
};

export default BilingualArrayInput;
