import React, { useState, useEffect } from 'react';
import { User, Phone, MessageSquare, Mail, FileText, ArrowRight, X, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import FormField from '@/components/ui/FormField';
import CountrySelect from '@/components/ui/CountrySelect';
import { useCountries } from '@/hooks/useContent';
import { useCreateMessage } from '@/hooks/useContent';
import { useTranslation } from '@/i18n/useTranslation';
import { getAttributionForSubmission } from '@/lib/attribution';
import { analytics } from '@/lib/analytics';

const ContactForm = ({ selectedMockup = null, onRemoveMockup = null }) => {
  const { toast } = useToast();
  const { t, language } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  // Fetch countries from Supabase
  const { data: countries = [], isLoading: countriesLoading } = useCountries();
  const createMessage = useCreateMessage();
  
  // Transform countries data to format expected by CountrySelect
  const countryOptions = countries.map(c => ({
    value: c.country_code || c.id,
    label: c.name,
    flag: c.flag_emoji
  }));

  const [formData, setFormData] = useState({
    fullName: '',
    country: '',
    phone: '',
    whatsapp: '',
    email: '',
    projectDetails: '',
    honeypot: '' // Anti-spam field
  });

  const [sameAsPhone, setSameAsPhone] = useState(false);

  // Pre-fill from mockup selection
  useEffect(() => {
    if (selectedMockup) {
      const mockupTitle = language === 'ar' ? selectedMockup.title_ar : selectedMockup.title_en;
      const prefix = language === 'ar' 
        ? `أنا مهتم بتصميم "${mockupTitle}". `
        : `I'm interested in the "${mockupTitle}" mockup design. `;
      
      setFormData(prev => ({
        ...prev,
        projectDetails: prefix + (prev.projectDetails || '')
      }));
    }
  }, [selectedMockup, language]);

  // Sync WhatsApp with Phone if checkbox is checked
  useEffect(() => {
    if (sameAsPhone && formData.phone) {
      setFormData(prev => ({ ...prev, whatsapp: prev.phone }));
    }
  }, [sameAsPhone, formData.phone]);

  const validateField = (name, value) => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return t('contact.form.required');
        if (value.trim().length < 2) return t('contact.form.nameTooShort');
        return '';
      
      case 'country':
        if (!value) return t('contact.form.selectCountry');
        return '';
      
      case 'phone':
        if (!value.trim()) return t('contact.form.required');
        // Accept international formats: +20, 0100, etc.
        if (!/^[\d\s\-\+\(\)]+$/.test(value)) return t('contact.form.invalidPhone');
        if (value.replace(/\D/g, '').length < 8) return t('contact.form.phoneTooShort');
        return '';
      
      case 'whatsapp':
        if (!value.trim()) return t('contact.form.required');
        if (!/^[\d\s\-\+\(\)]+$/.test(value)) return t('contact.form.invalidWhatsapp');
        if (value.replace(/\D/g, '').length < 8) return t('contact.form.whatsappTooShort');
        return '';
      
      case 'email':
        // Email is optional
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return t('contact.form.invalidEmail');
        }
        return '';
      
      case 'projectDetails':
        if (!value.trim()) return t('contact.form.required');
        if (value.trim().length < 10) return t('contact.form.detailsTooShort');
        return '';
      
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    newErrors.fullName = validateField('fullName', formData.fullName);
    newErrors.country = validateField('country', formData.country);
    newErrors.phone = validateField('phone', formData.phone);
    newErrors.whatsapp = validateField('whatsapp', formData.whatsapp);
    newErrors.email = validateField('email', formData.email);
    newErrors.projectDetails = validateField('projectDetails', formData.projectDetails);

    // Filter out empty errors
    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, v]) => v !== '')
    );

    setErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check honeypot (anti-spam)
    if (formData.honeypot) {
      console.log('Spam detected');
      return;
    }

    // Validate all fields
    if (!validateForm()) {
      // Focus first invalid field
      const firstError = Object.keys(errors)[0];
      document.getElementById(firstError)?.focus();
      return;
    }

    setIsSubmitting(true);

    // Get attribution data
    const attribution = getAttributionForSubmission();
    
    // Prepare data for Supabase
    const messageData = {
      full_name: formData.fullName,
      country: countries.find(c => (c.country_code || c.id) === formData.country)?.name || formData.country,
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      email: formData.email || null,
      message: formData.projectDetails,
      project_details: formData.projectDetails, // Additional field for design requests
      mockup_id: selectedMockup?.id || null, // Link to mockup if design request
      status: 'new',
      source: 'contact_form',
      type: selectedMockup ? 'mockup_request' : 'contact',
      // Attribution fields
      ...attribution,
    };

    try {
      await createMessage.mutateAsync(messageData);

      // Track conversion
      analytics.contactFormSubmit();
      if (selectedMockup) {
        analytics.designRequestSubmit(selectedMockup.id);
      }

      // Success
      toast({
        title: t('contact.form.successTitle'),
        description: t('contact.form.success'),
        duration: 5000,
      });

      // Reset form
      setFormData({
        fullName: '',
        country: '',
        phone: '',
        whatsapp: '',
        email: '',
        projectDetails: '',
        honeypot: ''
      });
      setSameAsPhone(false);
      setErrors({});
      setTouched({});

    } catch (error) {
      console.error('Supabase Error:', error);
      toast({
        title: t('contact.form.errorTitle'),
        description: t('contact.form.error'),
        duration: 5000,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-color-background rounded-2xl shadow-dropdown p-8 border border-frost">
      {/* Selected Mockup Chip */}
      {selectedMockup && (
        <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-4">
          {/* Mockup Thumbnail */}
          {(selectedMockup.cover_image_url || selectedMockup.desktop_screenshot_url) && (
            <img
              src={selectedMockup.cover_image_url || selectedMockup.desktop_screenshot_url}
              alt={language === 'ar' ? selectedMockup.title_ar : selectedMockup.title_en}
              className="w-16 h-12 object-cover rounded-lg"
            />
          )}
          
          {/* Mockup Info */}
          <div className="flex-1">
            <div className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">
              {language === 'ar' ? 'طلب تصميم' : 'Design Request'}
            </div>
            <div className="font-bold text-primary-deep">
              {language === 'ar' ? selectedMockup.title_ar : selectedMockup.title_en}
            </div>
          </div>

          {/* View & Remove Buttons */}
          <div className="flex items-center gap-2">
            <a
              href={`/mockups/${selectedMockup.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-primary/10 rounded-lg transition-colors text-primary"
              title={language === 'ar' ? 'عرض التصميم' : 'View Design'}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            {onRemoveMockup && (
              <button
                type="button"
                onClick={onRemoveMockup}
                className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-500"
                title={language === 'ar' ? 'إزالة' : 'Remove'}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-primary-deep mb-2">
          {selectedMockup 
            ? (language === 'ar' ? 'طلب هذا التصميم' : 'Request This Design')
            : t('contact.form.title')
          }
        </h2>
        <p className="text-text-muted">
          {selectedMockup
            ? (language === 'ar' 
                ? 'املأ النموذج أدناه وسنتواصل معك قريباً'
                : 'Fill out the form below and we\'ll get back to you soon')
            : t('contact.form.subtitle')
          }
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Honeypot field (hidden) */}
        <input
          type="text"
          name="honeypot"
          value={formData.honeypot}
          onChange={handleChange}
          tabIndex="-1"
          autoComplete="off"
          style={{ position: 'absolute', left: '-9999px' }}
          aria-hidden="true"
        />

        {/* Full Name */}
        <FormField
          id="fullName"
          name="fullName"
          type="text"
          label={t('contact.form.name')}
          placeholder={t('contact.form.namePlaceholder')}
          value={formData.fullName}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.fullName && errors.fullName}
          required
          icon={User}
          autoComplete="name"
          disabled={isSubmitting}
        />

        {/* Country */}
        <CountrySelect
          id="country"
          name="country"
          label={t('contact.form.country')}
          value={formData.country}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.country && errors.country}
          required
          countries={countryOptions}
          disabled={isSubmitting || countriesLoading}
        />

        {/* Phone Number */}
        <FormField
          id="phone"
          name="phone"
          type="tel"
          label={t('contact.form.phone')}
          placeholder={t('contact.form.phonePlaceholder')}
          value={formData.phone}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.phone && errors.phone}
          required
          icon={Phone}
          autoComplete="tel"
          disabled={isSubmitting}
        />

        {/* WhatsApp Number */}
        <div>
          <FormField
            id="whatsapp"
            name="whatsapp"
            type="tel"
            label={t('contact.form.whatsapp')}
            placeholder={t('contact.form.whatsappPlaceholder')}
            value={formData.whatsapp}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.whatsapp && errors.whatsapp}
            required
            icon={MessageSquare}
            autoComplete="tel"
            disabled={isSubmitting || sameAsPhone}
          />
          
          {/* Same as Phone Checkbox */}
          <div className={`mt-2 flex items-center ${language === 'ar' ? 'flex-row-reverse justify-end' : ''}`}>
            <input
              type="checkbox"
              id="sameAsPhone"
              checked={sameAsPhone}
              onChange={(e) => setSameAsPhone(e.target.checked)}
              disabled={isSubmitting}
              className="h-4 w-4 text-primary border-frost rounded focus:ring-primary"
            />
            <label htmlFor="sameAsPhone" className={`text-sm text-text-muted ${language === 'ar' ? 'mr-2' : 'ml-2'}`}>
              {t('contact.form.sameAsPhone')}
            </label>
          </div>
        </div>

        {/* Email (Optional) */}
        <FormField
          id="email"
          name="email"
          type="email"
          label={t('contact.form.email')}
          placeholder={t('contact.form.emailPlaceholder')}
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.email && errors.email}
          icon={Mail}
          autoComplete="email"
          disabled={isSubmitting}
        />

        {/* Project Details */}
        <FormField
          id="projectDetails"
          name="projectDetails"
          type="textarea"
          label={t('contact.form.message')}
          placeholder={t('contact.form.messagePlaceholder')}
          value={formData.projectDetails}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.projectDetails && errors.projectDetails}
          required
          icon={FileText}
          rows={5}
          disabled={isSubmitting}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-lg group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <svg className={`animate-spin h-5 w-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('contact.form.sending')}
            </>
          ) : (
            <>
              {t('contact.form.send')}
              <ArrowRight className={`h-5 w-5 group-hover:translate-x-1 transition-transform ${language === 'ar' ? 'mr-2 rotate-180' : 'ml-2'}`} />
            </>
          )}
        </Button>

        {/* Success/Error Message Region */}
        <div role="status" aria-live="polite" className="sr-only">
          {isSubmitting && t('contact.form.sendingAria')}
        </div>
      </form>
    </div>
  );
};

export default ContactForm;


