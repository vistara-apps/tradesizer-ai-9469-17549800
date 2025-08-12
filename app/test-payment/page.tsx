'use client'

import { useState } from 'react'
import { useAccount, useConnect, useChainId } from 'wagmi'
import { PaymentButton } from '../components/PaymentButton'
import { TransactionStatus } from '../components/TransactionStatus'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { PAYMENT_CONFIG } from '../lib/payment-config'

interface TestResult {
  testName: string
  status: 'pending' | 'success' | 'error'
  message: string
  data?: any
  error?: any
  timestamp: Date
}

export default function PaymentTestPage() {
  const { isConnected, address } = useAccount()
  const { connect, connectors } = useConnect()
  const chainId = useChainId()
  
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [currentTransactionHash, setCurrentTransactionHash] = useState<string | null>(null)

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [...prev, result])
  }

  const clearResults = () => {
    setTestResults([])
    setCurrentTransactionHash(null)
  }

  const connectWallet = () => {
    const coinbaseConnector = connectors.find(c => c.name === 'Coinbase Wallet')
    if (coinbaseConnector) {
      connect({ connector: coinbaseConnector })
    }
  }

  const runBasicPaymentTest = async () => {
    addTestResult({
      testName: 'Basic Payment Flow',
      status: 'pending',
      message: 'Testing basic x402 payment flow...',
      timestamp: new Date(),
    })

    try {
      const response = await fetch('/api/payment-test?type=basic&amount=0.01')
      
      if (response.status === 402) {
        addTestResult({
          testName: 'Basic Payment Flow',
          status: 'success',
          message: '✅ 402 Payment Required response received correctly',
          data: await response.json(),
          timestamp: new Date(),
        })
      } else {
        throw new Error(`Expected 402 status, got ${response.status}`)
      }
    } catch (error: any) {
      addTestResult({
        testName: 'Basic Payment Flow',
        status: 'error',
        message: '❌ Basic payment test failed',
        error: error.message,
        timestamp: new Date(),
      })
    }
  }

  const runErrorHandlingTest = async () => {
    addTestResult({
      testName: 'Error Handling',
      status: 'pending',
      message: 'Testing error handling scenarios...',
      timestamp: new Date(),
    })

    try {
      // Test invalid endpoint
      const response = await fetch('/api/nonexistent-endpoint')
      
      if (response.status === 404) {
        addTestResult({
          testName: 'Error Handling',
          status: 'success',
          message: '✅ 404 error handled correctly',
          timestamp: new Date(),
        })
      }
    } catch (error: any) {
      addTestResult({
        testName: 'Error Handling',
        status: 'success',
        message: '✅ Network error handled correctly',
        error: error.message,
        timestamp: new Date(),
      })
    }
  }

  const runUSDCIntegrationTest = async () => {
    addTestResult({
      testName: 'USDC Integration',
      status: 'pending',
      message: 'Testing USDC token configuration...',
      timestamp: new Date(),
    })

    try {
      const response = await fetch('/api/payment-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testScenario: 'usdc-integration',
          customAmount: '0.01',
        }),
      })

      if (response.status === 402) {
        const data = await response.json()
        const paymentReq = data.paymentRequirements[0]
        
        if (paymentReq.token && paymentReq.network === 'base') {
          addTestResult({
            testName: 'USDC Integration',
            status: 'success',
            message: '✅ USDC on Base configuration correct',
            data: paymentReq,
            timestamp: new Date(),
          })
        } else {
          throw new Error('Invalid USDC configuration')
        }
      }
    } catch (error: any) {
      addTestResult({
        testName: 'USDC Integration',
        status: 'error',
        message: '❌ USDC integration test failed',
        error: error.message,
        timestamp: new Date(),
      })
    }
  }

  const runAllTests = async () => {
    setIsRunningTests(true)
    clearResults()

    await runBasicPaymentTest()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await runErrorHandlingTest()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await runUSDCIntegrationTest()
    
    setIsRunningTests(false)
  }

  const handlePaymentSuccess = (data: any, testName: string) => {
    addTestResult({
      testName,
      status: 'success',
      message: '✅ Payment completed successfully',
      data,
      timestamp: new Date(),
    })

    // Extract transaction hash if available
    if (data.transactionHash) {
      setCurrentTransactionHash(data.transactionHash)
    }
  }

  const handlePaymentError = (error: any, testName: string) => {
    addTestResult({
      testName,
      status: 'error',
      message: '❌ Payment failed',
      error: error.message || error,
      timestamp: new Date(),
    })
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="container mx-auto px-5 max-w-4xl py-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            x402 Payment Flow Testing
          </h1>
          <p className="text-text-secondary">
            Test and verify the complete x402 payment implementation
          </p>
        </div>

        {/* Connection Status */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-bold text-text-primary mb-4">Connection Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-bg-secondary rounded-lg">
              <div className="text-2xl mb-2">
                {isConnected ? '✅' : '❌'}
              </div>
              <div className="font-medium">Wallet</div>
              <div className="text-text-secondary text-sm">
                {isConnected ? 'Connected' : 'Not Connected'}
              </div>
              {address && (
                <div className="text-xs font-mono mt-1">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </div>
              )}
            </div>

            <div className="text-center p-4 bg-bg-secondary rounded-lg">
              <div className="text-2xl mb-2">🌐</div>
              <div className="font-medium">Network</div>
              <div className="text-text-secondary text-sm">
                {chainId === 8453 ? 'Base Mainnet' : 
                 chainId === 84532 ? 'Base Sepolia' : 
                 `Chain ${chainId}`}
              </div>
            </div>

            <div className="text-center p-4 bg-bg-secondary rounded-lg">
              <div className="text-2xl mb-2">💰</div>
              <div className="font-medium">Token</div>
              <div className="text-text-secondary text-sm">USDC</div>
            </div>
          </div>

          {!isConnected && (
            <div className="mt-4 text-center">
              <Button onClick={connectWallet}>
                Connect Wallet to Start Testing
              </Button>
            </div>
          )}
        </Card>

        {/* Automated Tests */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-primary">Automated Tests</h2>
            <div className="space-x-2">
              <Button
                onClick={runAllTests}
                disabled={isRunningTests}
                variant={isRunningTests ? 'secondary' : 'primary'}
              >
                {isRunningTests ? 'Running Tests...' : 'Run All Tests'}
              </Button>
              <Button onClick={clearResults} variant="secondary">
                Clear Results
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Button
              onClick={runBasicPaymentTest}
              disabled={isRunningTests}
              className="w-full"
            >
              Test Basic Flow
            </Button>
            <Button
              onClick={runErrorHandlingTest}
              disabled={isRunningTests}
              className="w-full"
            >
              Test Error Handling
            </Button>
            <Button
              onClick={runUSDCIntegrationTest}
              disabled={isRunningTests}
              className="w-full"
            >
              Test USDC Integration
            </Button>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-text-primary">Test Results</h3>
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    result.status === 'success'
                      ? 'bg-green-50 border-green-200'
                      : result.status === 'error'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{result.testName}</span>
                    <span className="text-xs text-text-secondary">
                      {result.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-sm">{result.message}</div>
                  {result.error && (
                    <div className="text-xs text-red-600 mt-1">
                      Error: {result.error}
                    </div>
                  )}
                  {result.data && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer">View Data</summary>
                      <pre className="text-xs bg-bg-secondary p-2 rounded mt-1 overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Manual Payment Tests */}
        {isConnected && (
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-bold text-text-primary mb-4">Manual Payment Tests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="font-medium">Basic Payment Test</h3>
                <p className="text-sm text-text-secondary">
                  Test a simple payment flow with the minimum amount.
                </p>
                <PaymentButton
                  url="/api/payment-test?type=basic"
                  amount="0.01"
                  description="Basic Payment Test"
                  onSuccess={(data) => handlePaymentSuccess(data, 'Manual Basic Payment')}
                  onError={(error) => handlePaymentError(error, 'Manual Basic Payment')}
                  className="w-full"
                >
                  Test Basic Payment ($0.01)
                </PaymentButton>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium">Premium Payment Test</h3>
                <p className="text-sm text-text-secondary">
                  Test a higher-value payment with premium features.
                </p>
                <PaymentButton
                  url="/api/payment-test?type=premium"
                  amount="0.10"
                  description="Premium Payment Test"
                  onSuccess={(data) => handlePaymentSuccess(data, 'Manual Premium Payment')}
                  onError={(error) => handlePaymentError(error, 'Manual Premium Payment')}
                  className="w-full"
                >
                  Test Premium Payment ($0.10)
                </PaymentButton>
              </div>
            </div>
          </Card>
        )}

        {/* Transaction Monitoring */}
        {currentTransactionHash && (
          <Card className="p-6">
            <h2 className="text-lg font-bold text-text-primary mb-4">Transaction Monitoring</h2>
            <TransactionStatus
              transactionHash={currentTransactionHash}
              chainId={chainId}
              onConfirmed={(receipt) => {
                addTestResult({
                  testName: 'Transaction Confirmation',
                  status: 'success',
                  message: '✅ Transaction confirmed on blockchain',
                  data: receipt,
                  timestamp: new Date(),
                })
              }}
              onError={(error) => {
                addTestResult({
                  testName: 'Transaction Confirmation',
                  status: 'error',
                  message: '❌ Transaction confirmation failed',
                  error: error.message,
                  timestamp: new Date(),
                })
              }}
            />
          </Card>
        )}
      </div>
    </div>
  )
}
