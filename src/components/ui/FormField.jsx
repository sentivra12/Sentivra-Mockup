import React from 'react';

const FormField = ({
  id,
  name,
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  icon: Icon,
  autoComplete,
  disabled = false,
  rows,
  className = ''
}) => {
  const inputClasses = `
    w-full ps-12 pe-4 py-3 
    border rounded-lg 
    text-primary-deep placeholder:text-muted
    focus:ring-2 focus:ring-primary focus:border-primary 
    outline-none transition-all duration-200
    disabled:bg-frost-soft disabled:cursor-not-allowed
    ${error ? 'border-red-500 focus:ring-red-500' : 'border-frost'}
  `.trim();

  const Element = type === 'textarea' ? 'textarea' : 'input';

  return (
    <div className={className}>
      {/* Label */}
      <label 
        htmlFor={id} 
        className="block text-sm font-medium text-text-muted mb-2"
      >
        {label}
        {required && <span className="text-red-500 ms-1">*</span>}
      </label>

      {/* Input Container */}
      <div className="relative">
        {/* Icon */}
        {Icon && (
          <div className="absolute start-4 top-3.5 pointer-events-none">
            <Icon className="h-5 w-5 text-muted" />
          </div>
        )}

        {/* Input/Textarea */}
        <Element
          id={id}
          name={name}
          type={type === 'textarea' ? undefined : type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          rows={rows}
          dir={type === 'tel' || type === 'email' ? 'ltr' : undefined}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
          className={inputClasses}
          style={type === 'textarea' ? { resize: 'vertical' } : undefined}
        />
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

export default FormField;


