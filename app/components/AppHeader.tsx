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
    <header className="flex justify-between items-center mb-2xl px-md animate-fade-in">
      <div className="flex items-center space-x-md">
        {variant === 'withLogo' && (
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-button">
            <span className="text-white font-bold text-body">TS</span>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <h1 className="text-display-sm text-text-primary">TradeSizer AI</h1>
          <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse-subtle"></div>
        </div>
      </div>
      
      <div className="flex items-center space-x-sm">
        {context && !context.client.added && (
          <button
            onClick={handleAddFrame}
            disabled={isAdding}
            className="btn-secondary text-body-sm py-sm px-md"
          >
            {isAdding ? (
              <div className="flex items-center space-x-1">
                <div className="loading-spinner w-3 h-3"></div>
                <span>SAVING...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <span>SAVE</span>
              </div>
            )}
          </button>
        )}
        
        <button
          onClick={close}
          className="text-text-tertiary hover:text-text-primary text-body-sm font-semibold transition-all duration-200 hover:bg-surface-elevated px-sm py-xs rounded-md"
        >
          <div className="flex items-center space-x-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>CLOSE</span>
          </div>
        </button>
      </div>
    </header>
  )
}
