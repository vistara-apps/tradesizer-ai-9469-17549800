'use client'

import { useCallback, useMemo } from 'react'
import { useWalletClient, useAccount, useChainId } from 'wagmi'
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { withPaymentInterceptor } from 'x402-axios'
import { PAYMENT_CONFIG, getUSDCAddress } from '../lib/payment-config'
import { 
  PaymentError, 
  PaymentErrorType, 
  createPaymentError,
  validatePaymentAmount 
} from '../lib/payment-utils'

export interface PaymentClientConfig {
  maxPaymentAmount?: string
  timeout?: number
  baseURL?: string
}

export interface PaymentClientResult {
  client: AxiosInstance | null
  isReady: boolean
  error: PaymentError | null
  makePaymentRequest: <T = any>(config: AxiosRequestConfig) => Promise<AxiosResponse<T>>
  account: string | undefined
  chainId: number
  isConnected: boolean
}

export function usePaymentClient(config: PaymentClientConfig = {}): PaymentClientResult {
  const { data: walletClient } = useWalletClient()
  const { address, isConnected } = useAccount()
  const chainId = useChainId()

  const {
    maxPaymentAmount = PAYMENT_CONFIG.maxPaymentAmount,
    timeout = PAYMENT_CONFIG.timeout,
    baseURL,
  } = config

  // Create the payment-enabled axios client
  const client = useMemo(() => {
    if (!walletClient || !isConnected || !address) {
      return null
    }

    try {
      // Create base axios instance
      const axiosInstance = axios.create({
        timeout,
        baseURL,
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // Add x402 payment interceptor
      // Note: Type casting needed due to wagmi/x402-axios type compatibility
      const paymentClient = withPaymentInterceptor(
        axiosInstance, 
        walletClient as any,
        // Custom payment requirements selector
        (paymentRequirements) => {
          // Filter by network and respect max payment amount
          return paymentRequirements.filter(req => {
            const isCorrectNetwork = req.network === (chainId === 8453 ? 'base' : 'base-sepolia')
            const isWithinLimit = parseFloat(req.maxAmountRequired) <= parseFloat(maxPaymentAmount.toString())
            return isCorrectNetwork && isWithinLimit
          })[0] // Return first matching requirement
        }
      )

      return paymentClient
    } catch (error) {
      console.error('Failed to create payment client:', error)
      return null
    }
  }, [walletClient, isConnected, address, chainId, maxPaymentAmount, timeout, baseURL])

  // Error state
  const error = useMemo(() => {
    if (!isConnected) {
      return createPaymentError(
        PaymentErrorType.WALLET_NOT_CONNECTED,
        'Wallet not connected'
      )
    }

    if (!validatePaymentAmount(maxPaymentAmount)) {
      return createPaymentError(
        PaymentErrorType.INVALID_AMOUNT,
        'Invalid maximum payment amount'
      )
    }

    return null
  }, [isConnected, maxPaymentAmount])

  // Make payment request with error handling
  const makePaymentRequest = useCallback(async <T = any>(
    requestConfig: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    if (!client) {
      throw createPaymentError(
        PaymentErrorType.WALLET_NOT_CONNECTED,
        'Payment client not available'
      )
    }

    try {
      const response = await client.request<T>(requestConfig)
      return response
    } catch (error: any) {
      // Handle different types of errors
      if (error.response?.status === 402) {
        throw createPaymentError(
          PaymentErrorType.INSUFFICIENT_FUNDS,
          'Payment required but failed',
          error.response.data
        )
      }

      if (error.code === 'NETWORK_ERROR') {
        throw createPaymentError(
          PaymentErrorType.NETWORK_ERROR,
          'Network error occurred',
          error
        )
      }

      if (error.code === 'TIMEOUT') {
        throw createPaymentError(
          PaymentErrorType.TIMEOUT,
          'Request timed out',
          error
        )
      }

      if (error.code === 4001) { // User rejected transaction
        throw createPaymentError(
          PaymentErrorType.USER_REJECTED,
          'Transaction rejected by user',
          error
        )
      }

      // Generic error
      throw createPaymentError(
        PaymentErrorType.UNKNOWN,
        error.message || 'Unknown error occurred',
        error
      )
    }
  }, [client])

  return {
    client,
    isReady: !!client && !error,
    error,
    makePaymentRequest,
    account: address,
    chainId,
    isConnected,
  }
}
