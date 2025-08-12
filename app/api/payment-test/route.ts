import { NextRequest, NextResponse } from 'next/server'
import { PAYMENT_CONFIG, getUSDCAddress } from '../../lib/payment-config'

// Helper function to get test results based on scenario
function getTestResults(testScenario: string) {
  const results = {
    'error-handling': {
      message: 'Error handling test completed',
      simulatedErrors: ['Network timeout', 'Insufficient funds', 'Invalid signature'],
      errorRecovery: 'All errors handled gracefully',
    },
    'transaction-confirmation': {
      message: 'Transaction confirmation test completed',
      confirmationSteps: [
        'Transaction submitted',
        'Pending confirmation',
        'Block inclusion',
        'Confirmation received',
      ],
      finalStatus: 'Confirmed',
    },
    'usdc-integration': {
      message: 'USDC integration test completed',
      tokenAddress: getUSDCAddress(8453),
      network: 'Base',
      decimals: 6,
      transferStatus: 'Success',
    },
    'end-to-end': {
      message: 'End-to-end test completed',
      steps: [
        '1. Payment request initiated',
        '2. Wallet connection verified',
        '3. Payment authorization signed',
        '4. Transaction submitted to network',
        '5. Payment verified by service',
        '6. Premium content delivered',
      ],
      overallStatus: 'Success',
    },
  } as const

  return results[testScenario as keyof typeof results] || { message: 'Unknown test scenario' }
}

// Simple test endpoint for x402 payment flow
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const testType = searchParams.get('type') || 'basic'
  const amount = searchParams.get('amount') || PAYMENT_CONFIG.premiumAnalysis

  // Check for payment header
  const paymentHeader = request.headers.get('x-payment')
  
  if (!paymentHeader) {
    // Return 402 Payment Required with payment requirements
    const paymentRequirements = {
      paymentRequirements: [
        {
          scheme: 'eip712',
          network: 'base',
          token: getUSDCAddress(8453), // Base mainnet USDC
          amount,
          recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', // Example recipient
          facilitator: PAYMENT_CONFIG.facilitatorUrl,
          description: `Test payment for ${testType} service`,
          metadata: {
            service: 'payment-test',
            testType,
            timestamp: new Date().toISOString(),
          },
        },
      ],
    }

    return NextResponse.json(paymentRequirements, { 
      status: 402,
      headers: {
        'Content-Type': 'application/json',
        'X-Payment-Required': 'true',
      },
    })
  }

  // Payment received, return test data
  const testData = {
    success: true,
    message: 'Payment successful! Access granted to premium content.',
    testType,
    amount,
    timestamp: new Date().toISOString(),
    paymentVerified: true,
    data: {
      basic: {
        message: 'Basic premium content unlocked',
        features: ['Feature A', 'Feature B'],
      },
      advanced: {
        message: 'Advanced premium content unlocked',
        features: ['Feature A', 'Feature B', 'Feature C', 'Advanced Analytics'],
        analytics: {
          metric1: Math.random() * 100,
          metric2: Math.random() * 50,
          metric3: Math.random() * 25,
        },
      },
      premium: {
        message: 'Premium content unlocked',
        features: ['All Features', 'Priority Support', 'Custom Analytics'],
        analytics: {
          detailedMetrics: Array.from({ length: 10 }, () => Math.random() * 100),
          insights: [
            'Market trend analysis shows positive momentum',
            'Risk indicators suggest moderate volatility',
            'Optimal entry points identified',
          ],
        },
      },
    }[testType] || { message: 'Unknown test type' },
  }

  // Simulate payment response header
  const paymentResponse = btoa(JSON.stringify({
    success: true,
    transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
    blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
    network: 'base',
    token: getUSDCAddress(8453),
    amount,
    timestamp: new Date().toISOString(),
  }))

  return NextResponse.json(testData, {
    headers: {
      'X-Payment-Response': paymentResponse,
      'Content-Type': 'application/json',
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { testScenario, customAmount, metadata } = body

    // Check for payment header
    const paymentHeader = request.headers.get('x-payment')
    
    if (!paymentHeader) {
      // Return 402 Payment Required
      const paymentRequirements = {
        paymentRequirements: [
          {
            scheme: 'eip712',
            network: 'base',
            token: getUSDCAddress(8453),
            amount: customAmount || PAYMENT_CONFIG.premiumAnalysis,
            recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
            facilitator: PAYMENT_CONFIG.facilitatorUrl,
            description: `Test payment for ${testScenario} scenario`,
            metadata: {
              service: 'payment-test-post',
              testScenario,
              customAmount,
              ...metadata,
            },
          },
        ],
      }

      return NextResponse.json(paymentRequirements, { 
        status: 402,
        headers: {
          'Content-Type': 'application/json',
          'X-Payment-Required': 'true',
        },
      })
    }

    // Payment received, return test results
    const testResults = {
      success: true,
      message: 'POST payment test successful!',
      testScenario,
      customAmount,
      metadata,
      timestamp: new Date().toISOString(),
      paymentVerified: true,
      results: getTestResults(testScenario),
    }

    const paymentResponse = btoa(JSON.stringify({
      success: true,
      transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
      blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
      network: 'base',
      token: getUSDCAddress(8453),
      amount: customAmount || PAYMENT_CONFIG.premiumAnalysis,
      timestamp: new Date().toISOString(),
    }))

    return NextResponse.json(testResults, {
      headers: {
        'X-Payment-Response': paymentResponse,
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Error processing payment test:', error)
    return NextResponse.json(
      { error: 'Failed to process payment test' },
      { status: 500 }
    )
  }
}
