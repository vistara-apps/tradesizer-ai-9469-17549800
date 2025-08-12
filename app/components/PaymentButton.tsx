'use client'

import { useState } from 'react'
import { useAccount, useConnect } from 'wagmi'
import { useWalletPayment } from '../hooks/useWalletPayment'
import { formatUSDCAmount, getErrorMessage } from '../lib/payment-utils'
import { Button } from './Button'

interface PaymentButtonProps {
  url: string
  amount: string
  description: string
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  className?: string
  disabled?: boolean
  children?: React.ReactNode
}

export function PaymentButton({
  url,
  amount,
  description,
  onSuccess,
  onError,
  className,
  disabled,
  children,
}: PaymentButtonProps) {
  const { isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const {
    makePayment,
    isLoading,
    isSuccess,
    isError,
    error,
    transactionHash,
    formattedHash,
    explorerUrl,
    reset,
  } = useWalletPayment()

  const [showDetails, setShowDetails] = useState(false)

  const handlePayment = async () => {
    if (!isConnected) {
      // Connect wallet first
      const coinbaseConnector = connectors.find(c => c.name === 'Coinbase Wallet')
      if (coinbaseConnector) {
        connect({ connector: coinbaseConnector })
      }
      return
    }

    try {
      reset() // Reset previous state
      const result = await makePayment(url)
      onSuccess?.(result)
    } catch (err) {
      console.error('Payment failed:', err)
      onError?.(err)
    }
  }

  const getButtonText = () => {
    if (!isConnected) {
      return 'Connect Wallet'
    }
    
    if (isLoading) {
      return transactionHash ? 'Confirming...' : 'Processing Payment...'
    }
    
    if (isSuccess) {
      return '✅ Payment Complete'
    }
    
    if (isError) {
      return 'Retry Payment'
    }
    
    return children || `Pay ${formatUSDCAmount(amount)}`
  }

  const getButtonVariant = (): 'primary' | 'secondary' | 'copy' => {
    if (isError) return 'secondary'
    return 'primary'
  }

  return (
    <div className="space-y-3">
      <Button
        onClick={handlePayment}
        disabled={disabled || (isLoading && !transactionHash)}
        variant={getButtonVariant()}
        className={className}
      >
        {getButtonText()}
      </Button>

      {/* Payment details */}
      {(isLoading || isSuccess || isError) && (
        <div className="text-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Payment Details</span>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-primary hover:text-primary-dark"
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </button>
          </div>

          {showDetails && (
            <div className="bg-bg-secondary rounded-lg p-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-text-secondary">Amount:</span>
                <span className="font-medium">{formatUSDCAmount(amount)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-text-secondary">Service:</span>
                <span className="font-medium">{description}</span>
              </div>

              {transactionHash && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">Transaction:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm">{formattedHash}</span>
                    {explorerUrl && (
                      <a
                        href={explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-dark text-sm"
                      >
                        View ↗
                      </a>
                    )}
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="flex items-center space-x-2 text-text-secondary">
                  <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                  <span>
                    {transactionHash ? 'Waiting for confirmation...' : 'Preparing payment...'}
                  </span>
                </div>
              )}

              {isSuccess && (
                <div className="flex items-center space-x-2 text-green-600">
                  <span>✅</span>
                  <span>Payment confirmed successfully!</span>
                </div>
              )}

              {isError && error && (
                <div className="text-red-600 text-sm">
                  <div className="font-medium">Payment Failed</div>
                  <div>{getErrorMessage(error)}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
