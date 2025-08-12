
'use client'

import { useAddFrame, useClose } from '@coinbase/onchainkit/minikit'
import { useState, useCallback } from 'react'

interface AppHeaderProps {
  variant?: 'withLogo' | 'withTitle'
  context?: any
}

export function AppHeader({ variant = 'withTitle', context }: AppHeaderProps) {
  const [isAdding, setIsAdding] = useState(false)
  const addFrame = useAddFrame()
  const close = useClose()

  const handleAddFrame = useCallback(async () => {
    setIsAdding(true)
    try {
      const result = await addFrame()
      if (result) {
        console.log('Frame added:', result.url, result.token)
      }
    } catch (error) {
      console.error('Failed to add frame:', error)
    } finally {
      setIsAdding(false)
    }
  }, [addFrame])

  return (
    <header className="flex justify-between items-center mb-lg px-md">
      <div className="flex items-center space-x-2">
        {variant === 'withLogo' && (
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-sm">TS</span>
          </div>
        )}
        <h1 className="text-display text-text-primary">TradeSizer AI</h1>
      </div>
      
      <div className="flex items-center space-x-2">
        {context && !context.client.added && (
          <button
            onClick={handleAddFrame}
            disabled={isAdding}
            className="btn-secondary text-sm py-2 px-3"
          >
            {isAdding ? 'SAVING...' : 'SAVE FRAME'}
          </button>
        )}
        
        <button
          onClick={close}
          className="text-text-secondary hover:text-text-primary text-sm font-semibold transition-colors"
        >
          CLOSE
        </button>
      </div>
    </header>
  )
}
