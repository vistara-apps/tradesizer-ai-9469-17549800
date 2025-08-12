
'use client'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'copy'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export function Button({
  variant = 'primary',
  children,
  onClick,
  disabled = false,
  className = ''
}: ButtonProps) {
  const getButtonClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'btn-secondary'
      case 'copy':
        return 'btn-copy'
      default:
        return 'btn-primary'
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${getButtonClasses()} ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } animate-fade-in`}
    >
      {children}
    </button>
  )
}
