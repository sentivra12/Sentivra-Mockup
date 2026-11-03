import React from 'react';
import { Check } from 'lucide-react';
import { projectChecklist } from '../../data/contactData';

const ProjectChecklistCard = () => {
  return (
    <div className="bg-gradient-to-br from-frost-soft to-frost rounded-2xl border border-frost p-6 lg:p-8 shadow-card">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-primary-deep mb-2">
          Ready to Start Your Project?
        </h3>
        <p className="text-sm text-text-muted">
          Here's what to expect when you work with us
        </p>
      </div>

      {/* Illustration */}
      <div className="mb-6 flex justify-center">
        <div className="relative w-32 h-32">
          {/* Simple illustration using shapes */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary-strong/30 rounded-full opacity-30"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-strong rounded-2xl shadow-lg flex items-center justify-center transform rotate-12">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center transform -rotate-12">
                <svg
                  className="w-10 h-10 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        {projectChecklist.map((item, index) => (
          <div
            key={index}
            className="flex items-start gap-3 group"
          >
            {/* Check Icon */}
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Check className="w-4 h-4 text-white" strokeWidth={3} />
            </div>

            {/* Text */}
            <p className="flex-1 text-sm font-medium text-primary-deep pt-0.5 group-hover:text-primary transition-colors">
              {item}
            </p>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-6 pt-6 border-t border-frost">
        <p className="text-xs text-text-muted text-center">
          Join{' '}
          <span className="font-bold text-primary">50+ satisfied clients</span>
          {' '}who trusted us
        </p>
      </div>
    </div>
  );
};

export default ProjectChecklistCard;


