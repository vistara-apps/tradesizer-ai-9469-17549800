import { parseUnits, formatUnits } from 'viem'
import { PAYMENT_CONFIG } from './payment-config'

// Format USDC amount for display (6 decimals)
export function formatUSDCAmount(amount: string | bigint): string {
  const formatted = typeof amount === 'string' 
    ? formatUnits(parseUnits(amount, 6), 6)
    : formatUnits(amount, 6)
  
  return `$${parseFloat(formatted).toFixed(2)}`
}

// Parse USDC amount to wei (6 decimals)
export function parseUSDCAmount(amount: string): bigint {
  return parseUnits(amount, 6)
}

// Validate payment amount
export function validatePaymentAmount(amount: string): boolean {
  try {
    const parsed = parseFloat(amount)
    const maxAmount = parseFloat(PAYMENT_CONFIG.maxPaymentAmount)
    
    return parsed > 0 && parsed <= maxAmount
  } catch {
    return false
  }
}

// Generate payment ID for tracking
export function generatePaymentId(): string {
  return `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Format transaction hash for display
export function formatTransactionHash(hash: string): string {
  if (hash.length < 10) return hash
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`
}

// Get block explorer URL
export function getBlockExplorerUrl(chainId: number, hash: string): string {
  const baseUrls = {
    8453: 'https://basescan.org', // Base mainnet
    84532: 'https://sepolia.basescan.org', // Base Sepolia
  }
  
  const baseUrl = baseUrls[chainId as keyof typeof baseUrls]
  if (!baseUrl) {
    return `https://etherscan.io/tx/${hash}` // Fallback
  }
  
  return `${baseUrl}/tx/${hash}`
}

// Payment error types
export enum PaymentErrorType {
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  TIMEOUT = 'TIMEOUT',
  USER_REJECTED = 'USER_REJECTED',
  UNKNOWN = 'UNKNOWN',
}

export interface PaymentError {
  type: PaymentErrorType
  message: string
  details?: any
}

// Create payment error
export function createPaymentError(
  type: PaymentErrorType,
  message: string,
  details?: any
): PaymentError {
  return { type, message, details }
}

// Get user-friendly error message
export function getErrorMessage(error: PaymentError): string {
  switch (error.type) {
    case PaymentErrorType.INSUFFICIENT_FUNDS:
      return 'Insufficient USDC balance to complete payment'
    case PaymentErrorType.NETWORK_ERROR:
      return 'Network error occurred. Please check your connection and try again'
    case PaymentErrorType.TRANSACTION_FAILED:
      return 'Transaction failed. Please try again'
    case PaymentErrorType.WALLET_NOT_CONNECTED:
      return 'Please connect your wallet to continue'
    case PaymentErrorType.INVALID_AMOUNT:
      return 'Invalid payment amount'
    case PaymentErrorType.TIMEOUT:
      return 'Transaction timed out. Please try again'
    case PaymentErrorType.USER_REJECTED:
      return 'Transaction was rejected by user'
    default:
      return error.message || 'An unexpected error occurred'
  }
}

// Retry configuration
export interface RetryConfig {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
}

// Exponential backoff delay
export function calculateRetryDelay(attempt: number, config: RetryConfig): number {
  const delay = config.baseDelay * Math.pow(2, attempt - 1)
  return Math.min(delay, config.maxDelay)
}

// Sleep utility
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Retry function with exponential backoff
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === config.maxAttempts) {
        throw lastError
      }
      
      const delay = calculateRetryDelay(attempt, config)
      await sleep(delay)
    }
  }
  
  throw lastError!
}
