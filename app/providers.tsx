
'use client'

import { MiniKitProvider } from '@coinbase/onchainkit/minikit'
import { base } from 'viem/chains'
import type { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
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
  )
}
