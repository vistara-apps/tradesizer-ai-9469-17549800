'use client'

import { useMiniKit, usePrimaryButton, useAddFrame, useNotification } from '@coinbase/onchainkit/minikit'
import { useEffect, useState, useCallback } from 'react'
import { AppHeader } from './components/AppHeader'
import { PositionCalculator } from './components/PositionCalculator'
import { CalculationHistory } from './components/CalculationHistory'
import { PlatformTemplates } from './components/PlatformTemplates'

interface CalculationResult {
  positionSize: number
  riskAmount: number
  timestamp: Date
}

export default function TradeSizerAI() {
  const { setFrameReady, isFrameReady, context } = useMiniKit()
  const [lastCalculation, setLastCalculation] = useState<CalculationResult | undefined>(undefined)
  const [calculationMode, setCalculationMode] = useState('calculate')
  const addFrame = useAddFrame()
  const sendNotification = useNotification()

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady()
    }
  }, [setFrameReady, isFrameReady])

  const handleCalculationComplete = useCallback((result: CalculationResult) => {
    setLastCalculation(result)
    setCalculationMode('share')
    
    // Send notification on successful calculation
    if (context?.client.added) {
      sendNotification({
        title: 'Position Size Calculated! 📊',
        body: `Your position size: $${result.positionSize.toLocaleString()}`
      }).catch(console.error)
    }
  }, [context, sendNotification])

  const handleShareCalculation = useCallback(() => {
    if (lastCalculation) {
      // In a real implementation, this would create a Farcaster frame
      console.log('Sharing calculation:', lastCalculation)
      setCalculationMode('calculate')
    }
  }, [lastCalculation])

  const handleNewCalculation = useCallback(() => {
    setCalculationMode('calculate')
    setLastCalculation(undefined)
  }, [])

  // Primary button management
  usePrimaryButton(
    {
      text: calculationMode === 'share' && lastCalculation 
        ? 'Share Calculation' 
        : 'New Calculation'
    },
    calculationMode === 'share' && lastCalculation 
      ? handleShareCalculation 
      : handleNewCalculation
  )

  return (
    <div className="min-h-screen bg-bg">
      <div className="container mx-auto px-lg max-w-lg py-xl">
        <AppHeader variant="withTitle" context={context} />
        
        <main className="space-y-2xl">
          <div className="text-center mb-xl animate-fade-in">
            <div className="space-y-md">
              <h2 className="text-display text-gradient">Smart Position Sizing</h2>
              <p className="text-body-lg text-text-secondary max-w-md mx-auto">
                Calculate your perfect crypto trade size instantly with proper risk management and professional-grade precision.
              </p>
              
              {/* Feature highlights */}
              <div className="flex justify-center space-x-lg pt-md">
                <div className="flex items-center space-x-1 text-body-sm text-text-tertiary">
                  <svg className="w-4 h-4 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Risk Management</span>
                </div>
                <div className="flex items-center space-x-1 text-body-sm text-text-tertiary">
                  <svg className="w-4 h-4 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Instant Results</span>
                </div>
              </div>
            </div>
          </div>

          <PositionCalculator onCalculationComplete={handleCalculationComplete} />
          
          <CalculationHistory newCalculation={lastCalculation} />
          
          <PlatformTemplates />

          <footer className="text-center pt-2xl border-t border-border animate-fade-in">
            <div className="space-y-sm">
              <p className="text-caption text-text-tertiary">
                Built on Base with MiniKit
              </p>
              <div className="flex justify-center space-x-md">
                <div className="flex items-center space-x-1 text-caption text-text-tertiary">
                  <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse-subtle"></div>
                  <span>Secure</span>
                </div>
                <div className="flex items-center space-x-1 text-caption text-text-tertiary">
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse-subtle"></div>
                  <span>Fast</span>
                </div>
                <div className="flex items-center space-x-1 text-caption text-text-tertiary">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse-subtle"></div>
                  <span>Reliable</span>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
