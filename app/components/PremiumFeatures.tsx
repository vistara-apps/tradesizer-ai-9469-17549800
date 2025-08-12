'use client'

import { useState } from 'react'
import { PaymentButton } from './PaymentButton'
import { PAYMENT_CONFIG } from '../lib/payment-config'
import { Card } from './Card'

interface PremiumAnalysis {
  riskScore: number
  volatilityIndex: number
  marketSentiment: string
  recommendedPositionSize: number
  analysis: {
    technicalIndicators: any
    fundamentals: any
    riskFactors: string[]
    opportunities: string[]
  }
  recommendations: string[]
}

export function PremiumFeatures() {
  const [premiumData, setPremiumData] = useState<PremiumAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handlePremiumAnalysisSuccess = (data: PremiumAnalysis) => {
    setPremiumData(data)
    setIsLoading(false)
  }

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error)
    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-text-primary mb-2">
          Premium AI Analysis
        </h2>
        <p className="text-text-secondary text-sm">
          Get advanced trading insights powered by AI for just {PAYMENT_CONFIG.premiumAnalysis} USDC
        </p>
      </div>

      {!premiumData ? (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-4 bg-bg-secondary rounded-lg">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-medium">Risk Analysis</div>
                <div className="text-text-secondary">Advanced risk scoring</div>
              </div>
              <div className="text-center p-4 bg-bg-secondary rounded-lg">
                <div className="text-2xl mb-2">🎯</div>
                <div className="font-medium">AI Recommendations</div>
                <div className="text-text-secondary">Personalized trading advice</div>
              </div>
              <div className="text-center p-4 bg-bg-secondary rounded-lg">
                <div className="text-2xl mb-2">📈</div>
                <div className="font-medium">Market Insights</div>
                <div className="text-text-secondary">Technical & fundamental analysis</div>
              </div>
            </div>

            <PaymentButton
              url="/api/premium-analysis?symbol=BTC&riskLevel=medium"
              amount={PAYMENT_CONFIG.premiumAnalysis}
              description="Premium AI Trading Analysis"
              onSuccess={handlePremiumAnalysisSuccess}
              onError={handlePaymentError}
              className="w-full"
            >
              🚀 Unlock Premium Analysis
            </PaymentButton>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Premium Analysis Results */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-text-primary">
                Premium Analysis Results
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✅ Paid</span>
                <button
                  onClick={() => setPremiumData(null)}
                  className="text-text-secondary hover:text-text-primary text-sm"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Key Metrics */}
              <div className="space-y-4">
                <h4 className="font-medium text-text-primary">Key Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Risk Score:</span>
                    <span className="font-medium">{premiumData.riskScore}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Volatility Index:</span>
                    <span className="font-medium">{premiumData.volatilityIndex}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Market Sentiment:</span>
                    <span className="font-medium">{premiumData.marketSentiment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Recommended Size:</span>
                    <span className="font-medium">{(premiumData.recommendedPositionSize * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* Technical Indicators */}
              <div className="space-y-4">
                <h4 className="font-medium text-text-primary">Technical Indicators</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">RSI:</span>
                    <span className="font-medium">{premiumData.analysis.technicalIndicators.rsi}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">MACD:</span>
                    <span className="font-medium">{premiumData.analysis.technicalIndicators.macd}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Support:</span>
                    <span className="font-medium">{premiumData.analysis.technicalIndicators.support}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Resistance:</span>
                    <span className="font-medium">{premiumData.analysis.technicalIndicators.resistance}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Factors */}
            <div className="mt-6">
              <h4 className="font-medium text-text-primary mb-3">Risk Factors</h4>
              <ul className="space-y-2">
                {premiumData.analysis.riskFactors.map((factor, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">⚠️</span>
                    <span className="text-text-secondary text-sm">{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Opportunities */}
            <div className="mt-6">
              <h4 className="font-medium text-text-primary mb-3">Opportunities</h4>
              <ul className="space-y-2">
                {premiumData.analysis.opportunities.map((opportunity, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">✅</span>
                    <span className="text-text-secondary text-sm">{opportunity}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="mt-6">
              <h4 className="font-medium text-text-primary mb-3">AI Recommendations</h4>
              <ul className="space-y-2">
                {premiumData.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">💡</span>
                    <span className="text-text-secondary text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          {/* Additional Premium Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h4 className="font-medium text-text-primary mb-2">Historical Data Access</h4>
              <p className="text-text-secondary text-sm mb-3">
                Access 5 years of historical trading data and backtesting results.
              </p>
              <PaymentButton
                url="/api/premium-analysis?type=historical"
                amount={PAYMENT_CONFIG.historicalData}
                description="Historical Data Access"
                onSuccess={(data) => console.log('Historical data:', data)}
                onError={handlePaymentError}
                className="w-full"
              >
                📊 Get Historical Data
              </PaymentButton>
            </Card>

            <Card className="p-4">
              <h4 className="font-medium text-text-primary mb-2">AI Trading Signals</h4>
              <p className="text-text-secondary text-sm mb-3">
                Real-time AI-powered trading signals and alerts.
              </p>
              <PaymentButton
                url="/api/premium-analysis?type=signals"
                amount={PAYMENT_CONFIG.aiRecommendations}
                description="AI Trading Signals"
                onSuccess={(data) => console.log('Trading signals:', data)}
                onError={handlePaymentError}
                className="w-full"
              >
                🤖 Get AI Signals
              </PaymentButton>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
