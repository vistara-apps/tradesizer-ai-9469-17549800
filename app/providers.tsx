'use client'

import { MiniKitProvider } from '@coinbase/onchainkit/minikit'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { base, baseSepolia } from 'viem/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { coinbaseWallet } from 'wagmi/connectors'
import type { ReactNode } from 'react'
import { useState } from 'react'

// Configure wagmi
const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    coinbaseWallet({
      appName: 'TradeSizer AI',
      appLogoUrl: '/icon.png',
    }),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
})

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <MiniKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={base}
          config={{
            appearance: {
              mode: 'auto',
              theme: 'base',
              name: 'TradeSizer AI',
              logo: '/icon.png',
            },
          }}
        >
          {children}
        </MiniKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
