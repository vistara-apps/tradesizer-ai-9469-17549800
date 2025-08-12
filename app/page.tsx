
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
      <div className="container mx-auto px-5 max-w-lg py-lg">
        <AppHeader variant="withTitle" context={context} />
        
        <main className="space-y-lg">
          <div className="text-center mb-lg">
            <p className="text-body text-text-secondary">
              Calculate your perfect crypto trade size instantly with proper risk management.
            </p>
          </div>

          <PositionCalculator onCalculationComplete={handleCalculationComplete} />
          
          <CalculationHistory newCalculation={lastCalculation} />
          
          <PlatformTemplates />

          <footer className="text-center pt-lg border-t border-text-secondary/10">
            <p className="text-caption text-text-secondary">
              Built on Base with MiniKit
            </p>
          </footer>
        </main>
      </div>
    </div>
  )
}
