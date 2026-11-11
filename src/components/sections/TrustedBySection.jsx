import { useEffect, useState, useRef } from 'react';
import { useTranslation } from '../../i18n/useTranslation';
import { supabase } from '../../lib/supabase';

export default function TrustedBySection() {
  const { language } = useTranslation();
  const isRTL = language === 'ar';
  const [clients, setClients] = useState([]);
  const [sectionSettings, setSectionSettings] = useState(null);
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch active clients
        const { data: clientsData, error: clientsError } = await supabase
          .from('client_logos')
          .select('*')
          .eq('is_active', true)
          .order('display_order');

        if (clientsData && !clientsError) {
          setClients(clientsData);
        }

        // Fetch section settings (optional - won't break if table doesn't exist)
        const { data: sectionData, error: sectionError } = await supabase
          .from('page_sections')
          .select('*')
          .eq('section_key', 'trusted_by')
          .eq('page', 'home')
          .eq('enabled', true)
          .single();

        if (sectionData && !sectionError) {
          setSectionSettings(sectionData);
        }
      } catch (error) {
        console.error('Error fetching client logos data:', error);
      }
    }

    fetchData();
  }, []);

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Duplicate clients for seamless infinite scroll
  const duplicatedClients = prefersReducedMotion ? clients : [...clients, ...clients, ...clients];

  // Hide section if no clients - AFTER all hooks
  if (clients.length === 0) return null;

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        {sectionSettings && (
          <div className="text-center mb-12">
            {sectionSettings.eyebrow && (
              <p className="text-sm font-medium text-primary mb-2 uppercase tracking-wider">
                {isRTL ? sectionSettings.eyebrow_ar || sectionSettings.eyebrow : sectionSettings.eyebrow}
              </p>
            )}
            {sectionSettings.title && (
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                {isRTL ? sectionSettings.title_ar || sectionSettings.title : sectionSettings.title}
              </h2>
            )}
            {sectionSettings.subtitle && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {isRTL ? sectionSettings.subtitle_ar || sectionSettings.subtitle : sectionSettings.subtitle}
              </p>
            )}
          </div>
        )}

        {/* Logo Marquee */}
        <div className="relative overflow-hidden">
          {/* Edge fade masks */}
          {!prefersReducedMotion && (
            <>
              <div 
                className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
                style={{
                  background: isRTL 
                    ? 'linear-gradient(to left, transparent, hsl(var(--background)))' 
                    : 'linear-gradient(to right, transparent, hsl(var(--background)))'
                }}
              />
              <div 
                className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
                style={{
                  background: isRTL 
                    ? 'linear-gradient(to right, transparent, hsl(var(--background)))' 
                    : 'linear-gradient(to left, transparent, hsl(var(--background)))'
                }}
              />
            </>
          )}

          {/* Scrolling container */}
          <div
            ref={scrollRef}
            className={`flex gap-8 md:gap-12 ${prefersReducedMotion ? 'justify-center flex-wrap' : ''}`}
            style={!prefersReducedMotion ? {
              animation: isPaused ? 'none' : `marquee-${isRTL ? 'rtl' : 'ltr'} 40s linear infinite`,
              width: 'fit-content'
            } : {}}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocus={() => setIsPaused(true)}
            onBlur={() => setIsPaused(false)}
          >
            {duplicatedClients.map((client, index) => (
              <div
                key={`${client.id}-${index}`}
                className="flex-shrink-0 group"
              >
                {client.website_url ? (
                  <a
                    href={client.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block transition-opacity hover:opacity-70 focus:opacity-70 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                    aria-label={`${isRTL ? client.client_name_ar || client.client_name : client.client_name} website`}
                  >
                    <img
                      src={client.logo_url}
                      alt={client.alt_text || (isRTL ? client.client_name_ar || client.client_name : client.client_name)}
                      className="h-12 md:h-16 w-auto object-contain opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                      loading="lazy"
                    />
                  </a>
                ) : (
                  <div className="flex items-center h-12 md:h-16">
                    <img
                      src={client.logo_url}
                      alt={client.alt_text || (isRTL ? client.client_name_ar || client.client_name : client.client_name)}
                      className="h-full w-auto object-contain opacity-60"
                      loading="lazy"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes marquee-ltr {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-33.333%);
          }
        }

        @keyframes marquee-rtl {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(33.333%);
          }
        }
      `}</style>
    </section>
  );
}
