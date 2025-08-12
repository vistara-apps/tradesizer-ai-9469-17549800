
'use client'

interface InputFieldProps {
  variant?: 'default' | 'withLabel' | 'numeric'
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  suffix?: string
}

export function InputField({
  variant = 'default',
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  suffix
}: InputFieldProps) {
  const getInputClasses = () => {
    switch (variant) {
      case 'numeric':
        return 'input-numeric'
      default:
        return 'input-field'
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value
    
    if (variant === 'numeric') {
      // Allow only numbers and decimal point
      newValue = newValue.replace(/[^0-9.]/g, '')
      // Prevent multiple decimal points
      const parts = newValue.split('.')
      if (parts.length > 2) {
        newValue = parts[0] + '.' + parts.slice(1).join('')
      }
    }
    
    onChange(newValue)
  }

  if (variant === 'withLabel') {
    return (
      <div className="input-with-label">
        {label && (
          <label className="text-caption text-text-secondary font-semibold">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            type={type}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className={getInputClasses()}
          />
          {suffix && (
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary text-sm">
              {suffix}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={getInputClasses()}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary text-sm">
          {suffix}
        </span>
      )}
    </div>
  )
}
