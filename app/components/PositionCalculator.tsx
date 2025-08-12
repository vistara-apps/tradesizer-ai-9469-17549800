
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

  const calculatePositionSize = useCallback(() => {
    const balance = parseFloat(accountBalance)
    const risk = parseFloat(riskPercentage)
    const stopLoss = parseFloat(stopLossDistance)

    if (!balance || !risk || !stopLoss) {
      return
    }

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

        <div className="space-y-md">
          <InputField
            variant="withLabel"
            label="Account Balance"
            value={accountBalance}
            onChange={setAccountBalance}
            placeholder="10000"
            type="text"
            suffix="USD"
          />

          <InputField
            variant="withLabel"
            label="Risk Percentage"
            value={riskPercentage}
            onChange={setRiskPercentage}
            placeholder="2"
            type="text"
            suffix="%"
          />

          <InputField
            variant="withLabel"
            label={activeTab === 'crypto' ? 'Stop Loss Distance (%)' : 'Stop Loss Distance (Pips)'}
            value={stopLossDistance}
            onChange={setStopLossDistance}
            placeholder={activeTab === 'crypto' ? '5' : '50'}
            type="text"
            suffix={activeTab === 'crypto' ? '%' : 'pips'}
          />

          <Button
            variant="primary"
            onClick={calculatePositionSize}
            disabled={!accountBalance || !riskPercentage || !stopLossDistance}
            className="w-full"
          >
            Calculate Position Size
          </Button>
        </div>
      </Card>

      {result && (
        <Card variant="result">
          <div className="text-center space-y-md">
            <h3 className="text-display text-accent">Position Size</h3>
            <div className="text-3xl font-bold text-text-primary">
              ${result.positionSize.toLocaleString()}
            </div>
            <div className="text-caption text-text-secondary">
              Risk Amount: ${result.riskAmount.toLocaleString()}
            </div>
            
            <div className="flex space-x-2 pt-md">
              <Button
                variant="copy"
                onClick={copyToClipboard}
                className="flex-1"
              >
                {copied ? 'Copied!' : 'Copy Size'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setResult(null)}
                className="flex-1"
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
