import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQAccordion = ({ faqs = [] }) => {
  const [openIndex, setOpenIndex] = useState(0); // First item open by default

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleFAQ(index);
    }
  };

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        const accordionId = `faq-${index}`;
        const contentId = `faq-content-${index}`;

        return (
          <div
            key={index}
            className="bg-color-background rounded-xl border border-frost overflow-hidden"
          >
            <button
              id={accordionId}
              onClick={() => toggleFAQ(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              aria-expanded={isOpen}
              aria-controls={contentId}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-frost-soft transition-colors duration-200 group"
            >
              <span className="font-semibold text-primary-deep pr-4 group-hover:text-primary transition-colors">
                {faq.question}
              </span>
              <ChevronDown
                className={`h-5 w-5 text-primary flex-shrink-0 transition-transform duration-300 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={contentId}
                  role="region"
                  aria-labelledby={accordionId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 pt-2 text-text-muted leading-relaxed">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default FAQAccordion;


