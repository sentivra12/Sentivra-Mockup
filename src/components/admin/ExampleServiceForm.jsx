import React, { useState } from 'react';
import BilingualInput from './BilingualInput';
import BilingualArrayInput from './BilingualArrayInput';
import { Save, Eye } from 'lucide-react';

/**
 * Example Service Form
 * 
 * Demonstrates how to use BilingualInput and BilingualArrayInput
 * in an admin form for managing bilingual content
 */
const ExampleServiceForm = () => {
  const [formData, setFormData] = useState({
    // English fields
    title: '',
    short_description: '',
    long_description: '',
    features: [],
    benefits: [],
    pricing_info: '',
    delivery_time: '',
    
    // Arabic fields
    title_ar: '',
    short_description_ar: '',
    long_description_ar: '',
    features_ar: [],
    benefits_ar: [],
    pricing_info_ar: '',
    delivery_time_ar: '',
    
    // Non-translatable fields
    slug: '',
    category: 'Web & Mobile',
    icon: 'Code',
    image_url: '',
    display_order: 0,
    is_featured: false,
    is_active: true
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle text input changes
  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle array input changes
  const handleArrayChange = (field, lang, newArray) => {
    const fieldName = lang === 'en' ? field : `${field}_ar`;
    setFormData(prev => ({
      ...prev,
      [fieldName]: newArray
    }));
  };

  // Validate form
  const validate = () => {
    const newErrors = {};

    // English fields are required
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.short_description.trim()) {
      newErrors.short_description = 'Short description is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }

    if (formData.features.length === 0) {
      newErrors.features = 'At least one feature is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert arrays to JSONB format for Supabase
      const payload = {
        ...formData,
        features: JSON.stringify(formData.features),
        benefits: JSON.stringify(formData.benefits),
        features_ar: formData.features_ar.length > 0 
          ? JSON.stringify(formData.features_ar) 
          : null,
        benefits_ar: formData.benefits_ar.length > 0 
          ? JSON.stringify(formData.benefits_ar) 
          : null,
      };

      console.log('Submitting:', payload);

      // Here you would make your API call to Supabase
      // const { data, error } = await supabase
      //   .from('services')
      //   .insert(payload);

      alert('✅ Service saved successfully!');
    } catch (error) {
      console.error('Error saving service:', error);
      alert('❌ Error saving service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preview mode toggle
  const [previewMode, setPreviewMode] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Add New Service
          </h1>
          <p className="text-gray-600 mt-1">
            Fill in both English and Arabic content
          </p>
        </div>

        <button
          type="button"
          onClick={() => setPreviewMode(!previewMode)}
          className="flex items-center gap-2 px-4 py-2 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
        >
          <Eye className="h-4 w-4" />
          {previewMode ? 'Edit Mode' : 'Preview'}
        </button>
      </div>

      {!previewMode ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Section */}
          <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              📋 Basic Information
            </h2>

            {/* Slug (Non-translatable) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Slug (URL) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                placeholder="web-development"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
              {errors.slug && (
                <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
              )}
            </div>

            {/* Category (Non-translatable) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="Web & Mobile">Web & Mobile</option>
                <option value="Business Systems">Business Systems</option>
                <option value="AI & Data">AI & Data</option>
              </select>
            </div>
          </div>

          {/* Bilingual Content Section */}
          <div className="space-y-6 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              🌐 Bilingual Content
            </h2>

            {/* Title */}
            <BilingualInput
              label="Service Title"
              nameEn="title"
              nameAr="title_ar"
              valueEn={formData.title}
              valueAr={formData.title_ar}
              onChange={handleInputChange}
              type="text"
              required={true}
              placeholder="Enter service title"
              error={errors.title}
            />

            {/* Short Description */}
            <BilingualInput
              label="Short Description"
              nameEn="short_description"
              nameAr="short_description_ar"
              valueEn={formData.short_description}
              valueAr={formData.short_description_ar}
              onChange={handleInputChange}
              type="textarea"
              required={true}
              rows={3}
              placeholder="Brief description for cards"
              error={errors.short_description}
              helperText="Used in service cards and previews (max 150 characters recommended)"
            />

            {/* Long Description */}
            <BilingualInput
              label="Long Description"
              nameEn="long_description"
              nameAr="long_description_ar"
              valueEn={formData.long_description}
              valueAr={formData.long_description_ar}
              onChange={handleInputChange}
              type="textarea"
              rows={6}
              placeholder="Detailed description for service page"
              helperText="Detailed content for the service detail page"
            />

            {/* Features Array */}
            <BilingualArrayInput
              label="Service Features"
              valuesEn={formData.features}
              valuesAr={formData.features_ar}
              onChange={(lang, newArray) => handleArrayChange('features', lang, newArray)}
              placeholder="e.g., Responsive Design"
              maxItems={10}
              required={true}
            />

            {/* Benefits Array */}
            <BilingualArrayInput
              label="Service Benefits"
              valuesEn={formData.benefits}
              valuesAr={formData.benefits_ar}
              onChange={(lang, newArray) => handleArrayChange('benefits', lang, newArray)}
              placeholder="e.g., Increase conversion rates"
              maxItems={10}
            />

            {/* Pricing Info */}
            <BilingualInput
              label="Pricing Information"
              nameEn="pricing_info"
              nameAr="pricing_info_ar"
              valueEn={formData.pricing_info}
              valueAr={formData.pricing_info_ar}
              onChange={handleInputChange}
              type="text"
              placeholder="Starting from $999"
              helperText="Optional pricing details"
            />

            {/* Delivery Time */}
            <BilingualInput
              label="Delivery Time"
              nameEn="delivery_time"
              nameAr="delivery_time_ar"
              valueEn={formData.delivery_time}
              valueAr={formData.delivery_time_ar}
              onChange={handleInputChange}
              type="text"
              placeholder="2-4 weeks"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Save className="h-5 w-5" />
              {isSubmitting ? 'Saving...' : 'Save Service'}
            </button>
          </div>
        </form>
      ) : (
        // Preview Mode
        <div className="space-y-6 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            📄 Preview
          </h2>
          
          <div className="grid grid-cols-2 gap-6">
            {/* English Preview */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-primary">🇬🇧 English</h3>
              <div>
                <strong>Title:</strong>
                <p className="text-gray-700">{formData.title || '(empty)'}</p>
              </div>
              <div>
                <strong>Short Description:</strong>
                <p className="text-gray-700">{formData.short_description || '(empty)'}</p>
              </div>
              <div>
                <strong>Features:</strong>
                <ul className="list-disc list-inside">
                  {formData.features.map((feat, i) => (
                    <li key={i} className="text-gray-700">{feat}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Arabic Preview */}
            <div className="space-y-4" dir="rtl">
              <h3 className="text-lg font-bold text-primary">🇸🇦 Arabic</h3>
              <div>
                <strong>العنوان:</strong>
                <p className="text-gray-700">{formData.title_ar || '(فارغ)'}</p>
              </div>
              <div>
                <strong>الوصف المختصر:</strong>
                <p className="text-gray-700">{formData.short_description_ar || '(فارغ)'}</p>
              </div>
              <div>
                <strong>المميزات:</strong>
                <ul className="list-disc list-inside">
                  {formData.features_ar.map((feat, i) => (
                    <li key={i} className="text-gray-700">{feat}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExampleServiceForm;
