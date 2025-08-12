'use client'

import { useState, useCallback, useEffect } from 'react'
import { usePublicClient, useWaitForTransactionReceipt } from 'wagmi'
import { usePaymentClient } from './usePaymentClient'
import { 
  PaymentError, 
  PaymentErrorType, 
  createPaymentError,
  formatTransactionHash,
  getBlockExplorerUrl,
  retryWithBackoff 
} from '../lib/payment-utils'
import { PAYMENT_CONFIG } from '../lib/payment-config'

export interface PaymentState {
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
  error: PaymentError | null
  transactionHash: string | null
  blockNumber: number | null
  confirmations: number
  explorerUrl: string | null
}

export interface PaymentResult extends PaymentState {
  makePayment: (url: string, options?: RequestInit) => Promise<any>
  reset: () => void
  formattedHash: string | null
}

export function useWalletPayment(): PaymentResult {
  const { makePaymentRequest, isReady, chainId } = usePaymentClient()
  const publicClient = usePublicClient()
  
  const [state, setState] = useState<PaymentState>({
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null,
    transactionHash: null,
    blockNumber: null,
    confirmations: 0,
    explorerUrl: null,
  })

  // Wait for transaction receipt
  const { data: receipt } = useWaitForTransactionReceipt({
    hash: state.transactionHash as `0x${string}` | undefined,
    confirmations: PAYMENT_CONFIG.confirmations,
  })

  // Update state when receipt is received
  useEffect(() => {
    if (receipt && state.transactionHash) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        isSuccess: true,
        blockNumber: Number(receipt.blockNumber),
        confirmations: PAYMENT_CONFIG.confirmations,
      }))
    }
  }, [receipt, state.transactionHash])

  // Reset payment state
  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isSuccess: false,
      isError: false,
      error: null,
      transactionHash: null,
      blockNumber: null,
      confirmations: 0,
      explorerUrl: null,
    })
  }, [])

  // Make payment with retry logic
  const makePayment = useCallback(async (url: string, options: RequestInit = {}) => {
    if (!isReady) {
      const error = createPaymentError(
        PaymentErrorType.WALLET_NOT_CONNECTED,
        'Wallet not ready for payments'
      )
      setState(prev => ({ ...prev, isError: true, error }))
      throw error
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      isError: false,
      error: null,
      isSuccess: false,
    }))

    try {
      // Make payment request with retry logic
      const response = await retryWithBackoff(async () => {
        return await makePaymentRequest({
          url,
          method: options.method || 'GET',
          data: options.body,
          headers: options.headers as Record<string, string>,
        })
      })

      // Extract transaction hash from response headers
      const paymentResponse = response.headers['x-payment-response']
      let transactionHash: string | null = null
      
      if (paymentResponse) {
        try {
          const decoded = JSON.parse(atob(paymentResponse))
          transactionHash = decoded.transactionHash || null
        } catch (e) {
          console.warn('Failed to decode payment response:', e)
        }
      }

      // Update state with transaction info
      if (transactionHash) {
        const explorerUrl = getBlockExplorerUrl(chainId, transactionHash)
        setState(prev => ({
          ...prev,
          transactionHash,
          explorerUrl,
          // Keep loading true until we get receipt
        }))
      } else {
        // No transaction hash means payment wasn't required
        setState(prev => ({
          ...prev,
          isLoading: false,
          isSuccess: true,
        }))
      }

      return response.data
    } catch (error: any) {
      console.error('Payment failed:', error)
      
      let paymentError: PaymentError
      
      if (error.type) {
        // Already a PaymentError
        paymentError = error
      } else {
        // Convert to PaymentError
        paymentError = createPaymentError(
          PaymentErrorType.UNKNOWN,
          error.message || 'Payment failed',
          error
        )
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        isError: true,
        error: paymentError,
      }))

      throw paymentError
    }
  }, [isReady, makePaymentRequest, chainId])

  // Format transaction hash for display
  const formattedHash = state.transactionHash 
    ? formatTransactionHash(state.transactionHash)
    : null

  return {
    ...state,
    makePayment,
    reset,
    formattedHash,
  }
}
