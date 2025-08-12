
'use client'

import { useState } from 'react'
import { Card } from './Card'
import { Button } from './Button'
import { Tabs } from './Tabs'

interface Template {
  id: string
  name: string
  instructions: string[]
}

const templates: Template[] = [
  {
    id: 'tradingview',
    name: 'TradingView',
    instructions: [
      '1. Open your TradingView chart',
      '2. Click on "Trading Panel" at the bottom',
      '3. Enter the calculated position size in "Quantity" field',
      '4. Set your stop loss and take profit levels',
      '5. Click "Buy" or "Sell" to place the order'
    ]
  },
  {
    id: 'binance',
    name: 'Binance',
    instructions: [
      '1. Go to Binance Spot/Futures trading',
      '2. Select your trading pair',
      '3. Choose "Limit" or "Market" order',
      '4. Enter the calculated amount in "Amount" field',
      '5. Set stop loss in "Stop-Limit" section',
      '6. Click "Buy" or "Sell"'
    ]
  },
  {
    id: 'coinbase',
    name: 'Coinbase Pro',
    instructions: [
      '1. Open Coinbase Pro trading interface',
      '2. Select your trading pair',
      '3. Choose order type (Market/Limit)',
      '4. Enter calculated amount in "Size" field',
      '5. Set price if using limit order',
      '6. Click "Place Order"'
    ]
  }
]

export function PlatformTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState('tradingview')
  const [showTemplates, setShowTemplates] = useState(false)

  const tabs = templates.map(template => ({
    id: template.id,
    label: template.name
  }))

  const currentTemplate = templates.find(t => t.id === selectedTemplate)

  if (!showTemplates) {
    return (
      <div className="text-center">
        <Button
          variant="secondary"
          onClick={() => setShowTemplates(true)}
          className="w-full"
        >
          View Platform Templates
        </Button>
      </div>
    )
  }

  return (
    <Card>
      <div className="flex justify-between items-center mb-md">
        <h3 className="text-lg font-semibold text-text-primary">Platform Templates</h3>
        <Button
          variant="secondary"
          onClick={() => setShowTemplates(false)}
          className="text-sm py-2 px-3"
        >
          Hide
        </Button>
      </div>

      <Tabs
        variant="platformSelector"
        tabs={tabs}
        activeTab={selectedTemplate}
        onTabChange={setSelectedTemplate}
      />

      {currentTemplate && (
        <div className="space-y-3">
          <h4 className="font-semibold text-text-primary">
            How to use on {currentTemplate.name}:
          </h4>
          <div className="space-y-2">
            {currentTemplate.instructions.map((instruction, index) => (
              <div
                key={index}
                className="text-body text-text-secondary bg-bg p-3 rounded-md"
              >
                {instruction}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
