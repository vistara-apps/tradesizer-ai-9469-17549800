import { base, baseSepolia } from 'viem/chains'

// USDC contract addresses
export const USDC_ADDRESSES = {
  [base.id]: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
  [baseSepolia.id]: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // USDC on Base Sepolia
} as const

// Payment configuration
export const PAYMENT_CONFIG = {
  // Default payment amounts in USDC (6 decimals)
  premiumAnalysis: '0.01', // $0.01 for premium analysis
  historicalData: '0.05', // $0.05 for historical data access
  aiRecommendations: '0.10', // $0.10 for AI recommendations
  
  // Network settings
  defaultChain: base,
  testChain: baseSepolia,
  
  // Transaction settings
  confirmations: 1, // Number of confirmations to wait for
  timeout: 30000, // 30 seconds timeout for transactions
  
  // x402 settings
  maxPaymentAmount: '1.00', // Maximum payment amount in USDC
  facilitatorUrl: process.env.NEXT_PUBLIC_X402_FACILITATOR_URL || 'https://facilitator.x402.org',
} as const

// Environment variables validation
export const ENV_CONFIG = {
  cdpApiKeyId: process.env.CDP_API_KEY_ID,
  cdpApiKeySecret: process.env.CDP_API_KEY_SECRET,
  cdpWalletSecret: process.env.CDP_WALLET_SECRET,
  onchainKitApiKey: process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY,
  x402FacilitatorUrl: process.env.NEXT_PUBLIC_X402_FACILITATOR_URL,
} as const

// Validate required environment variables
export function validateEnvironment() {
  const missing = []
  
  if (!ENV_CONFIG.onchainKitApiKey) {
    missing.push('NEXT_PUBLIC_ONCHAINKIT_API_KEY')
  }
  
  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing.join(', '))
  }
  
  return missing.length === 0
}

// Get USDC contract address for current chain
export function getUSDCAddress(chainId: number): string {
  const address = USDC_ADDRESSES[chainId as keyof typeof USDC_ADDRESSES]
  if (!address) {
    throw new Error(`USDC contract address not found for chain ${chainId}`)
  }
  return address
}

// Payment requirement types for x402
export interface PaymentRequirement {
  scheme: 'eip712'
  network: 'base' | 'base-sepolia'
  token: string
  amount: string
  recipient: string
  facilitator: string
}

export interface PaymentResponse {
  success: boolean
  transactionHash?: string
  error?: string
  blockNumber?: number
  confirmations?: number
}
