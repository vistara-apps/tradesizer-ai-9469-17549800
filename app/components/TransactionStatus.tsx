'use client'

import { useEffect, useState } from 'react'
import { usePublicClient, useWaitForTransactionReceipt } from 'wagmi'
import { formatTransactionHash, getBlockExplorerUrl } from '../lib/payment-utils'
import { PAYMENT_CONFIG } from '../lib/payment-config'

interface TransactionStatusProps {
  transactionHash: string
  chainId: number
  onConfirmed?: (receipt: any) => void
  onError?: (error: any) => void
  className?: string
}

export function TransactionStatus({
  transactionHash,
  chainId,
  onConfirmed,
  onError,
  className = '',
}: TransactionStatusProps) {
  const [confirmations, setConfirmations] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const publicClient = usePublicClient()

  const { data: receipt, isLoading, isError, error } = useWaitForTransactionReceipt({
    hash: transactionHash as `0x${string}`,
    confirmations: PAYMENT_CONFIG.confirmations,
  })

  const explorerUrl = getBlockExplorerUrl(chainId, transactionHash)
  const formattedHash = formatTransactionHash(transactionHash)

  useEffect(() => {
    if (receipt && !isComplete) {
      setIsComplete(true)
      setConfirmations(PAYMENT_CONFIG.confirmations)
      onConfirmed?.(receipt)
    }
  }, [receipt, isComplete, onConfirmed])

  useEffect(() => {
    if (isError && error) {
      onError?.(error)
    }
  }, [isError, error, onError])

  // Monitor confirmations in real-time
  useEffect(() => {
    if (!publicClient || !transactionHash || isComplete) return

    const interval = setInterval(async () => {
      try {
        const currentBlock = await publicClient.getBlockNumber()
        const txReceipt = await publicClient.getTransactionReceipt({
          hash: transactionHash as `0x${string}`,
        })

        if (txReceipt) {
          const confirmationCount = Number(currentBlock - txReceipt.blockNumber)
          setConfirmations(Math.min(confirmationCount, PAYMENT_CONFIG.confirmations))
        }
      } catch (err) {
        console.error('Error monitoring confirmations:', err)
      }
    }, 2000) // Check every 2 seconds

    return () => clearInterval(interval)
  }, [publicClient, transactionHash, isComplete])

  const getStatusIcon = () => {
    if (isError) return '❌'
    if (isComplete) return '✅'
    if (isLoading || confirmations < PAYMENT_CONFIG.confirmations) return '⏳'
    return '🔄'
  }

  const getStatusText = () => {
    if (isError) return 'Transaction Failed'
    if (isComplete) return 'Transaction Confirmed'
    if (confirmations === 0) return 'Pending Confirmation'
    return `${confirmations}/${PAYMENT_CONFIG.confirmations} Confirmations`
  }

  const getStatusColor = () => {
    if (isError) return 'text-red-600'
    if (isComplete) return 'text-green-600'
    return 'text-yellow-600'
  }

  return (
    <div className={`bg-bg-secondary rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getStatusIcon()}</span>
          <span className={`font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        
        {explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary-dark text-sm flex items-center space-x-1"
          >
            <span>View</span>
            <span>↗</span>
          </a>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-text-secondary">Transaction:</span>
          <span className="font-mono">{formattedHash}</span>
        </div>

        {receipt && (
          <>
            <div className="flex justify-between">
              <span className="text-text-secondary">Block:</span>
              <span className="font-mono">#{receipt.blockNumber.toString()}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-text-secondary">Gas Used:</span>
              <span className="font-mono">{receipt.gasUsed.toString()}</span>
            </div>
          </>
        )}

        {!isComplete && !isError && (
          <div className="flex justify-between">
            <span className="text-text-secondary">Progress:</span>
            <div className="flex items-center space-x-2">
              <div className="w-20 bg-bg-tertiary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(confirmations / PAYMENT_CONFIG.confirmations) * 100}%`,
                  }}
                />
              </div>
              <span className="text-xs">
                {Math.round((confirmations / PAYMENT_CONFIG.confirmations) * 100)}%
              </span>
            </div>
          </div>
        )}

        {isError && error && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
            <div className="font-medium">Error Details:</div>
            <div>{error.message || 'Unknown error occurred'}</div>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center mt-3">
          <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
          <span className="ml-2 text-sm text-text-secondary">
            Waiting for network confirmation...
          </span>
        </div>
      )}
    </div>
  )
}
