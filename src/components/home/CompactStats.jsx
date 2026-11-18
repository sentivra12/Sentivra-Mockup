/**
 * CompactStats — 4 items, 2x2 mobile, 1x4 desktop, tight spacing, count-up
 */

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { getIcon } from '@/utils/iconMap';
import { useMotionPreference } from '@/hooks/useMotionPreference';

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function StatCard({ stat, index, isRTL, motionMode }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);
  const rafRef = useRef(null);

  const valueStr = String(stat.value || '');
  const numericValue = parseInt(valueStr) || 0;
  const isNumeric = !isNaN(numericValue) && valueStr && /^\d+$/.test(valueStr.trim());
  const prefix = stat.prefix || '';
  const suffix = stat.suffix || '';
  
  const Icon = getIcon(stat.icon);
  
  const finalValueFormatted = isNumeric
    ? new Intl.NumberFormat(isRTL ? 'ar' : 'en').format(numericValue)
    : valueStr;
  
  const ariaLabel = `${prefix}${finalValueFormatted}${suffix} ${isRTL ? (stat.label_ar || stat.label_en || stat.label) : (stat.label_en || stat.label_ar || stat.label)}`;

  const finalDisplayWidth = isNumeric 
    ? `${(prefix + finalValueFormatted + suffix).length + 1}ch`
    : 'auto';

  // IntersectionObserver
  useEffect(() => {
    if (!cardRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  // Count-up animation
  useEffect(() => {
    if (!isVisible || !isNumeric) return;

    // Motion off: instant
    if (motionMode === 'off') {
      setDisplayValue(numericValue);
      return;
    }

    const duration = motionMode === 'calm' ? 700 : 1600;
    const startTime = performance.now() + (index * 100);

    function animate(currentTime) {
      if (document.hidden) {
        setDisplayValue(numericValue);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        return;
      }

      const elapsed = currentTime - startTime;
      
      if (elapsed < 0) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      if (elapsed < duration) {
        const progress = elapsed / duration;
        const easedProgress = easeOutCubic(progress);
        const current = Math.floor(easedProgress * numericValue);
        setDisplayValue(current);
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(numericValue);
      }
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isVisible, numericValue, isNumeric, motionMode, index]);

  const formattedDisplay = isNumeric
    ? new Intl.NumberFormat(isRTL ? 'ar' : 'en').format(displayValue)
    : valueStr;

  return (
    <div
      ref={cardRef}
      className="flex flex-col items-center text-center"
      style={{ paddingTop: 10, paddingBottom: 10 }}
      role="img"
      aria-label={ariaLabel}
    >
      {Icon && (
        <div
          className="flex items-center justify-center"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'rgba(16,185,129,0.15)',
            marginBottom: 6,
          }}
          aria-hidden="true"
        >
          <Icon
            style={{
              width: 20,
              height: 20,
              color: 'rgb(110, 231, 183)',
            }}
          />
        </div>
      )}

      <div
        style={{
          fontSize: 34,
          lineHeight: 1,
          marginBottom: 4,
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
          minWidth: finalDisplayWidth,
          color: 'rgba(255,255,255,0.96)',
        }}
        aria-hidden="true"
      >
        {prefix}{isNumeric ? formattedDisplay : valueStr}{suffix}
      </div>

      <p
        style={{
          fontSize: 14,
          lineHeight: 1.3,
          color: 'rgba(255,255,255,0.72)',
          fontWeight: 500,
        }}
        aria-hidden="true"
      >
        {isRTL ? (stat.label_ar || stat.label_en || stat.label) : (stat.label_en || stat.label_ar || stat.label)}
      </p>
    </div>
  );
}

export default function CompactStats({ stats = [] }) {
  const { language } = useTranslation();
  const isRTL = language === 'ar';
  const { motionMode } = useMotionPreference();

  // Filter: active only, skip Team Members, limit 4
  let filteredStats = stats.filter(s => {
    if (s.is_active === false) return false;
    
    const key = (s.key || '').toLowerCase();
    const labelEn = (s.label_en || s.label || '').toLowerCase();
    const labelAr = (s.label_ar || '').toLowerCase();
    
    if (key.includes('team')) return false;
    if (labelEn.includes('team member')) return false;
    if (labelAr.includes('أعضاء') || labelAr.includes('فريق')) return false;
    
    return true;
  }).slice(0, 4);

  if (filteredStats.length === 0) return null;

  return (
    <section
      className="relative overflow-hidden"
      style={{
        paddingTop: 36,
        paddingBottom: 36,
        background: 'linear-gradient(to bottom, #020f0d 0%, #04211c 45%, #0b3d33 100%)',
      }}
      aria-label={isRTL ? 'إحصائيات' : 'Statistics'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="grid grid-cols-2 md:grid-cols-4"
          style={{ gap: '20px 0' }}
        >
          {filteredStats.map((stat, idx) => (
            <div
              key={stat.id}
              className="relative"
              style={{
                borderInlineEnd: idx % 2 === 0 && idx < 3 ? '1px solid rgba(255,255,255,0.1)' : 'none',
              }}
            >
              <StatCard stat={stat} index={idx} isRTL={isRTL} motionMode={motionMode} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
