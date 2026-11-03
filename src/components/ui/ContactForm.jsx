import React, { useState, useEffect } from 'react';
import { User, Phone, MessageSquare, Mail, FileText, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import FormField from '@/components/ui/FormField';
import CountrySelect from '@/components/ui/CountrySelect';
import { countries } from '@/data/contactData';
import emailjs from 'emailjs-com';

const ContactForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
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

  // Pre-fill from query params (e.g., from Mockups page)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mockupName = params.get('mockup');
    if (mockupName) {
      setFormData(prev => ({
        ...prev,
        projectDetails: `I'm interested in the "${mockupName}" mockup design. `
      }));
    }
  }, []);

  // Sync WhatsApp with Phone if checkbox is checked
  useEffect(() => {
    if (sameAsPhone && formData.phone) {
      setFormData(prev => ({ ...prev, whatsapp: prev.phone }));
    }
  }, [sameAsPhone, formData.phone]);

  const validateField = (name, value) => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        return '';
      
      case 'country':
        if (!value) return 'Please select your country';
        return '';
      
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        // Accept international formats: +20, 0100, etc.
        if (!/^[\d\s\-\+\(\)]+$/.test(value)) return 'Please enter a valid phone number';
        if (value.replace(/\D/g, '').length < 8) return 'Phone number is too short';
        return '';
      
      case 'whatsapp':
        if (!value.trim()) return 'WhatsApp number is required';
        if (!/^[\d\s\-\+\(\)]+$/.test(value)) return 'Please enter a valid WhatsApp number';
        if (value.replace(/\D/g, '').length < 8) return 'WhatsApp number is too short';
        return '';
      
      case 'email':
        // Email is optional
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email address';
        }
        return '';
      
      case 'projectDetails':
        if (!value.trim()) return 'Please tell us about your project';
        if (value.trim().length < 10) return 'Please provide more details (at least 10 characters)';
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

    // Prepare data for EmailJS
    const emailData = {
      from_name: formData.fullName,
      country: countries.find(c => c.value === formData.country)?.label || formData.country,
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      from_email: formData.email || 'Not provided',
      message: formData.projectDetails,
      to_email: 'info@sentivra-tech.com'
    };

    try {
      await emailjs.send(
        'service_wa6n2ik',
        'template_25w1x47',
        emailData,
        'hJmI9fWxOOjxXclFc'
      );

      // Success
      toast({
        title: '✅ Message Sent Successfully!',
        description: "We've received your message and will get back to you within 24 hours.",
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
      console.error('EmailJS Error:', error);
      toast({
        title: '❌ Failed to Send Message',
        description: 'Something went wrong. Please try again or contact us directly via WhatsApp.',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-dropdown p-8 border border-frost">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-primary-deep mb-2">
          Send Us a Message
        </h2>
        <p className="text-text-muted">
          Fill out the form and we'll get back to you soon.
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
          label="Full Name"
          placeholder="Enter your full name"
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
          label="Country"
          value={formData.country}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.country && errors.country}
          required
          countries={countries}
          disabled={isSubmitting}
        />

        {/* Phone Number */}
        <FormField
          id="phone"
          name="phone"
          type="tel"
          label="Phone Number"
          placeholder="Enter your phone number"
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
            label="WhatsApp Number"
            placeholder="Enter your WhatsApp number"
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
          <div className="mt-2 flex items-center">
            <input
              type="checkbox"
              id="sameAsPhone"
              checked={sameAsPhone}
              onChange={(e) => setSameAsPhone(e.target.checked)}
              disabled={isSubmitting}
              className="h-4 w-4 text-primary border-frost rounded focus:ring-primary"
            />
            <label htmlFor="sameAsPhone" className="ml-2 text-sm text-text-muted">
              Same as phone number
            </label>
          </div>
        </div>

        {/* Email (Optional) */}
        <FormField
          id="email"
          name="email"
          type="email"
          label="Email Address (Optional)"
          placeholder="Enter your email address"
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
          label="Project Details"
          placeholder="Tell us about your project, your goals, and any specific requirements..."
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
              <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </>
          ) : (
            <>
              Send Message
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>

        {/* Success/Error Message Region */}
        <div role="status" aria-live="polite" className="sr-only">
          {isSubmitting && 'Sending your message...'}
        </div>
      </form>
    </div>
  );
};

export default ContactForm;


