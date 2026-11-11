import React, { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { contactInfo } from '../../data/contactData';
import { useTranslation } from '@/i18n/useTranslation';
import { Bidi } from './Bidi';

const ContactInfoCard = () => {
  const [copiedField, setCopiedField] = useState(null);
  const { t, language } = useTranslation();

  const handleCopy = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const contactItems = [
    {
      icon: Mail,
      label: t('contact.info.email'),
      value: contactInfo.email,
      link: `mailto:${contactInfo.email}`,
      field: 'email',
      copyText: contactInfo.email
    },
    {
      icon: Phone,
      label: t('contact.info.phone'),
      value: contactInfo.phone,
      link: `tel:${contactInfo.phone}`,
      field: 'phone',
      copyText: contactInfo.phone
    },
    {
      icon: Phone,
      label: 'WhatsApp',
      value: contactInfo.whatsapp,
      link: `https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, '')}`,
      field: 'whatsapp',
      copyText: contactInfo.whatsapp
    },
    {
      icon: MapPin,
      label: t('contact.info.address'),
      value: contactInfo.location,
      link: null,
      field: 'location',
      copyText: contactInfo.location
    }
  ];

  return (
    <div className="bg-color-background rounded-2xl border border-frost p-6 lg:p-8 shadow-card">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-primary-deep mb-2">
          {t('contact.info.title')}
        </h3>
        <p className="text-sm text-text-muted">
          {t('contact.info.description')}
        </p>
      </div>

      {/* Contact Items */}
      <div className="space-y-4">
        {contactItems.map((item) => {
          const Icon = item.icon;
          const isCopied = copiedField === item.field;

          return (
            <div
              key={item.field}
              className={`group relative bg-frost-soft rounded-xl p-4 hover:bg-frost transition-colors ${language === 'ar' ? 'text-right' : ''}`}
            >
              <div className={`flex items-start gap-3 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                {/* Icon */}
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text-muted mb-1">
                    {item.label}
                  </p>
                  {item.link ? (
                    <a
                      href={item.link}
                      target={item.link.startsWith('http') ? '_blank' : undefined}
                      rel={item.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-sm font-medium text-primary-deep hover:text-primary transition-colors break-all"
                    >
                      <Bidi>{item.value}</Bidi>
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-primary-deep break-all">
                      <Bidi>{item.value}</Bidi>
                    </p>
                  )}
                </div>

                {/* Copy Button */}
                <button
                  onClick={() => handleCopy(item.copyText, item.field)}
                  className="flex-shrink-0 relative px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
                  style={{
                    backgroundColor: isCopied ? '#10b981' : '#e5e7eb',
                    color: isCopied ? '#ffffff' : '#6b7280'
                  }}
                  aria-label={`${t('contact.info.copy')} ${item.label}`}
                >
                  <span className="transition-opacity duration-200">
                    {isCopied ? t('contact.info.copied') : t('contact.info.copy')}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Note */}
      <div className="mt-6 pt-6 border-t border-frost">
        <p className="text-xs text-text-muted text-center">
          {t('contact.info.available')}{' '}
          <span className="font-medium text-primary-deep">{t('contact.info.availableTime')}</span> {t('contact.info.toAssist')}
        </p>
      </div>
    </div>
  );
};

export default ContactInfoCard;


