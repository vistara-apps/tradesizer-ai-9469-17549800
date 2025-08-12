
'use client'

import { useState, useEffect } from 'react'
import { Card } from './Card'
import { Button } from './Button'

interface CalculationHistoryItem {
  id: string
  positionSize: number
  riskAmount: number
  timestamp: Date
  accountBalance: number
  riskPercentage: number
}

interface CalculationHistoryProps {
  newCalculation?: {
    positionSize: number
    riskAmount: number
    timestamp: Date
  }
}

export function CalculationHistory({ newCalculation }: CalculationHistoryProps) {
  const [history, setHistory] = useState<CalculationHistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    // Load history from localStorage
    const saved = localStorage.getItem('tradeSizerHistory')
    if (saved) {
      try {
        const parsed = JSON.parse(saved).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }))
        setHistory(parsed)
      } catch (error) {
        console.error('Failed to load history:', error)
      }
    }
  }, [])

  useEffect(() => {
    if (newCalculation) {
      const newItem: CalculationHistoryItem = {
        id: Date.now().toString(),
        ...newCalculation,
        accountBalance: 0, // Would be passed from parent in real implementation
        riskPercentage: 0
      }

      const updatedHistory = [newItem, ...history].slice(0, 10) // Keep last 10
      setHistory(updatedHistory)
      
      // Save to localStorage
      localStorage.setItem('tradeSizerHistory', JSON.stringify(updatedHistory))
    }
  }, [newCalculation, history])

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('tradeSizerHistory')
  }

  if (!showHistory) {
    return (
      <div className="text-center">
        <Button
          variant="secondary"
          onClick={() => setShowHistory(true)}
          className="w-full"
        >
          View Calculation History ({history.length})
        </Button>
      </div>
    )
  }

  return (
    <Card>
      <div className="flex justify-between items-center mb-md">
        <h3 className="text-lg font-semibold text-text-primary">Recent Calculations</h3>
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            onClick={clearHistory}
            className="text-sm py-2 px-3"
          >
            Clear
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowHistory(false)}
            className="text-sm py-2 px-3"
          >
            Hide
          </Button>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center text-text-secondary py-md">
          No calculations yet
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center p-3 bg-bg rounded-md border border-text-secondary/10"
            >
              <div>
                <div className="font-semibold text-text-primary">
                  ${item.positionSize.toLocaleString()}
                </div>
                <div className="text-caption text-text-secondary">
                  Risk: ${item.riskAmount.toLocaleString()}
                </div>
              </div>
              <div className="text-caption text-text-secondary text-right">
                {item.timestamp.toLocaleDateString()}<br />
                {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
