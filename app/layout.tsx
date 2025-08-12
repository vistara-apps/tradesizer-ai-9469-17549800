
import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'TradeSizer AI',
  description: 'Calculate your perfect crypto trade size instantly',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
