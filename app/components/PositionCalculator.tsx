'use client'

import { useState, useCallback } from 'react'
import { InputField } from './InputField'
import { Button } from './Button'
import { Card } from './Card'
import { Tabs } from './Tabs'

interface CalculationResult {
  positionSize: number
  riskAmount: number
  timestamp: Date
}

interface PositionCalculatorProps {
  onCalculationComplete?: (result: CalculationResult) => void
}

export function PositionCalculator({ onCalculationComplete }: PositionCalculatorProps) {
  const [activeTab, setActiveTab] = useState('crypto')
  const [accountBalance, setAccountBalance] = useState('')
  const [riskPercentage, setRiskPercentage] = useState('2')
  const [stopLossDistance, setStopLossDistance] = useState('')
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [copied, setCopied] = useState(false)

  const tabs = [
    { id: 'crypto', label: 'Crypto' },
    { id: 'forex', label: 'Forex' }
  ]

  const calculatePositionSize = useCallback(async () => {
    const balance = parseFloat(accountBalance)
    const risk = parseFloat(riskPercentage)
    const stopLoss = parseFloat(stopLossDistance)

    if (!balance || !risk || !stopLoss) {
      return
    }

    // Simulate calculation delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800))

    const riskAmount = (balance * risk) / 100
    let positionSize: number

    if (activeTab === 'crypto') {
      // For crypto: Position Size = Risk Amount / (Stop Loss Distance / 100)
      positionSize = riskAmount / (stopLoss / 100)
    } else {
      // For forex: Position Size = Risk Amount / Stop Loss in Pips (simplified)
      positionSize = riskAmount / stopLoss
    }

    const calculationResult: CalculationResult = {
      positionSize: Math.round(positionSize * 100) / 100,
      riskAmount: Math.round(riskAmount * 100) / 100,
      timestamp: new Date()
    }

    setResult(calculationResult)
    onCalculationComplete?.(calculationResult)
  }, [accountBalance, riskPercentage, stopLossDistance, activeTab, onCalculationComplete])

  const copyToClipboard = useCallback(async () => {
    if (!result) return

    try {
      await navigator.clipboard.writeText(result.positionSize.toString())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }, [result])

  return (
    <div className="space-y-lg">
      <Card>
        <Tabs
          variant="platformSelector"
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="space-y-lg">
          <InputField
            variant="numeric"
            label="Account Balance"
            value={accountBalance}
            onChange={setAccountBalance}
            placeholder="10000"
            type="text"
            suffix="USD"
            validation={{
              required: true,
              min: 1,
              max: 10000000,
              custom: (value) => {
                const num = parseFloat(value)
                if (isNaN(num)) return 'Please enter a valid number'
                return null
              }
            }}
            helperText="Enter your total trading account balance"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            }
          />

          <InputField
            variant="numeric"
            label="Risk Percentage"
            value={riskPercentage}
            onChange={setRiskPercentage}
            placeholder="2"
            type="text"
            suffix="%"
            validation={{
              required: true,
              min: 0.1,
              max: 10,
              custom: (value) => {
                const num = parseFloat(value)
                if (isNaN(num)) return 'Please enter a valid percentage'
                if (num > 5) return 'Consider using a lower risk percentage (≤5%)'
                return null
              }
            }}
            helperText="Recommended: 1-3% of your account balance"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />

          <InputField
            variant="numeric"
            label={activeTab === 'crypto' ? 'Stop Loss Distance (%)' : 'Stop Loss Distance (Pips)'}
            value={stopLossDistance}
            onChange={setStopLossDistance}
            placeholder={activeTab === 'crypto' ? '5' : '50'}
            type="text"
            suffix={activeTab === 'crypto' ? '%' : 'pips'}
            validation={{
              required: true,
              min: activeTab === 'crypto' ? 0.1 : 1,
              max: activeTab === 'crypto' ? 50 : 1000,
              custom: (value) => {
                const num = parseFloat(value)
                if (isNaN(num)) return 'Please enter a valid number'
                return null
              }
            }}
            helperText={activeTab === 'crypto' ? 'Distance from entry to stop loss' : 'Stop loss distance in pips'}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            }
          />

          <Button
            variant="primary"
            size="lg"
            onClick={calculatePositionSize}
            disabled={!accountBalance || !riskPercentage || !stopLossDistance}
            className="w-full"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            }
          >
            Calculate Position Size
          </Button>
        </div>
      </Card>

      {result && (
        <Card variant="result">
          <div className="text-center space-y-lg animate-scale-in">
            {/* Success indicator */}
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-accent-500 rounded-full flex items-center justify-center animate-bounce-subtle">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <div className="space-y-md">
              <h3 className="text-display-sm text-gradient">Position Size Calculated</h3>
              
              {/* Main result */}
              <div className="bg-white/50 rounded-xl p-lg border border-accent-200/50">
                <div className="text-4xl font-bold text-text-primary tabular-nums">
                  ${result.positionSize.toLocaleString()}
                </div>
                <div className="text-body-sm text-text-secondary mt-1">
                  Recommended position size
                </div>
              </div>

              {/* Risk breakdown */}
              <div className="grid grid-cols-2 gap-md">
                <div className="bg-white/30 rounded-lg p-md">
                  <div className="text-title font-semibold text-text-primary tabular-nums">
                    ${result.riskAmount.toLocaleString()}
                  </div>
                  <div className="text-caption text-text-secondary">
                    Risk Amount
                  </div>
                </div>
                <div className="bg-white/30 rounded-lg p-md">
                  <div className="text-title font-semibold text-text-primary tabular-nums">
                    {((result.riskAmount / parseFloat(accountBalance)) * 100).toFixed(1)}%
                  </div>
                  <div className="text-caption text-text-secondary">
                    Account Risk
                  </div>
                </div>
              </div>

              {/* Risk level indicator */}
              <div className="flex items-center justify-center space-x-2">
                {(() => {
                  const riskPercent = parseFloat(riskPercentage)
                  if (riskPercent <= 2) {
                    return (
                      <>
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                        <span className="text-body-sm text-success font-medium">Conservative Risk</span>
                      </>
                    )
                  } else if (riskPercent <= 5) {
                    return (
                      <>
                        <div className="w-2 h-2 bg-warning rounded-full"></div>
                        <span className="text-body-sm text-warning font-medium">Moderate Risk</span>
                      </>
                    )
                  } else {
                    return (
                      <>
                        <div className="w-2 h-2 bg-error rounded-full"></div>
                        <span className="text-body-sm text-error font-medium">High Risk</span>
                      </>
                    )
                  }
                })()}
              </div>
            </div>
            
            <div className="flex space-x-md pt-md">
              <Button
                variant="copy"
                size="md"
                onClick={copyToClipboard}
                className="flex-1"
                icon={
                  copied ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )
                }
              >
                {copied ? 'Copied!' : 'Copy Size'}
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setResult(null)}
                className="flex-1"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                }
              >
                New Calculation
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
