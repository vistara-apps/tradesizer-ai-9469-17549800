'use client'

import { useState, useEffect } from 'react'

interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  custom?: (value: string) => string | null
}

interface InputFieldProps {
  variant?: 'default' | 'withLabel' | 'numeric'
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  suffix?: string
  validation?: ValidationRule
  showValidation?: boolean
  disabled?: boolean
  helperText?: string
  icon?: React.ReactNode
}

export function InputField({
  variant = 'default',
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  suffix,
  validation,
  showValidation = true,
  disabled = false,
  helperText,
  icon
}: InputFieldProps) {
  const [error, setError] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)
  const [focused, setFocused] = useState(false)

  const validateValue = (val: string): string | null => {
    if (!validation) return null

    if (validation.required && !val.trim()) {
      return 'This field is required'
    }

    if (validation.min !== undefined && parseFloat(val) < validation.min) {
      return `Value must be at least ${validation.min}`
    }

    if (validation.max !== undefined && parseFloat(val) > validation.max) {
      return `Value must be no more than ${validation.max}`
    }

    if (validation.pattern && !validation.pattern.test(val)) {
      return 'Invalid format'
    }

    if (validation.custom) {
      return validation.custom(val)
    }

    return null
  }

  useEffect(() => {
    if (touched && showValidation) {
      const validationError = validateValue(value)
      setError(validationError)
    }
  }, [value, touched, showValidation, validation])

  const getInputClasses = () => {
    const baseClass = variant === 'numeric' ? 'input-numeric' : 'input-field'
    const errorClass = error && touched ? 'input-field-error' : ''
    const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : ''
    
    return `${baseClass} ${errorClass} ${disabledClass}`
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value
    
    if (variant === 'numeric') {
      // Allow only numbers, decimal point, and negative sign
      newValue = newValue.replace(/[^0-9.-]/g, '')
      
      // Handle negative sign (only at the beginning)
      if (newValue.includes('-')) {
        const parts = newValue.split('-')
        newValue = '-' + parts.join('')
        if (newValue !== '-' && !newValue.startsWith('-')) {
          newValue = newValue.replace('-', '')
        }
      }
      
      // Prevent multiple decimal points
      const parts = newValue.split('.')
      if (parts.length > 2) {
        newValue = parts[0] + '.' + parts.slice(1).join('')
      }
    }
    
    onChange(newValue)
  }

  const handleBlur = () => {
    setTouched(true)
    setFocused(false)
  }

  const handleFocus = () => {
    setFocused(true)
  }

  const inputElement = (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary">
          {icon}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disabled}
        className={`${getInputClasses()} ${icon ? 'pl-10' : ''} ${suffix ? 'pr-12' : ''}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${label}-error` : helperText ? `${label}-helper` : undefined}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-tertiary text-body-sm font-medium">
          {suffix}
        </span>
      )}
      
      {/* Focus ring animation */}
      {focused && !error && (
        <div className="absolute inset-0 rounded-lg border-2 border-primary-500/20 animate-pulse pointer-events-none" />
      )}
    </div>
  )

  if (variant === 'withLabel') {
    return (
      <div className="input-with-label">
        {label && (
          <label className="text-caption text-text-secondary font-semibold uppercase tracking-wide">
            {label}
            {validation?.required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        
        {inputElement}
        
        {/* Error message */}
        {error && touched && showValidation && (
          <div 
            id={`${label}-error`}
            className="flex items-center space-x-1 text-body-sm text-error animate-slide-down"
            role="alert"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        
        {/* Helper text */}
        {helperText && !error && (
          <div 
            id={`${label}-helper`}
            className="text-body-sm text-text-tertiary"
          >
            {helperText}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {inputElement}
      
      {/* Error message for non-labeled inputs */}
      {error && touched && showValidation && (
        <div className="flex items-center space-x-1 text-body-sm text-error animate-slide-down">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
