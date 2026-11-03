import React from 'react';
import { Globe } from 'lucide-react';

const CountrySelect = ({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  countries = [],
  disabled = false,
  className = ''
}) => {
  return (
    <div className={className}>
      {/* Label */}
      <label 
        htmlFor={id} 
        className="block text-sm font-medium text-text-muted mb-2"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Select Container */}
      <div className="relative">
        {/* Icon */}
        <div className="absolute left-4 top-3.5 pointer-events-none">
          <Globe className="h-5 w-5 text-muted" />
        </div>

        {/* Select */}
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`
            w-full pl-12 pr-4 py-3 
            border rounded-lg 
            text-primary-deep
            focus:ring-2 focus:ring-primary focus:border-primary 
            outline-none transition-all duration-200
            disabled:bg-frost-soft disabled:cursor-not-allowed
            appearance-none cursor-pointer
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-frost'}
            ${!value ? 'text-muted' : 'text-primary-deep'}
          `.trim()}
        >
          <option value="" disabled>Select your country</option>
          {countries.map((country) => (
            <option key={country.value} value={country.value}>
              {country.label}
            </option>
          ))}
        </select>

        {/* Dropdown Arrow */}
        <div className="absolute right-4 top-4 pointer-events-none">
          <svg className="h-5 w-5 text-muted" fill="none" viewBox="0 0 20 20" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p 
          id={`${id}-error`} 
          className="mt-2 text-sm text-red-600 flex items-center gap-1"
          role="alert"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default CountrySelect;


