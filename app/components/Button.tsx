'use client'

import { useState } from 'react'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'copy'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: () => void | Promise<void>
  disabled?: boolean
  loading?: boolean
  className?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  loading: externalLoading = false,
  className = '',
  icon,
  iconPosition = 'left'
}: ButtonProps) {
  const [internalLoading, setInternalLoading] = useState(false)
  const isLoading = externalLoading || internalLoading

  const getButtonClasses = () => {
    const baseClasses = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      copy: 'btn-copy'
    }[variant]

    const sizeClasses = {
      sm: 'px-md py-sm text-body-sm',
      md: 'px-lg py-md text-body',
      lg: 'px-xl py-lg text-body-lg'
    }[size]

    return `${baseClasses} ${sizeClasses}`
  }

  const handleClick = async () => {
    if (disabled || isLoading || !onClick) return

    try {
      setInternalLoading(true)
      await onClick()
    } catch (error) {
      console.error('Button click error:', error)
    } finally {
      setInternalLoading(false)
    }
  }

  const LoadingSpinner = () => (
    <div className="loading-spinner w-4 h-4" />
  )

  const buttonContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center space-x-2">
          <LoadingSpinner />
          <span>Loading...</span>
        </div>
      )
    }

    if (icon) {
      return (
        <div className="flex items-center justify-center space-x-2">
          {iconPosition === 'left' && <span className="w-4 h-4">{icon}</span>}
          <span>{children}</span>
          {iconPosition === 'right' && <span className="w-4 h-4">{icon}</span>}
        </div>
      )
    }

    return children
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`
        ${getButtonClasses()} 
        ${className} 
        ${disabled || isLoading ? 'btn-loading' : ''} 
        animate-fade-in
        relative
        overflow-hidden
        group
      `}
      aria-disabled={disabled || isLoading}
      aria-busy={isLoading}
    >
      {/* Ripple effect overlay */}
      <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-active:scale-x-100 transition-transform duration-300 origin-left" />
      
      {/* Button content */}
      <div className="relative z-10">
        {buttonContent()}
      </div>
    </button>
  )
}
