
'use client'

interface CardProps {
  variant?: 'default' | 'result'
  children: React.ReactNode
  className?: string
}

export function Card({ variant = 'default', children, className = '' }: CardProps) {
  const getCardClasses = () => {
    switch (variant) {
      case 'result':
        return 'card-result'
      default:
        return 'card'
    }
  }

  return (
    <div className={`${getCardClasses()} ${className} animate-slide-up`}>
      {children}
    </div>
  )
}
